from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import subprocess
from datetime import datetime, timezone

SCREEN_CLASS_RE = re.compile(r"\bclass\s+(\w*Screen)\b")
IMPORT_RE = re.compile(r"^import\s+['\"]([^'\"]+)['\"]", re.MULTILINE)
API_RE = re.compile(r"['\"](/api/app/[^'\"\s?#)]*)")

WIDGETS = (
    "Scaffold", "AppBar", "SafeArea", "Form", "SingleChildScrollView",
    "Column", "Row", "Wrap", "Padding", "Container", "SizedBox", "Center",
    "Align", "Stack", "Positioned", "Expanded", "Flexible", "Card", "ListTile",
    "TextFormField", "TextField", "FilledButton", "ElevatedButton", "OutlinedButton",
    "TextButton", "IconButton", "Image", "CircleAvatar", "ListView", "GridView",
    "TabBar", "BottomNavigationBar", "NavigationBar", "FloatingActionButton", "Drawer",
    "ExpansionTile", "DataTable", "Table", "GoogleMap", "WebView", "PageView",
    "Stepper", "Dialog", "AlertDialog", "DropdownButton", "DropdownButtonFormField",
    "Switch", "Checkbox", "Radio", "Chip", "Divider", "LinearProgressIndicator",
    "CircularProgressIndicator", "Icon", "Text",
)

STRUCTURAL_WIDGETS = tuple(w for w in WIDGETS if w != "Text")
TECH_MARKERS = ("repository", "service", "api", "session", "database", "network", "storage")

TEXT_LITERAL_RE = re.compile(
    r"\bText\s*\(\s*(?:const\s+)?(?:AppStrings\.t\s*\(\s*)?['\"]([^'\"\n]{1,80})['\"]"
)
FIELD_LABEL_RE = re.compile(r"\b(?:labelText|hintText|helperText)\s*:\s*['\"]([^'\"\n]{1,80})['\"]")
TOOLTIP_RE = re.compile(r"\btooltip\s*:\s*['\"]([^'\"\n]{1,80})['\"]")
ICON_RE = re.compile(r"\bIcons\.([A-Za-z0-9_]+)")


def git_head(root: pathlib.Path) -> str:
    try:
        return subprocess.check_output(
            ["git", "-C", str(root), "rev-parse", "HEAD"], text=True
        ).strip()
    except Exception:
        return "unknown"


def rel(root: pathlib.Path, path: pathlib.Path) -> str:
    return path.relative_to(root).as_posix()


def title_from_class(name: str) -> str:
    base = re.sub(r"Screen$", "", name)
    words = re.sub(r"(?<!^)(?=[A-Z])", " ", base).strip()
    return words or name


def resolve_import(root: pathlib.Path, source: pathlib.Path, value: str) -> pathlib.Path | None:
    if value.startswith("package:possebon/"):
        candidate = root / "lib" / value.split("package:possebon/", 1)[1]
    elif value.startswith("."):
        candidate = (source.parent / value).resolve()
    else:
        return None
    try:
        candidate.relative_to(root.resolve())
    except ValueError:
        return None
    return candidate if candidate.exists() else None


def classify_domain(path: str) -> str:
    if "/features/" in f"/{path}":
        parts = path.split("/")
        if "features" in parts:
            idx = parts.index("features")
            if idx + 1 < len(parts):
                return parts[idx + 1].replace("_", " ").title()
    stem = pathlib.Path(path).stem
    for prefix, label in (
        ("transporte", "Transporte"), ("meu_transporte", "Transporte"),
        ("acesso", "Acesso"), ("login", "Acesso"), ("splash", "Acesso"),
        ("processo", "Admissão"), ("candidato", "Admissão"),
        ("meu_rdo", "RDO"), ("quadro", "Comunicação"),
        ("manifestacao", "Comunicação"), ("meus_dados", "Perfil"),
        ("meus_treinamentos", "Treinamentos"), ("cadastro_cracha", "Crachá"),
        ("cerca_virtual", "Acesso"),
    ):
        if stem.startswith(prefix):
            return label
    return "App"


def preview_kind(widget_counts: dict[str, int], text: str) -> str:
    if widget_counts.get("GoogleMap") or "mapa" in text.lower():
        return "map"
    if widget_counts.get("WebView"):
        return "web"
    if widget_counts.get("Form") or widget_counts.get("TextFormField") or widget_counts.get("TextField"):
        return "form"
    if widget_counts.get("GridView"):
        return "grid"
    if widget_counts.get("ListView") or widget_counts.get("DataTable"):
        return "list"
    if widget_counts.get("PageView"):
        return "pages"
    return "dashboard"


def nav_target(text: str, class_name: str) -> tuple[bool, float]:
    pattern = re.compile(rf"\b{re.escape(class_name)}\s*\(")
    for match in pattern.finditer(text):
        before = text[max(0, match.start() - 700):match.start()]
        if re.search(r"Navigator|MaterialPageRoute|CupertinoPageRoute|PageRoute|pushNamed|showModalBottomSheet", before):
            return True, 0.96
    return False, 0.0


