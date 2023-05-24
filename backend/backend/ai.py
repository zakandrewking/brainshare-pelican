from dataclasses import dataclass
from time import time

from langchain import SerpAPIWrapper
from langchain.agents import AgentExecutor, Tool
from langchain.agents.mrkl.base import ZeroShotAgent
from langchain.agents.mrkl.output_parser import MRKLOutputParser
from langchain.agents.mrkl.prompt import FORMAT_INSTRUCTIONS, PREFIX, SUFFIX
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


def what_next(question: str) -> AiResult:
    # Define which tools the agent can use to answer user queries
    search = SerpAPIWrapper()
    tools = [
        Tool(
            name="Search",
            func=search.run,
            description="useful for when you need to answer questions about current events",
        )
    ]
    prompt = ZeroShotAgent.create_prompt(
        tools=tools,
        format_instructions=FORMAT_INSTRUCTIONS,
        prefix=PREFIX,
        suffix=SUFFIX,
        input_variables=["input", "agent_scratchpad"],
    )
    output_parser = MRKLOutputParser()
    llm = ChatOpenAI(
        model_name="gpt-3.5-turbo",
        temperature=0.0,
        # no effect
        verbose=False,
    )
    llm_chain = LLMChain(
        llm=llm,
        prompt=prompt,
        # print prompts
        verbose=True,
    )
    agent = ZeroShotAgent(
        llm_chain=llm_chain, output_parser=output_parser, allowed_tools=[x.name for x in tools]
    )
    agent_executor = AgentExecutor.from_agent_and_tools(
        agent=agent,
        tools=tools,
        # print responses
        verbose=True,
    )
    with get_openai_callback() as cb:
        start = time()
        result = agent_executor.run(question)
        return AiResult(
            result=result,
            total_tokens=cb.total_tokens,
            total_cost=cb.total_cost,
            time_s=time() - start,
        )
