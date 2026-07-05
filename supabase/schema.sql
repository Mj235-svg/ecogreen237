-- ============================================================
-- EcoGreen237 — Schéma complet de base de données Supabase
-- À copier-coller intégralement dans : Supabase > SQL Editor > New query > Run
-- ============================================================

-- ---------- 1. TABLE DES PROFILS ----------
-- Étend auth.users (géré par Supabase) avec les infos propres à EcoGreen237.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user',        -- 'user' | 'expert' | 'admin'
  filiere text,                              -- cacao, cafe, banane, huile_de_palme, coton, autre
  region text,
  approved boolean not null default true,    -- passe à false si vous voulez valider chaque compte manuellement
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Chacun peut voir les profils de base"
  on public.profiles for select
  using (true);

create policy "Un utilisateur modifie uniquement son propre profil"
  on public.profiles for update
  using (auth.uid() = id);

-- Fonction utilitaire : est-ce que l'utilisateur connecté est admin ?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Les admins peuvent tout modifier sur les profils"
  on public.profiles for update
  using (public.is_admin());

-- Création automatique du profil à chaque inscription (trigger sur auth.users)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ---------- 2. CODES D'INVITATION ----------
create table if not exists public.invite_codes (
  code text primary key,
  note text,
  max_uses int not null default 1,
  uses int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.invite_codes enable row level security;

create policy "Seuls les admins voient les codes"
  on public.invite_codes for select
  using (public.is_admin());

create policy "Seuls les admins créent des codes"
  on public.invite_codes for insert
  with check (public.is_admin());

create policy "Seuls les admins modifient des codes"
  on public.invite_codes for update
  using (public.is_admin());

-- Fonction publique (appelable par un visiteur non connecté) pour vérifier
-- et consommer un code d'invitation au moment de l'inscription.
create or replace function public.redeem_invite_code(input_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  found_uses int;
  found_max int;
begin
  select uses, max_uses into found_uses, found_max
  from public.invite_codes where code = input_code;

  if not found then
    return false;
  end if;

  if found_uses >= found_max then
    return false;
  end if;

  update public.invite_codes set uses = uses + 1 where code = input_code;
  return true;
end;
$$;

grant execute on function public.redeem_invite_code(text) to anon, authenticated;


-- ---------- 3. FORMATIONS (COURS INTERNES + LIENS EXTERNES) ----------
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  kind text not null default 'interne',      -- 'interne' | 'externe'
  partner text,                              -- ex: 'Banque Mondiale', 'GIZ', 'Union Européenne', 'BAD'
  external_url text,
  filiere text default 'toutes',
  published boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.courses enable row level security;

create policy "Tout le monde peut voir les cours publiés"
  on public.courses for select
  using (published = true or public.is_admin());

create policy "Seuls les admins publient des cours"
  on public.courses for insert
  with check (public.is_admin());

create policy "Seuls les admins modifient des cours"
  on public.courses for update
  using (public.is_admin());

create policy "Seuls les admins suppriment des cours"
  on public.courses for delete
  using (public.is_admin());


-- ---------- 4. FIL D'ACTUALITÉ ----------
create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  source text not null,        -- 'Banque Mondiale' | 'GIZ' | 'Union Européenne' | 'BAD' | 'MINADER' | 'LinkedIn'
  title text not null,
  body text,
  url text,
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

alter table public.news_items enable row level security;

create policy "Tout le monde peut lire le fil d'actualité"
  on public.news_items for select
  using (true);

create policy "Seuls les admins publient une actualité"
  on public.news_items for insert
  with check (public.is_admin());

create policy "Seuls les admins modifient une actualité"
  on public.news_items for update
  using (public.is_admin());

create policy "Seuls les admins suppriment une actualité"
  on public.news_items for delete
  using (public.is_admin());


-- ---------- 5. FORUM D'ENTRAIDE ----------
create table if not exists public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id),
  title text not null,
  body text not null,
  filiere text default 'toutes',
  status text not null default 'pending',   -- 'pending' | 'approved' | 'solved'
  created_at timestamptz not null default now()
);

alter table public.forum_posts enable row level security;

create policy "Voir les posts approuvés, les siens, ou tout si admin"
  on public.forum_posts for select
  using (status in ('approved','solved') or author_id = auth.uid() or public.is_admin());

create policy "Un utilisateur connecté peut publier une question"
  on public.forum_posts for insert
  with check (auth.uid() = author_id);

create policy "L'auteur ou l'admin peut modifier le post"
  on public.forum_posts for update
  using (auth.uid() = author_id or public.is_admin());

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.forum_posts(id) on delete cascade,
  author_id uuid references public.profiles(id),
  body text not null,
  status text not null default 'pending',   -- 'pending' | 'approved'
  created_at timestamptz not null default now()
);

alter table public.forum_replies enable row level security;

create policy "Voir les réponses approuvées, les siennes, ou tout si admin"
  on public.forum_replies for select
  using (status = 'approved' or author_id = auth.uid() or public.is_admin());

create policy "Un utilisateur connecté peut répondre"
  on public.forum_replies for insert
  with check (auth.uid() = author_id);

create policy "L'auteur ou l'admin peut modifier la réponse"
  on public.forum_replies for update
  using (auth.uid() = author_id or public.is_admin());


-- ============================================================
-- FIN DU SCRIPT — après exécution, passez à l'étape "Devenir admin"
-- dans le README (une seule ligne SQL à exécuter avec VOTRE email).
-- ============================================================
