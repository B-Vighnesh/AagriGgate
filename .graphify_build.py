import json
from pathlib import Path

from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.export import to_html, to_json
from graphify.report import generate

root = Path(r"G:\MY_PROJECTS\AagriGgate")
out = root / "graphify-out"
out.mkdir(exist_ok=True)

extraction = json.loads((root / ".graphify_extract.json").read_text(encoding="utf-8"))
detection = json.loads((root / ".graphify_detect.json").read_text(encoding="utf-8"))

graph = build_from_json(extraction)
communities = cluster(graph)
cohesion = score_all(graph, communities)
tokens = {
    "input": extraction.get("input_tokens", 0),
    "output": extraction.get("output_tokens", 0),
}
gods = god_nodes(graph)
surprises = surprising_connections(graph, communities)
labels = {community_id: f"Community {community_id}" for community_id in communities}
questions = suggest_questions(graph, communities, labels)

report = generate(
    graph,
    communities,
    cohesion,
    labels,
    gods,
    surprises,
    detection,
    tokens,
    str(root),
    suggested_questions=questions,
)
(out / "GRAPH_REPORT.md").write_text(report, encoding="utf-8")
to_json(graph, communities, str(out / "graph.json"))

analysis = {
    "communities": {str(key): value for key, value in communities.items()},
    "cohesion": {str(key): value for key, value in cohesion.items()},
    "gods": gods,
    "surprises": surprises,
    "questions": questions,
}
(root / ".graphify_analysis.json").write_text(json.dumps(analysis, indent=2), encoding="utf-8")

if graph.number_of_nodes() <= 5000:
    to_html(graph, communities, str(out / "graph.html"), community_labels=labels or None)

print(
    f"Graph: {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges, {len(communities)} communities"
)
