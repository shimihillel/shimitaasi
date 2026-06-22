const STORAGE_KEY = "shimi-taasi-tasks-v1";

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const addTaskButton = document.getElementById("addTaskButton");
const taskDialog = document.getElementById("taskDialog");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const dialogTitle = document.getElementById("dialogTitle");
const closeDialogButton = document.getElementById("closeDialogButton");
const charCount = document.getElementById("charCount");
const deleteDialog = document.getElementById("deleteDialog");
const cancelDeleteButton = document.getElementById("cancelDeleteButton");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");

let tasks = [];
let editingTaskId = null;
let deletingTaskId = null;

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKey) {
  if (dateKey === todayKey()) return "נוסף היום";

  const [year, month, day] = dateKey.split("-").map(Number);
  const taskDate = new Date(year, month - 1, day);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  if (dateKey === yKey) return "נוסף אתמול";
  return `נוסף ${taskDate.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" })}`;
}

function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    tasks = [];
  }

  removeOldDoneTasks();
  saveTasks();
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function removeOldDoneTasks() {
  const today = todayKey();
  tasks = tasks.filter(task => !task.done || task.doneAt === today);
}

function createTask(text) {
  tasks.unshift({
    id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: text.trim(),
    createdAt: todayKey(),
    done: false,
    doneAt: null
  });
  saveTasks();
  renderTasks();
}

function updateTask(id, text) {
  tasks = tasks.map(task => task.id === id ? { ...task, text: text.trim() } : task);
  saveTasks();
  renderTasks();
}

function toggleDone(id) {
  const today = todayKey();
  tasks = tasks.map(task => {
    if (task.id !== id) return task;
    const nextDone = !task.done;
    return { ...task, done: nextDone, doneAt: nextDone ? today : null };
  });
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function moveTaskUp(id) {
  const index = tasks.findIndex(task => task.id === id);
  if (index <= 0) return;
  [tasks[index - 1], tasks[index]] = [tasks[index], tasks[index - 1]];
  saveTasks();
  renderTasks();
}

function openTaskDialog(mode, task = null) {
  editingTaskId = mode === "edit" ? task.id : null;
  dialogTitle.innerHTML = mode === "edit" ? "<mark>מה לשנות פה?</mark>" : "<mark>מה נפל עלייך עכשיו?</mark>";
  taskInput.value = task?.text || "";
  updateCharCount();
  taskDialog.showModal();
  setTimeout(() => taskInput.focus(), 50);
}

function closeTaskDialog() {
  taskDialog.close();
  editingTaskId = null;
  taskForm.reset();
  updateCharCount();
}

function openDeleteDialog(id) {
  deletingTaskId = id;
  deleteDialog.showModal();
}

function closeDeleteDialog() {
  deleteDialog.close();
  deletingTaskId = null;
}

function updateCharCount() {
  charCount.textContent = taskInput.value.length;
}

function renderTasks() {
  removeOldDoneTasks();
  taskList.innerHTML = "";
  emptyState.hidden = tasks.length > 0;

  tasks.forEach((task, index) => {
    const row = document.createElement("article");
    row.className = `task-row${task.done ? " done" : ""}`;

    const checkButton = document.createElement("button");
    checkButton.className = "check-button";
    checkButton.type = "button";
    checkButton.setAttribute("aria-label", task.done ? "בטלי ביצוע" : "סמני שבוצע");
    checkButton.innerHTML = '<span class="check-shape" aria-hidden="true"></span>';
    checkButton.addEventListener("click", () => toggleDone(task.id));

    const textWrap = document.createElement("div");
    textWrap.className = "task-text-wrap";

    const taskText = document.createElement("div");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const taskDate = document.createElement("div");
    taskDate.className = "task-date";
    taskDate.textContent = formatDateLabel(task.createdAt);

    textWrap.append(taskText, taskDate);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const moveButton = document.createElement("button");
    moveButton.className = "action-button move";
    moveButton.type = "button";
    moveButton.textContent = "↑";
    moveButton.setAttribute("aria-label", "העלי מטלה למעלה");
    moveButton.disabled = index === 0;
    moveButton.addEventListener("click", () => moveTaskUp(task.id));

    const editButton = document.createElement("button");
    editButton.className = "action-button edit";
    editButton.type = "button";
    editButton.textContent = "✎";
    editButton.setAttribute("aria-label", "עריכת מטלה");
    editButton.addEventListener("click", () => openTaskDialog("edit", task));

    const deleteButton = document.createElement("button");
    deleteButton.className = "action-button delete";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "מחיקת מטלה");
    deleteButton.addEventListener("click", () => openDeleteDialog(task.id));

    actions.append(moveButton, editButton, deleteButton);
    row.append(checkButton, textWrap, actions);
    taskList.appendChild(row);
  });
}

addTaskButton.addEventListener("click", () => openTaskDialog("add"));
closeDialogButton.addEventListener("click", closeTaskDialog);
taskInput.addEventListener("input", updateCharCount);

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  if (editingTaskId) {
    updateTask(editingTaskId, text);
  } else {
    createTask(text);
  }

  closeTaskDialog();
});

cancelDeleteButton.addEventListener("click", closeDeleteDialog);
confirmDeleteButton.addEventListener("click", () => {
  if (deletingTaskId) deleteTask(deletingTaskId);
  closeDeleteDialog();
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (taskDialog.open) closeTaskDialog();
    if (deleteDialog.open) closeDeleteDialog();
  }
});

loadTasks();
renderTasks();
