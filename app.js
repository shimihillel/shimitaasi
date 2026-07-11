const STORAGE_KEY = "shimi-taasi-tasks-v1";
const SHOPPING_STORAGE_KEY = "shimi-taasi-shopping-v1";
const RECURRING_STORAGE_KEY = "shimi-taasi-recurring-v1";
const SUGGESTIONS_STORAGE_KEY = "shimi-taasi-suggestions-v1";
const ACHIEVEMENT_STORAGE_KEY = "shimi-taasi-achievement-v1";

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
const scheduleTimeWrap = document.getElementById("scheduleTimeWrap");
const scheduleDate = document.getElementById("scheduleDate");
const scheduleTime = document.getElementById("scheduleTime");
const suggestionsBox = document.getElementById("suggestionsBox");
const headNote = document.getElementById("headNote");
const effortField = document.getElementById("effortField");

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
let shoppingItems = [];
let recurringTasks = [];
let editingTaskId = null;
let deletingTaskId = null;
let sortMode = false;
let activeList = "tasks";
let editingRecurringId = null;
let deletingRecurringId = null;
let doneCollapsed = { tasks: false, shopping: false };
let suggestionCounts = {};

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

function isFutureTask(task) {
  return Boolean(task && task.scheduleMode && task.scheduleMode !== "now" && task.scheduleDate && task.scheduleDate > todayKey());
}

function isTaskVisibleNow(task) {
  return !isFutureTask(task);
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
  tasks = tasks.filter(task => !task.done || task.doneAt === today);
  shoppingItems = shoppingItems.filter(item => !item.done || item.doneAt === today);
}

