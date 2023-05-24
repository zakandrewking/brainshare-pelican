import os
import re
from dataclasses import dataclass
from time import time
from typing import Union

from langchain import SerpAPIWrapper
from langchain.agents import AgentExecutor, AgentOutputParser, LLMSingleActionAgent, Tool
from langchain.callbacks import get_openai_callback
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate, StringPromptTemplate
from langchain.schema import AgentAction, AgentFinish

from backend.prompts import tool_description_kgquery_list_types
from backend.tools import list_types


@dataclass
class AiResult:
    total_tokens: float | None = None
    total_cost: float | None = None
    result: str | None = None
    error: str | None = None
    time_s: float | None = None

    def __repr__(self):
        return f"{self.result or ''}{self.error or ''}\n--\nAiResult: used {self.total_tokens} token, cost ${round(self.total_cost, 4)}, took {round(self.time_s, 1)} seconds"


# https://python.langchain.com/en/latest/modules/agents/agents/custom_llm_agent.html

# Define which tools the agent can use to answer user queries
global serpapi_api_key
search = SerpAPIWrapper()
tools = [
    Tool(
        name="Search",
        func=search.run,
        description="useful for when you need to answer questions about current events",
    )
]

# Set up the base template
template = """
Answer the following questions as best you can, but speaking as a pirate might
speak. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer Thought: you should always think
about what to do Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action Observation: the result of the action ...
(this Thought/Action/Action Input/Observation can repeat N times) Thought: I now
know the final answer Final Answer: the final answer to the original input
question

Begin! Remember to speak as a pirate when giving your final answer. Use lots of
"Arg"s

Question: {input} {agent_scratchpad}"""


# Set up a prompt template
class CustomPromptTemplate(StringPromptTemplate):
    # The template to use
    template: str
    # The list of tools available
    tools: list[Tool]

    def format(self, **kwargs) -> str:
        # Get the intermediate steps (AgentAction, Observation tuples)
        # Format them in a particular way
        intermediate_steps = kwargs.pop("intermediate_steps")
        thoughts = ""
        for action, observation in intermediate_steps:
            thoughts += action.log
            thoughts += f"\nObservation: {observation}\nThought: "
        # Set the agent_scratchpad variable to that value
        kwargs["agent_scratchpad"] = thoughts
        # Create a tools variable from the list of tools provided
        kwargs["tools"] = "\n".join([f"{tool.name}: {tool.description}" for tool in self.tools])
        # Create a list of tool names for the tools provided
        kwargs["tool_names"] = ", ".join([tool.name for tool in self.tools])
        return self.template.format(**kwargs)


prompt = CustomPromptTemplate(
    template=template,
    tools=tools,
    # This omits the `agent_scratchpad`, `tools`, and `tool_names` variables because those are generated dynamically
    # This includes the `intermediate_steps` variable because that is needed
    input_variables=["input", "intermediate_steps"],
)


class CustomOutputParser(AgentOutputParser):
    def parse(self, llm_output: str) -> Union[AgentAction, AgentFinish]:
        # Check if agent should finish
        if "Final Answer:" in llm_output:
            return AgentFinish(
                # Return values is generally always a dictionary with a single `output` key
                # It is not recommended to try anything else at the moment :)
                return_values={"output": llm_output.split("Final Answer:")[-1].strip()},
                log=llm_output,
            )
        # Parse out the action and action input
        regex = r"Action\s*\d*\s*:(.*?)\nAction\s*\d*\s*Input\s*\d*\s*:[\s]*(.*)"
        match = re.search(regex, llm_output, re.DOTALL)
        if not match:
            raise ValueError(f"Could not parse LLM output: `{llm_output}`")
        action = match.group(1).strip()
        action_input = match.group(2)
        # Return the action and action input
        return AgentAction(
            tool=action, tool_input=action_input.strip(" ").strip('"'), log=llm_output
        )


output_parser = CustomOutputParser()

llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.0)


def what_next(file_name: str, file_description: str, file_content: str) -> AiResult:
    llm_chain = LLMChain(
        llm=llm,
        prompt=prompt,
        # print prompts and responses
        verbose=True,
    )
    agent = LLMSingleActionAgent(
        llm_chain=llm_chain, stop=["\nObservation:"], output_parser=output_parser
    )
    agent_executor = AgentExecutor.from_agent_and_tools(
        agent=agent,
        tools=tools,
        # TODO how does this compare to LLMChain(verbose=True)
        verbose=True,
    )
    with get_openai_callback() as cb:
        start = time()
        # try:
        result = agent_executor.run("How many people live in canada as of 2023?")
        # except Exception as e:
        #     return AiResult(
        #         error=f"Error: {e}",
        #         total_tokens=cb.total_tokens,
        #         total_cost=cb.total_cost,
        #         time_s=time() - start,
        #     )
        return AiResult(
            result=result,
            total_tokens=cb.total_tokens,
            total_cost=cb.total_cost,
            time_s=time() - start,
        )
