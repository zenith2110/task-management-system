import { useEffect, useState } from "react";
import api from "../api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("pending");
  const [editingId, setEditingId] = useState(null);

  async function load() {
    const { data } = await api.get("/tasks");
    setTasks(data);
  }
  useEffect(() => { load(); }, []);

  const filtered = tasks.filter(t => filter === "all" ? true : t.status === filter);

  async function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingId) {
      await api.put(`/tasks/${editingId}`, { title, status });
    } else {
      await api.post("/tasks", { title, status });
    }
    setTitle(""); setStatus("pending"); setEditingId(null);
    await load();
  }

  async function del(id) {
    await api.delete(`/tasks/${id}`);
    await load();
  }

  function startEdit(t) {
    setEditingId(t.id);
    setTitle(t.title);
    setStatus(t.status);
  }

  function logout() {
    localStorage.removeItem("token");
    location.href = "/login";
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">My Tasks</h3>
        <button className="btn btn-outline-secondary" onClick={logout}>Logout</button>
      </div>

      <div className="mb-3">
        <label className="me-2">Filter:</label>
        <select className="form-select w-auto d-inline-block"
                value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <form className="card card-body mb-3" onSubmit={submit}>
        <div className="row g-2">
          <div className="col-md-6">
            <input className="form-control" placeholder="Task title"
                   required value={title} onChange={e=>setTitle(e.target.value)} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={status} onChange={e=>setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="col-md-3">
            <button className="btn btn-primary w-100">
              {editingId ? "Update Task" : "Add Task"}
            </button>
          </div>
        </div>
      </form>

      <ul className="list-group">
        {filtered.map(t => (
          <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-semibold">{t.title}</div>
              <small className="text-muted">{t.status}</small>
            </div>
            <div className="btn-group">
              <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(t)}>Edit</button>
              <button className="btn btn-sm btn-outline-danger" onClick={()=>del(t.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
