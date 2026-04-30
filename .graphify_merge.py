import json
from pathlib import Path

root = Path(r"G:\MY_PROJECTS\AagriGgate")
ast = json.loads((root / ".graphify_ast.json").read_text(encoding="utf-8"))
sem_path = root / ".graphify_semantic.json"

if sem_path.exists():
    sem = json.loads(sem_path.read_text(encoding="utf-8"))
else:
    sem = {"nodes": [], "edges": [], "hyperedges": [], "input_tokens": 0, "output_tokens": 0}

seen = {node["id"] for node in ast["nodes"]}
merged_nodes = list(ast["nodes"])
for node in sem["nodes"]:
    if node["id"] not in seen:
        merged_nodes.append(node)
        seen.add(node["id"])

merged = {
    "nodes": merged_nodes,
    "edges": ast["edges"] + sem["edges"],
    "hyperedges": sem.get("hyperedges", []),
    "input_tokens": sem.get("input_tokens", 0),
    "output_tokens": sem.get("output_tokens", 0),
}

(root / ".graphify_extract.json").write_text(json.dumps(merged, indent=2), encoding="utf-8")
print(
    "Merged:",
    len(merged_nodes),
    "nodes,",
    len(merged["edges"]),
    "edges (",
    len(ast["nodes"]),
    "AST +",
    len(sem["nodes"]),
    "semantic )",
)
