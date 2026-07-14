import { useEffect, useState } from "react";
import { AUTH_API_URL, panelFetch } from "../lib/auth";

interface AdminUser {
  id: number;
  email: string;
  name?: string;
  isAdmin?: boolean;
  isSupportAgent?: boolean;
}

const usersUrl = `${AUTH_API_URL}/admin/users`;

/**
 * Core user management (Nutzerverwaltung) — the base service's own screen,
 * talking to tds-auth-api's admin user endpoints (the owner of `app_user`).
 * Checkpoint-1: list + create + toggle admin + reset-password + delete. Fine-
 * grained permissions + company memberships editing land in a later checkpoint.
 */
export default function UsersAdmin() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = () =>
    panelFetch(usersUrl)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => setUsers(d.users ?? []))
      .catch((e) => setError(String(e.message ?? e)));

  useEffect(() => {
    void load();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setNotice(null);
    const res = await panelFetch(usersUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), name: name.trim() || undefined, isAdmin }),
    });
    setBusy(false);
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.tempPassword) setNotice(`Temporäres Passwort: ${data.tempPassword}`);
      setEmail("");
      setName("");
      setIsAdmin(false);
      void load();
    } else {
      setError(res.status === 409 ? "E-Mail existiert bereits." : `Anlegen fehlgeschlagen (HTTP ${res.status}).`);
    }
  };

  const toggleAdmin = async (u: AdminUser) => {
    await panelFetch(`${usersUrl}/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: !u.isAdmin }),
    });
    void load();
  };

  const resetPassword = async (u: AdminUser) => {
    const res = await panelFetch(`${usersUrl}/${u.id}/reset-password`, { method: "POST" });
    if (res.ok) {
      const d = await res.json().catch(() => ({}));
      if (d.tempPassword) setNotice(`Neues temporäres Passwort für ${u.email}: ${d.tempPassword}`);
    }
  };

  const remove = async (u: AdminUser) => {
    await panelFetch(`${usersUrl}/${u.id}`, { method: "DELETE" });
    void load();
  };

  return (
    <div className="users-admin">
      {error ? <p className="status-pill status-pill--danger">{error}</p> : null}
      {notice ? <p className="status-pill status-pill--info">{notice}</p> : null}

      <form className="users-admin__create" onSubmit={create}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail" required />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (optional)" />
        <label>
          <input type="checkbox" checked={isAdmin} onChange={(e) => setIsAdmin(e.target.checked)} /> Admin
        </label>
        <button type="submit" disabled={busy}>Nutzer anlegen</button>
      </form>

      {users === null ? (
        <p>Wird geladen …</p>
      ) : users.length === 0 ? (
        <p>Keine Nutzer.</p>
      ) : (
        <table className="users-admin__table">
          <thead>
            <tr><th>E-Mail</th><th>Name</th><th>Admin</th><th>Aktionen</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.name ?? "—"}</td>
                <td>
                  <button type="button" className={`chip chip--${u.isAdmin ? "success" : "neutral"}`} onClick={() => toggleAdmin(u)}>
                    {u.isAdmin ? "Ja" : "Nein"}
                  </button>
                </td>
                <td>
                  <button type="button" onClick={() => resetPassword(u)}>Passwort zurücksetzen</button>
                  <button type="button" onClick={() => remove(u)}>Löschen</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
