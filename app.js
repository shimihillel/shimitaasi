const STORAGE_KEY = "shimi-taasi-tasks-v1";
const SHOPPING_STORAGE_KEY = "shimi-taasi-shopping-v1";
const RECURRING_STORAGE_KEY = "shimi-taasi-recurring-v1";
const SUGGESTIONS_STORAGE_KEY = "shimi-taasi-suggestions-v1";
const ACHIEVEMENT_STORAGE_KEY = "shimi-taasi-achievement-v1";
const HAIR_WASH_PROMPT_KEY = "shimi-taasi-hair-wash-prompt-v1";

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
const viewMoveBlock = document.getElementById("viewMoveBlock");
const viewMoveToggle = document.getElementById("viewMoveToggle");
const viewMovePanel = document.getElementById("viewMovePanel");
const viewMoveDateWrap = document.getElementById("viewMoveDateWrap");
const viewMoveEndDateWrap = document.getElementById("viewMoveEndDateWrap");
const viewMoveTimeWrap = document.getElementById("viewMoveTimeWrap");
const viewMoveRevealWrap = document.getElementById("viewMoveRevealWrap");
const viewMoveDate = document.getElementById("viewMoveDate");
const viewMoveEndDate = document.getElementById("viewMoveEndDate");
const viewMoveTime = document.getElementById("viewMoveTime");
const viewMoveApply = document.getElementById("viewMoveApply");
const sortModeButton = document.getElementById("sortModeButton");
const appTitle = document.getElementById("appTitle");
const appSubtitle = document.getElementById("appSubtitle");
const tasksTab = document.getElementById("tasksTab");
const shoppingTab = document.getElementById("shoppingTab");
const sortHint = document.getElementById("sortHint");
const backupButton = document.getElementById("backupButton");
const backupDialog = document.getElementById("backupDialog");
const closeBackupButton = document.getElementById("closeBackupButton");
const exportBackupButton = document.getElementById("exportBackupButton");
const importBackupInput = document.getElementById("importBackupInput");
const backupStatus = document.getElementById("backupStatus");
const futureButton = document.getElementById("futureButton");
const futureDialog = document.getElementById("futureDialog");
const futureList = document.getElementById("futureList");
const closeFutureButton = document.getElementById("closeFutureButton");
const scheduleField = document.getElementById("scheduleField");
const scheduleDateWrap = document.getElementById("scheduleDateWrap");
const scheduleEndDateWrap = document.getElementById("scheduleEndDateWrap");
const scheduleTimeWrap = document.getElementById("scheduleTimeWrap");
const scheduleDate = document.getElementById("scheduleDate");
const scheduleEndDate = document.getElementById("scheduleEndDate");
const scheduleTime = document.getElementById("scheduleTime");
const suggestionsBox = document.getElementById("suggestionsBox");
const headNote = document.getElementById("headNote");
const scheduleRevealWrap = document.getElementById("scheduleRevealWrap");
const hairWashDialog = document.getElementById("hairWashDialog");
const hairWashYes = document.getElementById("hairWashYes");
const hairWashNo = document.getElementById("hairWashNo");
const hairWashLater = document.getElementById("hairWashLater");

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
const multiWeeklyOptions = document.getElementById("multiWeeklyOptions");
const multiWeeklyError = document.getElementById("multiWeeklyError");
const recurringWeekdayChecks = [...document.querySelectorAll('input[name="recurringWeekdays"]')];
const monthlyOptions = document.getElementById("monthlyOptions");
const closeRecurringFormButton = document.getElementById("closeRecurringFormButton");
const deleteRecurringDialog = document.getElementById("deleteRecurringDialog");
const cancelDeleteRecurringButton = document.getElementById("cancelDeleteRecurringButton");
const confirmDeleteRecurringButton = document.getElementById("confirmDeleteRecurringButton");

let tasks = [];
let shoppingItems = [];
let recurringTasks = [];
let editingTaskId = null;
let deletingTaskId = null;
let viewingTaskId = null;
let viewingTaskKind = null;
let sortMode = false;
let activeList = "tasks";
let editingRecurringId = null;
let deletingRecurringId = null;
let doneCollapsed = { tasks: false, shopping: false };
let suggestionCounts = {};
let futureViewMode = "calendar";
let calendarCursor = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedCalendarDate = null;

const weekdayLabels = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function currentItems() {
  return activeList === "shopping" ? shoppingItems : tasks;
}

function setCurrentItems(nextItems) {
  if (activeList === "shopping") {
    shoppingItems = nextItems;
    saveShoppingItems();
  } else {
    tasks = nextItems;
    saveTasks();
  }
}

