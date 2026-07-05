import React from "react";
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Feed from "./pages/Feed.jsx";
import Courses from "./pages/Courses.jsx";
import Forum from "./pages/Forum.jsx";
import Admin from "./pages/Admin.jsx";

function TopBar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/", label: "Accueil" },
    { to: "/tableau-de-bord", label: "Mon espace" },
    { to: "/actualites", label: "Fil d'actualité" },
    { to: "/formations", label: "Formations" },
    { to: "/forum", label: "Forum d'entraide" },
  ];
  if (isAdmin) links.push({ to: "/admin", label: "Espace admin" });

  return (
    <div className="topbar">
      <Link to="/" className="brand">
        <div className="flag-mark">
          <span className="g"></span>
          <span className="r"></span>
          <span className="y"></span>
        </div>
        EcoGreen<span style={{ color: "var(--gold)" }}>237</span>
      </Link>
      <div className="nav">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={location.pathname === l.to ? "nav-link active" : "nav-link"}
          >
            {l.label}
          </Link>
        ))}
      </div>
      <div className="topbar-actions">
        {user ? (
          <>
            <span className="hello-user">{profile?.full_name || user.email}</span>
            <button
              className="btn btn-ghost"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            <Link to="/connexion" className="btn btn-ghost">Se connecter</Link>
            <Link to="/inscription" className="btn btn-primary">S'inscrire</Link>
          </>
        )}
      </div>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Chargement…</div>;
  if (!user) return <Navigate to="/connexion" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="loading-screen">Chargement…</div>;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppShell() {
  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Signup />} />
        <Route
          path="/tableau-de-bord"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/actualites"
          element={
            <RequireAuth>
              <Feed />
            </RequireAuth>
          }
        />
        <Route
          path="/formations"
          element={
            <RequireAuth>
              <Courses />
            </RequireAuth>
          }
        />
        <Route
          path="/forum"
          element={
            <RequireAuth>
              <Forum />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />
      </Routes>
      <footer>
        <div className="footer-inner">
          <div>
            <div className="brand" style={{ color: "#fff", marginBottom: "0.6rem" }}>
              <div className="flag-mark">
                <span className="g"></span>
                <span className="r"></span>
                <span className="y"></span>
              </div>
              EcoGreen237
            </div>
            <div>
              Plateforme nationale de formation et de sensibilisation
              <br />
              agroalimentaire durable — République du Cameroun.
            </div>
          </div>
          <div>
            <strong>Partenaires</strong>
            <br />
            MINADER · MINEPDED · Banque Mondiale · GIZ · Union Européenne · BAD
          </div>
          <div>
            <strong>Sécurité</strong>
            <br />
            Authentification sécurisée · Accès par invitation · Modération active
          </div>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
