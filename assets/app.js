import {
  calculateStats,
  createId,
  dayDifference,
  dueText,
  filterTasks,
  isoLocalDate,
  normalizeTask,
  taskState,
  validateTask,
} from "./utils.js";

const STORAGE_KEY = "agendaupc.tasks.v1";
const THEME_KEY = "agendaupc.theme";
const priorityNames = { high: "Alta", medium: "Media", low: "Baja" };

const elements = {
  todayLabel: document.querySelector("#todayLabel"),
  focusMessage: document.querySelector("#focusMessage"),
  statTotal: document.querySelector("#statTotal"),
  statUpcoming: document.querySelector("#statUpcoming"),
  statOverdue: document.querySelector("#statOverdue"),
  statCompleted: document.querySelector("#statCompleted"),
  progressRing: document.querySelector("#progressRing"),
  progressValue: document.querySelector("#progressValue"),
  pendingHours: document.querySelector("#pendingHours"),
  courseCount: document.querySelector("#courseCount"),
  taskList: document.querySelector("#taskList"),
  emptyState: document.querySelector("#emptyState"),
  template: document.querySelector("#taskTemplate"),
  dialog: document.querySelector("#taskDialog"),
  form: document.querySelector("#taskForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  formError: document.querySelector("#formError"),
  taskId: document.querySelector("#taskId"),
  taskTitle: document.querySelector("#taskTitle"),
  taskCourse: document.querySelector("#taskCourse"),
  taskDueDate: document.querySelector("#taskDueDate"),
  taskPriority: document.querySelector("#taskPriority"),
  taskHours: document.querySelector("#taskHours"),
  taskNotes: document.querySelector("#taskNotes"),
  searchInput: document.querySelector("#searchInput"),
  priorityFilter: document.querySelector("#priorityFilter"),
  importData: document.querySelector("#importData"),
  clearCompleted: document.querySelector("#clearCompleted"),
  toast: document.querySelector("#toast"),
};

let tasks = loadTasks();
let filters = { status: "all", priority: "all", query: "" };
let toastTimer;

function loadTasks() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored.map(normalizeTask) : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("is-visible"), 2600);
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", year: "numeric" })
    .format(new Date(year, month - 1, day));
}

function setTodayLabel() {
  const label = new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  elements.todayLabel.textContent = label.toLocaleUpperCase("es");
}

function renderStats() {
  const stats = calculateStats(tasks);
  elements.statTotal.textContent = stats.total;
  elements.statUpcoming.textContent = stats.upcoming;
  elements.statOverdue.textContent = stats.overdue;
  elements.statCompleted.textContent = `${stats.completed} completada${stats.completed === 1 ? "" : "s"}`;
  elements.clearCompleted.disabled = stats.completed === 0;
  elements.progressValue.textContent = `${stats.progress}%`;
  elements.progressRing.style.setProperty("--progress", `${stats.progress * 3.6}deg`);
  elements.pendingHours.textContent = `${Number(stats.pendingHours.toFixed(1))} h`;
  elements.courseCount.textContent = stats.courseCount;

  const next = tasks
    .filter((task) => !task.completed)
    .sort((a, b) => dayDifference(a.dueDate) - dayDifference(b.dueDate))[0];
  elements.focusMessage.textContent = next
    ? `${next.title} · ${dueText(next).toLocaleLowerCase("es")}`
    : "Todo al día. Agrega tu siguiente objetivo";
}

function createTaskCard(task) {
  const fragment = elements.template.content.cloneNode(true);
  const card = fragment.querySelector(".task-card");
  const state = taskState(task);
  card.dataset.id = task.id;
  card.classList.toggle("is-completed", task.completed);
  card.classList.toggle("is-overdue", state === "overdue");

  fragment.querySelector(".task-title").textContent = task.title;
  fragment.querySelector(".task-course").textContent = task.course;

  const notes = fragment.querySelector(".task-notes");
  notes.textContent = task.notes;
  notes.hidden = !task.notes;

  const priority = fragment.querySelector(".priority-badge");
  priority.textContent = priorityNames[task.priority];
  priority.classList.add(`priority-${task.priority}`);

  fragment.querySelector(".due-label").textContent = `${dueText(task)} · ${formatDate(task.dueDate)}`;
  fragment.querySelector(".hours-label").textContent = `${task.hours} h estimada${task.hours === 1 ? "" : "s"}`;

  const completeButton = fragment.querySelector(".complete-toggle");
  completeButton.setAttribute("aria-label", task.completed ? "Marcar como pendiente" : "Marcar como completada");
  completeButton.addEventListener("click", () => toggleTask(task.id));
  fragment.querySelector(".edit-task").addEventListener("click", () => openDialog(task));
  fragment.querySelector(".delete-task").addEventListener("click", () => removeTask(task.id));
  return fragment;
}

function renderTasks() {
  const visibleTasks = filterTasks(tasks, filters);
  elements.taskList.replaceChildren(...visibleTasks.map(createTaskCard));
  elements.emptyState.hidden = visibleTasks.length > 0;
  renderStats();
}

function openDialog(task = null) {
  elements.form.reset();
  elements.formError.hidden = true;
  elements.dialogTitle.textContent = task ? "Editar tarea" : "Nueva tarea";
  elements.taskId.value = task?.id || "";
  elements.taskTitle.value = task?.title || "";
  elements.taskCourse.value = task?.course || "";
  elements.taskDueDate.value = task?.dueDate || isoLocalDate(new Date(Date.now() + 86400000));
  elements.taskPriority.value = task?.priority || "medium";
  elements.taskHours.value = task?.hours || 1;
  elements.taskNotes.value = task?.notes || "";
  elements.dialog.showModal();
  elements.taskTitle.focus();
}

