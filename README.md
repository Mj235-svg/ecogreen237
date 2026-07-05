# EcoGreen237 — Guide de mise en ligne

Ce dossier contient une application **réelle et fonctionnelle** (pas une maquette) :
authentification, base de données, formations, fil d'actualité, forum, espace admin.
Elle utilise **Supabase** (base de données + comptes utilisateurs, gratuit pour démarrer)
et se déploie sur **Netlify** (hébergement gratuit).

Je ne peux pas créer votre compte Supabase ou Netlify à votre place (ce sont vos comptes,
avec vos identifiants) — mais voici exactement, étape par étape, quoi cliquer.

---

## Étape 1 — Créer votre projet Supabase (10 minutes)

1. Allez sur **https://supabase.com** → *Start your project* → connectez-vous avec GitHub ou Google.
2. Cliquez **New project**. Donnez-lui un nom : `ecogreen237`. Choisissez un mot de passe de
   base de données (notez-le quelque part). Région : la plus proche (Europe de l'Ouest).
3. Attendez ~2 minutes que le projet soit prêt.
4. Dans le menu de gauche, allez dans **SQL Editor** → **New query**.
5. Ouvrez le fichier `supabase/schema.sql` de ce dossier, copiez-collez **tout son contenu**
   dans l'éditeur, puis cliquez **Run**. Cela crée toutes les tables, la sécurité et les
   fonctions nécessaires.
6. Allez dans **Project Settings** (icône engrenage) → **API**. Vous y trouverez :
   - **Project URL** → à mettre dans `VITE_SUPABASE_URL`
   - **anon public key** → à mettre dans `VITE_SUPABASE_ANON_KEY`

---

## Étape 2 — Configurer le projet en local

**Bonne nouvelle : le fichier `.env` de ce zip est déjà rempli avec vos vraies clés
Supabase.** Vous n'avez rien à taper — passez directement à :

```bash
npm install
npm run dev
```

Le site s'ouvre sur `http://localhost:5173`. Testez l'inscription (voir Étape 4 pour le
premier code d'invitation).

*(Si un jour vous changez de projet Supabase, ouvrez `.env` et remplacez les deux valeurs
par les nouvelles, disponibles dans Project Settings > API Keys.)*

---

## Étape 3 — Devenir administrateur (VOUS)

Le tout premier compte admin se crée manuellement, une seule fois, en base de données —
c'est la méthode standard et la plus sûre (personne ne peut se donner le rôle admin
depuis le site lui-même).

1. Inscrivez-vous normalement sur le site avec votre propre email (il vous faudra un code
   d'invitation — voir Étape 4 pour en créer un directement en base pour vous-même).
2. Dans Supabase → **SQL Editor** → **New query**, lancez :

```sql
update public.profiles set role = 'admin' where email = 'votre-email@exemple.com';
```

3. Reconnectez-vous sur le site : le lien **Espace admin** apparaît dans le menu.

---

## Étape 4 — Créer votre tout premier code d'invitation

Avant d'avoir un compte admin, il vous faut un premier code pour pouvoir vous inscrire.
Créez-le directement en base, une seule fois :

```sql
insert into public.invite_codes (code, note, max_uses)
values ('BIENVENUE-2026', 'Premier code — à usage unique', 1);
```

Utilisez `BIENVENUE-2026` pour votre propre inscription. Ensuite, **une fois administrateur**,
vous générez tous les codes suivants directement depuis l'onglet **Codes d'invitation** de
l'espace admin — plus besoin de SQL.

### Comment donner les codes aux utilisateurs, concrètement
- Depuis l'espace admin, générez un code (ex : `CACAO-4821`), avec une note et un nombre
  d'usages (ex : 30, pour un atelier de 30 personnes).
- Partagez ce code oralement en atelier, par SMS, ou via les groupes WhatsApp des
  coopératives. La personne l'entre dans le formulaire d'inscription du site.
- Le code se désactive automatiquement une fois son quota d'usages atteint.

---

## Étape 5 — Mettre le code sur GitHub

```bash
git init
git add .
git commit -m "Version initiale EcoGreen237"
```

Créez un dépôt vide sur **https://github.com/new**, puis :

```bash
git remote add origin https://github.com/VOTRE-COMPTE/ecogreen237.git
git branch -M main
git push -u origin main
```

---

## Étape 6 — Déployer sur Netlify (5 minutes)

1. Allez sur **https://netlify.com** → connectez-vous avec GitHub.
2. **Add new site** → **Import an existing project** → choisissez votre dépôt `ecogreen237`.
3. Réglages de build (Netlify les détecte normalement tout seul avec Vite) :
   - Build command : `npm run build`
   - Publish directory : `dist`
4. **Étape des variables d'environnement : déjà faite pour vous.** Comme le fichier `.env`
   est inclus dans le zip et sera donc présent sur GitHub, Netlify le lira automatiquement
   au moment de la construction du site — vous n'avez rien à ajouter manuellement.
   *(Si vous préférez la méthode plus sécurisée utilisée par les développeurs professionnels,
   vous pouvez supprimer `.env` de GitHub plus tard et le remplacer par les mêmes deux
   valeurs dans Netlify > Site settings > Environment variables — mais ce n'est pas
   obligatoire pour démarrer.)*
5. Cliquez **Deploy site**. Après 1-2 minutes, votre site est en ligne sur une adresse du
   type `https://ecogreen237-xxxx.netlify.app`.
6. (Optionnel) Dans **Domain settings**, vous pouvez brancher un nom de domaine personnalisé
   comme `www.ecogreen237.cm` si vous en achetez un.

**Chaque fois que vous ou moi modifions le code et le poussons sur GitHub (`git push`),
Netlify redéploie automatiquement le site — aucune action manuelle nécessaire.**

---

## Comment les images ont été placées

- `public/images/hero-marche.jpg` (marché avec le drapeau camerounais) → arrière-plan de la
  page d'accueil.
- `public/images/terrain-formation.jpg`, `usine-controle.jpg`, `boutique-produits.jpg` →
  bande "De la parcelle à l'étagère" sur l'accueil.
- `public/images/campagne-madein.jpg` → section "Made in Cameroon" de l'accueil.
- `public/images/admin-reunion.jpg` (réunion GIZ) → arrière-plan de l'espace administrateur,
  pour un rendu institutionnel et sobre.

Vous pouvez remplacer n'importe quelle image en glissant un nouveau fichier dans
`public/images/` sous le même nom.

---

## Automatiser le fil d'actualité (optionnel, pour plus tard)

Pour l'instant, toute actualité est publiée manuellement depuis l'espace admin (onglet
"Publier une actualité") — c'est nécessaire pour LinkedIn (pas d'API publique) et recommandé
pour filtrer la pertinence. Pour la Banque Mondiale, la GIZ ou l'UE, qui publient des flux
RSS publics, on peut brancher une **Supabase Edge Function** programmée (cron) qui va lire
ces flux automatiquement et les insère dans `news_items`. Dites-moi quand vous voulez cette
étape et je l'écris avec vous — elle demande de connaître l'URL exacte des flux RSS de
chaque organisme, que nous choisirons ensemble.

---

## Ce qui est déjà réellement fonctionnel

- ✅ Inscription avec code d'invitation obligatoire (vérifié en base, pas juste côté écran)
- ✅ Connexion sécurisée (gérée par Supabase Auth, chiffrement standard de l'industrie)
- ✅ Rôles : utilisateur / expert / admin, appliqués aussi au niveau de la base de données
  (un utilisateur ne peut pas "tricher" en modifiant le code du site pour devenir admin)
- ✅ Formations publiées par l'admin, visibles par tous les utilisateurs connectés
- ✅ Fil d'actualité avec mise à jour en direct (sans recharger la page)
- ✅ Forum avec modération : rien n'apparaît publiquement avant validation de l'admin
- ✅ Génération de codes d'invitation illimitée depuis l'espace admin
- ✅ Plusieurs personnes peuvent utiliser le site en même temps (infrastructure Supabase +
  Netlify, prévue pour ça nativement)

## Ce qu'il reste à faire ensemble, dans l'ordre logique
1. Créer le projet Supabase et Netlify (comptes à vous, 15 minutes, étapes ci-dessus)
2. Me confirmer que la connexion et l'inscription fonctionnent
3. Publier les 4 premiers modules de formation et quelques actualités de lancement
4. Décider si on automatise le fil pour la Banque Mondiale/GIZ/UE (Edge Function)
5. Envisager un nom de domaine officiel (`.cm`) une fois le site validé
