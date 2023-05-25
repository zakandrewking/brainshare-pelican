from dataclasses import dataclass
from time import time
import re
from typing import Any, Union

from langchain.agents import (
    AgentExecutor,
    Tool,
    ZeroShotAgent,
    AgentOutputParser,
)
from langchain.schema import AgentAction, AgentFinish, OutputParserException
from langchain.callbacks import get_openai_callback
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI


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

PREFIX = """Your goal is to return a Python script that loads a data file into
the Brainshare knowledge graph. Load all possible nodes and edges from the data.

To learn about the Python environment and the Brainshare library, you have
access to the following tools:"""

FORMAT_INSTRUCTIONS = """Use the following format for your Working Area:

Goal: <Description of the original coding task>
Thought: <always think about what to do>
Tool: <the name of tool to use; must be one of: {tool_names}>
Tool Input: <the input to the tool; can be empty>
Observation: <the result of the tool>
... (this Thought/Tool/Tool Input/Observation can repeat N times) ...
Thought: I understand the problem well enought to write code
Final Answer: <A working block of code that solves the coding task>"""

SUFFIX = """# File contents

The first three lines of the data file are:
{data_head}

In your Python code, access the entire file as the unicode string `file_contents`.

A description of the data file provided by the user is:
{data_description}

Begin!

# Working Area

Thought: {agent_scratchpad}"""

INPUT_VARIABLES = ["data_head", "data_description", "agent_scratchpad"]

FINAL_ANSWER_ACTION = "Final Answer:"


class OutputParser(AgentOutputParser):
    def get_format_instructions(self) -> str:
        return FORMAT_INSTRUCTIONS

    def parse(self, text: str) -> Union[AgentAction, AgentFinish]:
        if FINAL_ANSWER_ACTION in text:
            return AgentFinish({"output": text.split(FINAL_ANSWER_ACTION)[-1].strip()}, text)
        # \s matches against tab/newline/whitespace
        regex = r"Tool\s*\d*\s*:[\s]*(.*?)[\s]*Tool\s*\d*\s*Input\s*\d*\s*:[\s]*(.*)"
        match = re.search(regex, text, re.DOTALL)
        if not match:
            if not re.search(r"Tool\s*\d*\s*:[\s]*(.*?)", text, re.DOTALL):
                raise OutputParserException(
                    f"Could not parse LLM output: `{text}`",
                    observation="Invalid Format: Missing 'Tool:' after 'Thought:'",
                    llm_output=text,
                    send_to_llm=True,
                )
            elif not re.search(r"[\s]*Tool\s*\d*\s*Input\s*\d*\s*:[\s]*(.*)", text, re.DOTALL):
                raise OutputParserException(
                    f"Could not parse LLM output: `{text}`",
                    observation="Invalid Format:" " Missing 'Tool Input:' after 'Tool:'",
                    llm_output=text,
                    send_to_llm=True,
                )
            else:
                raise OutputParserException(f"Could not parse LLM output: `{text}`")
        action = match.group(1).strip()
        action_input = match.group(2)
        return AgentAction(action, action_input.strip(" ").strip('"'), text)

    @property
    def _type(self) -> str:
        return "mrkl"


def give_data_example(input: str) -> str:
    if input == "city":
        return "{ 'name': 'New York City', 'population': 8_336_817, 'state': 'New York', 'country': 'United States' }"
    elif input == "country":
        return "{ 'name': 'United States', 'population': 328_239_523 }"
    elif input == "state":
        return "{ 'name': 'New York', 'population': 19_453_561 }"
    return ""


def import_code(data_head: str, data_description: str, model_name="gpt-3.5-turbo") -> AiResult:
    tools = [
        Tool.from_function(
            lambda _: """
            Brainshare is a web application that allows users to upload data
            files and then query the data using a Python API. Use tools to learn
            more about the API.""",
            "describe_brainshare",
            "Describe the Brainshare library.",
        ),
        Tool.from_function(
            lambda _: """
            In your code can import these functions with `from brainshare import *`:
            load_node(type: str, data: any) -> int - Load a node into the knowledge graph.  Returns a node_id.
            load_edge(node_id: int, node_id: int) -> None - Load an edge into the knowledge graph",
            """,
            "list_functions",
            "List the Python functions in the Brainshare library.",
        ),
        Tool.from_function(
            lambda _: """city, country, state""",
            "list_node_types",
            "List the existing node types in the knowledge graph.",
        ),
        Tool.from_function(
            give_data_example,
            "give_data_example",
            "Give an example of the data for a node type",
        ),
    ]
    prompt = ZeroShotAgent.create_prompt(
        tools=tools,
        format_instructions=FORMAT_INSTRUCTIONS,
        prefix=PREFIX,
        suffix=SUFFIX,
        input_variables=INPUT_VARIABLES,
    )
    output_parser = OutputParser()
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
    agent = ZeroShotAgent(
        llm_chain=llm_chain, output_parser=output_parser, allowed_tools=[x.name for x in tools]
    )
    agent_executor = AgentExecutor.from_agent_and_tools(
        agent=agent,
        tools=tools,
        max_iterations=10,
        # print responses
        verbose=True,
    )
    with get_openai_callback() as cb:
        start = time()
        result = agent_executor.run(data_head=data_head, data_description=data_description)
        return AiResult(
            result=result,
            total_tokens=cb.total_tokens,
            total_cost=cb.total_cost,
            time_s=time() - start,
        )
