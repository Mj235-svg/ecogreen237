import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";

function genCode() {
  const words = ["CACAO", "CAFE", "BANANE", "PALME", "COTON", "CENTRE", "OUEST", "SUD", "NORD", "LITTORAL"];
  const a = words[Math.floor(Math.random() * words.length)];
  const b = Math.floor(1000 + Math.random() * 9000);
  return `${a}-${b}`;
}

export default function Admin() {
  const { profile } = useAuth();
  const [tab, setTab] = useState("moderation");

  // --- moderation state ---
  const [pendingPosts, setPendingPosts] = useState([]);
  const [pendingReplies, setPendingReplies] = useState([]);

  // --- courses form ---
  const [courseForm, setCourseForm] = useState({
    title: "", description: "", kind: "interne", partner: "", external_url: "", filiere: "toutes",
  });

  // --- news form ---
  const [newsForm, setNewsForm] = useState({ source: "MINADER", title: "", body: "", url: "" });

  // --- invite codes ---
  const [codes, setCodes] = useState([]);
  const [newCodeNote, setNewCodeNote] = useState("");
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(1);

  async function loadModeration() {
    const { data: posts } = await supabase.from("forum_posts").select("*").eq("status", "pending");
    setPendingPosts(posts || []);
    const { data: repl } = await supabase
      .from("forum_replies")
      .select("*, forum_posts(title)")
      .eq("status", "pending");
    setPendingReplies(repl || []);
  }

  async function loadCodes() {
    const { data } = await supabase.from("invite_codes").select("*").order("created_at", { ascending: false });
    setCodes(data || []);
  }

  useEffect(() => {
    loadModeration();
    loadCodes();
  }, []);

  async function approvePost(id) {
    await supabase.from("forum_posts").update({ status: "approved" }).eq("id", id);
    loadModeration();
  }
  async function rejectPost(id) {
    await supabase.from("forum_posts").delete().eq("id", id);
    loadModeration();
  }
  async function approveReply(id) {
    await supabase.from("forum_replies").update({ status: "approved" }).eq("id", id);
    loadModeration();
  }
  async function rejectReply(id) {
    await supabase.from("forum_replies").delete().eq("id", id);
    loadModeration();
  }

  async function publishCourse(e) {
    e.preventDefault();
    await supabase.from("courses").insert({ ...courseForm, created_by: profile.id, published: true });
    setCourseForm({ title: "", description: "", kind: "interne", partner: "", external_url: "", filiere: "toutes" });
    alert("Formation publiée.");
  }

  async function publishNews(e) {
    e.preventDefault();
    await supabase.from("news_items").insert({ ...newsForm, created_by: profile.id });
    setNewsForm({ source: "MINADER", title: "", body: "", url: "" });
    alert("Actualité publiée sur le fil.");
  }

  async function createCode() {
    const code = genCode();
    await supabase.from("invite_codes").insert({
      code,
      note: newCodeNote,
      max_uses: newCodeMaxUses,
      created_by: profile.id,
    });
    setNewCodeNote("");
    setNewCodeMaxUses(1);
    loadCodes();
  }

  return (
    <div
      className="admin-hero"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(10,35,21,0.92), rgba(10,35,21,0.88)), url('/images/admin-reunion.jpg')",
      }}
    >
      <div className="section" style={{ paddingTop: "2.4rem" }}>
        <div className="page-title-row">
          <h2 style={{ color: "#fff" }}>Espace administrateur</h2>
        </div>
        <div className="admin-tabs">
          {[
            ["moderation", "Modération du forum"],
            ["cours", "Publier une formation"],
            ["actualite", "Publier une actualité"],
            ["codes", "Codes d'invitation"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={tab === key ? "atab active" : "atab"}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "moderation" && (
          <div className="admin-panel">
            <h3>Questions en attente d'approbation ({pendingPosts.length})</h3>
            {pendingPosts.length === 0 && <p className="muted-text">Rien à modérer pour le moment.</p>}
            {pendingPosts.map((p) => (
              <div className="queue-row" key={p.id}>
                <div>
                  <strong>{p.title}</strong>
                  <div className="qmeta">{p.body.slice(0, 120)}…</div>
                </div>
                <div className="row-actions">
                  <button className="btn btn-primary" onClick={() => approvePost(p.id)}>Approuver</button>
                  <button className="btn btn-ghost" onClick={() => rejectPost(p.id)}>Rejeter</button>
                </div>
              </div>
            ))}

            <h3 style={{ marginTop: "1.6rem" }}>Réponses en attente ({pendingReplies.length})</h3>
            {pendingReplies.length === 0 && <p className="muted-text">Rien à modérer pour le moment.</p>}
            {pendingReplies.map((r) => (
              <div className="queue-row" key={r.id}>
                <div>
                  <strong>Réponse sur : {r.forum_posts?.title}</strong>
                  <div className="qmeta">{r.body.slice(0, 120)}…</div>
                </div>
                <div className="row-actions">
                  <button className="btn btn-primary" onClick={() => approveReply(r.id)}>Approuver</button>
                  <button className="btn btn-ghost" onClick={() => rejectReply(r.id)}>Rejeter</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "cours" && (
          <div className="admin-panel">
            <h3>Publier un nouveau cours ou lien de certification</h3>
            <form onSubmit={publishCourse}>
              <div className="form-row">
                <label>Titre</label>
                <input
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-row">
                  <label>Type de contenu</label>
                  <select
                    value={courseForm.kind}
                    onChange={(e) => setCourseForm({ ...courseForm, kind: e.target.value })}
                  >
                    <option value="interne">Cours interne EcoGreen237</option>
                    <option value="externe">Lien vers programme externe</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Filière concernée</label>
                  <select
                    value={courseForm.filiere}
                    onChange={(e) => setCourseForm({ ...courseForm, filiere: e.target.value })}
                  >
                    <option value="toutes">Toutes les filières</option>
                    <option value="cacao">Cacao / Café</option>
                    <option value="huile_de_palme">Huile de palme</option>
                    <option value="banane">Banane</option>
                    <option value="coton">Coton</option>
                  </select>
                </div>
              </div>
              {courseForm.kind === "externe" && (
                <>
                  <div className="form-row">
                    <label>Organisme partenaire</label>
                    <input
                      placeholder="Banque Mondiale, GIZ, Union Européenne, BAD…"
                      value={courseForm.partner}
                      onChange={(e) => setCourseForm({ ...courseForm, partner: e.target.value })}
                    />
                  </div>
                  <div className="form-row">
                    <label>Lien vers le programme officiel</label>
                    <input
                      placeholder="https://..."
                      value={courseForm.external_url}
                      onChange={(e) => setCourseForm({ ...courseForm, external_url: e.target.value })}
                    />
                  </div>
                </>
              )}
              <button className="btn btn-primary">Publier sur la plateforme</button>
            </form>
          </div>
        )}

        {tab === "actualite" && (
          <div className="admin-panel">
            <h3>Publier une actualité sur le fil</h3>
            <p className="muted-text">
              Utilisez ce formulaire pour relayer manuellement une publication LinkedIn ou d'un
              site sans flux RSS. Pour la Banque Mondiale/GIZ/UE, un flux automatique peut être
              branché ici plus tard (voir le README, section "Automatiser le fil").
            </p>
            <form onSubmit={publishNews}>
              <div className="form-row">
                <label>Source</label>
                <select
                  value={newsForm.source}
                  onChange={(e) => setNewsForm({ ...newsForm, source: e.target.value })}
                >
                  <option>MINADER</option>
                  <option>MINEPDED</option>
                  <option>Banque Mondiale</option>
                  <option>GIZ</option>
                  <option>Union Européenne</option>
                  <option>BAD</option>
                  <option>LinkedIn</option>
                </select>
              </div>
              <div className="form-row">
                <label>Titre</label>
                <input
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <label>Résumé</label>
                <textarea
                  rows={3}
                  value={newsForm.body}
                  onChange={(e) => setNewsForm({ ...newsForm, body: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Lien vers la publication originale</label>
                <input
                  placeholder="https://..."
                  value={newsForm.url}
                  onChange={(e) => setNewsForm({ ...newsForm, url: e.target.value })}
                />
              </div>
              <button className="btn btn-primary">Publier sur le fil</button>
            </form>
          </div>
        )}

        {tab === "codes" && (
          <div className="admin-panel">
            <h3>Générer un code d'invitation</h3>
            <p className="muted-text">
              Partagez ce code par WhatsApp, SMS ou en atelier. La personne l'entre lors de son
              inscription. Chaque code peut être utilisé un nombre limité de fois.
            </p>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap", marginBottom: "1.2rem" }}>
              <div className="form-row" style={{ flex: 1, minWidth: 200 }}>
                <label>Note (ex : "Atelier cacao Centre — juillet")</label>
                <input value={newCodeNote} onChange={(e) => setNewCodeNote(e.target.value)} />
              </div>
              <div className="form-row" style={{ width: 140 }}>
                <label>Nombre d'usages</label>
                <input
                  type="number"
                  min={1}
                  value={newCodeMaxUses}
                  onChange={(e) => setNewCodeMaxUses(parseInt(e.target.value) || 1)}
                />
              </div>
              <button className="btn btn-primary" onClick={createCode}>Générer un code</button>
            </div>

            <h3>Codes existants</h3>
            {codes.length === 0 && <p className="muted-text">Aucun code généré pour le moment.</p>}
            {codes.map((c) => (
              <div className="queue-row" key={c.code}>
                <div>
                  <strong style={{ fontFamily: "monospace", fontSize: "1rem" }}>{c.code}</strong>
                  <div className="qmeta">
                    {c.note || "Sans note"} · utilisé {c.uses}/{c.max_uses} fois
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