function isShoppingMode() {
  return activeList === "shopping";
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function keyFromDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function tomorrowKey() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const day = String(tomorrow.getDate()).padStart(2, "0");
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

function dateFromKey(dateKey) {
  if (!dateKey || typeof dateKey !== "string") return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function daysBetweenKeys(fromKey, toKey) {
  const fromDate = dateFromKey(fromKey);
  const toDate = dateFromKey(toKey);
  if (!fromDate || !toDate) return Infinity;
  return Math.floor((toDate - fromDate) / 86400000);
}

function compareDateKeys(a, b) {
  return String(a || "").localeCompare(String(b || ""));
}

function isRangeTask(task) {
  return Boolean(task && task.scheduleMode === "range" && task.scheduleDate && task.scheduleEndDate);
}

function isActiveRangeTask(task) {
  if (!isRangeTask(task) || task.done) return false;
  const today = todayKey();
  return compareDateKeys(task.scheduleDate, today) <= 0 && compareDateKeys(today, task.scheduleEndDate) <= 0;
}

function isExpiredRangeTask(task) {
  if (!isRangeTask(task) || task.done) return false;
  return compareDateKeys(task.scheduleEndDate, todayKey()) < 0;
}

function isDateInTaskRange(dateKey, task) {
  return Boolean(isRangeTask(task) && compareDateKeys(task.scheduleDate, dateKey) <= 0 && compareDateKeys(dateKey, task.scheduleEndDate) <= 0);
}

function formatDateRange(task) {
  if (!isRangeTask(task)) return "";
  return `${formatCalendarDate(task.scheduleDate, false)}–${formatCalendarDate(task.scheduleEndDate, false)}`;
}

function getRangeProgress(task) {
  if (!isActiveRangeTask(task)) return null;
  const total = daysBetweenKeys(task.scheduleDate, task.scheduleEndDate) + 1;
  const current = daysBetweenKeys(task.scheduleDate, todayKey()) + 1;
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(1, current), safeTotal);
  return {
    current: safeCurrent,
    total: safeTotal,
    percent: Math.round((safeCurrent / safeTotal) * 100)
  };
}

function getTaskRevealDate(task) {
  if (!task || !task.scheduleDate || !task.scheduleMode || task.scheduleMode === "now") return null;
  if (task.scheduleMode === "from" || task.scheduleMode === "range") return task.scheduleDate;
  const eventDate = dateFromKey(task.scheduleDate);
  if (!eventDate) return task.scheduleDate;
  const leadDays = Math.max(0, Math.min(3, Number(task.scheduleRevealDays) || 0));
  eventDate.setDate(eventDate.getDate() - leadDays);
  const year = eventDate.getFullYear();
  const month = String(eventDate.getMonth() + 1).padStart(2, "0");
  const day = String(eventDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isFutureTask(task) {
  if (isRangeTask(task)) return compareDateKeys(task.scheduleDate, todayKey()) > 0;
  const revealDate = getTaskRevealDate(task);
  return Boolean(revealDate && revealDate > todayKey());
}

function isTaskVisibleNow(task) {
  if (isRangeTask(task)) return isActiveRangeTask(task);
  return !isFutureTask(task);
}

function getCountdownLabel(task) {
  if (!task || task.scheduleMode !== "exact" || !task.scheduleDate || !isTaskVisibleNow(task)) return "";
  const days = daysBetweenKeys(todayKey(), task.scheduleDate);
  if (days === 3) return "עוד 3 ימים";
  if (days === 2) return "עוד יומיים";
  if (days === 1) return "מחר";
  return "";
}

function formatCalendarDate(dateKey, includeWeekday = true) {
  const date = dateFromKey(dateKey);
  if (!date) return "תאריך לא ידוע";
  const options = includeWeekday
    ? { weekday: "long", day: "numeric", month: "numeric" }
    : { day: "numeric", month: "numeric" };
  return date.toLocaleDateString("he-IL", options);
}

function formatTaskMeta(task) {
  if (task.scheduleMode === "range" && task.scheduleDate && task.scheduleEndDate) {
    return formatDateRange(task);
  }
  if (task.scheduleMode === "exact" && task.scheduleDate) {
    return `${formatCalendarDate(task.scheduleDate)}${task.scheduleTime ? ` · ${task.scheduleTime}` : ""}`;
  }
  if (task.scheduleMode === "from" && task.scheduleDate) {
    return `החל מ־${formatCalendarDate(task.scheduleDate)}`;
  }
  return formatDateLabel(task.createdAt);
}

function formatDateLabel(dateKey) {
  const days = daysBetweenKeys(dateKey, todayKey());
  if (days === 0) return "נוסף היום";
  if (days === 1) return "נוסף אתמול";
  if (days > 1 && days < 7) return `נוסף לפני ${days} ימים`;
  if (days >= 7 && days < 14) return "נוסף לפני שבוע. עדיין איתנו.";
  if (days >= 14 && days < 30) return `נוסף לפני ${days} ימים. עקשנית.`;

  const parsed = dateFromKey(dateKey);
  if (!parsed) return "נוסף מתישהו, כנראה";
  return `נוסף ${parsed.toLocaleDateString("he-IL", { day: "numeric", month: "numeric" })}`;
}

function dailyIndex(length, salt = 0) {
  const today = todayKey().replaceAll("-", "");
  return (Number(today) + salt) % length;
}

const emptyMessages = {
  tasks: [
    "<mark>שקט מדי.</mark><br />מה ייפול עלי תיכף??",
    "<mark>אין כלום.</mark><br />חשוד מאוד.",
    "<mark>וואו.</mark><br />מי זאת המאורגנת הזאת?",
    "<mark>מחברת נקייה.</mark><br />סימן לסערה מתקרבת."
  ],
  shopping: [
    "<mark>לא חסר כלום?</mark><br />חשוד.",
    "<mark>המקרר רגוע.</mark><br />בינתיים.",
    "<mark>אין קניות.</mark><br />שקר חמוד.",
    "<mark>כלום לקנות?</mark><br />מי את ומה עשית לשימי?"
  ]
};


function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    tasks = [];
  }

  try {
    shoppingItems = JSON.parse(localStorage.getItem(SHOPPING_STORAGE_KEY)) || [];
  } catch {
    shoppingItems = [];
  }

  try {
    recurringTasks = JSON.parse(localStorage.getItem(RECURRING_STORAGE_KEY)) || [];
  } catch {
    recurringTasks = [];
  }

  try {
    suggestionCounts = JSON.parse(localStorage.getItem(SUGGESTIONS_STORAGE_KEY)) || {};
  } catch {
    suggestionCounts = {};
  }
  document.body.dataset.theme = "cream";

  removeOldDoneTasks();
  generateDueRecurringTasks();
  saveTasks();
  saveShoppingItems();
  saveRecurringTasks();
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function saveShoppingItems() {
  localStorage.setItem(SHOPPING_STORAGE_KEY, JSON.stringify(shoppingItems));
}

function saveRecurringTasks() {
  localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(recurringTasks));
}

function removeOldDoneTasks() {
  const today = todayKey();
  tasks = tasks.filter(task => (!task.done || task.doneAt === today) && !isExpiredRangeTask(task));
  shoppingItems = shoppingItems.filter(item => !item.done || item.doneAt === today);
}

function createTask(text, recurringId = null, schedule = null, extra = {}) {
  const newItem = {
    id: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: text.trim(),
    createdAt: todayKey(),
    done: false,
    doneAt: null,
    recurringId: isShoppingMode() ? null : recurringId,
    onHead: false,
    scheduleMode: isShoppingMode() ? "now" : (schedule?.mode || "now"),
    scheduleDate: isShoppingMode() ? null : (schedule?.date || null),
    scheduleEndDate: isShoppingMode() ? null : (schedule?.mode === "range" ? (schedule?.endDate || null) : null),
    scheduleTime: isShoppingMode() ? null : (schedule?.mode === "exact" ? (schedule?.time || null) : null),
    scheduleRevealDays: isShoppingMode() ? 0 : (schedule?.mode === "exact" ? Number(schedule?.revealDays || 0) : 0),
    specialType: extra.specialType || null
  };

  if (isShoppingMode()) {
    shoppingItems.unshift(newItem);
    saveShoppingItems();
  } else {
    tasks.unshift(newItem);
    saveTasks();
  }
  if (!isShoppingMode() && !recurringId) recordSuggestion(text);
  renderTasks();
}

function updateTask(id, text, schedule = null) {
  const items = currentItems().map(item => item.id === id ? {
    ...item,
    text: text.trim(),
    ...(schedule ? {
      scheduleMode: schedule.mode,
      scheduleDate: schedule.date || null,
      scheduleEndDate: schedule.mode === "range" ? (schedule.endDate || null) : null,
      scheduleTime: schedule.mode === "exact" ? (schedule.time || null) : null,
      scheduleRevealDays: schedule.mode === "exact" ? Number(schedule.revealDays || 0) : 0
    } : {})
  } : item);
  setCurrentItems(items);
  renderTasks();
}

function postponeTaskToTomorrow(id) {
  if (isShoppingMode()) return;
  moveTaskToSchedule(id, "from", tomorrowKey(), null, 0);
}

function moveTaskToSchedule(id, mode, date, time = null, revealDays = 0, endDate = null) {
  if (!id || !date || !["exact", "from", "range"].includes(mode)) return false;
  if (mode === "range" && !endDate) return false;
  let moved = false;
  tasks = tasks.map(item => {
    if (item.id !== id) return item;
    moved = true;
    return {
      ...item,
      scheduleMode: mode,
      scheduleDate: date,
      scheduleEndDate: mode === "range" ? endDate : null,
      scheduleTime: mode === "exact" ? (time || null) : null,
      scheduleRevealDays: mode === "exact" ? Number(revealDays || 0) : 0,
      onHead: false
    };
  });
  if (moved) {
    saveTasks();
    renderTasks();
  }
  return moved;
}

function toggleDone(id) {
  const today = todayKey();
  const items = [...currentItems()];
  const index = items.findIndex(item => item.id === id);
  if (index < 0) return;

  const currentItem = items[index];
  const nextDone = !currentItem.done;
  const updatedItem = { ...currentItem, done: nextDone, doneAt: nextDone ? today : null, onHead: nextDone ? false : currentItem.onHead };

  items.splice(index, 1);

  if (nextDone) {
    items.push(updatedItem);
  } else {
    items.unshift(updatedItem);
  }

  setCurrentItems(items);
  if (nextDone) registerAchievement(currentItem);
  renderTasks();
}

function deleteTask(id) {
  setCurrentItems(currentItems().filter(item => item.id !== id));
  renderTasks();
}

function splitItemsForSorting() {
  const items = currentItems();
  const visibleOpen = items.filter(entry => !entry.done && (isShoppingMode() || isTaskVisibleNow(entry)));
  const hiddenFuture = isShoppingMode() ? [] : items.filter(entry => !entry.done && !isTaskVisibleNow(entry));
  const doneItems = items.filter(entry => entry.done);
  return { visibleOpen, hiddenFuture, doneItems };
}

function saveSortedVisibleItems(visibleOpen, hiddenFuture, doneItems) {
  setCurrentItems([...visibleOpen, ...hiddenFuture, ...doneItems]);
}

function moveTaskToTop(id) {
  const item = currentItems().find(entry => entry.id === id);
  if (!item || item.done || (!isShoppingMode() && !isTaskVisibleNow(item))) return;

  const { visibleOpen, hiddenFuture, doneItems } = splitItemsForSorting();
  const index = visibleOpen.findIndex(entry => entry.id === id);
  if (index <= 0) return;

  const [movedItem] = visibleOpen.splice(index, 1);
  visibleOpen.unshift(movedItem);
  saveSortedVisibleItems(visibleOpen, hiddenFuture, doneItems);
  renderTasks();
}

function moveTaskToBottom(id) {
  const item = currentItems().find(entry => entry.id === id);
  if (!item || item.done || (!isShoppingMode() && !isTaskVisibleNow(item))) return;

  const { visibleOpen, hiddenFuture, doneItems } = splitItemsForSorting();
  const index = visibleOpen.findIndex(entry => entry.id === id);
  if (index < 0 || index === visibleOpen.length - 1) return;

  const [movedItem] = visibleOpen.splice(index, 1);
  visibleOpen.push(movedItem);
  saveSortedVisibleItems(visibleOpen, hiddenFuture, doneItems);
  renderTasks();
}

function moveTaskBy(id, direction) {
  const item = currentItems().find(entry => entry.id === id);
  if (!item || item.done || (!isShoppingMode() && !isTaskVisibleNow(item))) return;

  const { visibleOpen, hiddenFuture, doneItems } = splitItemsForSorting();
  const index = visibleOpen.findIndex(entry => entry.id === id);
  const targetIndex = index + direction;
  if (index < 0 || targetIndex < 0 || targetIndex >= visibleOpen.length) return;

  const [movedItem] = visibleOpen.splice(index, 1);
  visibleOpen.splice(targetIndex, 0, movedItem);
  saveSortedVisibleItems(visibleOpen, hiddenFuture, doneItems);
  renderTasks();
}

function getVisibleTasks() {
  const items = currentItems();
  let openItems = items.filter(item => !item.done);
  if (isShoppingMode()) {
    openItems = [...openItems].sort((a, b) => Number(Boolean(b.onHead)) - Number(Boolean(a.onHead)));
  }
  const doneItems = items.filter(item => item.done);
  return [...openItems, ...doneItems];
}

function isRecurringDueToday(recurring) {
  if (recurring.enabled === false) return false;
  const today = getTodayParts();

  if (recurring.frequency === "daily") return true;
  if (recurring.frequency === "weekly") return Number(recurring.weekday) === today.day;
  if (recurring.frequency === "multiweekly") {
    const days = Array.isArray(recurring.weekdays) ? recurring.weekdays.map(Number) : [];
    return days.includes(today.day);
  }
  if (recurring.frequency === "biweekly") {
    if (Number(recurring.weekday) !== today.day) return false;
    if (!recurring.lastGeneratedAt) return true;
    return daysBetweenKeys(recurring.lastGeneratedAt, todayKey()) >= 14;
  }
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
      recurringId: recurring.id,
      onHead: false,
      scheduleMode: "now",
      scheduleDate: null,
      scheduleEndDate: null,
      scheduleTime: null
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
  if (recurring.frequency === "multiweekly") {
    const days = Array.isArray(recurring.weekdays) ? recurring.weekdays.map(Number).filter(day => day >= 0 && day <= 6) : [];
    const names = days.map(day => weekdayLabels[day]);
    if (names.length === 0) return "כמה פעמים בשבוע";
    if (names.length === 1) return `כל ${names[0]}`;
    if (names.length === 2) return `כל ${names[0]} ו${names[1]}`;
    return `כל ${names.slice(0, -1).join(", ")} ו${names.at(-1)}`;
  }
  if (recurring.frequency === "biweekly") return `פעם בשבועיים · ${weekdayLabels[Number(recurring.weekday)] || "יום קבוע"}`;
  if (recurring.frequency === "monthly") return `כל חודש ביום ${Number(recurring.monthDay) || 1}`;
  return "קבועה";
}

function createRecurringTask(data) {
  recurringTasks.unshift({
    id: `rec-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: data.text.trim(),
    frequency: data.frequency,
    weekday: data.weekday,
    weekdays: data.weekdays,
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
    weekdays: data.weekdays,
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


function setRecurringEnabled(id, enabled) {
  recurringTasks = recurringTasks.map(item => item.id === id ? { ...item, enabled } : item);
  saveRecurringTasks();
  generateDueRecurringTasks();
  renderRecurringTasks();
  renderTasks();
}

function clearDoneItems() {
  const items = currentItems();
  const hasDone = items.some(item => item.done);
  if (!hasDone) return;
  const ok = window.confirm(isShoppingMode() ? "לנקות את כל מה שכבר נקנה?" : "לנקות את כל מה שכבר בוצע?");
  if (!ok) return;
  setCurrentItems(items.filter(item => !item.done));
  doneCollapsed[activeList] = false;
  renderTasks();
}
function normalizeSuggestion(text) {
  return text.trim().replace(/\s+/g, " ").slice(0, 120);
}

function saveSuggestions() {
  localStorage.setItem(SUGGESTIONS_STORAGE_KEY, JSON.stringify(suggestionCounts));
}

function recordSuggestion(text) {
  const key = normalizeSuggestion(text);
  if (!key || key.length < 2) return;
  suggestionCounts[key] = (suggestionCounts[key] || 0) + 1;
  saveSuggestions();
}

function getSuggestionList() {
  return Object.entries(suggestionCounts)
    .filter(([text, count]) => count >= 2 && !tasks.some(task => !task.done && task.text.trim() === text))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([text]) => text);
}

function renderSuggestions() {
  if (!suggestionsBox) return;
  suggestionsBox.innerHTML = "";
  const show = !isShoppingMode() && !editingTaskId;
  const suggestions = show ? getSuggestionList() : [];
  suggestionsBox.hidden = suggestions.length === 0;
  if (suggestions.length === 0) return;

  const label = document.createElement("span");
  label.className = "suggestions-label";
  label.textContent = "צצות הרבה:";
  suggestionsBox.appendChild(label);

  suggestions.forEach(text => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "suggestion-chip";
    btn.textContent = text;
    btn.addEventListener("click", () => {
      taskInput.value = text;
      updateCharCount();
      taskInput.focus();
    });
    suggestionsBox.appendChild(btn);
  });
}

function setHeadTask(id) {
  if (isShoppingMode()) {
    const selected = shoppingItems.find(item => item.id === id);
    const nextActive = selected ? !selected.onHead : false;
    shoppingItems = shoppingItems.map(item => ({
      ...item,
      onHead: item.id === id ? nextActive : false
    }));

    if (nextActive) {
      const important = shoppingItems.find(item => item.id === id);
      const restOpen = shoppingItems.filter(item => !item.done && item.id !== id);
      const done = shoppingItems.filter(item => item.done);
      shoppingItems = [important, ...restOpen, ...done];
    }

    saveShoppingItems();
    renderTasks();
    return;
  }

  const selected = tasks.find(task => task.id === id);
  const nextActive = selected ? !selected.onHead : false;
  tasks = tasks.map(task => ({
    ...task,
    onHead: task.id === id ? nextActive : false
  }));

  // In the tasks tab, "על הראש" is only a separate note at the top.
  // The original task keeps its exact position in the list.
  saveTasks();
  renderTasks();
}

function getHeadTask() {
  return tasks.find(task => task.onHead && !task.done && isTaskVisibleNow(task));
}

function getUrgentShoppingItem() {
  return shoppingItems.find(item => item.onHead && !item.done);
}

function registerAchievement(item) {
  const today = todayKey();
  let data;
  try { data = JSON.parse(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY)) || {}; } catch { data = {}; }
  if (data.date !== today) data = { date: today, count: 0, threeShown: false };
  data.count += 1;

  if (data.count === 3 && !data.threeShown) {
    data.threeShown = true;
    showToast("שלוש נסגרו. תראי אותך.");
  }
  localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(data));
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "achievement-toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 20);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

function getHairWashPromptState() {
  try { return JSON.parse(localStorage.getItem(HAIR_WASH_PROMPT_KEY)) || null; } catch { return null; }
}

function setHairWashAnswer(answer) {
  localStorage.setItem(HAIR_WASH_PROMPT_KEY, JSON.stringify({ date: todayKey(), answer }));
}

function hasRosemaryTaskToday() {
  const today = todayKey();
  return tasks.some(task => task.specialType === "rosemary" && task.createdAt === today);
}

function addRosemaryTask() {
  if (hasRosemaryTaskToday()) return;
  const previousList = activeList;
  activeList = "tasks";
  createTask("רוזמרין", null, { mode: "now", date: null, time: null, revealDays: 0 }, { specialType: "rosemary" });
  activeList = previousList;
  renderTasks();
}

function maybeOpenHairWashDialog() {
  const state = getHairWashPromptState();
  if (state?.date === todayKey() && (state.answer === "yes" || state.answer === "no")) return;
  setTimeout(() => {
    if (!hairWashDialog.open) hairWashDialog.showModal();
  }, 180);
}

function closeHairWashDialog() {
  if (hairWashDialog.open) hairWashDialog.close();
}

function openFutureDialog() {
  renderFutureList();
  futureDialog.showModal();
}

function closeFutureDialog() {
  futureDialog.close();
}

function getFutureTasks() {
  return tasks
    .filter(task => !task.done && isFutureTask(task))
    .sort((a, b) => {
      const dateCompare = String(a.scheduleDate).localeCompare(String(b.scheduleDate));
      if (dateCompare !== 0) return dateCompare;
      return String(a.scheduleTime || "99:99").localeCompare(String(b.scheduleTime || "99:99"));
    });
}

function renderFutureList() {
  updateFutureViewMode();
  futureList.innerHTML = "";
  const futureTasks = getFutureTasks();
  if (futureTasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "recurring-empty";
    empty.textContent = "אין עתידיות כרגע. העתיד פנוי, איכשהו.";
    futureList.appendChild(empty);
    renderFutureCalendar();
    return;
  }

  const exact = futureTasks.filter(task => task.scheduleMode === "exact");
  const from = futureTasks.filter(task => task.scheduleMode === "from");
  const range = futureTasks.filter(task => task.scheduleMode === "range");
  addFutureGroup("בתאריך מסוים", exact);
  addFutureGroup("החל מתאריך", from);
  addFutureGroup("בין תאריכים", range);
  renderFutureCalendar();
}

function updateFutureViewMode() {
  const calendarMode = futureViewMode === "calendar";
  futureList.hidden = calendarMode;
  futureCalendarPanel.hidden = !calendarMode;
  futureListViewButton.classList.toggle("active", !calendarMode);
  futureCalendarViewButton.classList.toggle("active", calendarMode);
}

function setFutureViewMode(mode) {
  futureViewMode = mode;
  updateFutureViewMode();
  if (mode === "calendar") renderFutureCalendar();
}

function getCalendarTaskDate(task) {
  return task.scheduleDate || getTaskRevealDate(task);
}

function isCalendarTask(task) {
  return Boolean(
    task &&
    !task.done &&
    task.scheduleDate &&
    task.scheduleMode &&
    task.scheduleMode !== "now" &&
    !isExpiredRangeTask(task)
  );
}

function getCalendarTasks() {
  return tasks
    .filter(isCalendarTask)
    .sort((a, b) => {
      const dateCompare = String(getCalendarTaskDate(a)).localeCompare(String(getCalendarTaskDate(b)));
      if (dateCompare !== 0) return dateCompare;
      return String(a.scheduleTime || "99:99").localeCompare(String(b.scheduleTime || "99:99"));
    });
}

function getFutureTasksForDate(dateKey) {
  return getCalendarTasks().filter(task => isRangeTask(task) ? isDateInTaskRange(dateKey, task) : getCalendarTaskDate(task) === dateKey);
}

function renderFutureCalendar() {
  if (!futureCalendarGrid || !futureCalendarDayList) return;
  futureCalendarGrid.innerHTML = "";
  futureCalendarDayList.innerHTML = "";
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const today = todayKey();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  calendarMonthLabel.textContent = firstDay.toLocaleDateString("he-IL", { month: "long", year: "numeric" });

  const calendarTasks = getCalendarTasks();
  const taskCounts = {};
  const rangeDays = {};
  calendarTasks.forEach(task => {
    if (isRangeTask(task)) {
      const start = dateFromKey(task.scheduleDate);
      const end = dateFromKey(task.scheduleEndDate);
      if (!start || !end) return;
      for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = keyFromDate(d);
        taskCounts[key] = (taskCounts[key] || 0) + 1;
        rangeDays[key] = true;
      }
      return;
    }
    const key = getCalendarTaskDate(task);
    if (key) taskCounts[key] = (taskCounts[key] || 0) + 1;
  });

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    const blank = document.createElement("span");
    blank.className = "calendar-day blank";
    futureCalendarGrid.appendChild(blank);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const key = keyFromDate(date);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    if (key === today) button.classList.add("today");
    if (rangeDays[key]) button.classList.add("has-range");
    if (selectedCalendarDate === key) button.classList.add("selected");
    if (taskCounts[key]) button.classList.add("has-items");
    button.innerHTML = `<span>${day}</span>${taskCounts[key] ? `<em>${taskCounts[key]}</em>` : ""}`;
    button.addEventListener("click", () => {
      selectedCalendarDate = key;
      renderFutureCalendar();
    });
    futureCalendarGrid.appendChild(button);
  }

  if (!selectedCalendarDate || dateFromKey(selectedCalendarDate)?.getMonth() !== month || dateFromKey(selectedCalendarDate)?.getFullYear() !== year) {
    const keysInMonth = Object.keys(taskCounts).filter(key => {
      const d = dateFromKey(key);
      return d && d.getFullYear() === year && d.getMonth() === month;
    }).sort();
    selectedCalendarDate = keysInMonth[0] || keyFromDate(new Date(year, month, Math.min(new Date().getDate(), lastDay.getDate())));
  }

  renderFutureCalendarDayList();
}

function renderFutureCalendarDayList() {
  futureCalendarDayList.innerHTML = "";
  const heading = document.createElement("h3");
  heading.textContent = formatCalendarDate(selectedCalendarDate, true);
  futureCalendarDayList.appendChild(heading);
  const items = getFutureTasksForDate(selectedCalendarDate);
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "calendar-empty";
    empty.textContent = "אין כלום ביום הזה. רגע נדיר.";
    futureCalendarDayList.appendChild(empty);
    return;
  }
  items.forEach(task => {
    const row = document.createElement("div");
    row.className = `calendar-task-row${isRangeTask(task) ? " range-calendar-task" : ""}`;
    const visibleNow = isTaskVisibleNow(task);
    const label = isRangeTask(task) ? `בין תאריכים · ${formatDateRange(task)}` : (task.scheduleMode === "from" ? "החל מ־" : (task.scheduleTime || "בתאריך"));
    row.innerHTML = `<strong>${task.text}</strong><span>${label}${visibleNow ? " · ברשימה" : ""}</span>`;
    row.addEventListener("click", () => openViewTaskDialog(task));
    futureCalendarDayList.appendChild(row);
  });
}

function addFutureGroup(title, items) {
  if (!items.length) return;
  const group = document.createElement("section");
  group.className = "future-group";
  const heading = document.createElement("h3");
  heading.textContent = title;
  group.appendChild(heading);
  items.forEach(item => group.appendChild(createFutureRow(item)));
  futureList.appendChild(group);
}

function createFutureRow(task) {
  const row = document.createElement("article");
  row.className = "future-row";
  const text = document.createElement("div");
  text.className = "future-text";
  const strong = document.createElement("strong");
  strong.textContent = task.text;
  const meta = document.createElement("span");
  meta.textContent = task.scheduleMode === "exact"
    ? `${formatCalendarDate(task.scheduleDate)}${task.scheduleTime ? ` · ${task.scheduleTime}` : ""} · ${Number(task.scheduleRevealDays || 0) === 3 ? "מוצגת 3 ימים לפני" : Number(task.scheduleRevealDays || 0) === 1 ? "מוצגת יום לפני" : "מוצגת ביום עצמו"}`
    : task.scheduleMode === "range"
      ? `${formatCalendarDate(task.scheduleDate)} עד ${formatCalendarDate(task.scheduleEndDate)}`
      : `החל מ־${formatCalendarDate(task.scheduleDate)}`;
  text.append(strong, meta);

  const actions = document.createElement("div");
  actions.className = "future-actions";

  const showNow = document.createElement("button");
  showNow.type = "button";
  showNow.className = "tiny-action";
  showNow.textContent = "להציג עכשיו";
  showNow.addEventListener("click", () => {
    tasks = tasks.map(item => item.id === task.id ? { ...item, scheduleMode: "now", scheduleDate: null, scheduleEndDate: null, scheduleTime: null, scheduleRevealDays: 0 } : item);
    saveTasks();
    renderFutureList();
    renderTasks();
  });

  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "tiny-action";
  edit.textContent = "לערוך";
  edit.addEventListener("click", () => {
    closeFutureDialog();
    openTaskDialog("edit", task);
  });

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "tiny-action danger-lite";
  remove.textContent = "למחוק";
  remove.addEventListener("click", () => {
    if (!window.confirm("למחוק את העתידית הזאת?")) return;
    tasks = tasks.filter(item => item.id !== task.id);
    saveTasks();
    renderFutureList();
    renderTasks();
  });

  actions.append(showNow, edit, remove);
  row.append(text, actions);
  return row;
}

function applyTheme() {
  document.body.dataset.theme = "cream";
}

function openBackupDialog() {
  backupStatus.textContent = "";
  backupDialog.showModal();
}

function closeBackupDialog() {
  backupDialog.close();
  backupStatus.textContent = "";
  importBackupInput.value = "";
}

function exportBackup() {
  const data = {
    app: "shimi-taasi",
    version: 20,
    exportedAt: new Date().toISOString(),
    tasks,
    shoppingItems,
    recurringTasks,
    suggestions: suggestionCounts
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `shimi-taasi-backup-${todayKey()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  backupStatus.textContent = "הגיבוי ירד. לשמור במקום שלא ייעלם, כן?";
}

function importBackupFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result || "{}"));
      if (!Array.isArray(data.tasks) || !Array.isArray(data.shoppingItems) || !Array.isArray(data.recurringTasks)) {
        throw new Error("bad backup");
      }
      const ok = window.confirm("השחזור יחליף את מה שיש עכשיו באפליקציה. להמשיך?");
      if (!ok) return;
      tasks = data.tasks;
      shoppingItems = data.shoppingItems;
      recurringTasks = data.recurringTasks;
      suggestionCounts = data.suggestions || suggestionCounts || {};
      saveSuggestions();
      applyTheme();
      removeOldDoneTasks();
      generateDueRecurringTasks();
      saveTasks();
      saveShoppingItems();
      saveRecurringTasks();
      renderTasks();
      renderRecurringTasks();
      backupStatus.textContent = "שוחזר. המוח חזר למקום.";
    } catch (error) {
      backupStatus.textContent = "הקובץ הזה לא נראה כמו גיבוי תקין.";
    } finally {
      importBackupInput.value = "";
    }
  };
  reader.readAsText(file);
}

