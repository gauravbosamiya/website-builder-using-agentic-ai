import os
import subprocess
from typing import Tuple
from langchain_core.tools import tool

PROJECT_ROOT = os.path.join(os.getcwd(), "generated_project")


def safe_path_for_project(path: str) -> str:
    # Join the path with project root and normalize it
    full_path = os.path.normpath(os.path.join(PROJECT_ROOT, path))
    project_root_normalized = os.path.normpath(PROJECT_ROOT)
    
    # Check if the resolved path is within project root
    if not full_path.startswith(project_root_normalized + os.sep) and full_path != project_root_normalized:
        raise ValueError("Attempt to write outside project root")
    
    return full_path


@tool
def write_file(path: str, content: str) -> str:
    """Writes content to a file at the specified path within the project root."""
    p = safe_path_for_project(path)
    directory = os.path.dirname(p)
    
    # Create parent directories if they don't exist
    if directory and not os.path.exists(directory):
        os.makedirs(directory)
    
    with open(p, "w", encoding="utf-8") as f:
        f.write(content)
    return f"WROTE:{p}"


@tool
def read_file(path: str) -> str:
    """Reads content from a file at the specified path within the project root."""
    p = safe_path_for_project(path)
    if not os.path.exists(p):
        return ""
    with open(p, "r", encoding="utf-8") as f:
        return f.read()


@tool
def get_current_directory() -> str:
    """Returns the current working directory."""
    return PROJECT_ROOT


@tool
def list_files(directory: str = ".") -> str:
    """Lists all files in the specified directory within the project root."""
    p = safe_path_for_project(directory)
    if not os.path.isdir(p):
        return f"ERROR: {p} is not a directory"
    
    # Get all files recursively
    files = []
    for root, dirs, filenames in os.walk(p):
        for filename in filenames:
            full_file_path = os.path.join(root, filename)
            # Get relative path from project root
            rel_path = os.path.relpath(full_file_path, PROJECT_ROOT)
            files.append(rel_path)
    
    return "\n".join(files) if files else "No files found."


@tool
def run_cmd(cmd: str, cwd: str = None, timeout: int = 30) -> Tuple[int, str, str]:
    """Runs a shell command in the specified directory and returns the result."""
    cwd_dir = safe_path_for_project(cwd) if cwd else PROJECT_ROOT
    res = subprocess.run(cmd, shell=True, cwd=cwd_dir, capture_output=True, text=True, timeout=timeout)
    return res.returncode, res.stdout, res.stderr


def init_project_root():
    if not os.path.exists(PROJECT_ROOT):
        os.makedirs(PROJECT_ROOT)
    return PROJECT_ROOT