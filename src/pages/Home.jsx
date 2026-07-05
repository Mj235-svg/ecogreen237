import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <div
        className="hero hero-image"
        style={{ backgroundImage: "linear-gradient(180deg, rgba(10,77,40,0.88), rgba(13,92,48,0.93)), url('/images/hero-marche.jpg')" }}
      >
        <div className="hero-inner">
          <div className="eyebrow">Plateforme nationale · Agriculture &amp; environnement</div>
          <h1>
            Former, connecter et outiller les producteurs, coopératives et PME
            agroalimentaires du Cameroun
          </h1>
          <p className="lead">
            EcoGreen237 rassemble en un seul endroit les formations, les certifications
            internationales, l'actualité du secteur et un espace d'entraide entre producteurs
            et experts — pour que chaque acteur, du village à l'entreprise exportatrice, ait
            accès aux mêmes outils que ses concurrents des marchés internationaux.
          </p>
          <div className="hero-ctas">
            <Link to="/inscription" className="btn btn-gold">Créer mon compte</Link>
            <Link to="/formations" className="btn btn-outline-light">Découvrir les formations</Link>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="eyebrow-dark">Ce que vous trouverez ici</div>
          <h2>Une seule plateforme, quatre besoins couverts</h2>
        </div>
        <div className="grid-4">
          <div className="card">
            <div className="icon-circle">🎓</div>
            <h3>Se former en ligne</h3>
            <p>Agriculture de précision, certifications (EUDR, RSPO, GlobalGAP) et fiscalité verte.</p>
          </div>
          <div className="card">
            <div className="icon-circle">🌍</div>
            <h3>Programmes internationaux</h3>
            <p>Liens à jour vers les formations de la Banque Mondiale, la GIZ, l'UE et la BAD.</p>
          </div>
          <div className="card">
            <div className="icon-circle">💬</div>
            <h3>Forum d'entraide</h3>
            <p>Posez vos difficultés de terrain, des experts locaux et internationaux répondent.</p>
          </div>
          <div className="card">
            <div className="icon-circle">📰</div>
            <h3>Actualité en continu</h3>
            <p>Les publications des ministères, ONG et bailleurs de fonds sur un seul écran.</p>
          </div>
        </div>
      </div>

      <div className="section image-band">
        <div className="section-head">
          <div className="eyebrow-dark">De la parcelle à l'étagère</div>
          <h2>Toute la chaîne de valeur agroalimentaire camerounaise</h2>
        </div>
        <div className="grid-3">
          <figure className="photo-card">
            <img src="/images/terrain-formation.jpg" alt="Formation de terrain à la ferme-école de Kaïgama" />
            <figcaption>Formations de terrain dans les fermes-écoles, en partenariat avec la GIZ et Brot für die Welt</figcaption>
          </figure>
          <figure className="photo-card">
            <img src="/images/usine-controle.jpg" alt="Contrôle qualité en usine agroalimentaire" />
            <figcaption>Accompagnement des unités de transformation vers les standards de qualité internationaux</figcaption>
          </figure>
          <figure className="photo-card">
            <img src="/images/boutique-produits.jpg" alt="Boutique de produits locaux transformés" />
            <figcaption>Valorisation des produits « Made in Cameroon » transformés localement</figcaption>
          </figure>
        </div>
      </div>

      <div className="section campaign-section">
        <div className="campaign-grid">
          <img src="/images/campagne-madein.jpg" alt="Campagne Made in Cameroon" className="campaign-img" />
          <div>
            <div className="eyebrow-dark">Une dynamique déjà en marche</div>
            <h2>La consommation locale progresse — la conformité internationale doit suivre</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.6 }}>
              Les campagnes « Made in Cameroon » et la multiplication des rayons de produits
              locaux dans la grande distribution montrent que la demande existe. EcoGreen237
              accompagne cette dynamique en donnant aux producteurs les moyens de répondre
              aussi aux exigences des marchés d'exportation.
            </p>
            <Link to="/inscription" className="btn btn-primary">Rejoindre la plateforme</Link>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="eyebrow-dark">Sécurité &amp; accès</div>
          <h2>Une plateforme sécurisée, à accès maîtrisé</h2>
        </div>
        <div className="grid-3">
          <div className="card">
            <div className="icon-circle">🔒</div>
            <h3>Connexion sécurisée</h3>
            <p>Authentification chiffrée fournie par Supabase, standard de l'industrie.</p>
          </div>
          <div className="card">
            <div className="icon-circle">🎫</div>
            <h3>Accès par invitation</h3>
            <p>L'inscription se fait avec un code fourni par l'administrateur de la plateforme.</p>
          </div>
          <div className="card">
            <div className="icon-circle">🛡️</div>
            <h3>Modération active</h3>
            <p>Chaque publication du forum et de l'actualité est vérifiée avant diffusion.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
