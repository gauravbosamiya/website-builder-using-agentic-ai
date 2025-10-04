// Colorful Todo App script
// Constants and state
const STORAGE_KEY = 'colorful_todo_items';
let todos = [];
let currentFilter = 'all'; // 'all' | 'active' | 'completed'

// Load todos from localStorage
function loadTodos() {
  const data = localStorage.getItem(STORAGE_KEY);
  try {
    todos = data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to parse todos from localStorage', e);
    todos = [];
  }
}

// Save current todos to localStorage
function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error('Failed to save todos to localStorage', e);
  }
}

// Render the todo list based on the current filter
function renderTodos(filter = currentFilter) {
  const listEl = document.getElementById('todo-list');
  if (!listEl) return;
  // Clear existing items
  listEl.innerHTML = '';

  const filtered = todos.filter(todo => {
    if (filter === 'all') return true;
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  filtered.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    if (todo.completed) li.classList.add('completed');
    li.dataset.id = todo.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.dataset.id = todo.id;
    checkbox.className = 'toggle-checkbox';

    const span = document.createElement('span');
    span.textContent = todo.text;
    span.className = 'todo-text';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.dataset.id = todo.id;
    deleteBtn.textContent = '✕';

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    listEl.appendChild(li);
  });

  // Update filter button active state
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
}

// Add a new todo item
function addTodo(text) {
  const id = Date.now();
  todos.push({ id, text, completed: false });
  saveTodos();
  renderTodos();
}

// Toggle completed state of a todo
function toggleTodo(id) {
  const todo = todos.find(t => t.id === Number(id));
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
  }
}

// Delete a todo item
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== Number(id));
  saveTodos();
  renderTodos();
}

// Set the current filter and re-render
function setFilter(filter) {
  currentFilter = filter;
  renderTodos();
}

// Attach event listeners after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  renderTodos();

  // Form submission for adding todos
  const form = document.getElementById('todo-form');
  const input = document.getElementById('new-todo');
  if (form && input) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = input.value.trim();
      if (text) {
        addTodo(text);
        input.value = '';
        input.focus();
      }
    });
  }

  // Event delegation for toggle and delete actions
  const listEl = document.getElementById('todo-list');
  if (listEl) {
    listEl.addEventListener('change', e => {
      const target = e.target;
      if (target.matches('input.toggle-checkbox')) {
        const id = target.dataset.id;
        toggleTodo(id);
      }
    });

    listEl.addEventListener('click', e => {
      const target = e.target;
      if (target.matches('button.delete-btn')) {
        const id = target.dataset.id;
        deleteTodo(id);
      }
    });
  }

  // Filter button clicks
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      setFilter(filter);
    });
  });
});
