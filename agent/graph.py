from gc import set_debug
from langchain_core.globals import set_verbose
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from prompts import *
from states import *
from langgraph.graph import StateGraph, START, END
from typing import TypedDict

load_dotenv()

# set_debug(True)
# set_verbose(True)

llm = ChatGroq(model="openai/gpt-oss-120b")

class plannerState(TypedDict):
    user_prompt: str
    plan: Plan
    task_plan: TaskPlan
    code: str


def planner(state:plannerState):
    user_prompt = state["user_prompt"]
    llm_with_structured_output = llm.with_structured_output(Plan)
    prompt = planner_prompt(user_prompt)
    response = llm_with_structured_output.invoke(prompt)
    return {"plan":response}

def architect(state:plannerState):
    plan = state["plan"]
    llm_with_structured_output2 = llm.with_structured_output(TaskPlan)
    prompt = architect_prompt(plan)
    response = llm_with_structured_output2.invoke(prompt)
    response.plan = plan
    return {"task_plan":response}

def coder(state: plannerState):
    steps = state["task_plan"].implementation_steps
    current_step_idx = 0
    current_task = steps[current_step_idx]
    user_prompt = (
        f"Task : {current_task.task_description}\n"
    )
    system_prompt = coder_system_prompt()
    response = llm.invoke(system_prompt + user_prompt)
    return {"code":response.content}


graph = StateGraph(plannerState)
graph.add_node("planner",planner)
graph.add_node("architect", architect)
graph.add_node("coder",coder)
graph.add_edge(START, "planner")
graph.add_edge("planner","architect")
graph.add_edge("architect","coder")
graph.add_edge("coder", END)

workflow = graph.compile()

user_prompt = "create a simple calculator web application"
result = workflow.invoke({"user_prompt":user_prompt})
print(result)