import assert from "node:assert/strict";
import {
  calculateStats,
  dayDifference,
  dueText,
  filterTasks,
  normalizeTask,
  taskState,
  validateTask,
} from "../assets/utils.js";

const now = new Date(2026, 9, 24, 12, 0, 0);
const tasks = [
  normalizeTask({ id: "1", title: "Informe", course: "IA", dueDate: "2026-10-24", priority: "high", hours: 2, completed: false }),
  normalizeTask({ id: "2", title: "Lectura", course: "Redes", dueDate: "2026-10-26", priority: "low", hours: 1.5, completed: false }),
  normalizeTask({ id: "3", title: "Práctica", course: "IA", dueDate: "2026-10-20", priority: "medium", hours: 3, completed: false }),
  normalizeTask({ id: "4", title: "Quiz", course: "BD", dueDate: "2026-10-23", priority: "medium", hours: 1, completed: true }),
];

assert.equal(validateTask(tasks[0]), "");
assert.match(validateTask({ ...tasks[0], title: "" }), /título/i);
assert.equal(dayDifference("2026-10-24", now), 0);
assert.equal(taskState(tasks[2], now), "overdue");
assert.equal(taskState(tasks[3], now), "completed");
assert.equal(dueText(tasks[0], now), "Vence hoy");

const stats = calculateStats(tasks, now);
assert.deepEqual(stats, {
  total: 4,
  completed: 1,
  overdue: 1,
  upcoming: 2,
  pendingHours: 6.5,
  courseCount: 2,
  progress: 25,
});

assert.deepEqual(
  filterTasks(tasks, { status: "pending", priority: "all", query: "IA" }, now).map((task) => task.id),
  ["1"],
);
assert.deepEqual(
  filterTasks(tasks, { status: "all", priority: "medium", query: "" }, now).map((task) => task.id),
  ["3", "4"],
);

console.log("Todas las pruebas de lógica pasaron.");
