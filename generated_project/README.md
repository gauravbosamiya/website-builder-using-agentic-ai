# ColorfulTodoApp

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Description
A simple, colorful web‑based Todo app built with vanilla HTML, CSS, and JavaScript. It features localStorage persistence, responsive design, and a vibrant color scheme.

## Tech Stack
- **HTML5**
- **CSS3** (custom properties, flexbox, media queries)
- **JavaScript (ES6)**

## Features
- Add new todo items
- Mark items as completed
- Delete todo items
- Filter view: All, Active, Completed
- Responsive design with vibrant color scheme
- Persist todos in `localStorage`

## Installation / Usage
1. Clone or download the repository.
2. Open `index.html` in any modern browser.
3. Interact with the UI – no build step required.

## Project Structure
```
/index.html   – main markup and UI layout
/styles.css   – styling and responsive layout
/script.js    – application logic, CRUD, filtering, persistence
/README.md    – this documentation
```

## Development Notes
- The JavaScript file expects the HTML elements with IDs `todo-form`, `new-todo`, `todo-list` and class `filter-btn` as defined in `index.html`.
- CSS custom properties control the color palette; modify them in `styles.css` to change the theme.

## Contributing
1. Fork the repository.
2. Create a new branch for your feature or bug‑fix.
3. Make your changes, ensuring the existing functionality remains intact.
4. Commit with clear messages and push to your fork.
5. Open a pull request describing the changes and why they are beneficial.

## License
This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.
