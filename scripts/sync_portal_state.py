#!/usr/bin/env python3
"""Atualiza somente HEADs de GitHub; jamais presume que HEAD=produção."""
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

PATH=Path("data/portal-state.json")
repo="pedrotorresepc13-glitch/possebon-portal"
token=os.environ.get("POSSEBON_PORTAL_SOURCE_TOKEN") or os.environ.get("POSSEBON_SOURCE_TOKEN") or ""
obj=json.loads(PATH.read_text(encoding="utf8"))
obj.setdefault("sync",{})
now=datetime.now(timezone.utc).isoformat()
def fetch(path):
    headers={"Accept":"application/vnd.github+json","User-Agent":"possebon-portal-brain"}
    if token: headers["Authorization"]="Bearer "+token
    with urlopen(Request("https://api.github.com/repos/"+repo+"/"+path,headers=headers),timeout=20) as response:
        return json.load(response)
try:
    info=fetch("")
    branches=[]
    for page in range(1,6):
        chunk=fetch("branches?per_page=100&page="+str(page))
        branches.extend({"name":x["name"],"sha":x["commit"]["sha"]} for x in chunk)
        if len(chunk)<100:break
    prs=[]
    for page in range(1,6):
        chunk=fetch("pulls?state=open&per_page=100&page="+str(page))
        prs.extend({"number":x["number"],"title":x["title"],"head":x["head"]["sha"],
            "branch":x["head"]["ref"],"base":x["base"]["sha"],"draft":x["draft"],
            "updated_at":x["updated_at"]} for x in chunk)
        if len(chunk)<100:break
    obj["git_observed"]={"default_branch":info["default_branch"],"branches":branches,"open_prs":prs,"checked_at":now}
    obj["sync"].update(status="synced",last_checked=now,method="GitHub API (branches and PRs)")
    obj["sync"].pop("error",None)
except Exception as exc:
    obj["sync"].update(status="attention",last_checked=now,error=type(exc).__name__)
PATH.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
