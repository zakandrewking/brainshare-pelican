import os
from backend.prompts import tool_description_kgquery_list_types

from langchain.llms import OpenAI


def what_next(file_name: str, file_description: str, file_content: str) -> str:
    llm = OpenAI(temperature=0.9)
    return "yay"