function getSelectedSchedule() {
  const selected = taskForm.querySelector('input[name="scheduleMode"]:checked');
  const mode = selected ? selected.value : "now";
  if (mode === "now") return { mode: "now", date: null, endDate: null, time: null, revealDays: 0 };
  return {
    mode,
    date: scheduleDate.value || null,
    endDate: mode === "range" ? (scheduleEndDate.value || null) : null,
    time: mode === "exact" ? (scheduleTime.value || null) : null,
    revealDays: mode === "exact" ? Number(taskForm.querySelector('input[name="scheduleReveal"]:checked')?.value || 0) : 0
  };
}

function setSelectedSchedule(task = null) {
  const mode = task?.scheduleMode || "now";
  const input = taskForm.querySelector(`input[name="scheduleMode"][value="${mode}"]`) || taskForm.querySelector('input[name="scheduleMode"][value="now"]');
  if (input) input.checked = true;
  scheduleDate.value = task?.scheduleDate || "";
  if (scheduleEndDate) scheduleEndDate.value = task?.scheduleEndDate || "";
  scheduleTime.value = task?.scheduleTime || "";
  const revealValue = String(task?.scheduleRevealDays ?? 0);
  const revealInput = taskForm.querySelector(`input[name="scheduleReveal"][value="${revealValue}"]`) || taskForm.querySelector('input[name="scheduleReveal"][value="0"]');
  if (revealInput) revealInput.checked = true;
  updateScheduleVisibility();
}