function createTask(text, recurringId = null, effort = "normal", schedule = null) {
  const newItem = {
    id: `item-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text: text.trim(),
    createdAt: todayKey(),
    done: false,
    doneAt: null,
    effort: isShoppingMode() ? "normal" : effort,
    recurringId: isShoppingMode() ? null : recurringId,
    onHead: false,
    scheduleMode: isShoppingMode() ? "now" : (schedule?.mode || "now"),
    scheduleDate: isShoppingMode() ? null : (schedule?.date || null),
    scheduleTime: isShoppingMode() ? null : (schedule?.mode === "exact" ? (schedule?.time || null) : null)
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

function updateTask(id, text, effort = null, schedule = null) {
  const items = currentItems().map(item => item.id === id ? { ...item, text: text.trim(), ...(effort ? { effort } : {}), ...(schedule ? { scheduleMode: schedule.mode, scheduleDate: schedule.date || null, scheduleTime: schedule.mode === "exact" ? (schedule.time || null) : null } : {}) } : item);
  setCurrentItems(items);
  renderTasks();
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
  const openItems = items.filter(item => !item.done);
  const doneItems = items.filter(item => item.done);
  return [...openItems, ...doneItems];
}

function isRecurringDueToday(recurring) {
  if (recurring.enabled === false) return false;
  const today = getTodayParts();

  if (recurring.frequency === "daily") return true;
  if (recurring.frequency === "weekly") return Number(recurring.weekday) === today.day;
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
      effort: recurring.effort || "normal",
      recurringId: recurring.id,
      onHead: false,
      scheduleMode: "now",
      scheduleDate: null,
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
  tasks = tasks.map(task => ({ ...task, onHead: task.id === id ? !task.onHead : false }));
  saveTasks();
  renderTasks();
}

function getHeadTask() {
  return tasks.find(task => task.onHead && !task.done && isTaskVisibleNow(task));
}

function shoppingCategory(text) {
  const value = (text || "").toLowerCase();
  const groups = [
    { label: "מקרר", words: ["חלב", "גבינה", "יוגורט", "קוטג", "ביצים", "חמאה", "שמנת"] },
    { label: "בית", words: ["מגבונים", "נייר", "סבון", "שקיות", "טישו", "אקונומיקה", "כביסה", "מרכך"] },
    { label: "חתולים", words: ["חתול", "חתולים", "סושי", "מייפל", "חול", "אוכל לחתולים"] },
    { label: "טיפוח", words: ["קרם", "שמפו", "מסכה", "סרום", "סבון פנים", "דאודורנט", "לק"] },
    { label: "ילדים", words: ["שחר", "רון", "ניר", "גן", "בית ספר", "מחברת", "טושים"] }
  ];
  const found = groups.find(group => group.words.some(word => value.includes(word)));
  return found ? found.label : "כללי";
}

function registerAchievement(item) {
  const today = todayKey();
  let data;
  try { data = JSON.parse(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY)) || {}; } catch { data = {}; }
  if (data.date !== today) data = { date: today, count: 0, threeShown: false, heavyShown: false };
  data.count += 1;

  if (!isShoppingMode() && item.effort === "heavy" && !data.heavyShown) {
    data.heavyShown = true;
    showToast("כבדה נפלה. כבוד.");
  } else if (data.count === 3 && !data.threeShown) {
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
  futureList.innerHTML = "";
  const futureTasks = getFutureTasks();
  if (futureTasks.length === 0) {
    const empty = document.createElement("p");
    empty.className = "recurring-empty";
    empty.textContent = "אין עתידיות כרגע. העתיד פנוי, איכשהו.";
    futureList.appendChild(empty);
    return;
  }

  const exact = futureTasks.filter(task => task.scheduleMode === "exact");
  const from = futureTasks.filter(task => task.scheduleMode === "from");
  addFutureGroup("בתאריך מסוים", exact);
  addFutureGroup("החל מתאריך", from);
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
    ? `${formatCalendarDate(task.scheduleDate)}${task.scheduleTime ? ` · ${task.scheduleTime}` : ""}`
    : `החל מ־${formatCalendarDate(task.scheduleDate)}`;
  text.append(strong, meta);

  const actions = document.createElement("div");
  actions.className = "future-actions";

  const showNow = document.createElement("button");
  showNow.type = "button";
  showNow.className = "tiny-action";
  showNow.textContent = "להציג עכשיו";
  showNow.addEventListener("click", () => {
    tasks = tasks.map(item => item.id === task.id ? { ...item, scheduleMode: "now", scheduleDate: null, scheduleTime: null } : item);
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

function getSelectedEffort() {
  const checked = taskForm.querySelector('input[name="effort"]:checked');
  return checked ? checked.value : "normal";
}

function setSelectedEffort(value) {
  const next = value || "normal";
  const input = taskForm.querySelector(`input[name="effort"][value="${next}"]`) || taskForm.querySelector('input[name="effort"][value="normal"]');
  if (input) input.checked = true;
}

function getSelectedSchedule() {
  const selected = taskForm.querySelector('input[name="scheduleMode"]:checked');
  const mode = selected ? selected.value : "now";
  if (mode === "now") return { mode: "now", date: null, time: null };
  return {
    mode,
    date: scheduleDate.value || null,
    time: mode === "exact" ? (scheduleTime.value || null) : null
  };
}

function setSelectedSchedule(task = null) {
  const mode = task?.scheduleMode || "now";
  const input = taskForm.querySelector(`input[name="scheduleMode"][value="${mode}"]`) || taskForm.querySelector('input[name="scheduleMode"][value="now"]');
  if (input) input.checked = true;
  scheduleDate.value = task?.scheduleDate || "";
  scheduleTime.value = task?.scheduleTime || "";
  updateScheduleVisibility();
}

function updateScheduleVisibility() {
  const selected = taskForm.querySelector('input[name="scheduleMode"]:checked');
  const mode = selected ? selected.value : "now";
  const scheduled = !isShoppingMode() && mode !== "now";
  scheduleDateWrap.hidden = !scheduled;
  scheduleTimeWrap.hidden = !(!isShoppingMode() && mode === "exact");
  scheduleDate.required = scheduled;
  if (mode !== "exact") scheduleTime.value = "";
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
  effortField.hidden = isShoppingMode();
  scheduleField.hidden = isShoppingMode();
  renderSuggestions();
  setSelectedEffort(task?.effort || "normal");
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
  setSelectedEffort("normal");
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
  weeklyOptions.hidden = !["weekly", "biweekly"].includes(recurringFrequency.value);
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

function createTaskRow(task) {
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
  taskDate.textContent = formatTaskMeta(task);

  const metaWrap = document.createElement("div");
  metaWrap.className = "task-meta";
  metaWrap.appendChild(taskDate);
  if (!isShoppingMode() && task.effort && task.effort !== "normal") {
    const effortChip = document.createElement("span");
    effortChip.className = `effort-chip ${task.effort}`;
    effortChip.textContent = task.effort === "heavy" ? "כבדה" : "קטנה";
    metaWrap.appendChild(effortChip);
  }

  if (isShoppingMode()) {
    const categoryChip = document.createElement("span");
    categoryChip.className = "category-chip";
    categoryChip.textContent = shoppingCategory(task.text);
    metaWrap.appendChild(categoryChip);
  }

  textWrap.append(taskText, metaWrap);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  if (sortMode) {
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
    const headButton = document.createElement("button");
    headButton.className = `action-button head ${task.onHead ? "active" : ""}`;
    headButton.type = "button";
    headButton.textContent = "!";
    headButton.setAttribute("aria-label", task.onHead ? "להוריד מהראש" : "לשים על הראש");
    headButton.title = task.onHead ? "להוריד מהראש" : "על הראש";
    headButton.hidden = isShoppingMode() || task.done;
    headButton.addEventListener("click", () => setHeadTask(task.id));

    const moveButton = document.createElement("button");
    moveButton.className = "action-button move";
    moveButton.type = "button";
    moveButton.textContent = "↑";
    moveButton.setAttribute("aria-label", "הקפיצי מטלה לראש הרשימה");
    moveButton.title = "הקפצה לראש";
    const openIndex = currentItems().filter(item => !item.done && (isShoppingMode() || isTaskVisibleNow(item))).findIndex(item => item.id === task.id);
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

    actions.append(headButton, moveButton, editButton, deleteButton);
  }

  row.append(checkButton, textWrap, actions);
  return row;
}

function renderHeadNote() {
  if (!headNote) return;
  headNote.innerHTML = "";
  const headTask = getHeadTask();
  const show = !isShoppingMode() && headTask;
  headNote.hidden = !show;
  if (!show) return;

  const label = document.createElement("span");
  label.textContent = "על הראש";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "head-note-button";
  btn.textContent = headTask.text;
  btn.addEventListener("click", () => openViewTaskDialog(headTask));
  const clear = document.createElement("button");
  clear.type = "button";
  clear.className = "head-note-clear";
  clear.textContent = "×";
  clear.setAttribute("aria-label", "להוריד מהראש");
  clear.addEventListener("click", () => setHeadTask(headTask.id));
  headNote.append(label, btn, clear);
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

  const openItems = items.filter(item => !item.done);
  const doneItems = items.filter(item => item.done);
  emptyState.hidden = openItems.length > 0 || doneItems.length > 0;

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

  if (editingTaskId) {
    updateTask(editingTaskId, text, isShoppingMode() ? null : getSelectedEffort(), schedule);
    closeTaskDialog();
    return;
  }

  if (isShoppingMode()) {
    createShoppingItemsFromText(text);
  } else {
    createTask(text, null, getSelectedEffort(), schedule);
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
    if (backupDialog.open) closeBackupDialog();
    if (futureDialog.open) closeFutureDialog();
  }
});

loadTasks();
switchList("tasks");
