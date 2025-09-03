from tarfile import FIFOTYPE
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class File(BaseModel):
    path: str = Field(description="the path to the file to be created or modified")
    purpose: str=Field(description="The purpose of file, e.g. 'main application logic','data preprocessing module', etc.")

class Plan(BaseModel):
    name: str = Field(description="the name of app to be built")
    description: str = Field(description="A oneline description of the app to be built, e.g. 'A web application for managing personal finances'")
    techstack: str = Field(description="The techstack to be used to build the app, e.g. 'Python', 'Django', 'React', 'TailwindCSS', 'Javascript', 'TypeScript', 'flask','Bootstrap' etc")
    features: list[str] = Field(description="A list of features the app should have, e.g. 'User authentication', 'data visulization', etc")
    files: list[File] = Field(description="A list of files to be created, each with a 'path' and a 'purpose'")

class ImplementationTask(BaseModel):
    file_path: str = Field(description="The path to the file to be modified")
    task_description: str=Field(description="A detailed description of the task to be performed on the file, e.g.'add user authentication', 'implement data processing logic', etc.")

class TaskPlan(BaseModel):
    implementation_steps: list[ImplementationTask] = Field(description="A list of steps to be taken to implement the task")
    model_config = ConfigDict(extra="allow")

class CoderState(BaseModel):
    task_plan: TaskPlan = Field(description="The plan for the task to be implemented")
    current_step_idx : int = Field(0, description="The index of the current steps in the implementation steps")
    current_file_content: Optional[str] = Field(default=None, description="The content of the file currently being edited or created")

