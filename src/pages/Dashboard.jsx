import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";

export default function Dashboard() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [news, setNews] = useState([]);
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    supabase
      .from("courses")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setCourses(data || []));

    supabase
      .from("news_items")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setNews(data || []));

    if (profile?.id) {
      supabase
        .from("forum_posts")
        .select("*")
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setMyPosts(data || []));
    }
  }, [profile]);

  return (
    <div className="layout-2col">
      <div>
        <div className="page-title-row">
          <h2>Bonjour, {profile?.full_name || "producteur"} 👋</h2>
        </div>

        <div className="side-card">
          <h3>Dernières actualités pour vous</h3>
          {news.length === 0 && <p className="muted-text">Aucune actualité publiée pour le moment.</p>}
          {news.map((n) => (
            <div key={n.id} className="mini-news">
              <span className="source-pill">{n.source}</span>
              <strong>{n.title}</strong>
            </div>
          ))}
          <Link to="/actualites" className="btn btn-ghost" style={{ marginTop: "0.6rem" }}>
            Voir tout le fil d'actualité
          </Link>
        </div>
      </div>

      <div>
        <div className="side-card">
          <h3>Formations recommandées</h3>
          {courses.length === 0 && <p className="muted-text">Aucune formation publiée pour le moment.</p>}
          {courses.map((c) => (
            <div className="mini-course" key={c.id}>
              <div className="thumb">🎓</div>
              <div>
                <h5>{c.title}</h5>
                <span>{c.partner || "EcoGreen237"}</span>
              </div>
            </div>
          ))}
          <Link to="/formations" className="btn btn-ghost" style={{ width: "100%", marginTop: "0.4rem" }}>
            Voir toutes les formations
          </Link>
        </div>

        <div className="side-card">
          <h3>Mes questions sur le forum</h3>
          {myPosts.length === 0 && <p className="muted-text">Vous n'avez pas encore posé de question.</p>}
          {myPosts.map((p) => (
            <div key={p.id} style={{ fontSize: "0.85rem", marginBottom: "0.6rem" }}>
              <strong>{p.title}</strong>
              <br />
              <span className={p.status === "solved" ? "status-solved" : "status-open"}>
                {p.status === "solved" ? "Résolu" : p.status === "approved" ? "En attente de réponse" : "En modération"}
              </span>
            </div>
          ))}
          <Link to="/forum" className="btn btn-ghost" style={{ width: "100%" }}>
            Aller au forum
          </Link>
        </div>
      </div>
    </div>
  );
}
