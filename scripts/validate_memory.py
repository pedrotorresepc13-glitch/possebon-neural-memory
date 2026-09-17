from __future__ import annotations

import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]


def load_json(relative: str):
    path = ROOT / relative
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def fail(message: str) -> None:
    print(f"ERROR: {message}")
    raise SystemExit(1)


def main() -> int:
    memory = load_json("data/project-memory.json")
    state = load_json("data/current-state.json")
    load_json("data/api-contracts.json")

    nodes = memory.get("nodes")
    edges = memory.get("edges")
    if not isinstance(nodes, list) or not nodes:
        fail("project-memory.json precisa conter nodes não vazio")
    if not isinstance(edges, list):
        fail("project-memory.json precisa conter edges")

    ids: set[str] = set()
    allowed = {"stable", "active", "attention", "planned", "blocked"}
    for node in nodes:
        node_id = node.get("id")
        if not isinstance(node_id, str) or not node_id:
            fail("todo node precisa de id")
        if node_id in ids:
            fail(f"node duplicado: {node_id}")
        ids.add(node_id)
        if node.get("status") not in allowed:
            fail(f"status inválido em {node_id}: {node.get('status')}")
        if not node.get("title") or not node.get("summary"):
            fail(f"node {node_id} precisa de title e summary")
        if not isinstance(node.get("x"), (int, float)) or not isinstance(node.get("y"), (int, float)):
            fail(f"node {node_id} precisa de coordenadas numéricas")

    for edge in edges:
        if not isinstance(edge, list) or len(edge) != 2:
            fail(f"edge inválida: {edge}")
        if edge[0] not in ids or edge[1] not in ids:
            fail(f"edge aponta para node inexistente: {edge}")

    if not isinstance(memory.get("global_rules"), list) or not memory["global_rules"]:
        fail("global_rules precisa estar preenchido")

    if not state.get("updated_at"):
        fail("current-state.json precisa de updated_at")
    if not isinstance(state.get("modules"), dict) or not state["modules"]:
        fail("current-state.json precisa de modules")

    forbidden_keys = {
        "password",
        "senha",
        "client_secret",
        "rest_key",
        "access_token",
        "refresh_token",
        "cpf",
    }
    for path in (ROOT / "data").glob("*.json"):
        text = path.read_text(encoding="utf-8").lower()
        # Permite menções documentais a nomes de campos/segredos, mas bloqueia padrões óbvios de atribuição.
        for key in forbidden_keys:
            for marker in (f'"{key}": "ey', f'"{key}": "sk-', f'"{key}": "ghp_', f'"{key}": "github_pat_'):
                if marker in text:
                    fail(f"possível segredo em {path.name}: {key}")

    print(f"OK: {len(nodes)} nodes, {len(edges)} edges, memória estrutural válida")
    return 0


if __name__ == "__main__":
    sys.exit(main())
