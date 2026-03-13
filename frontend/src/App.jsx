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
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [error, setError] = useState("");

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

  return (
    <main className="container">
      <h1>Simple To-Do List</h1>

      <form onSubmit={addTask} className="add-form">
        <input
          value={newTaskTitle}
          onChange={(event) => setNewTaskTitle(event.target.value)}
          placeholder="Enter a task"
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-item">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleComplete(task)}
            />

            {editingTaskId === task.id ? (
              <>
                <input
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                />
                <button onClick={() => saveEdit(task.id)}>Save</button>
                <button onClick={() => setEditingTaskId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span className={task.completed ? "done" : ""}>{task.title}</span>
                <button onClick={() => startEdit(task)}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
