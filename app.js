const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

/* ── State ── */
let selectedDate = new Date();
let weekOffset = 0;
let todos = loadTodos();

/* ── DOM Elements ── */
const currentDateEl = document.getElementById("currentDate");
const weekDaysEl = document.getElementById("weekDays");
const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");
const todoForm = document.getElementById("todoForm");
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoCountEl = document.getElementById("todoCount");
const themeToggleBtn = document.getElementById("themeToggle");

/* ── LocalStorage ── */
function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem("todos")) || {};
  } catch {
    return {};
  }
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

/* ── Date Helpers ── */
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return formatDateKey(a) === formatDateKey(b);
}

function getWeekDates(offset) {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // 선택된 주의 일요일 날짜 계산
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek + offset * 7);

  // 선택된 주의 날짜 설정
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function formatDisplayDate(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const day = DAY_NAMES[date.getDay()];
  return `${y}년 ${m}월 ${d}일 ${day}요일`;
}

/* ── Render: Week Navigation ── */
function renderWeek() {
  const weekDates = getWeekDates(weekOffset);
  const today = new Date();

  weekDaysEl.innerHTML = "";

  weekDates.forEach((date) => {
    const dateKey = formatDateKey(date);
    const todoCount = (todos[dateKey] || []).length;
    const isSelected = isSameDay(date, selectedDate);
    const isToday = isSameDay(date, today);

    const li = document.createElement("li");
    li.className = "week-nav__day";
    if (isSelected) li.classList.add("week-nav__day--selected");
    if (isToday) li.classList.add("week-nav__day--today");

    const dayName = document.createElement("span");
    dayName.className = "week-nav__day-name";
    dayName.textContent = DAY_NAMES[date.getDay()];

    const dayNumber = document.createElement("span");
    dayNumber.className = "week-nav__day-number";
    dayNumber.textContent = date.getDate();

    const dayCount = document.createElement("span");
    dayCount.className = "week-nav__day-count";
    dayCount.textContent = todoCount > 0 ? `${todoCount}개` : "";

    li.appendChild(dayName);
    li.appendChild(dayNumber);
    li.appendChild(dayCount);

    li.addEventListener("click", () => {
      selectedDate = new Date(date);
      render();
    });

    weekDaysEl.appendChild(li);
  });
}

/* ── Render: Todo List ── */
function renderTodos() {
  const dateKey = formatDateKey(selectedDate);
  const currentTodos = todos[dateKey] || [];

  todoCountEl.textContent = `${currentTodos.length}개`;
  todoList.innerHTML = "";

  if (currentTodos.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.className = "todo-list__empty";
    emptyLi.textContent = "할 일이 없습니다";
    todoList.appendChild(emptyLi);
    return;
  }

  currentTodos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";
    if (todo.done) li.classList.add("todo-item--done");

    const checkbox = document.createElement("button");
    checkbox.className = "todo-item__checkbox";
    checkbox.setAttribute("aria-label", "완료 토글");
    checkbox.addEventListener("click", () => toggleTodo(dateKey, index));

    const text = document.createElement("span");
    text.className = "todo-item__text";
    text.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "todo-item__delete";
    deleteBtn.setAttribute("aria-label", "삭제");
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => deleteTodo(dateKey, index));

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });
}

/* ── Render All ── */
function render() {
  currentDateEl.textContent = formatDisplayDate(selectedDate);
  renderWeek();
  renderTodos();
}

/* ── Todo Actions ── */
function addTodo(text) {
  const dateKey = formatDateKey(selectedDate);
  if (!todos[dateKey]) {
    todos[dateKey] = [];
  }
  todos[dateKey].push({ text, done: false });
  saveTodos();
  render();
}

function toggleTodo(dateKey, index) {
  todos[dateKey][index].done = !todos[dateKey][index].done;
  saveTodos();
  render();
}

function deleteTodo(dateKey, index) {
  todos[dateKey].splice(index, 1);
  if (todos[dateKey].length === 0) {
    delete todos[dateKey];
  }
  saveTodos();
  render();
}

/* ── Dark Mode ── */
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggleBtn.textContent = "\u2600\uFE0F";
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  themeToggleBtn.textContent = isDark ? "\u2600\uFE0F" : "\uD83C\uDF19";
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

/* ── Event Listeners ── */
themeToggleBtn.addEventListener("click", toggleTheme);

todoForm.addEventListener("submit", (e) => {
  // 불필요한 페이지 새로고침 방지 및 현재 UI 유지
  e.preventDefault();

  // 공백 문자열만 입력 시 등록 안되도록 공백 제거
  const text = todoInput.value.trim();
  if (text) {
    addTodo(text);
    todoInput.value = "";
    todoInput.focus();
  }
});

prevWeekBtn.addEventListener("click", () => {
  weekOffset--;
  render();
});

nextWeekBtn.addEventListener("click", () => {
  weekOffset++;
  render();
});

/* ── Init ── */
loadTheme();
render();
