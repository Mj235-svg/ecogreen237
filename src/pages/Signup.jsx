import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Signup() {
  const [step, setStep] = useState(1); // 1 = vérifier le code, 2 = créer le compte
  const [inviteCode, setInviteCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [filiere, setFiliere] = useState("toutes");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function checkCode(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { data, error } = await supabase.rpc("redeem_invite_code", {
      input_code: inviteCode.trim(),
    });
    setBusy(false);
    if (error || data !== true) {
      setError(
        "Ce code d'invitation est invalide, déjà utilisé, ou a atteint sa limite d'utilisation. Contactez votre administrateur EcoGreen237 pour en obtenir un."
      );
      return;
    }
    setStep(2);
  }

  async function createAccount(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate("/tableau-de-bord");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Créer mon compte EcoGreen237</h2>
        {step === 1 && (
          <>
            <p className="auth-sub">
              L'inscription se fait sur invitation. Entrez le code fourni par votre
              administrateur (formateur MINADER, coopérative, ou responsable EcoGreen237).
            </p>
            <form onSubmit={checkCode}>
              <div className="form-row">
                <label>Code d'invitation</label>
                <input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Ex : CACAO-CENTRE-2026"
                  required
                />
              </div>
              {error && <div className="form-error">{error}</div>}
              <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
                {busy ? "Vérification…" : "Valider le code"}
              </button>
            </form>
          </>
        )}
        {step === 2 && (
          <form onSubmit={createAccount}>
            <div className="form-row">
              <label>Nom complet</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="form-row">
              <label>Adresse email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-row">
              <label>Mot de passe</label>
              <input
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <label>Filière principale</label>
              <select value={filiere} onChange={(e) => setFiliere(e.target.value)}>
                <option value="toutes">Non spécifiée</option>
                <option value="cacao">Cacao / Café</option>
                <option value="huile_de_palme">Huile de palme</option>
                <option value="banane">Banane</option>
                <option value="coton">Coton</option>
              </select>
            </div>
            {error && <div className="form-error">{error}</div>}
            <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
              {busy ? "Création…" : "Créer mon compte"}
            </button>
          </form>
        )}
        <p className="auth-foot">
          Déjà inscrit ? <Link to="/connexion">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
