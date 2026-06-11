# Leaderboard global — plan de production

Le MVP utilise `localStorage` (voir `leaderboard.js`). Ce document décrit la
migration vers un classement global. Deux options : **Supabase** (recommandé,
zéro backend à maintenir) ou une **API REST** maison.

## Option A — Supabase

### Schéma SQL

```sql
create table public.scores (
  id              uuid primary key default gen_random_uuid(),
  name            varchar(12) not null,
  score           integer not null check (score >= 0),
  level_reached   smallint not null check (level_reached between 1 and 10),
  final_orientation text not null,
  duration        integer not null check (duration > 0),       -- secondes
  defeated_bosses text[] not null default '{}',
  mode            text not null check (mode in ('facile','normal','cauchemar')),
  session_hash    text not null,                                -- voir anti-triche
  created_at      timestamptz not null default now()
);

-- Index pour les classements par période
create index scores_score_idx on public.scores (score desc);
create index scores_created_idx on public.scores (created_at desc);

-- RLS : lecture publique, insertion contrôlée par une Edge Function
alter table public.scores enable row level security;
create policy "lecture publique" on public.scores for select using (true);
-- PAS de policy insert : seule la service key (Edge Function) peut insérer.
```

### Edge Function `submit-score` (validation serveur)

Pseudo-code de validation avant `insert` :

```
1. name      : trim, 1–12 caractères, filtre d'insultes serveur (liste maintenue).
2. score     : entier >= 0 ET score <= duration * 400 + 5000 (plafond plausible).
3. duration  : 10 s minimum (une vraie partie ne dure pas 2 s).
4. level     : cohérent avec le score (ex. niveau 10 improbable avec 50 points).
5. session_hash : sha256(session_id + secret_partagé + score). Le client génère
   session_id au début de partie ; le secret est embarqué côté Edge Function
   uniquement pour vérification de forme (dissuasion, pas sécurité absolue).
6. rate-limit : max 10 soumissions / IP / heure (table `submissions_log`).
```

### Endpoints (auto-générés par Supabase / PostgREST)

| Usage | Requête |
|---|---|
| Top 100 global | `GET /rest/v1/scores?select=*&order=score.desc&limit=100` |
| Top 100 mois | `...&created_at=gte.<now - 30j>` |
| Top 100 semaine | `...&created_at=gte.<now - 7j>` |
| Top 100 jour | `...&created_at=gte.<now - 24h>` |
| Soumettre | `POST /functions/v1/submit-score` (Edge Function) |

## Option B — API REST simple

```
POST /api/scores          body: {name, score, levelReached, finalOrientation,
                                 duration, defeatedBosses, mode, sessionHash}
GET  /api/scores?period=global|month|week|day&limit=100
```

Mêmes règles de validation que ci-dessus, stockage au choix (SQLite suffit).

## Intégration côté client

`leaderboard.js` expose déjà `addEntry(data)` et `getTop(period, limit)`.
Pour migrer : remplacer le corps de ces deux fonctions par des appels `fetch`
vers l'API, en gardant la même signature — aucun autre fichier à toucher.
Garder le localStorage en **cache hors-ligne / fallback**.

## Anti-triche : limites connues

Un jeu 100 % client ne peut jamais être totalement protégé : le score est
calculé dans le navigateur. Les mesures ci-dessus (plafond par durée,
rate-limit, hash de session, validation de cohérence) bloquent la triche
triviale (POST manuel, scores absurdes). Pour aller plus loin : rejouer la
partie côté serveur à partir du seed du run + journal des inputs (le moteur
étant déterministe par seed, c'est faisable — coûteux mais robuste).
