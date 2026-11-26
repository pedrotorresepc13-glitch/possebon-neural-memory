#!/usr/bin/env python3
"""Atualiza apenas referências Git do Portal; a memória canônica é portal-brain."""
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

PATH = Path("data/portal-state.json")
REPO = "pedrotorresepc13-glitch/possebon-portal"
TOKEN = os.environ.get("POSSEBON_PORTAL_SOURCE_TOKEN") or os.environ.get("POSSEBON_SOURCE_TOKEN") or ""
obj = json.loads(PATH.read_text(encoding="utf8"))
obj.setdefault("sync", {})
now = datetime.now(timezone.utc).isoformat()

def fetch(path):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "possebon-portal-brain",
        "Authorization": "Bearer " + TOKEN,
    }
    url = "https://api.github.com/repos/" + REPO + "/" + path
    with urlopen(Request(url, headers=headers), timeout=20) as response:
        return json.load(response)

if not TOKEN:
    # O repositório público não precisa do token da memória privada do Portal
    # para editar regras de página. Esta sincronização é somente referencial.
    obj["sync"].update(
        status="legacy_reference_only",
        last_checked=now,
        method="Fonte canônica: possebon-portal / portal-brain",
        notice="As regras de página e o estado do Portal são editados na branch privada portal-brain.",
    )
    obj["sync"].pop("error", None)
else:
    try:
        info = fetch("")
        branches = []
        for page in range(1, 6):
            chunk = fetch("branches?per_page=100&page=" + str(page))
            branches.extend(
                {"name": entry["name"], "sha": entry["commit"]["sha"]}
                for entry in chunk
            )
            if len(chunk) < 100:
                break
        prs = []
        for page in range(1, 6):
            chunk = fetch("pulls?state=open&per_page=100&page=" + str(page))
            prs.extend({
                "number": entry["number"],
                "title": entry["title"],
                "head": entry["head"]["sha"],
                "branch": entry["head"]["ref"],
                "base": entry["base"]["sha"],
                "draft": entry["draft"],
                "updated_at": entry["updated_at"],
            } for entry in chunk)
            if len(chunk) < 100:
                break
        obj["git_observed"] = {
            "default_branch": info["default_branch"],
            "branches": branches,
            "open_prs": prs,
            "checked_at": now,
        }
        obj["sync"].update(
            status="synced",
            last_checked=now,
            method="GitHub API (branches and PRs)",
        )
        obj["sync"].pop("error", None)
    except Exception as exc:
        obj["sync"].update(
            status="attention",
            last_checked=now,
            error=type(exc).__name__,
            notice="Falha na leitura opcional de branches. O cérebro canônico continua em portal-brain.",
        )

PATH.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
