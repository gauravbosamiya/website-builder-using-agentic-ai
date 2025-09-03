// app.js - Core logic for ColorfulTodo
// ------------------------------------------------------------
// 1. Data Model
// ------------------------------------------------------------
/**
 * Represents a single todo item.
 */
class TodoItem {
  /**
   * @param {string} text - The todo description.
   */
  constructor(text) {
    this.id = generateId();
    this.text = text;
    this.completed = false;
    this.createdAt = Date.now();
  }
}

/** Generate a UUID using the Web Crypto API */
function generateId() {
  // crypto.randomUUID is widely supported in modern browsers
  return crypto.randomUUID();
}
// expose for debugging / external use
window.generateId = generateId;

// ------------------------------------------------------------
// 2. Storage Module
// ------------------------------------------------------------
const Storage = {
  /** Load todos from localStorage and return an array of TodoItem instances */
  load() {
    const raw = localStorage.getItem('todos');
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      // Re‑instantiate as TodoItem objects (preserve prototype methods if any)
      return parsed.map(obj => Object.assign(new TodoItem(''), obj));
    } catch (e) {
      console.error('Failed to parse stored todos:', e);
      return [];
    }
  },

  /** Save an array of TodoItem instances to localStorage */
  save(todos) {
    try {
      const data = JSON.stringify(todos);
      localStorage.setItem('todos', data);
    } catch (e) {
      console.error('Failed to save todos:', e);
    }
  }
};

// ------------------------------------------------------------
// 3. State Management
// ------------------------------------------------------------
let todos = [];
let currentFilter = 'all'; // 'all' | 'active' | 'completed'

function addTodo(text) {
  const item = new TodoItem(text.trim());
  todos.push(item);
  persistAndRender();
}

function updateTodo(id, updates) {
  const idx = todos.findIndex(t => t.id === id);
  if (idx === -1) return;
  Object.assign(todos[idx], updates);
  persistAndRender();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  persistAndRender();
}

function toggleComplete(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  persistAndRender();
}

function setFilter(filter) {
  currentFilter = filter;
  render();
  // Update active button UI
  document.querySelectorAll('.filter').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  persistAndRender();
}

function persistAndRender() {
  Storage.save(todos);
  render();
}

// ------------------------------------------------------------
// 4. UI Rendering
// ------------------------------------------------------------
function render() {
  const listEl = document.getElementById('todo-list');
  if (!listEl) return;
  // Clear existing items
  listEl.innerHTML = '';

  // Determine which todos are visible based on the filter
  const visibleTodos = todos.filter(todo => {
    if (currentFilter === 'active') return !todo.completed;
    if (currentFilter === 'completed') return todo.completed;
    return true; // 'all'
  });

  visibleTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.dataset.id = todo.id;
    li.draggable = true;

    // Checkbox for completion
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.className = 'toggle';
    checkbox.setAttribute('aria-label', 'Mark as completed');

    // Text span (or editable input later)
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = todo.text;

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'edit';
    editBtn.textContent = '✎';
    editBtn.title = 'Edit';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete';
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Delete';

    // Assemble li
    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    // Attach drag‑and‑drop listeners for this item
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('dragenter', handleDragEnter);
    li.addEventListener('dragleave', handleDragLeave);
    li.addEventListener('drop', handleDrop);
    li.addEventListener('dragend', handleDragEnd);

    listEl.appendChild(li);
  });
}

// ------------------------------------------------------------
// 5. Event Listeners – Delegated Handlers
// ------------------------------------------------------------
function initEventListeners() {
  // Form submission – add new todo
  const form = document.getElementById('todo-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('new-todo');
    const text = input.value.trim();
    if (text) {
      addTodo(text);
      input.value = '';
    }
  });

  // Delegated actions inside the todo list
  const list = document.getElementById('todo-list');
  list.addEventListener('click', e => {
    const li = e.target.closest('li.todo-item');
    if (!li) return;
    const id = li.dataset.id;

    // Completion toggle (checkbox)
    if (e.target.matches('input.toggle')) {
      toggleComplete(id);
      return;
    }

    // Delete button
    if (e.target.matches('button.delete')) {
      deleteTodo(id);
      return;
    }

    // Edit button – simple prompt based editing
    if (e.target.matches('button.edit')) {
      const current = todos.find(t => t.id === id);
      const newText = prompt('Edit todo', current.text);
      if (newText !== null && newText.trim() !== '') {
        updateTodo(id, { text: newText.trim() });
      }
      return;
    }
  });

  // Filter buttons
  document.querySelectorAll('.filter').forEach(btn => {
    btn.addEventListener('click', () => {
      setFilter(btn.dataset.filter);
    });
  });

  // Clear completed button
  const clearBtn = document.getElementById('clear-completed');
  clearBtn.addEventListener('click', () => {
    clearCompleted();
  });

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const newTheme = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = newTheme;
    localStorage.setItem('theme', newTheme);
  });
}

// ------------------------------------------------------------
// 6. Drag‑and‑Drop Handlers
// ------------------------------------------------------------
let draggedId = null;

function handleDragStart(e) {
  draggedId = e.currentTarget.dataset.id;
  e.dataTransfer.effectAllowed = 'move';
  // Some browsers require data to be set
  e.dataTransfer.setData('text/plain', draggedId);
  e.currentTarget.classList.add('dragging');
}

function handleDragOver(e) {
  e.preventDefault(); // Necessary to allow a drop
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  if (e.currentTarget.dataset.id !== draggedId) {
    e.currentTarget.classList.add('drag-placeholder');
  }
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-placeholder');
}

function handleDrop(e) {
  e.preventDefault();
  const targetId = e.currentTarget.dataset.id;
  if (!draggedId || draggedId === targetId) return;

  // Reorder the todos array
  const draggedIdx = todos.findIndex(t => t.id === draggedId);
  const targetIdx = todos.findIndex(t => t.id === targetId);
  if (draggedIdx === -1 || targetIdx === -1) return;

  const [moved] = todos.splice(draggedIdx, 1);
  // Insert before the target index (if dragged was after target, the targetIdx has shifted)
  const insertIdx = draggedIdx < targetIdx ? targetIdx - 1 : targetIdx;
  todos.splice(insertIdx, 0, moved);

  persistAndRender();
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.drag-placeholder').forEach(el => el.classList.remove('drag-placeholder'));
  draggedId = null;
}

// ------------------------------------------------------------
// 7. Initialization
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Load persisted todos
  todos = Storage.load();

  // Load persisted theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.dataset.theme = savedTheme;
  } else {
    // Default theme – light
    document.documentElement.dataset.theme = 'light';
  }

  render();
  initEventListeners();
});

// ------------------------------------------------------------
// 8. Debug exposure (optional)
// ------------------------------------------------------------
window.TodoApp = {
  addTodo,
  updateTodo,
  deleteTodo,
  toggleComplete,
  setFilter,
  clearCompleted,
  todos: () => todos,
  render
};