function updateScheduleVisibility() {
  const selected = taskForm.querySelector('input[name="scheduleMode"]:checked');
  const mode = selected ? selected.value : "now";
  const scheduled = !isShoppingMode() && mode !== "now";
  scheduleDateWrap.hidden = !scheduled;
  if (scheduleEndDateWrap) scheduleEndDateWrap.hidden = !(!isShoppingMode() && mode === "range");
  scheduleTimeWrap.hidden = !(!isShoppingMode() && mode === "exact");
  scheduleRevealWrap.hidden = !(!isShoppingMode() && mode === "exact");
  scheduleDate.required = scheduled;
  if (scheduleEndDate) scheduleEndDate.required = !isShoppingMode() && mode === "range";
  if (mode !== "exact") scheduleTime.value = "";
  if (mode !== "range" && scheduleEndDate) scheduleEndDate.value = "";
}

function createShoppingItemsFromText(text) {
  const lines = text.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const uniqueLines = lines.length ? lines : [text.trim()];
  uniqueLines.reverse().forEach(line => createTask(line));
}

function setSortMode(nextMode) {
  sortMode = nextMode;
  document.body.classList.toggle("sort-mode", sortMode);
  sortModeButton.textContent = sortMode ? "סיימתי" : "סדרי לי";
  sortModeButton.setAttribute("aria-pressed", String(sortMode));
  if (sortHint) sortHint.hidden = !sortMode;
  renderTasks();
}

