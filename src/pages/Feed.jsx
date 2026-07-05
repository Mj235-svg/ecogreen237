import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const SOURCES = ["Tout", "Banque Mondiale", "GIZ", "Union Européenne", "BAD", "MINADER", "LinkedIn"];

export default function Feed() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("Tout");

  async function loadNews() {
    const { data } = await supabase
      .from("news_items")
      .select("*")
      .order("published_at", { ascending: false });
    setItems(data || []);
  }

  useEffect(() => {
    loadNews();

    // Écoute en temps réel : toute nouvelle actualité publiée par l'admin
    // apparaît instantanément ici, sans recharger la page.
    const channel = supabase
      .channel("news_items_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "news_items" },
        (payload) => setItems((prev) => [payload.new, ...prev])
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const filtered = filter === "Tout" ? items : items.filter((i) => i.source === filter);

  return (
    <div className="section" style={{ paddingTop: "2.2rem" }}>
      <div className="page-title-row">
        <h2>Fil d'actualité</h2>
        <span className="live-dot">
          <span className="dot"></span> Mis à jour en temps réel
        </span>
      </div>
      <div className="filters">
        {SOURCES.map((s) => (
          <span
            key={s}
            className={filter === s ? "chip active" : "chip"}
            onClick={() => setFilter(s)}
          >
            {s}
          </span>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="muted-text">Aucune actualité pour ce filtre pour le moment.</p>
      )}

      {filtered.map((item) => (
        <div className="feed-item" key={item.id}>
          <div className="feed-top">
            <span className="source-tag">{item.source}</span>
            <span className="feed-time">
              {new Date(item.published_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <h4>{item.title}</h4>
          <p>{item.body}</p>
          {item.url && (
            <a className="lk" href={item.url} target="_blank" rel="noreferrer">
              Lire la publication originale →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
