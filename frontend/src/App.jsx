import { useEffect, useState } from "react";

const runtimeApiUrl =
  typeof window !== "undefined"
    ? window.__APP_CONFIG__?.API_URL
    : undefined;

const API_URL =
  runtimeApiUrl ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.REACT_APP_API_URL ||
  "http://localhost:5000";

export default function App() {
  const TASKS_PER_PAGE = 5;

  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  async function fetchTasks() {
    setError("");
    try {
      const response = await fetch(`${API_URL}/tasks`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch {
      setError("Unable to fetch tasks. Ensure backend is running.");
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function addTask(event) {
    event.preventDefault();
    if (!newTaskTitle.trim()) return;

    setError("");
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle.trim() }),
      });
      if (!response.ok) throw new Error("Failed to add task");
      setNewTaskTitle("");
      fetchTasks();
    } catch {
      setError("Unable to add task.");
    }
  }

  function startEdit(task) {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  }

  async function saveEdit(taskId) {
    if (!editingTitle.trim()) return;

    setError("");
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      setEditingTaskId(null);
      setEditingTitle("");
      fetchTasks();
    } catch {
      setError("Unable to update task.");
    }
  }

  async function toggleComplete(task) {
    setError("");
    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!response.ok) throw new Error("Failed to toggle task status");
      fetchTasks();
    } catch {
      setError("Unable to update task status.");
    }
  }

  async function deleteTask(taskId) {
    setError("");
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      fetchTasks();
    } catch {
      setError("Unable to delete task.");
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;
  const totalPages = Math.max(1, Math.ceil(tasks.length / TASKS_PER_PAGE));
  const pageStart = (currentPage - 1) * TASKS_PER_PAGE;
  const visibleTasks = tasks.slice(pageStart, pageStart + TASKS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <main className="app-shell">
      <div className="bg-shape bg-shape-one" />
      <div className="bg-shape bg-shape-two" />

      <section className="todo-panel">
        <header className="panel-header">
          <p className="eyebrow">Daily Planner</p>
          <h1>Design-First To-Do</h1>
          <p className="subtitle">Plan focused work and keep momentum all day.</p>

          <div className="stats">
            <span className="stat-pill">{tasks.length} total</span>
            <span className="stat-pill">{pendingCount} pending</span>
            <span className="stat-pill">{completedCount} done</span>
          </div>
        </header>

        <form onSubmit={addTask} className="add-form">
          <input
            value={newTaskTitle}
            onChange={(event) => setNewTaskTitle(event.target.value)}
            placeholder="What do you want to get done?"
          />
          <button type="submit" className="btn btn-primary">
            Add task
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet. Add your first one to get started.</p>
          </div>
        ) : (
          <>
            <ul className="task-list">
              {visibleTasks.map((task) => (
              <li key={task.id} className="task-item">
                <input
                  className="task-check"
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task)}
                />

                {editingTaskId === task.id ? (
                  <>
                    <input
                      className="task-input"
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                    />
                    <div className="task-actions">
                      <button
                        type="button"
                        className="btn btn-save"
                        onClick={() => saveEdit(task.id)}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn btn-cancel"
                        onClick={() => setEditingTaskId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className={task.completed ? "task-title done" : "task-title"}>
                      {task.title}
                    </span>
                    <div className="task-actions">
                      <button
                        type="button"
                        className="btn btn-edit"
                        onClick={() => startEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-delete"
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
              ))}
            </ul>

            {tasks.length > TASKS_PER_PAGE && (
              <nav className="pagination" aria-label="Task pagination">
                <button
                  type="button"
                  className="btn btn-page"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        type="button"
                        className={page === currentPage ? "btn btn-page active" : "btn btn-page"}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="btn btn-page"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </main>
  );
}
