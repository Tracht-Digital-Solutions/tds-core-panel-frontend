import { useState } from "react";
import { AUTH_API_URL, setAuthed, fetchMe, clearAuthed, type Me } from "../lib/auth";

/**
 * Panel login: email + password → tds-auth-api `POST /login` (sets the httpOnly
 * session cookie), then re-confirms via `/me` (a cookie that didn't stick becomes
 * a message, not a redirect loop) and marks the presence hint before navigating.
 * On mount it also honours an existing shared session (cross-panel SSO).
 */
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const nextUrl = (): string => {
    const p = new URLSearchParams(location.search).get("next");
    return p && p.startsWith("/") ? p : "/";
  };

  const succeed = (me: Me) => {
    setAuthed();
    void me;
    location.replace(nextUrl());
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        clearAuthed();
        setError(res.status === 401 ? "E-Mail oder Passwort ist falsch." : "Anmeldung fehlgeschlagen.");
        setBusy(false);
        return;
      }
      const me = await fetchMe();
      if (!me) {
        clearAuthed();
        setError("Sitzung konnte nicht bestätigt werden. Bitte erneut versuchen.");
        setBusy(false);
        return;
      }
      succeed(me);
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
      setBusy(false);
    }
  };

  return (
    <form className="login-form" onSubmit={submit}>
      {error ? <p className="status-pill status-pill--danger">{error}</p> : null}
      <label>
        E-Mail
        <input
          type="email"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          autoComplete="username"
          required
        />
      </label>
      <label>
        Passwort
        <input
          type="password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          autoComplete="current-password"
          required
        />
      </label>
      <button type="submit" disabled={busy}>
        {busy ? "Anmelden …" : "Anmelden"}
      </button>
    </form>
  );
}