function openTaskDialog(mode, task = null) {
  editingTaskId = mode === "edit" ? task.id : null;
  if (mode === "edit") {
    dialogTitle.innerHTML = "<mark>מה לשנות פה?</mark>";
    taskForm.querySelector(".save-button").textContent = "שימי, תעשי";
  } else if (isShoppingMode()) {
    dialogTitle.innerHTML = "<mark>מה חסר?</mark>";
    taskForm.querySelector(".save-button").textContent = "+ עוד אחד";
  } else {
    dialogTitle.innerHTML = "<mark>מה נפל עלייך עכשיו?</mark>";
    taskForm.querySelector(".save-button").textContent = "שימי, תעשי";
  }
  scheduleField.hidden = isShoppingMode();
  renderSuggestions();
  setSelectedSchedule(task);
  taskInput.placeholder = isShoppingMode() && mode !== "edit" ? "אפשר גם כמה שורות:\nחלב\nביצים\nמגבונים" : "כתוב פה...";
  taskInput.value = task?.text || "";
  updateCharCount();
  renderSuggestions();
  taskDialog.showModal();
  setTimeout(() => taskInput.focus(), 50);
}

function closeTaskDialog() {
  taskDialog.close();
  editingTaskId = null;
  taskForm.reset();
  setSelectedSchedule(null);
  updateCharCount();
  if (suggestionsBox) { suggestionsBox.hidden = true; suggestionsBox.innerHTML = ""; }
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

function resetViewMoveControls(task = null) {
  if (!viewMoveBlock || !viewMovePanel) return;
  const canMove = Boolean(task && !task.done && viewingTaskKind === "tasks");
  viewMoveBlock.hidden = !canMove;
  viewMovePanel.hidden = true;
  if (!canMove) return;
  const tomorrowInput = viewTaskDialog.querySelector('input[name="viewMoveMode"][value="tomorrow"]');
  if (tomorrowInput) tomorrowInput.checked = true;
  const revealInput = viewTaskDialog.querySelector('input[name="viewMoveReveal"][value="0"]');
  if (revealInput) revealInput.checked = true;
  if (viewMoveDate) viewMoveDate.value = tomorrowKey();
  if (viewMoveEndDate) viewMoveEndDate.value = "";
  if (viewMoveTime) viewMoveTime.value = "";
  updateViewMoveVisibility();
}

function updateViewMoveVisibility() {
  if (!viewMovePanel || viewMovePanel.hidden) return;
  const selected = viewTaskDialog.querySelector('input[name="viewMoveMode"]:checked');
  const mode = selected ? selected.value : "tomorrow";
  const needsDate = mode === "exact" || mode === "from" || mode === "range";
  viewMoveDateWrap.hidden = !needsDate;
  if (viewMoveEndDateWrap) viewMoveEndDateWrap.hidden = mode !== "range";
  viewMoveTimeWrap.hidden = mode !== "exact";
  viewMoveRevealWrap.hidden = mode !== "exact";
  if (mode === "tomorrow") {
    viewMoveDate.value = tomorrowKey();
    if (viewMoveEndDate) viewMoveEndDate.value = "";
    viewMoveTime.value = "";
  }
  if (mode === "from" || mode === "range") viewMoveTime.value = "";
  if (mode !== "range" && viewMoveEndDate) viewMoveEndDate.value = "";
}

function openViewTaskDialog(task) {
  viewingTaskId = task.id;
  viewingTaskKind = isShoppingMode() ? "shopping" : "tasks";
  viewTaskText.value = task.text;
  resetViewMoveControls(task);
  viewTaskDialog.showModal();
  setTimeout(() => {
    viewTaskText.focus();
    viewTaskText.setSelectionRange(viewTaskText.value.length, viewTaskText.value.length);
  }, 40);
}

function saveViewTaskText() {
  if (!viewingTaskId) return;
  const newText = viewTaskText.value.trim();
  if (!newText) return;
  let changed = false;
  if (viewingTaskKind === "shopping") {
    shoppingItems = shoppingItems.map(item => {
      if (item.id !== viewingTaskId) return item;
      changed = true;
      return { ...item, text: newText };
    });
    if (changed) saveShoppingItems();
  } else {
    tasks = tasks.map(item => {
      if (item.id !== viewingTaskId) return item;
      changed = true;
      return { ...item, text: newText };
    });
    if (changed) saveTasks();
  }
}

function closeViewTaskDialog() {
  saveViewTaskText();
  viewTaskDialog.close();
  viewTaskText.value = "";
  viewingTaskId = null;
  viewingTaskKind = null;
  if (viewMovePanel) viewMovePanel.hidden = true;
  renderTasks();
}

function applyViewMove() {
  if (!viewingTaskId || viewingTaskKind !== "tasks") return;
  const selected = viewTaskDialog.querySelector('input[name="viewMoveMode"]:checked');
  const picked = selected ? selected.value : "tomorrow";
  const mode = picked === "tomorrow" ? "from" : picked;
  const date = picked === "tomorrow" ? tomorrowKey() : (viewMoveDate.value || "");
  const endDate = mode === "range" ? (viewMoveEndDate?.value || "") : null;
  const time = mode === "exact" ? (viewMoveTime.value || null) : null;
  const revealDays = mode === "exact" ? Number(viewTaskDialog.querySelector('input[name="viewMoveReveal"]:checked')?.value || 0) : 0;
  if (!date) {
    viewMoveDate.focus();
    return;
  }
  if (mode === "range" && (!endDate || compareDateKeys(endDate, date) < 0)) {
    viewMoveEndDate.focus();
    return;
  }
  saveViewTaskText();
  const moved = moveTaskToSchedule(viewingTaskId, mode, date, time, revealDays, endDate);
  if (moved) closeViewTaskDialog();
}

function openRecurringDialog() {
  renderRecurringTasks();
  recurringDialog.showModal();
}

function closeRecurringDialog() {
  recurringDialog.close();
}

function updateRecurringScheduleVisibility() {
  const frequency = recurringFrequency.value;
  weeklyOptions.hidden = !["weekly", "biweekly"].includes(frequency);
  multiWeeklyOptions.hidden = frequency !== "multiweekly";
  monthlyOptions.hidden = frequency !== "monthly";
  if (frequency !== "multiweekly") multiWeeklyError.hidden = true;
}

function openRecurringForm(mode, recurring = null) {
  editingRecurringId = mode === "edit" ? recurring.id : null;
  recurringFormTitle.innerHTML = mode === "edit" ? "<mark>מה לשנות בקבועה?</mark>" : "<mark>מה חוזר על עצמו?</mark>";
  recurringInput.value = recurring?.text || "";
  recurringFrequency.value = recurring?.frequency || "weekly";
  recurringWeekday.value = String(recurring?.weekday ?? getTodayParts().day);
  const selectedDays = Array.isArray(recurring?.weekdays) ? recurring.weekdays.map(Number) : [];
  recurringWeekdayChecks.forEach(input => { input.checked = selectedDays.includes(Number(input.value)); });
  multiWeeklyError.hidden = true;
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
  recurringWeekdayChecks.forEach(input => { input.checked = false; });
  multiWeeklyError.hidden = true;
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

function createTaskRow(task) {
  const row = document.createElement("article");
  row.className = `task-row${task.done ? " done" : ""}${task.specialType === "rosemary" ? " rosemary-task" : ""}${task.onHead && !task.done && isShoppingMode() ? " shopping-priority" : ""}`;

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

  const longPreviewThreshold = 58;
  const moreButton = task.text.trim().length > longPreviewThreshold
    ? document.createElement("button")
    : null;
  if (moreButton) {
    moreButton.className = "task-more-button";
    moreButton.type = "button";
    moreButton.textContent = "עוד…";
    moreButton.setAttribute("aria-label", "הצגת המטלה המלאה");
    moreButton.addEventListener("click", () => openViewTaskDialog(task));
  }

  const taskDate = document.createElement("div");
  taskDate.className = "task-date";
  taskDate.textContent = formatTaskMeta(task);

  const metaWrap = document.createElement("div");
  metaWrap.className = "task-meta";
  metaWrap.appendChild(taskDate);
  const countdownLabel = getCountdownLabel(task);
  if (countdownLabel) {
    row.classList.add("has-countdown");
    const countdownChip = document.createElement("span");
    countdownChip.className = "countdown-chip";
    countdownChip.textContent = countdownLabel;
    metaWrap.appendChild(countdownChip);
  }
  if (!isShoppingMode() && task.specialType === "rosemary") {
    const rosemaryChip = document.createElement("span");
    rosemaryChip.className = "rosemary-chip";
    rosemaryChip.textContent = "חפיפה";
    metaWrap.appendChild(rosemaryChip);
  }

  const titleLine = document.createElement("div");
  titleLine.className = "task-title-line";
  titleLine.appendChild(taskText);

  if (!task.done) {
    const headButtonInline = document.createElement("button");
    headButtonInline.className = `task-head-star ${task.onHead ? "active" : ""}`;
    headButtonInline.type = "button";
    headButtonInline.textContent = task.onHead ? "★" : "☆";
    const priorityLabel = isShoppingMode() ? "הכי חשוב" : "על הראש";
    headButtonInline.setAttribute("aria-label", task.onHead ? `לבטל ${priorityLabel}` : `לסמן ${priorityLabel}`);
    headButtonInline.title = task.onHead ? `לבטל ${priorityLabel}` : priorityLabel;
    headButtonInline.addEventListener("click", (event) => {
      event.stopPropagation();
      setHeadTask(task.id);
    });
    titleLine.appendChild(headButtonInline);
  }

  textWrap.appendChild(titleLine);
  if (moreButton) textWrap.appendChild(moreButton);
  textWrap.appendChild(metaWrap);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  if (task.done) {
    const undoButton = document.createElement("button");
    undoButton.className = "undo-done-button";
    undoButton.type = "button";
    undoButton.textContent = "↩ החזרי";
    undoButton.setAttribute("aria-label", isShoppingMode() ? "להחזיר פריט לרשימת הקניות" : "להחזיר מטלה לרשימה הפתוחה");
    undoButton.title = isShoppingMode() ? "להחזיר לקניות" : "להחזיר לפתוחות";
    undoButton.addEventListener("click", () => toggleDone(task.id));
    actions.appendChild(undoButton);
  } else if (sortMode) {
    row.classList.add("sorting");

    const openItems = currentItems().filter(item => !item.done && (isShoppingMode() || isTaskVisibleNow(item)));
    const openTasksCount = openItems.length;
    const openIndex = openItems.findIndex(item => item.id === task.id);

    const topButton = document.createElement("button");
    topButton.className = "action-button move top";
    topButton.type = "button";
    topButton.textContent = "⇈";
    topButton.setAttribute("aria-label", "הקפיצי מטלה לראש הרשימה");
    topButton.title = "הקפצה לראש";
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

    const bottomButton = document.createElement("button");
    bottomButton.className = "action-button move bottom";
    bottomButton.type = "button";
    bottomButton.textContent = "⇊";
    bottomButton.setAttribute("aria-label", "הורידי מטלה לסוף הרשימה");
    bottomButton.title = "הורדה לסוף";
    bottomButton.disabled = task.done || openIndex === openTasksCount - 1;
    bottomButton.addEventListener("click", () => moveTaskToBottom(task.id));

    actions.append(topButton, upButton, downButton, bottomButton);
  } else {
    const openItems = currentItems().filter(item => !item.done && (isShoppingMode() || isTaskVisibleNow(item)));
    const openIndex = openItems.findIndex(item => item.id === task.id);
    const openCount = openItems.length;

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
    downButton.disabled = task.done || openIndex === openCount - 1;
    downButton.addEventListener("click", () => moveTaskBy(task.id, 1));

    const tomorrowButton = document.createElement("button");
    tomorrowButton.className = "action-button tomorrow";
    tomorrowButton.type = "button";
    tomorrowButton.textContent = "מחר";
    tomorrowButton.setAttribute("aria-label", "לא היום — להעביר למחר");
    tomorrowButton.title = "לא היום";
    tomorrowButton.hidden = isShoppingMode() || task.done;
    tomorrowButton.addEventListener("click", () => postponeTaskToTomorrow(task.id));

    actions.append(upButton, downButton, tomorrowButton);
  }

  row.append(checkButton, textWrap, actions);
  return row;
}

function createHeadNoteRow({ labelText, text, onOpen, onClear, clearText = "×", clearLabel = "הסרה", extraClass = "" }) {
  const row = document.createElement("div");
  row.className = `head-note-row${extraClass ? ` ${extraClass}` : ""}`;

  const label = document.createElement("span");
  label.textContent = labelText;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "head-note-button";
  btn.textContent = text;
  btn.addEventListener("click", onOpen);

  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "head-note-clear";
  clear.textContent = clearText;
  clear.setAttribute("aria-label", clearLabel);
  clear.addEventListener("click", onClear);

  row.append(label, btn, clear);
  return row;
}

function getActiveRangeTasks() {
  return tasks
    .filter(isActiveRangeTask)
    .sort((a, b) => compareDateKeys(a.scheduleEndDate, b.scheduleEndDate));
}

function createActiveRangeNote(task) {
  const progress = getRangeProgress(task);
  const row = document.createElement("div");
  row.className = "head-note-row range-note-row";

  const label = document.createElement("span");
  label.textContent = "עכשיו קורה";

  const content = document.createElement("button");
  content.type = "button";
  content.className = "head-note-button range-note-button";
  content.addEventListener("click", () => openViewTaskDialog(task));
  content.innerHTML = `<strong>${task.text}</strong><small>${formatDateRange(task)}</small>`;

  const barWrap = document.createElement("div");
  barWrap.className = "range-progress-wrap";
  const bar = document.createElement("span");
  bar.className = "range-progress-bar";
  bar.style.width = `${progress?.percent || 0}%`;
  barWrap.appendChild(bar);

  const progressText = document.createElement("em");
  progressText.textContent = progress ? `יום ${progress.current} מתוך ${progress.total}` : "";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "range-note-delete";
  deleteButton.textContent = "×";
  deleteButton.setAttribute("aria-label", "מחיקת טווח");
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    openDeleteDialog(task.id);
  });

  row.append(label, content, deleteButton, barWrap, progressText);
  return row;
}

