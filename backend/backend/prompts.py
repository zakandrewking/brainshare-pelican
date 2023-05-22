tool_description_kgquery_list_types = """
Access to the knowledge graph is available using the kgquery tool. You can use
kgquery.list_types function to retrieve a list of the node types in the
knowledge graph. To use it, return:

tool: kgquery.list_types
"""

tool_description_kgquery_search = """
You can use kgquery.search function to retrieve a list of matching nodes in the
knowledge graph. To use it, you must include a type and a search query, like
this:

tool: kgquery.search type: country query: Andorra
"""

dataset_analyze = """
Brainshare is an application that allows users to upload datasets, analyze them,
and incorporate them into a global, collaborative knowledge graph.

{tools}

The user has uploaded a file called "{filename}". The user description of the
file is "{description}". The file has {n_rows} rows. The headers and the first
data row are:

{data_head}

What next steps do you recommend for the user in brainshare?
"""
