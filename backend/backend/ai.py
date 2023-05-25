from dataclasses import dataclass
from time import time

from langchain.callbacks import get_openai_callback
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate

from backend.ast import load_code


@dataclass
class AiResult:
    total_tokens: float | None = None
    total_cost: float | None = None
    result: str | None = None
    error: str | None = None
    time_s: float | None = None

    def __repr__(self):
        return f"{self.result or ''}{self.error or ''}\n--\nAiResult: used {self.total_tokens} token, cost ${round(self.total_cost, 4)}, took {round(self.time_s, 1)} seconds"


# derived from langchain.agents.mrkl.prompt

# TODO try pandas and polars
template = """
Return a Python script that uses PySpark to transform a data file into the
Brainshare knowledge graph format. The data file is on disk, in the working
directory, with the name `data.txt`. The file is `data.txt`. Infer the file type
from the following file description and excerpt.

A description of the data file provided by the user is: {data_description}

The first three lines of the data file are: {data_head}

The output format is the Brainshare knowledge graph format. The format is two
data frames, one for nodes and one for edges. The nodes data frame has the
following columns: `id`, `node_type`, `properties`. The edges data frame has the
following columns: `source_id`, `target_id`, `relationship_type`.

Three important rules to follow:

1. Load all possible nodes and edges from the data.
2. All edges must have a `source` and `target` node, and both source and target
   nodes must be in the nodes data frame.
3. Prefer the following functions: spark.read.csv, spark.read.json, df.select,
   df.drop, df.filter, df.union, df.filter, df.withColumn, df.withColumnRenamed

Code:

```python
import pyspark
from pyspark.sql import SparkSession

# create SparkSession
spark = SparkSession.builder.appName("Brainshare Knowledge Graph").getOrCreate()

# read data file
"""

inpute_variables = ["data_head", "data_description"]


def clean(code: str) -> str:
    return code.rstrip("`")


def import_code(data_head: str, data_description: str, model_name="gpt-3.5-turbo") -> AiResult:
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
        result = llm_chain.run(data_head=data_head, data_description=data_description)
        ai_result = AiResult(
            result=result,
            total_tokens=cb.total_tokens,
            total_cost=cb.total_cost,
            time_s=time() - start,
        )
    return ai_result
