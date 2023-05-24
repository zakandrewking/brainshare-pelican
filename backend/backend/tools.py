from langchain.tools import Tool


def list_types_fn(_: str) -> str:
    return "cities, countries"


list_types = Tool.from_function(
    list_types_fn, "list_types", "List the node types in the knowledge graph"
)
