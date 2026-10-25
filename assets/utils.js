const PRIORITIES = new Set(["high", "medium", "low"]);

export function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function localDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isoLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dayDifference(dateValue, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((localDate(dateValue) - today) / 86400000);
}

export function taskState(task, now = new Date()) {
  if (task.completed) return "completed";
  return dayDifference(task.dueDate, now) < 0 ? "overdue" : "pending";
}

export function validateTask(task) {
  const title = String(task.title ?? "").trim();
  const course = String(task.course ?? "").trim();
  const dueDate = String(task.dueDate ?? "");
  const priority = String(task.priority ?? "");
  const hours = Number(task.hours);
  if (!title || title.length > 80) return "Escribe un título válido de hasta 80 caracteres.";
  if (!course || course.length > 50) return "Escribe un curso válido de hasta 50 caracteres.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(localDate(dueDate).getTime())) return "Selecciona una fecha válida.";
  if (!PRIORITIES.has(priority)) return "Selecciona una prioridad válida.";
  if (!Number.isFinite(hours) || hours < 0.5 || hours > 100) return "Las horas deben estar entre 0.5 y 100.";
  return "";
}

export function normalizeTask(task) {
  const normalized = {
    id: String(task.id || createId()),
    title: String(task.title ?? "").trim(),
    course: String(task.course ?? "").trim(),
    dueDate: String(task.dueDate ?? ""),
    priority: String(task.priority ?? "medium"),
    hours: Number(task.hours),
    notes: String(task.notes ?? "").trim().slice(0, 240),
    completed: Boolean(task.completed),
    createdAt: String(task.createdAt || new Date().toISOString()),
  };
  const error = validateTask(normalized);
  if (error) throw new Error(error);
  return normalized;
}

export function calculateStats(tasks, now = new Date()) {
  const completed = tasks.filter((task) => task.completed).length;
  const overdue = tasks.filter((task) => taskState(task, now) === "overdue").length;
  const upcoming = tasks.filter((task) => {
    const days = dayDifference(task.dueDate, now);
    return !task.completed && days >= 0 && days <= 7;
  }).length;
  const pendingHours = tasks
    .filter((task) => !task.completed)
    .reduce((sum, task) => sum + Number(task.hours || 0), 0);
  const courses = new Set(tasks.filter((task) => !task.completed).map((task) => task.course.toLocaleLowerCase("es")));
  return {
    total: tasks.length,
    completed,
    overdue,
    upcoming,
    pendingHours,
    courseCount: courses.size,
    progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
  };
}

export function filterTasks(tasks, filters, now = new Date()) {
  const query = String(filters.query || "").trim().toLocaleLowerCase("es");
  return tasks
    .filter((task) => {
      const stateMatches = filters.status === "all" || taskState(task, now) === filters.status;
      const priorityMatches = filters.priority === "all" || task.priority === filters.priority;
      const searchable = `${task.title} ${task.course} ${task.notes}`.toLocaleLowerCase("es");
      return stateMatches && priorityMatches && (!query || searchable.includes(query));
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      const dateOrder = localDate(a.dueDate) - localDate(b.dueDate);
      if (dateOrder !== 0) return dateOrder;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}

export function dueText(task, now = new Date()) {
  if (task.completed) return "Completada";
  const days = dayDifference(task.dueDate, now);
  if (days < 0) return `Vencida hace ${Math.abs(days)} ${Math.abs(days) === 1 ? "día" : "días"}`;
  if (days === 0) return "Vence hoy";
  if (days === 1) return "Vence mañana";
  return `Vence en ${days} días`;
}
