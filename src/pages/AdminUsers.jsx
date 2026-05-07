import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      const { data } = await api.get("/admin/users", {
        params: { search, role, limit: 50 },
      });
      setUsers(data.users);
    } catch (err) {
      setError(err?.response?.data?.message || "Greška pri učitavanju korisnika.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    loadUsers();
  }

  async function changeRole(userId, newRole) {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Greška pri promeni role.");
    }
  }

  async function deleteUser(userId) {
    if (!confirm("Da li želiš da obrišeš ovog korisnika?")) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Greška pri brisanju korisnika.");
    }
  }

  return (
    <section>
      <h1>Upravljanje korisnicima</h1>

      <form onSubmit={handleSearch} className="filter-form" style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Pretraga po imenu ili email-u"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="all">Sve role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button type="submit">Pretraži</button>
      </form>

      {error && <p className="auth-error">{error}</p>}
      {loading && <p>Učitavanje korisnika...</p>}

      {!loading &&
        users.map((u) => (
          <article key={u._id} className="question-card">
            <h3>{u.name}</h3>
            <p>{u.email}</p>
            <p>Rola: {u.role}</p>

            <div>
              <button onClick={() => changeRole(u._id, u.role === "admin" ? "user" : "admin")}>
                Promeni rolu
              </button>

              <button onClick={() => deleteUser(u._id)} disabled={u.role === "admin" && u.email === "admin@geoquizjunior.com"}>
                Obriši
              </button>
            </div>
          </article>
        ))}
    </section>
  );
}