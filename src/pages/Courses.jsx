import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("toutes");

  useEffect(() => {
    supabase
      .from("courses")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setCourses(data || []));
  }, []);

  const filtered =
    filter === "toutes" ? courses : courses.filter((c) => c.kind === filter);

  return (
    <div className="section" style={{ paddingTop: "2.2rem" }}>
      <div className="page-title-row">
        <h2>Formations &amp; certifications</h2>
      </div>
      <div className="filters">
        <span className={filter === "toutes" ? "chip active" : "chip"} onClick={() => setFilter("toutes")}>
          Tous les modules
        </span>
        <span className={filter === "interne" ? "chip active" : "chip"} onClick={() => setFilter("interne")}>
          Cours EcoGreen237
        </span>
        <span className={filter === "externe" ? "chip active" : "chip"} onClick={() => setFilter("externe")}>
          Programmes externes
        </span>
      </div>

      {filtered.length === 0 && <p className="muted-text">Aucune formation disponible pour ce filtre.</p>}

      <div className="grid-3" style={{ marginTop: "1rem" }}>
        {filtered.map((c) => (
          <div className="course-card" key={c.id}>
            <div
              className="course-banner"
              style={{ background: c.kind === "externe" ? "#5B21B6" : "#0F7A3D" }}
            >
              {c.kind === "externe" ? "🌍" : "🎓"}
            </div>
            <div className="course-body">
              <h3>{c.title}</h3>
              <p className="muted-text" style={{ fontSize: "0.85rem" }}>{c.description}</p>
              <div className="course-meta">
                <span>{c.partner || "EcoGreen237"} · {c.filiere}</span>
                <span className="badge-ext">{c.kind === "externe" ? "Lien externe" : "Interne"}</span>
              </div>
              {c.kind === "externe" && c.external_url && (
                <a href={c.external_url} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ marginTop: "0.8rem", display: "inline-block" }}>
                  Voir le programme officiel
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