def build_block(text: str) -> str:
    """Returns the first Widget build(...) body, keeping only the UI-oriented source window."""
    match = re.search(r"\bWidget\s+build\s*\(\s*BuildContext\s+context\s*\)\s*\{", text)
    if not match:
        return text
    start = match.end() - 1
    depth = 0
    quote: str | None = None
    escaped = False
    for i in range(start, len(text)):
        ch = text[i]
        if quote:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == quote:
                quote = None
            continue
        if ch in ("'", '"'):
            quote = ch
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start + 1:i]
    return text[start + 1:]


def line_indent(source: str, pos: int) -> int:
    start = source.rfind("\n", 0, pos) + 1
    line = source[start:pos]
    spaces = len(line) - len(line.lstrip(" "))
    return min(12, max(0, spaces // 2))


def clean_label(value: str) -> str:
    value = re.sub(r"\s+", " ", value).strip()
    return value[:80]


def layout_sequence(text: str) -> list[dict]:
    """Builds an ordered, evidence-based UI blueprint from the screen's build() method.

    This is intentionally static: it records widgets/text in lexical order and indentation,
    without pretending to reproduce runtime-only/conditional layout exactly.
    """
    source = build_block(text)
    events: list[tuple[int, dict]] = []

    widget_pattern = re.compile(r"\b(" + "|".join(map(re.escape, STRUCTURAL_WIDGETS)) + r")\s*(?:<[^>]+>)?\s*\(")
    for match in widget_pattern.finditer(source):
        widget = match.group(1)
        events.append((match.start(), {
            "type": "widget",
            "widget": widget,
            "level": line_indent(source, match.start()),
        }))

    for match in TEXT_LITERAL_RE.finditer(source):
        label = clean_label(match.group(1))
        if label:
            events.append((match.start(), {
                "type": "text",
                "text": label,
                "level": line_indent(source, match.start()),
            }))

    for match in FIELD_LABEL_RE.finditer(source):
        label = clean_label(match.group(1))
        if label:
            events.append((match.start(), {
                "type": "field_label",
                "text": label,
                "level": line_indent(source, match.start()),
            }))

    for match in TOOLTIP_RE.finditer(source):
        label = clean_label(match.group(1))
        if label:
            events.append((match.start(), {
                "type": "tooltip",
                "text": label,
                "level": line_indent(source, match.start()),
            }))

    for match in ICON_RE.finditer(source):
        events.append((match.start(), {
            "type": "icon",
            "icon": match.group(1),
            "level": line_indent(source, match.start()),
        }))

    events.sort(key=lambda item: item[0])

    compact: list[dict] = []
    for _, event in events:
        # Remove exact consecutive duplicates created by nested/static declarations.
        if compact and compact[-1] == event:
            continue
        compact.append(event)
        if len(compact) >= 72:
            break

    if compact:
        min_level = min(item.get("level", 0) for item in compact)
        for item in compact:
            item["level"] = max(0, item.get("level", 0) - min_level)

    return compact


def visible_labels(layout: list[dict]) -> list[str]:
    labels: list[str] = []
    for item in layout:
        value = item.get("text")
        if not value or value in labels:
            continue
        labels.append(value)
        if len(labels) >= 18:
            break
    return labels


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--app-root", required=True)
    parser.add_argument("--output", default="data/app-inventory.json")
    parser.add_argument("--status-output", default="data/brain-status.json")
    parser.add_argument("--repo", default="pedrotorresepc13-glitch/possebon")
    parser.add_argument("--branch", default="possebon")
    args = parser.parse_args()

    root = pathlib.Path(args.app_root).resolve()
    lib = root / "lib"
    if not lib.exists():
        raise SystemExit(f"lib não encontrado em {root}")

    dart_files = sorted(p for p in lib.rglob("*.dart") if ".possebon_update_backups" not in p.parts)
    texts: dict[pathlib.Path, str] = {}
    class_to_file: dict[str, pathlib.Path] = {}
    screen_classes: dict[str, pathlib.Path] = {}

    for path in dart_files:
        text = path.read_text(encoding="utf-8", errors="replace")
        texts[path] = text
        for name in re.findall(r"\bclass\s+(\w+)\b", text):
            class_to_file.setdefault(name, path)
        for name in SCREEN_CLASS_RE.findall(text):
            screen_classes.setdefault(name, path)

    screens = []
    edges = []
    edge_keys: set[tuple[str, str, str]] = set()

    for class_name, path in sorted(screen_classes.items(), key=lambda item: rel(root, item[1])):
        text = texts[path]
        file_path = rel(root, path)
        imports = []
        project_import_paths = []
        for value in IMPORT_RE.findall(text):
            resolved = resolve_import(root, path, value)
            if resolved:
                rp = rel(root, resolved)
                project_import_paths.append(rp)
                imports.append({"import": value, "path": rp})

        technical = sorted({
            p for p in project_import_paths
            if any(marker in p.lower() for marker in TECH_MARKERS)
        })
        widget_counts = {w: len(re.findall(rf"\b{re.escape(w)}\b", text)) for w in WIDGETS}
        widget_counts = {k: v for k, v in widget_counts.items() if v}
        layout = layout_sequence(text)

        api_routes = set(API_RE.findall(text))
        for dep in technical:
            dep_path = root / dep
            dep_text = texts.get(dep_path)
            if dep_text:
                api_routes.update(API_RE.findall(dep_text))

        outgoing = []
        for target_class, target_path in screen_classes.items():
            if target_class == class_name:
                continue
            is_nav, confidence = nav_target(text, target_class)
            if not is_nav:
                continue
            target_id = re.sub(r"[^a-z0-9]+", "-", target_class.lower()).strip("-")
            outgoing.append(target_id)
            key = (re.sub(r"[^a-z0-9]+", "-", class_name.lower()).strip("-"), target_id, "navigation")
            if key not in edge_keys:
                edge_keys.add(key)
                edges.append({
                    "from": key[0], "to": key[1], "type": "navigation",
                    "confidence": confidence, "evidence": file_path,
                })

        sid = re.sub(r"[^a-z0-9]+", "-", class_name.lower()).strip("-")
        screens.append({
            "id": sid,
            "class": class_name,
            "title": title_from_class(class_name),
            "domain": classify_domain(file_path),
            "path": file_path,
            "source_hash": hashlib.sha256(text.encode("utf-8")).hexdigest()[:16],
            "preview": {
                "kind": preview_kind(widget_counts, text),
                "widgets": widget_counts,
                "layout": layout,
                "visible_labels": visible_labels(layout),
                "layout_evidence": "ordered-from-build-source",
                "layout_confidence": 0.90,
                "has_app_bar": bool(widget_counts.get("AppBar")),
                "has_form": bool(widget_counts.get("Form") or widget_counts.get("TextFormField") or widget_counts.get("TextField")),
                "has_list": bool(widget_counts.get("ListView")),
                "has_grid": bool(widget_counts.get("GridView")),
                "has_tabs": bool(widget_counts.get("TabBar")),
                "has_bottom_nav": bool(widget_counts.get("BottomNavigationBar") or widget_counts.get("NavigationBar")),
            },
            "imports": imports,
            "technical_dependencies": technical,
            "api_routes": sorted(api_routes),
            "navigation_out": sorted(set(outgoing)),
            "evidence": {"kind": "code-derived", "path": file_path, "confidence": 0.96},
        })

    screen_ids = {s["id"] for s in screens}
    edges = [e for e in edges if e["from"] in screen_ids and e["to"] in screen_ids]
    incoming: dict[str, list[str]] = {sid: [] for sid in screen_ids}
    for edge in edges:
        incoming[edge["to"]].append(edge["from"])
    for screen in screens:
        screen["navigation_in"] = sorted(set(incoming[screen["id"]]))

    head = git_head(root)
    generated_at = datetime.now(timezone.utc).isoformat()
    inventory = {
        "schema_version": 3,
        "generated_at": generated_at,
        "source": {"repository": args.repo, "branch": args.branch, "head": head},
        "method": "static-code-indexer+ordered-ui-blueprint",
        "confidence_policy": {
            "0.96": "classe/tela/navegação derivada diretamente do código",
            "0.90": "ordem visual derivada lexicalmente do build() e indentação do código",
            "note": "blueprint estrutural não substitui screenshot/runtime; condições e dados dinâmicos podem alterar a tela real",
        },
        "stats": {
            "dart_files": len(dart_files),
            "screens": len(screens),
            "navigation_edges": len(edges),
            "domains": len({s["domain"] for s in screens}),
            "screens_with_layout": sum(1 for s in screens if s["preview"].get("layout")),
        },
        "screens": screens,
        "edges": edges,
    }

    output = pathlib.Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    status = {
        "schema_version": 3,
        "updated_at": generated_at,
        "source": inventory["source"],
        "sync": {"state": "synced" if head != "unknown" else "attention", "method": "github-actions-static-index"},
        "coverage": {
            "screens_indexed": len(screens),
            "screens_with_blueprint": inventory["stats"]["screens_with_layout"],
            "dart_files_scanned": len(dart_files),
            "navigation_edges": len(edges),
        },
        "evidence": {
            "code_index": "generated",
            "ui_blueprint": "ordered-from-build-source",
            "runtime": "not-verified-by-this-job",
        },
        "warnings": [
            "O blueprint representa estrutura estática do build(); condições, dados remotos e estado podem alterar o runtime.",
            "Relações são derivadas estaticamente e devem ser revalidadas quando os arquivos-fonte mudarem.",
            "Backend MAD Builder continua dependente do baseline autoritativo confirmado separadamente.",
        ],
    }
    status_output = pathlib.Path(args.status_output)
    status_output.parent.mkdir(parents=True, exist_ok=True)
    status_output.write_text(json.dumps(status, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(
        f"OK: {len(screens)} telas, {len(edges)} navegações, "
        f"{inventory['stats']['screens_with_layout']} blueprints, HEAD {head[:12]}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
