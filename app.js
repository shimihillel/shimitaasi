const STORAGE_KEY = "shimi-taasi-tasks-v1";
const RECURRING_STORAGE_KEY = "shimi-taasi-recurring-v1";

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
const viewTaskDialog = document.getElementById("viewTaskDialog");
const viewTaskText = document.getElementById("viewTaskText");
const closeViewDialogButton = document.getElementById("closeViewDialogButton");
const closeViewBottomButton = document.getElementById("closeViewBottomButton");
const sortModeButton = document.getElementById("sortModeButton");

const recurringButton = document.getElementById("recurringButton");
const recurringDialog = document.getElementById("recurringDialog");
const recurringList = document.getElementById("recurringList");
const closeRecurringButton = document.getElementById("closeRecurringButton");
const addRecurringButton = document.getElementById("addRecurringButton");
const recurringFormDialog = document.getElementById("recurringFormDialog");
const recurringForm = document.getElementById("recurringForm");
const recurringFormTitle = document.getElementById("recurringFormTitle");
const recurringInput = document.getElementById("recurringInput");
const recurringFrequency = document.getElementById("recurringFrequency");
const recurringWeekday = document.getElementById("recurringWeekday");
const recurringMonthDay = document.getElementById("recurringMonthDay");
const weeklyOptions = document.getElementById("weeklyOptions");
const monthlyOptions = document.getElementById("monthlyOptions");
const closeRecurringFormButton = document.getElementById("closeRecurringFormButton");
const deleteRecurringDialog = document.getElementById("deleteRecurringDialog");
const cancelDeleteRecurringButton = document.getElementById("cancelDeleteRecurringButton");
const confirmDeleteRecurringButton = document.getElementById("confirmDeleteRecurringButton");

let tasks = [];
let recurringTasks = [];
let editingTaskId = null;
let deletingTaskId = null;
let sortMode = false;
let editingRecurringId = null;
let deletingRecurringId = null;

const weekdayLabels = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayParts() {
  const now = new Date();
  return {
    day: now.getDay(),
    date: now.getDate(),
    year: now.getFullYear(),
    month: now.getMonth()
  };
}

function daysInCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
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

  try {
    recurringTasks = JSON.parse(localStorage.getItem(RECURRING_STORAGE_KEY)) || [];
  } catch {
    recurringTasks = [];
  }

  removeOldDoneTasks();
  generateDueRecurringTasks();
  saveTasks();
  saveRecurringTasks();
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function saveRecurringTasks() {
  localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(recurringTasks));
}

function removeOldDoneTasks() {
  const today = todayKey();
  tasks = tasks.filter(task => !task.done || task.doneAt === today);
}

