from __future__ import annotations

import argparse
import json
import pathlib
import re
from collections import Counter, defaultdict, deque

ROLE_TOKENS = {
    'screen', 'form', 'formulario', 'detail', 'detalhe', 'details', 'lista', 'list',
    'page', 'view', 'novo', 'nova', 'cadastro', 'editar', 'edicao', 'edit', 'scanner',
    'mapa', 'map', 'home', 'main', 'index', 'resumo', 'resultado', 'legacy'
}
WEAK_TOKENS = {'meu', 'minha', 'meus', 'minhas', 'app', 'possebon'}
SPECIAL = {'qr': 'QR', 'rdo': 'RDO', 'epi': 'EPI', 'epis': 'EPIs', 'lgpd': 'LGPD'}


def slug(value: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-') or 'module'


def camel_words(value: str) -> list[str]:
    value = re.sub(r'Screen$', '', value or '')
    value = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', value)
    value = re.sub(r'[_-]+', ' ', value)
    return [p.lower() for p in value.split() if p]


def semantic_tokens(screen: dict) -> list[str]:
    words = camel_words(screen.get('class') or screen.get('title') or '')
    return list(dict.fromkeys(w for w in words if w not in ROLE_TOKENS and w not in WEAK_TOKENS))


def pretty(token: str) -> str:
    return SPECIAL.get(token, token[:1].upper() + token[1:])


def class_block(text: str, class_name: str) -> str:
    m = re.search(rf'\bclass\s+{re.escape(class_name)}\b[^{{]*\{{', text)
    if not m:
        return ''
    start = text.find('{', m.start())
    if start < 0:
        return ''
    depth = 0
    quote: str | None = None
    escaped = False
    line_comment = False
    block_comment = False
    i = start
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ''
        if line_comment:
            if ch == '\n':
                line_comment = False
            i += 1
            continue
        if block_comment:
            if ch == '*' and nxt == '/':
                block_comment = False
                i += 2
                continue
            i += 1
            continue
        if quote:
            if escaped:
                escaped = False
            elif ch == '\\':
                escaped = True
            elif ch == quote:
                quote = None
            i += 1
            continue
        if ch == '/' and nxt == '/':
            line_comment = True
            i += 2
            continue
        if ch == '/' and nxt == '*':
            block_comment = True
            i += 2
            continue
        if ch in ('\'', '"'):
            quote = ch
            i += 1
            continue
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return text[start + 1:i]
        i += 1
    return text[start + 1:]


def declared_steps(block: str) -> list[str]:
    if not block:
        return []
    patterns = [
        r'(?:static\s+)?const\s+(?:List<[^>]+>\s+)?[_A-Za-z0-9]*(?:etap|step|pagina|page)[_A-Za-z0-9]*\s*=\s*\[([^\]]{1,2000})\]',
        r'(?:final|const)\s+[_A-Za-z0-9]*(?:etap|step|pagina|page)[_A-Za-z0-9]*\s*=\s*\[([^\]]{1,2000})\]',
    ]
    for pattern in patterns:
        for m in re.finditer(pattern, block, flags=re.I | re.S):
            values = re.findall(r"['\"]([^'\"\n]{1,80})['\"]", m.group(1))
            clean = [re.sub(r'\s+', ' ', value).strip() for value in values if value.strip()]
            if 2 <= len(clean) <= 16:
                return list(dict.fromkeys(clean))
    return []


class UnionFind:
    def __init__(self, ids: list[str]):
        self.parent = {x: x for x in ids}

    def find(self, x: str) -> str:
        p = self.parent[x]
        while p != self.parent[p]:
            p = self.parent[p]
        while x != p:
            nxt = self.parent[x]
            self.parent[x] = p
            x = nxt
        return p

    def union(self, a: str, b: str) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[rb] = ra


def module_title(items: list[dict]) -> str:
    if len(items) == 1:
        return items[0].get('title') or items[0].get('class') or 'Tela'
    sets = [set(semantic_tokens(s)) for s in items if semantic_tokens(s)]
    if sets:
        common = sorted(set.intersection(*sets), key=lambda x: (-len(x), x)) if len(sets) > 1 else sorted(sets[0])
        if common:
            ordered = [t for t in semantic_tokens(items[0]) if t in common]
            return ' '.join(pretty(t) for t in (ordered or common)[:3])
    if all(s.get('path') == items[0].get('path') for s in items):
        stem = pathlib.Path(items[0].get('path') or '').stem
        parts = [p for p in stem.split('_') if p not in ROLE_TOKENS]
        if parts:
            return ' '.join(pretty(p) for p in parts)
    counts = Counter(t for s in items for t in semantic_tokens(s))
    if counts:
        return pretty(counts.most_common(1)[0][0])
    return items[0].get('title') or 'Módulo'


def role_weight(screen: dict) -> int:
    value = f"{screen.get('class', '')} {screen.get('title', '')}".lower()
    if re.search(r'form|cadastro|novo|nova', value):
        return 20
    if re.search(r'detalhe|detail|resultado', value):
        return 30
    if re.search(r'mapa|map|scanner', value):
        return 12
    return 0


def order_group(items: list[dict], edges: list[dict]) -> tuple[list[dict], str, dict[str, int]]:
    ids = {s['id'] for s in items}
    incoming = {sid: 0 for sid in ids}
    outgoing: dict[str, list[str]] = {sid: [] for sid in ids}
    for edge in edges:
        if edge.get('from') in ids and edge.get('to') in ids:
            outgoing[edge['from']].append(edge['to'])
            incoming[edge['to']] += 1
    roots = [s for s in items if incoming[s['id']] == 0]
    if not roots:
        roots = sorted(items, key=lambda s: (role_weight(s), s.get('title', '')))
    else:
        roots.sort(key=lambda s: (role_weight(s), s.get('title', '')))
    entry = roots[0]['id']
    depth: dict[str, int] = {s['id']: 0 for s in roots}
    queue = deque(s['id'] for s in roots)
    while queue:
        current = queue.popleft()
        for nxt in outgoing[current]:
            candidate = depth[current] + 1
            if nxt not in depth or candidate < depth[nxt]:
                depth[nxt] = candidate
                queue.append(nxt)
    ordered = sorted(items, key=lambda s: (depth.get(s['id'], 99), role_weight(s), s.get('title', '')))
    return ordered, entry, depth


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--app-root', required=True)
    parser.add_argument('--inventory', default='data/app-inventory.json')
    args = parser.parse_args()

    app_root = pathlib.Path(args.app_root).resolve()
    inventory_path = pathlib.Path(args.inventory)
    data = json.loads(inventory_path.read_text(encoding='utf-8'))
    screens: list[dict] = data.get('screens', [])
    edges: list[dict] = data.get('edges', [])
    by_id = {s['id']: s for s in screens}

    source_cache: dict[str, str] = {}
    for screen in screens:
        rel_path = screen.get('path') or ''
        if rel_path not in source_cache:
            path = app_root / rel_path
            source_cache[rel_path] = path.read_text(encoding='utf-8', errors='replace') if path.exists() else ''
        block = class_block(source_cache[rel_path], screen.get('class', ''))
        steps = declared_steps(block)
        screen['declared_steps'] = steps
        if steps:
            screen['declared_steps_evidence'] = {
                'kind': 'code-declared-sequence',
                'path': rel_path,
                'confidence': 0.99,
            }

    uf = UnionFind(list(by_id))
    by_path: dict[str, list[dict]] = defaultdict(list)
    for screen in screens:
        by_path[screen.get('path') or ''].append(screen)
    for items in by_path.values():
        if len(items) > 1:
            for item in items[1:]:
                uf.union(items[0]['id'], item['id'])

    for i, a in enumerate(screens):
        ta = semantic_tokens(a)
        for b in screens[i + 1:]:
            if a.get('domain') != b.get('domain'):
                continue
            tb = semantic_tokens(b)
            common = set(ta) & set(tb)
            if any(len(t) >= 5 or t in {'qr', 'rdo', 'epi', 'cracha'} for t in common):
                uf.union(a['id'], b['id'])

    for edge in edges:
        a, b = by_id.get(edge.get('from')), by_id.get(edge.get('to'))
        if not a or not b or a.get('domain') != b.get('domain'):
            continue
        if set(semantic_tokens(a)) & set(semantic_tokens(b)):
            uf.union(a['id'], b['id'])

    grouped: dict[str, list[dict]] = defaultdict(list)
    for screen in screens:
        grouped[uf.find(screen['id'])].append(screen)

    modules: list[dict] = []
    used_module_ids: set[str] = set()
    for items in grouped.values():
        title = module_title(items)
        base_id = slug(title)
        module_id = base_id
        suffix = 2
        while module_id in used_module_ids:
            module_id = f'{base_id}-{suffix}'
            suffix += 1
        used_module_ids.add(module_id)
        ordered, entry, depth = order_group(items, edges)
        ids = {s['id'] for s in items}
        internal_edges = [e for e in edges if e.get('from') in ids and e.get('to') in ids]
        domain = Counter(s.get('domain') or 'App' for s in items).most_common(1)[0][0]
        modules.append({
            'id': module_id,
            'title': title,
            'domain': domain,
            'entry_screen': entry,
            'screens': [s['id'] for s in ordered],
            'flow_edges': internal_edges,
            'evidence': {
                'kind': 'code-derived-module-flow',
                'confidence': 0.96,
                'rules': ['same-file-screen-group', 'semantic-root', 'confirmed-navigation'],
            },
        })
        for position, screen in enumerate(ordered, start=1):
            screen['module'] = {
                'id': module_id,
                'title': title,
                'domain': domain,
                'entry': screen['id'] == entry,
                'position': position,
                'flow_depth': depth.get(screen['id']),
            }

    modules.sort(key=lambda m: (m['domain'], m['title']))
    data['schema_version'] = max(int(data.get('schema_version') or 0), 4)
    data['method'] = f"{data.get('method', 'static-code-indexer')}+module-flow-enrichment"
    data['modules'] = modules
    data.setdefault('stats', {})['modules'] = len(modules)
    data['stats']['screens_with_declared_steps'] = sum(1 for s in screens if s.get('declared_steps'))
    data.setdefault('confidence_policy', {})['0.99'] = 'sequência/etapas declaradas explicitamente no código'
    data['confidence_policy']['0.96-module'] = 'agrupamento e fluxo derivados de arquivo, raiz funcional e navegação confirmada'

    inventory_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
