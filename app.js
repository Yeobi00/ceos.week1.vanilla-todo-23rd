const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

/* ── State ── */
let selectedDate = new Date();
let weekOffset = 0;
let todos = {};

/* ── DOM Elements ── */
const currentDateEl = document.getElementById("currentDate");
const weekDaysEl = document.getElementById("weekDays");
const prevWeekBtn = document.getElementById("prevWeek");
const nextWeekBtn = document.getElementById("nextWeek");
const todoList = document.getElementById("todoList");
const todoCountEl = document.getElementById("todoCount");

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
}

/* ── Render All ── */
function render() {
  currentDateEl.textContent = formatDisplayDate(selectedDate);
  renderWeek();
  renderTodos();
}

/* ── Event Listeners ── */
prevWeekBtn.addEventListener("click", () => {
  weekOffset--;
  render();
});

nextWeekBtn.addEventListener("click", () => {
  weekOffset++;
  render();
});

/* ── Init ── */
render();
