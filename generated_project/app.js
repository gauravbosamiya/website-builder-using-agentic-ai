// Initialize DOM references
const display = document.getElementById('display');
const buttons = document.querySelectorAll('#calculator button');

// State variables
let currentInput = '0';
let previousValue = null;
let operation = null;
let waitingForNewInput = false;

// Helper functions
function setDisplay(value) {
  display.textContent = value;
}

function appendToInput(value) {
  // Prevent multiple decimal points
  if (value === '.' && currentInput.includes('.')) return;

  if (waitingForNewInput) {
    currentInput = value;
    waitingForNewInput = false;
  } else {
    if (currentInput === '0') {
      currentInput = value;
    } else {
      currentInput += value;
    }
  }
  setDisplay(currentInput);
}

function clearInput() {
  currentInput = '0';
  previousValue = null;
  operation = null;
  waitingForNewInput = false;
  setDisplay(currentInput);
}

function backspaceInput() {
  if (waitingForNewInput) return;
  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = '0';
  }
  setDisplay(currentInput);
}

function computeResult() {
  if (!operation || previousValue === null) return;
  const current = parseFloat(currentInput);
  let result;
  switch (operation) {
    case '+':
      result = previousValue + current;
      break;
    case '-':
      result = previousValue - current;
      break;
    case '*':
      result = previousValue * current;
      break;
    case '/':
      result = current === 0 ? 'Infinity' : previousValue / current;
      break;
    default:
      return;
  }
  currentInput = result.toString();
  previousValue = null;
  operation = null;
  waitingForNewInput = true;
  setDisplay(currentInput);
}

function handleButtonClick(event) {
  const btn = event.target;
  const action = btn.dataset.action;
  const value = btn.dataset.value;

  switch (action) {
    case 'digit':
    case 'decimal':
      appendToInput(value);
      break;
    case 'operator':
      previousValue = parseFloat(currentInput);
      operation = value;
      waitingForNewInput = true;
      break;
    case 'equals':
      computeResult();
      break;
    case 'clear':
      clearInput();
      break;
    case 'backspace':
      backspaceInput();
      break;
    default:
      // No action
      break;
  }
}

// Keyboard support
function handleKeyDown(event) {
  const key = event.key;
  const isDigit = key >= '0' && key <= '9';
  const isOperator = ['+', '-', '*', '/'].includes(key);
  const isDecimal = key === '.';
  const isEquals = key === 'Enter' || key === '=';
  const isBackspace = key === 'Backspace';
  const isClear = key === 'Delete' || key.toLowerCase() === 'c';

  if (isDigit || isDecimal || isOperator || isEquals || isBackspace || isClear) {
    event.preventDefault();
  }

  if (isDigit) {
    appendToInput(key);
  } else if (isDecimal) {
    appendToInput('.');
  } else if (isOperator) {
    previousValue = parseFloat(currentInput);
    operation = key;
    waitingForNewInput = true;
  } else if (isEquals) {
    computeResult();
  } else if (isBackspace) {
    backspaceInput();
  } else if (isClear) {
    clearInput();
  }
}

// Attach event listeners to all buttons
buttons.forEach(btn => btn.addEventListener('click', handleButtonClick));

// Attach keyboard event listener
document.addEventListener('keydown', handleKeyDown);
