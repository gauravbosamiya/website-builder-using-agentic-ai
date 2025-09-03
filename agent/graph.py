from ast import Lambda, mod
import stat
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from prompts import *
from states import *
from tools import *
from langgraph.graph import StateGraph, START, END
from typing import TypedDict
from langgraph.prebuilt import create_react_agent
# from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace

load_dotenv()

# set_debug(True)
# set_verbose(True)

llm = ChatGroq(model="openai/gpt-oss-20b")

class plannerState(TypedDict):
    user_prompt: str
    plan: Plan
    task_plan: TaskPlan
    code: str
    coder_state: CoderState


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
    coder_state = state.get("coder_state")  
    if coder_state is None:
        coder_state =  CoderState(task_plan=state["task_plan"], current_step_idx=0)

    steps = coder_state.task_plan.implementation_steps

    if coder_state.current_step_idx >= len(steps):
        return {"coder_state": coder_state, "status": "DONE"}


    current_task = steps[coder_state.current_step_idx]

    existing_content = read_file.invoke({"path": current_task.file_path})


    user_prompt = (
        f"Task : {current_task.task_description}\n"
        f"File: {current_task.file_path}\n"
        f"Existing content: \n{existing_content}\n"
        "Use write_file(path, content) to save your changes"
    )
    system_prompt = coder_system_prompt()

    tools = [read_file, write_file, list_files, get_current_directory]

    react_agent = create_react_agent(
        llm, tools
    )
    response = react_agent.invoke({
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    })

    coder_state.current_step_idx+=1
    return {"coder_state": coder_state}

def should_continue_coding(state: plannerState) -> str:
    """Determine if coding should continue or end"""
    return "END" if state.get("status") == "DONE" else "coder"



graph = StateGraph(plannerState)
graph.add_node("planner",planner)
graph.add_node("architect", architect)
graph.add_node("coder",coder)

graph.add_edge(START, "planner")
graph.add_edge("planner","architect")
graph.add_edge("architect","coder")
graph.add_conditional_edges(
    "coder", 
    should_continue_coding, 
    {"END": END, "coder": "coder"}
)

workflow = graph.compile()

result = workflow.invoke(
    {"user_prompt": "build simple colorful calculator using html, css and js "},
    config={"recursion_limit": 100} 
)