function createTask(text, recurringId = null) {
  tasks.unshift({
    id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: text.trim(),
    createdAt: todayKey(),
    done: false,
    doneAt: null,
    recurringId
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
  const index = tasks.findIndex(task => task.id === id);
  if (index < 0) return;

  const currentTask = tasks[index];
  const nextDone = !currentTask.done;
  const updatedTask = { ...currentTask, done: nextDone, doneAt: nextDone ? today : null };

  tasks.splice(index, 1);

  if (nextDone) {
    tasks.push(updatedTask);
  } else {
    tasks.unshift(updatedTask);
  }

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function moveTaskToTop(id) {
  const task = tasks.find(item => item.id === id);
  if (!task || task.done) return;

  const openTasks = tasks.filter(item => !item.done);
  const doneTasks = tasks.filter(item => item.done);
  const index = openTasks.findIndex(item => item.id === id);
  if (index <= 0) return;

  const [movedTask] = openTasks.splice(index, 1);
  openTasks.unshift(movedTask);
  tasks = [...openTasks, ...doneTasks];

  saveTasks();
  renderTasks();
}

function moveTaskBy(id, direction) {
  const task = tasks.find(item => item.id === id);
  if (!task || task.done) return;

  const openTasks = tasks.filter(item => !item.done);
  const doneTasks = tasks.filter(item => item.done);
  const index = openTasks.findIndex(item => item.id === id);
  const targetIndex = index + direction;

  if (index < 0 || targetIndex < 0 || targetIndex >= openTasks.length) return;

  const [movedTask] = openTasks.splice(index, 1);
  openTasks.splice(targetIndex, 0, movedTask);
  tasks = [...openTasks, ...doneTasks];

  saveTasks();
  renderTasks();
}

function getVisibleTasks() {
  const openTasks = tasks.filter(task => !task.done);
  const doneTasks = tasks.filter(task => task.done);
  return [...openTasks, ...doneTasks];
}

function isRecurringDueToday(recurring) {
  if (recurring.enabled === false) return false;
  const today = getTodayParts();

  if (recurring.frequency === "daily") return true;
  if (recurring.frequency === "weekly") return Number(recurring.weekday) === today.day;
  if (recurring.frequency === "monthly") {
    const safeDay = Math.min(Number(recurring.monthDay) || 1, daysInCurrentMonth());
    return safeDay === today.date;
  }
  return false;
}

function hasOpenRecurringInstance(recurringId) {
  return tasks.some(task => task.recurringId === recurringId && !task.done);
}

function generateDueRecurringTasks() {
  const today = todayKey();
  let changedTasks = false;
  let changedRecurring = false;

  recurringTasks = recurringTasks.map(recurring => {
    if (!isRecurringDueToday(recurring)) return recurring;
    if (recurring.lastGeneratedAt === today) return recurring;
    if (hasOpenRecurringInstance(recurring.id)) return recurring;

    tasks.unshift({
      id: `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text: recurring.text,
      createdAt: today,
      done: false,
      doneAt: null,
      recurringId: recurring.id
    });

    changedTasks = true;
    changedRecurring = true;
    return { ...recurring, lastGeneratedAt: today };
  });

  if (changedTasks) saveTasks();
  if (changedRecurring) saveRecurringTasks();
}

function frequencyLabel(recurring) {
  if (recurring.frequency === "daily") return "כל יום";
  if (recurring.frequency === "weekly") return `כל ${weekdayLabels[Number(recurring.weekday)] || "שבוע"}`;
  if (recurring.frequency === "monthly") return `כל חודש ביום ${Number(recurring.monthDay) || 1}`;
  return "קבועה";
}

function createRecurringTask(data) {
  recurringTasks.unshift({
    id: `rec-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: data.text.trim(),
    frequency: data.frequency,
    weekday: data.weekday,
    monthDay: data.monthDay,
    enabled: true,
    createdAt: todayKey(),
    lastGeneratedAt: null
  });
  generateDueRecurringTasks();
  saveRecurringTasks();
  renderRecurringTasks();
  renderTasks();
}

function updateRecurringTask(id, data) {
  recurringTasks = recurringTasks.map(item => item.id === id ? {
    ...item,
    text: data.text.trim(),
    frequency: data.frequency,
    weekday: data.weekday,
    monthDay: data.monthDay,
    lastGeneratedAt: null
  } : item);

  tasks = tasks.map(task => task.recurringId === id && !task.done ? { ...task, text: data.text.trim() } : task);
  generateDueRecurringTasks();
  saveRecurringTasks();
  saveTasks();
  renderRecurringTasks();
  renderTasks();
}

function deleteRecurringTask(id) {
  recurringTasks = recurringTasks.filter(item => item.id !== id);
  saveRecurringTasks();
  renderRecurringTasks();
}

function setSortMode(nextMode) {
  sortMode = nextMode;
  document.body.classList.toggle("sort-mode", sortMode);
  sortModeButton.textContent = sortMode ? "סיימתי" : "סדרי לי";
  sortModeButton.setAttribute("aria-pressed", String(sortMode));
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

function openViewTaskDialog(task) {
  viewTaskText.textContent = task.text;
  viewTaskDialog.showModal();
}

function closeViewTaskDialog() {
  viewTaskDialog.close();
  viewTaskText.textContent = "";
}

function openRecurringDialog() {
  renderRecurringTasks();
  recurringDialog.showModal();
}

function closeRecurringDialog() {
  recurringDialog.close();
}

function updateRecurringScheduleVisibility() {
  weeklyOptions.hidden = recurringFrequency.value !== "weekly";
  monthlyOptions.hidden = recurringFrequency.value !== "monthly";
}

function openRecurringForm(mode, recurring = null) {
  editingRecurringId = mode === "edit" ? recurring.id : null;
  recurringFormTitle.innerHTML = mode === "edit" ? "<mark>מה לשנות בקבועה?</mark>" : "<mark>מה חוזר על עצמו?</mark>";
  recurringInput.value = recurring?.text || "";
  recurringFrequency.value = recurring?.frequency || "weekly";
  recurringWeekday.value = String(recurring?.weekday ?? getTodayParts().day);
  recurringMonthDay.value = String(recurring?.monthDay ?? getTodayParts().date);
  updateRecurringScheduleVisibility();
  recurringFormDialog.showModal();
  setTimeout(() => recurringInput.focus(), 50);
}

function closeRecurringForm() {
  recurringFormDialog.close();
  recurringForm.reset();
  editingRecurringId = null;
  recurringFrequency.value = "weekly";
  recurringWeekday.value = String(getTodayParts().day);
  recurringMonthDay.value = String(getTodayParts().date);
  updateRecurringScheduleVisibility();
}

function openDeleteRecurringDialog(id) {
  deletingRecurringId = id;
  deleteRecurringDialog.showModal();
}

function closeDeleteRecurringDialog() {
  deletingRecurringId = null;
  deleteRecurringDialog.close();
}

function renderTasks() {
  removeOldDoneTasks();
  taskList.innerHTML = "";
  emptyState.hidden = tasks.length > 0;

  const visibleTasks = getVisibleTasks();

  visibleTasks.forEach(task => {
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

    const taskText = document.createElement("button");
    taskText.className = "task-text";
    taskText.type = "button";
    taskText.textContent = task.text;
    taskText.setAttribute("aria-label", "פתיחת המטלה המלאה");
    taskText.addEventListener("click", () => openViewTaskDialog(task));

    const taskDate = document.createElement("div");
    taskDate.className = "task-date";
    taskDate.textContent = formatDateLabel(task.createdAt);

    textWrap.append(taskText, taskDate);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    if (sortMode) {
      row.classList.add("sorting");

      const topButton = document.createElement("button");
      topButton.className = "action-button move top";
      topButton.type = "button";
      topButton.textContent = "⇈";
      topButton.setAttribute("aria-label", "הקפיצי מטלה לראש הרשימה");
      topButton.title = "הקפצה לראש";
      const openTasksCount = tasks.filter(item => !item.done).length;
      const openIndex = tasks.filter(item => !item.done).findIndex(item => item.id === task.id);
      topButton.disabled = task.done || openIndex === 0;
      topButton.addEventListener("click", () => moveTaskToTop(task.id));

      const upButton = document.createElement("button");
      upButton.className = "action-button move up";
      upButton.type = "button";
      upButton.textContent = "↑";
      upButton.setAttribute("aria-label", "העלי מטלה מקום אחד");
      upButton.title = "לעלות מקום";
      upButton.disabled = task.done || openIndex === 0;
      upButton.addEventListener("click", () => moveTaskBy(task.id, -1));

      const downButton = document.createElement("button");
      downButton.className = "action-button move down";
      downButton.type = "button";
      downButton.textContent = "↓";
      downButton.setAttribute("aria-label", "הורידי מטלה מקום אחד");
      downButton.title = "להוריד מקום";
      downButton.disabled = task.done || openIndex === openTasksCount - 1;
      downButton.addEventListener("click", () => moveTaskBy(task.id, 1));

      actions.append(topButton, upButton, downButton);
    } else {
      const moveButton = document.createElement("button");
      moveButton.className = "action-button move";
      moveButton.type = "button";
      moveButton.textContent = "↑";
      moveButton.setAttribute("aria-label", "הקפיצי מטלה לראש הרשימה");
      moveButton.title = "הקפצה לראש";
      const openIndex = tasks.filter(item => !item.done).findIndex(item => item.id === task.id);
      moveButton.disabled = task.done || openIndex === 0;
      moveButton.addEventListener("click", () => moveTaskToTop(task.id));

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
    }
    row.append(checkButton, textWrap, actions);
    taskList.appendChild(row);
  });
}

function renderRecurringTasks() {
  recurringList.innerHTML = "";

  if (recurringTasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "recurring-empty";
    empty.textContent = "אין קבועות כרגע. איזה שקט חשוד.";
    recurringList.appendChild(empty);
    return;
  }

  recurringTasks.forEach(recurring => {
    const row = document.createElement("article");
    row.className = "recurring-row";

    const text = document.createElement("div");
    text.className = "recurring-text";
    const title = document.createElement("strong");
    title.textContent = recurring.text;
    const meta = document.createElement("span");
    meta.textContent = frequencyLabel(recurring);
    text.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "recurring-actions";

    const editButton = document.createElement("button");
    editButton.className = "action-button edit";
    editButton.type = "button";
    editButton.textContent = "✎";
    editButton.setAttribute("aria-label", "עריכת קבועה");
    editButton.addEventListener("click", () => openRecurringForm("edit", recurring));

    const deleteButton = document.createElement("button");
    deleteButton.className = "action-button delete";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "מחיקת קבועה");
    deleteButton.addEventListener("click", () => openDeleteRecurringDialog(recurring.id));

    actions.append(editButton, deleteButton);
    row.append(text, actions);
    recurringList.appendChild(row);
  });
}

addTaskButton.addEventListener("click", () => openTaskDialog("add"));
sortModeButton.addEventListener("click", () => setSortMode(!sortMode));
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
closeViewDialogButton.addEventListener("click", closeViewTaskDialog);
closeViewBottomButton.addEventListener("click", closeViewTaskDialog);
confirmDeleteButton.addEventListener("click", () => {
  if (deletingTaskId) deleteTask(deletingTaskId);
  closeDeleteDialog();
});

recurringButton.addEventListener("click", openRecurringDialog);
closeRecurringButton.addEventListener("click", closeRecurringDialog);
addRecurringButton.addEventListener("click", () => openRecurringForm("add"));
closeRecurringFormButton.addEventListener("click", closeRecurringForm);
recurringFrequency.addEventListener("change", updateRecurringScheduleVisibility);

recurringForm.addEventListener("submit", event => {
  event.preventDefault();
  const text = recurringInput.value.trim();
  if (!text) return;

  const monthDay = Math.max(1, Math.min(31, Number(recurringMonthDay.value) || 1));
  const data = {
    text,
    frequency: recurringFrequency.value,
    weekday: Number(recurringWeekday.value),
    monthDay
  };

  if (editingRecurringId) {
    updateRecurringTask(editingRecurringId, data);
  } else {
    createRecurringTask(data);
  }

  closeRecurringForm();
});

cancelDeleteRecurringButton.addEventListener("click", closeDeleteRecurringDialog);
confirmDeleteRecurringButton.addEventListener("click", () => {
  if (deletingRecurringId) deleteRecurringTask(deletingRecurringId);
  closeDeleteRecurringDialog();
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (taskDialog.open) closeTaskDialog();
    if (deleteDialog.open) closeDeleteDialog();
    if (viewTaskDialog.open) closeViewTaskDialog();
    if (recurringDialog.open) closeRecurringDialog();
    if (recurringFormDialog.open) closeRecurringForm();
    if (deleteRecurringDialog.open) closeDeleteRecurringDialog();
  }
});

loadTasks();
renderTasks();