function renderHeadNote() {
  if (!headNote) return;
  headNote.innerHTML = "";

  const activeRanges = getActiveRangeTasks();
  const headTask = getHeadTask();
  const urgentShoppingItem = getUrgentShoppingItem();
  const show = !isShoppingMode() && (activeRanges.length || headTask || urgentShoppingItem);
  headNote.hidden = !show;
  if (!show) return;

  activeRanges.forEach(task => headNote.appendChild(createActiveRangeNote(task)));

  if (headTask) {
    headNote.appendChild(createHeadNoteRow({
      labelText: "על הראש",
      text: headTask.text,
      onOpen: () => openViewTaskDialog(headTask),
      onClear: () => setHeadTask(headTask.id),
      clearText: "×",
      clearLabel: "להוריד מהראש"
    }));
  }

  if (urgentShoppingItem) {
    headNote.appendChild(createHeadNoteRow({
      labelText: "לקנות דחוף",
      text: urgentShoppingItem.text,
      onOpen: () => switchList("shopping"),
      onClear: () => switchList("shopping"),
      clearText: "›",
      clearLabel: "לעבור לקניות",
      extraClass: "urgent-shopping-note"
    }));
  }
}

function renderTasks() {
  removeOldDoneTasks();
  taskList.innerHTML = "";
  const rawItems = currentItems();
  const shopping = isShoppingMode();
  const items = shopping ? rawItems : rawItems.filter(isTaskVisibleNow);

  const emptyText = emptyState.querySelector("p");
  const messages = shopping ? emptyMessages.shopping : emptyMessages.tasks;
  emptyText.innerHTML = messages[dailyIndex(messages.length, shopping ? 17 : 4)];
  taskList.setAttribute("aria-label", shopping ? "רשימת קניות" : "רשימת מטלות");

  renderHeadNote();

  const activeRanges = shopping ? [] : items.filter(isActiveRangeTask);
  let openItems = items.filter(item => !item.done && !isActiveRangeTask(item));
  if (shopping) {
    openItems = [...openItems].sort((a, b) => Number(Boolean(b.onHead)) - Number(Boolean(a.onHead)));
  }
  const doneItems = items.filter(item => item.done);
  emptyState.hidden = openItems.length > 0 || doneItems.length > 0 || activeRanges.length > 0;

  openItems.forEach(task => taskList.appendChild(createTaskRow(task)));

  if (doneItems.length > 0) {
    const doneBlock = document.createElement("section");
    doneBlock.className = "done-block";

    const doneToggle = document.createElement("button");
    doneToggle.className = "done-toggle";
    doneToggle.type = "button";
    const collapsed = doneCollapsed[activeList];
    doneToggle.setAttribute("aria-expanded", String(!collapsed));
    doneToggle.innerHTML = `<span>${collapsed ? "פתחי" : "קפלי"}</span><strong>${isShoppingMode() ? "נקנו ונזרקו למטה" : "בוצעו ונזרקו למטה"} · ${doneItems.length}</strong>`;
    doneToggle.addEventListener("click", () => {
      doneCollapsed[activeList] = !doneCollapsed[activeList];
      renderTasks();
    });
    const clearDoneButton = document.createElement("button");
    clearDoneButton.className = "clear-done-button";
    clearDoneButton.type = "button";
    clearDoneButton.textContent = "לנקות עכשיו";
    clearDoneButton.addEventListener("click", clearDoneItems);

    const doneHeader = document.createElement("div");
    doneHeader.className = "done-header";
    doneHeader.append(doneToggle, clearDoneButton);
    doneBlock.appendChild(doneHeader);

    if (!collapsed) {
      const doneList = document.createElement("div");
      doneList.className = "done-list";
      doneItems.forEach(task => doneList.appendChild(createTaskRow(task)));
      doneBlock.appendChild(doneList);
    }

    taskList.appendChild(doneBlock);
  }
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
    row.className = `recurring-row${recurring.enabled === false ? " disabled" : ""}`;

    const text = document.createElement("div");
    text.className = "recurring-text";
    const title = document.createElement("strong");
    title.textContent = recurring.text;
    const meta = document.createElement("span");
    meta.textContent = `${frequencyLabel(recurring)} · ${recurring.enabled === false ? "כבויה" : "פעילה"}`;
    text.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "recurring-actions";

    const toggleButton = document.createElement("button");
    toggleButton.className = "action-button recurring-toggle";
    toggleButton.type = "button";
    const isEnabled = recurring.enabled !== false;
    toggleButton.textContent = isEnabled ? "⏸" : "▶";
    toggleButton.setAttribute("aria-label", isEnabled ? "כיבוי זמני של קבועה" : "הפעלה מחדש של קבועה");
    toggleButton.title = isEnabled ? "כיבוי זמני" : "להפעיל";
    toggleButton.addEventListener("click", () => setRecurringEnabled(recurring.id, !isEnabled));

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

    actions.append(toggleButton, editButton, deleteButton);
    row.append(text, actions);
    recurringList.appendChild(row);
  });
}

