import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    navigate("/tableau-de-bord");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Se connecter</h2>
        <p className="auth-sub">
          Administrateur ou utilisateur, la connexion se fait avec le même formulaire — c'est
          votre rôle enregistré dans la base qui détermine ce que vous voyez ensuite.
        </p>
        <form onSubmit={handleLogin}>
          <div className="form-row">
            <label>Adresse email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="auth-foot">
          Pas encore de compte ? <Link to="/inscription">S'inscrire avec un code d'invitation</Link>
        </p>
      </div>
    </div>
  );
}