function closeDialog() {
  elements.dialog.close();
  elements.formError.hidden = true;
}

function formTask() {
  return {
    id: elements.taskId.value || createId(),
    title: elements.taskTitle.value,
    course: elements.taskCourse.value,
    dueDate: elements.taskDueDate.value,
    priority: elements.taskPriority.value,
    hours: Number(elements.taskHours.value),
    notes: elements.taskNotes.value,
    completed: tasks.find((item) => item.id === elements.taskId.value)?.completed || false,
    createdAt: tasks.find((item) => item.id === elements.taskId.value)?.createdAt || new Date().toISOString(),
  };
}

function upsertTask(event) {
  event.preventDefault();
  const candidate = formTask();
  const error = validateTask(candidate);
  if (error) {
    elements.formError.textContent = error;
    elements.formError.hidden = false;
    return;
  }

  const normalized = normalizeTask(candidate);
  const index = tasks.findIndex((task) => task.id === normalized.id);
  if (index >= 0) tasks[index] = normalized;
  else tasks.push(normalized);
  saveTasks();
  closeDialog();
  renderTasks();
  showToast(index >= 0 ? "Tarea actualizada" : "Tarea creada");
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks();
  renderTasks();
  showToast(task.completed ? "Tarea completada" : "Tarea reabierta");
}

function removeTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task || !window.confirm(`¿Eliminar “${task.title}”?`)) return;
  tasks = tasks.filter((item) => item.id !== id);
  saveTasks();
  renderTasks();
  showToast("Tarea eliminada");
}

function clearCompleted() {
  const completedCount = tasks.filter((task) => task.completed).length;
  if (!completedCount || !window.confirm(`¿Eliminar ${completedCount} tarea${completedCount === 1 ? "" : "s"} completada${completedCount === 1 ? "" : "s"}?`)) return;
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
  showToast("Tareas completadas eliminadas");
}

function sampleTasks() {
  const addDays = (days) => isoLocalDate(new Date(Date.now() + days * 86400000));
  return [
    normalizeTask({ title: "Presentar prototipo de la app", course: "Inteligencia Artificial", dueDate: addDays(1), priority: "high", hours: 3, notes: "Validar filtros, exportación y vista móvil.", completed: false }),
    normalizeTask({ title: "Resolver práctica de consultas", course: "Base de Datos", dueDate: addDays(3), priority: "medium", hours: 2, notes: "Revisar JOIN, GROUP BY y subconsultas.", completed: false }),
    normalizeTask({ title: "Leer capítulo de redes", course: "Redes y Comunicaciones", dueDate: addDays(6), priority: "low", hours: 1.5, notes: "Preparar resumen de una página.", completed: false }),
    normalizeTask({ title: "Actualizar bitácora del proyecto", course: "Gestión de Proyectos", dueDate: addDays(-1), priority: "high", hours: 1, notes: "Registrar decisiones y riesgos.", completed: false }),
    normalizeTask({ title: "Subir avance al repositorio", course: "Inteligencia Artificial", dueDate: addDays(-2), priority: "medium", hours: 1, notes: "", completed: true }),
  ];
}

function loadDemo() {
  if (tasks.length && !window.confirm("Esto reemplazará las tareas actuales por datos de ejemplo. ¿Continuar?")) return;
  tasks = sampleTasks();
  saveTasks();
  renderTasks();
  showToast("Datos de ejemplo cargados");
}

function exportData() {
  const payload = JSON.stringify({ app: "AgendaUPC", version: 1, exportedAt: new Date().toISOString(), tasks }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `agendaupc-${isoLocalDate()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Datos exportados");
}

async function importData(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const imported = Array.isArray(parsed) ? parsed : parsed.tasks;
    if (!Array.isArray(imported)) throw new Error("El archivo no contiene una lista de tareas.");
    const normalized = imported.map(normalizeTask);
    if (!window.confirm(`Se importarán ${normalized.length} tareas y se reemplazarán las actuales. ¿Continuar?`)) return;
    tasks = normalized;
    saveTasks();
    renderTasks();
    showToast("Importación completada");
  } catch (error) {
    showToast(`No se pudo importar: ${error.message}`);
  }
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);
}

function bindEvents() {
  document.querySelector("#openTaskDialog").addEventListener("click", () => openDialog());
  document.querySelector("#emptyAddTask").addEventListener("click", () => openDialog());
  document.querySelector("#closeTaskDialog").addEventListener("click", closeDialog);
  document.querySelector("#cancelTask").addEventListener("click", closeDialog);
  document.querySelector("#themeToggle").addEventListener("click", toggleTheme);
  document.querySelector("#loadDemo").addEventListener("click", loadDemo);
  document.querySelector("#exportData").addEventListener("click", exportData);
  elements.clearCompleted.addEventListener("click", clearCompleted);
  elements.importData.addEventListener("change", importData);
  elements.form.addEventListener("submit", upsertTask);
  elements.dialog.addEventListener("click", (event) => {
    if (event.target === elements.dialog) closeDialog();
  });
  elements.searchInput.addEventListener("input", (event) => {
    filters.query = event.target.value;
    renderTasks();
  });
  elements.priorityFilter.addEventListener("change", (event) => {
    filters.priority = event.target.value;
    renderTasks();
  });
  document.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-status]").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      filters.status = button.dataset.status;
      renderTasks();
    });
  });
}

document.documentElement.dataset.theme = localStorage.getItem(THEME_KEY) || "light";
setTodayLabel();
bindEvents();
renderTasks();