function switchList(nextList) {
  activeList = nextList;
  if (sortMode) setSortMode(false);

  const shopping = isShoppingMode();
  document.body.classList.toggle("shopping-mode", shopping);
  appTitle.textContent = shopping ? "שימי, תקני" : "שימי, תעשי";
  appSubtitle.textContent = shopping ? "מה חסר?" : "מה עכשיו?";
  tasksTab.classList.toggle("active", !shopping);
  shoppingTab.classList.toggle("active", shopping);
  tasksTab.setAttribute("aria-selected", String(!shopping));
  shoppingTab.setAttribute("aria-selected", String(shopping));
  addTaskButton.querySelector("strong").textContent = shopping ? "צריך לקנות" : "עוד מטלה";
  recurringButton.hidden = shopping;
  futureButton.hidden = shopping;
  renderTasks();
}

addTaskButton.addEventListener("click", () => openTaskDialog("add"));
tasksTab.addEventListener("click", () => switchList("tasks"));
shoppingTab.addEventListener("click", () => switchList("shopping"));
sortModeButton.addEventListener("click", () => setSortMode(!sortMode));
backupButton.addEventListener("click", openBackupDialog);
closeBackupButton.addEventListener("click", closeBackupDialog);
exportBackupButton.addEventListener("click", exportBackup);
importBackupInput.addEventListener("change", event => importBackupFile(event.target.files?.[0]));
futureButton.addEventListener("click", openFutureDialog);
closeFutureButton.addEventListener("click", closeFutureDialog);
futureListViewButton.addEventListener("click", () => setFutureViewMode("list"));
futureCalendarViewButton.addEventListener("click", () => setFutureViewMode("calendar"));
calendarPrevButton.addEventListener("click", () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1);
  selectedCalendarDate = null;
  renderFutureCalendar();
});
calendarNextButton.addEventListener("click", () => {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1);
  selectedCalendarDate = null;
  renderFutureCalendar();
});
if (viewMoveToggle) viewMoveToggle.addEventListener("click", () => {
  viewMovePanel.hidden = !viewMovePanel.hidden;
  updateViewMoveVisibility();
});
if (viewMoveApply) viewMoveApply.addEventListener("click", applyViewMove);
viewTaskDialog.querySelectorAll('input[name="viewMoveMode"]').forEach(input => input.addEventListener("change", updateViewMoveVisibility));
taskForm.querySelectorAll('input[name="scheduleMode"]').forEach(input => input.addEventListener("change", updateScheduleVisibility));
closeDialogButton.addEventListener("click", closeTaskDialog);
taskInput.addEventListener("input", () => { updateCharCount(); });

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const schedule = isShoppingMode() ? null : getSelectedSchedule();
  if (schedule && schedule.mode !== "now" && !schedule.date) {
    scheduleDate.focus();
    return;
  }
  if (schedule && schedule.mode === "range" && (!schedule.endDate || compareDateKeys(schedule.endDate, schedule.date) < 0)) {
    scheduleEndDate.focus();
    return;
  }

  if (editingTaskId) {
    updateTask(editingTaskId, text, schedule);
    closeTaskDialog();
    return;
  }

  if (isShoppingMode()) {
    createShoppingItemsFromText(text);
  } else {
    createTask(text, null, schedule);
  }

  if (isShoppingMode()) {
    taskInput.value = "";
    updateCharCount();
    setTimeout(() => taskInput.focus(), 30);
  } else {
    closeTaskDialog();
  }
});

