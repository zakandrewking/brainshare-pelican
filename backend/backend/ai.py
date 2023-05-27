import ast
import re
import json
from dataclasses import dataclass
from time import time
from typing import Union
import pandas as pd

from langchain.callbacks import get_openai_callback
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate

# TODO for json, provider a jq tool
# TODO for csv, provide a csv tool that can summarize a row or column, e.g.
# min/max/mean/median/sum/count
# TODO get a cobra model into the DB


@dataclass
class AiResult:
    total_tokens: float | None = None
    total_cost: float | None = None
    result: str | None = None
    error: str | None = None
    time_s: float | None = None
    nodes: pd.DataFrame | None = None
    edges: pd.DataFrame | None = None

    def __repr__(self):
        return f"{self.result or ''}{self.error or ''}\n--\nAiResult: used {self.total_tokens} token, cost ${round(self.total_cost, 4)}, took {round(self.time_s, 1)} seconds"


template = """
Return a Python script that uses Pandas to transform a data file into the
Brainshare knowledge graph format. The data file is on disk, in the working
directory, with the name {filename}.

A description of the data file provided by the user is: {data_description}

{data_head}

The output format is the Brainshare knowledge graph format. The format is two
dataframes, one for nodes and one for edges. The `nodes_df` dataframe has the
following columns: `id`, `node_type`, `properties`. The `edges_df` dataframe has
the following columns: `source_id`, `target_id`, `relationship_type`.

Three important rules to follow:

1. Load all possible nodes and edges from the data.
2. All edges must have a `source` and `target` node, and both source and target
   nodes must be in the nodes data frame.
3. Use only the Pandas library to transform the data. Do not use any other
   libraries.
4. Do not use pd.read_json; use json.load instead.

Additional instructions (you MUST follow these instructions to get a good result):
{further_instructions}

Code:

```python import pandas as pd
"""


def clean(code: str) -> str:
    # delete the the line in `code` containing ``` and all lines after it
    return re.sub(r"```.*", "", code, flags=re.DOTALL)


def _head_json(data: Union[dict, list, str, int, float], level: int = 0):
    max_recursion = 5
    list_length = 2
    if isinstance(data, list):
        if level >= max_recursion:
            return ["..."]
        data_head = [_head_json(data[0], level=level + 1) for i in range(list_length)]
        if len(data) < list_length:
            return data_head
        else:
            data_head.append("...")
            return data_head
    elif isinstance(data, dict):
        if level >= max_recursion:
            return {"..."}
        return {k: _head_json(v, level=level + 1) for k, v in data.items()}
    elif isinstance(data, str):
        if len(data) < 200:
            return data
        else:
            return data[:200] + "..."
    else:
        return data


def get_data_head_json(data_path: str) -> str:
    with open(data_path) as f:
        data = json.load(f)
    if isinstance(data, dict) or isinstance(data, list):
        return json.dumps(_head_json(data))
    else:
        # return first 500 characters of the file
        with open(data_path) as f:
            data_raw = f.read()
        return f"{data_raw[:500]}..."


def get_data_head_line_based(data_path: str):
    with open(data_path) as f:
        data_head = "\n".join([f.readline() for _ in range(3)])
    return data_head


def import_code(
    data_path: str,
    data_description: str,
    further_instructions: str = "",
    model_name="gpt-3.5-turbo",
) -> AiResult:
    extension = data_path.split(".")[-1]
    filename = data_path.split("/")[-1]
    if not extension in ["json", "csv", "tsv", "txt", "tab"]:
        raise ValueError(f"File extension {extension} not supported")

    data_head_content = (
        get_data_head_json(data_path)
        if extension == "json"
        else get_data_head_line_based(data_path)
    )

    data_head_template = (
        "An excerpt of the JSON data structure is:"
        if extension == "json"
        else "The first few lines of the data are:"
    )
    data_head = f"""{data_head_template}
{data_head_content}
"""

    prompt = PromptTemplate.from_template(template)
    llm = ChatOpenAI(
        model_name=model_name,
        temperature=0.0,
        # no effect
        verbose=False,
    )
    llm_chain = LLMChain(
        llm=llm,
        prompt=prompt,
        # print prompts
        verbose=False,
    )
    with get_openai_callback() as cb:
        start = time()
        result = llm_chain.run(
            filename=filename,
            data_head=data_head,
            data_description=data_description,
            further_instructions=further_instructions,
        )
        ai_result = AiResult(
            result=result,
            total_tokens=cb.total_tokens,
            total_cost=cb.total_cost,
            time_s=time() - start,
        )

    # if ai_result.result is None:
    #     return ai_result
    return ai_result

    cleaned = clean(ai_result.result)
    tree = ast.parse(cleaned)
    # - only a limited number of pandas functions: read_csv, read_json, to_csv,
    # to_json, head, tail, describe, info, dropna, fillna, drop_duplicates,
    # drop, rename, merge, concat, groupby, apply, sort_values, sort_index,
    # reset_index, set_index, loc, iloc, at, iat, iterrows, itertuples, values,
    # columns, index, shape, size, dtypes, astype, isna, isnull, notna, notnull
    # - no funny business; no nested loops, no recursion, no imports

    nodes: pd.DataFrame | None = None
    edges: pd.DataFrame | None = None
    exec(cleaned)
    ai_result.nodes = nodes
    ai_result.edges = edges

    return ai_result
