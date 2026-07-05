import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";

export default function Forum() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [replies, setReplies] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [replyDrafts, setReplyDrafts] = useState({});

  async function loadPosts() {
    const { data } = await supabase
      .from("forum_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data || []);
    if (data && data.length) {
      const { data: allReplies } = await supabase
        .from("forum_replies")
        .select("*, profiles(full_name, role)")
        .in(
          "post_id",
          data.map((p) => p.id)
        );
      const grouped = {};
      (allReplies || []).forEach((r) => {
        grouped[r.post_id] = grouped[r.post_id] || [];
        grouped[r.post_id].push(r);
      });
      setReplies(grouped);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function submitPost(e) {
    e.preventDefault();
    await supabase.from("forum_posts").insert({
      author_id: user.id,
      title,
      body,
      filiere: profile?.filiere || "toutes",
    });
    setTitle("");
    setBody("");
    setShowForm(false);
    loadPosts();
  }

  async function submitReply(postId) {
    const text = replyDrafts[postId];
    if (!text || !text.trim()) return;
    await supabase.from("forum_replies").insert({
      post_id: postId,
      author_id: user.id,
      body: text,
    });
    setReplyDrafts((d) => ({ ...d, [postId]: "" }));
    loadPosts();
  }

  return (
    <div className="section" style={{ paddingTop: "2.2rem" }}>
      <div className="page-title-row">
        <h2>Forum d'entraide</h2>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Annuler" : "+ Poser une question"}
        </button>
      </div>
      <p className="muted-text" style={{ maxWidth: 640, marginTop: "-0.6rem" }}>
        Décrivez une difficulté rencontrée sur le terrain. Votre question passe par une brève
        modération avant d'être visible par tous, puis les producteurs, techniciens et experts
        (y compris internationaux) peuvent y répondre.
      </p>

      {showForm && (
        <form onSubmit={submitPost} className="side-card" style={{ marginTop: "1rem" }}>
          <div className="form-row">
            <label>Titre de votre question</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Détails</label>
            <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} required />
          </div>
          <button className="btn btn-primary">Envoyer pour modération</button>
        </form>
      )}

      <div style={{ marginTop: "1.2rem" }}>
        {posts.length === 0 && <p className="muted-text">Aucune question pour le moment. Soyez le premier à en poser une.</p>}
        {posts
          .filter((p) => p.status !== "pending" || p.author_id === user.id)
          .map((p) => (
            <div className="forum-post" key={p.id}>
              <div className="forum-top">
                <h4>{p.title}</h4>
                <span
                  className={
                    p.status === "solved"
                      ? "status-solved"
                      : p.status === "pending"
                      ? "status-pending"
                      : "status-open"
                  }
                >
                  {p.status === "solved"
                    ? "Résolu"
                    : p.status === "pending"
                    ? "En attente de modération"
                    : "En attente de réponse"}
                </span>
              </div>
              <p className="muted-text" style={{ fontSize: "0.88rem" }}>{p.body}</p>

              {(replies[p.id] || []).map((r) => (
                <div className="reply" key={r.id}>
                  <div className="reply-author">
                    {r.profiles?.full_name || "Utilisateur"}
                    {r.profiles?.role === "expert" && <span className="expert-badge">Expert vérifié</span>}
                    {r.profiles?.role === "admin" && <span className="expert-badge">Équipe EcoGreen237</span>}
                  </div>
                  <p>{r.body}</p>
                </div>
              ))}

              {p.status !== "pending" && (
                <div className="reply-form">
                  <input
                    placeholder="Écrire une réponse…"
                    value={replyDrafts[p.id] || ""}
                    onChange={(e) => setReplyDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
                  />
                  <button className="btn btn-ghost" onClick={() => submitReply(p.id)}>
                    Répondre
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
