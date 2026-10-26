document.addEventListener("DOMContentLoaded", () => {
  const todoForm = document.getElementById("todo-form");
  const todoInput = document.getElementById("todo-input");
  const todoList = document.getElementById("todo-list");
  const emptyState = document.getElementById("empty-state");
  const taskCounter = document.getElementById("task-counter");
  const filterButtons = document.querySelectorAll(".btn-filter");
  const clearCompletedBtn = document.getElementById("clear-completed");
  const currentDateEl = document.getElementById("current-date");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all";

  // Display Current Date
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);

  // Save Tasks to LocalStorage
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Render Tasks to DOM
  function renderTasks() {
    todoList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
      if (currentFilter === "active") return !task.completed;
      if (currentFilter === "completed") return task.completed;
      return true;
    });

    if (filteredTasks.length === 0) {
      emptyState.classList.remove("d-none");
    } else {
      emptyState.classList.add("d-none");
    }

    filteredTasks.forEach(task => {
      const li = document.createElement("li");
      li.className = `todo-item ${task.completed ? "completed" : ""}`;
      
      li.innerHTML = `
        <input type="checkbox" class="todo-checkbox" ${task.completed ? "checked" : ""} data-id="${task.id}">
        <span class="todo-text">${escapeHtml(task.text)}</span>
        <button class="btn-delete" data-id="${task.id}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;

      todoList.appendChild(li);
    });

    updateCounter();
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
  }

  // Update Active Task Counter
  function updateCounter() {
    const activeTasksCount = tasks.filter(t => !t.completed).length;
    taskCounter.textContent = `${activeTasksCount} Active`;
  }

  // Add Task
  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();

    if (text !== "") {
      const newTask = {
        id: Date.now(),
        text: text,
        completed: false
      };

      tasks.push(newTask);
      saveTasks();
      renderTasks();
      todoInput.value = "";
    }
  });

  // Toggle Complete or Delete Task
  todoList.addEventListener("click", (e) => {
    const id = Number(e.target.dataset.id || e.target.parentElement.dataset.id);

    if (e.target.classList.contains("todo-checkbox")) {
      tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
      saveTasks();
      renderTasks();
    }

    if (e.target.classList.contains("btn-delete") || e.target.parentElement.classList.contains("btn-delete")) {
      tasks = tasks.filter(task => task.id !== id);
      saveTasks();
      renderTasks();
    }
  });

  // Filter Switching
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Clear Completed Tasks
  clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
  });

  // Initial Render
  renderTasks();
});