cancelDeleteButton.addEventListener("click", closeDeleteDialog);
closeViewDialogButton.addEventListener("click", closeViewTaskDialog);
closeViewBottomButton.addEventListener("click", closeViewTaskDialog);
confirmDeleteButton.addEventListener("click", () => {
  if (deletingTaskId) deleteTask(deletingTaskId);
  closeDeleteDialog();
});

recurringButton.addEventListener("click", () => { if (!isShoppingMode()) openRecurringDialog(); });
closeRecurringButton.addEventListener("click", closeRecurringDialog);
addRecurringButton.addEventListener("click", () => openRecurringForm("add"));
closeRecurringFormButton.addEventListener("click", closeRecurringForm);
recurringFrequency.addEventListener("change", updateRecurringScheduleVisibility);
recurringWeekdayChecks.forEach(input => input.addEventListener("change", () => { if (recurringWeekdayChecks.some(day => day.checked)) multiWeeklyError.hidden = true; }));

recurringForm.addEventListener("submit", event => {
  event.preventDefault();
  const text = recurringInput.value.trim();
  if (!text) return;

  const monthDay = Math.max(1, Math.min(31, Number(recurringMonthDay.value) || 1));
  const weekdays = recurringWeekdayChecks.filter(input => input.checked).map(input => Number(input.value));
  if (recurringFrequency.value === "multiweekly" && weekdays.length === 0) {
    multiWeeklyError.hidden = false;
    multiWeeklyOptions.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return;
  }
  multiWeeklyError.hidden = true;
  const data = {
    text,
    frequency: recurringFrequency.value,
    weekday: Number(recurringWeekday.value),
    weekdays,
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

hairWashYes.addEventListener("click", () => {
  addRosemaryTask();
  setHairWashAnswer("yes");
  closeHairWashDialog();
  if (activeList !== "tasks") switchList("tasks");
});

hairWashNo.addEventListener("click", () => {
  setHairWashAnswer("no");
  closeHairWashDialog();
});

hairWashLater.addEventListener("click", () => {
  localStorage.removeItem(HAIR_WASH_PROMPT_KEY);
  closeHairWashDialog();
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    if (taskDialog.open) closeTaskDialog();
    if (deleteDialog.open) closeDeleteDialog();
    if (viewTaskDialog.open) closeViewTaskDialog();
    if (recurringDialog.open) closeRecurringDialog();
    if (recurringFormDialog.open) closeRecurringForm();
    if (deleteRecurringDialog.open) closeDeleteRecurringDialog();
    if (backupDialog.open) closeBackupDialog();
    if (futureDialog.open) closeFutureDialog();
    if (hairWashDialog.open) closeHairWashDialog();
  }
});

loadTasks();
switchList("tasks");
maybeOpenHairWashDialog();
