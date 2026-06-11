# Bourrage de Crâne : Mode Révolution 🧠🚀

Shoot'em up vertical **satirique** en pixel-art, 100 % HTML/CSS/JavaScript vanilla,
mobile-first (écran 9:16), jouable hors-ligne.

Tu pilotes **Le Neurone Libre**, un petit vaisseau-neurone qui traverse un cerveau
géant envahi par des avatars politiques pixelisés. Chaque avatar tente de saturer ta
**jauge de Bourrage de Crâne**. Personne n'est tué ici : les ennemis vaincus sont
**déprogrammés** et explosent en pixels, confettis et slogans brouillés.

> ⚠️ Satire de fiction. Tous les bords politiques sont tournés en dérision de manière
> équilibrée. Les dialogues sont absurdes et inventés — aucune citation authentique,
> aucune accusation réelle.

## 🎮 Lancer le jeu

Aucune installation, aucun build, aucun serveur :

1. Clone ou télécharge le dépôt.
2. Ouvre `index.html` dans un navigateur (Chrome, Firefox, Safari, mobile ou desktop).
3. Joue.

(Optionnel : `npx serve .` ou `python3 -m http.server` pour servir en local.)

## 🕹️ Contrôles

| Action | Desktop | Mobile |
|---|---|---|
| Déplacer | Flèches ou ZQSD/WASD | Glisser le doigt |
| Tirer (Pensées Critiques) | Espace | Maintien du doigt / bouton AUTO |
| Pause | P ou bouton II | Bouton II |
| Son | M ou bouton ♪ | Bouton ♪ |

Difficultés : **Facile** (tir auto, ennemis lents) · **Normal** · **Cauchemar
médiatique** (rapide, bourrage accéléré).

## 🎲 Chaque partie est unique

Au lancement d'une partie, un **seed de run** est tiré. Le `WavePlanner` (dans
`game.js`) tire alors au sort, pour chaque vague :

- la **trajectoire** : `sine`, `zigzag`, `swoop`, `orbit`, `steps`, `dive` ;
- le **côté d'entrée** : gauche, droite, haut, ou en tenaille (`split`) ;
- le **mode de tir** : visé, droit, éventail, pluie ;
- l'amplitude, la fréquence, le décalage de phase et la **probabilité de piqué
  kamikaze** de chaque ennemi.

Deux runs ne se ressemblent donc jamais : les menaces changent de parcours et de
stratégie à chaque partie.

## 📁 Architecture

```
index.html       Écrans (titre, difficulté, intros, pause, fin, classement) + HUD
style.css        Style arcade rétro mobile-first + animations CSS des têtes
characters.js    38 caricatures + 4 sbires fictifs : stats, palettes, répliques
levels.js        Les 10 niveaux + phases du boss final
leaderboard.js   Classement localStorage (global/mois/semaine/jour) + anti-triche MVP
game.js          Moteur : boucle 60 FPS, sprites procéduraux, patterns, boss, audio
leaderboard-api.md  Plan de migration vers un leaderboard global (Supabase/REST)
```

## ⚙️ Systèmes de jeu

- **3 vies** + jauge de **Bourrage de Crâne** (0–100). À 100 : cerveau saturé,
  fin de partie (le joueur n'est pas détruit, juste… convaincu).
- **Influence politique** : chaque coup encaissé crédite la famille satirique de
  l'attaquant (10 familles). En cas de défaite, le jeu te diagnostique une
  orientation humoristique : *Macron-compatible*, *Insoumis galactique*,
  *Patriote sous stéroïdes*, *Républicain fossilisé*, *Écolo de combat*,
  *Socialiste nostalgique*, *Centriste indestructible*, *Souverainiste orbital*,
  *Abstentionniste premium* ou *Confus mais très motivé*.
- **Victoire totale** (les 10 niveaux + Gérard Larcher vaincu) :
  rang **RÉVOLUTIONNAIRE**.
- **Score** : +10 petit ennemi, +50 élite, +500 boss, +100 cristal de discours,
  multiplicateur de **combo**, bonus **Esprit critique** (+150) après 12 s
  d'esquive parfaite.
- **Power-ups** : Esprit Critique (tir triple), Fact-check (purge l'écran),
  Débat Contradictoire (ralenti), Mémoire Historique (bouclier), Second Degré
  (−30 bourrage), Abstention Cosmique (intangible).
- **Boss final à 4 phases** : Protocole Républicain → Buffet Institutionnel →
  Gardien du Système (invocations) → Bourrage Terminal (cristaux de discours à
  détruire sous peine de saturation).

## 👾 Visages : génération et animation des têtes pixelisées

Les 42 têtes sont générées **procéduralement** au premier affichage par la
`SpriteFactory` (`game.js`) — aucun fichier image dans le projet.

- Chaque tête est dessinée sur une **grille logique 16×16**, rendue dans un canvas
  32×32, puis agrandie à l'affichage avec `image-rendering: pixelated`.
- La tête est composée à partir de la palette (`colorPalette`) et des traits
  (`features`) du personnage : forme de cheveux (`bald/crew/short/side/slick/
  bob/long/spiky/curly`), lunettes, barbe/moustache, sourcils (`flat/angry/high`),
  accessoire (`tie/scarf/bowtie/mic/badge`).
- **4 états** par personnage :
  - `idle` : visage normal, flottement vertical sinusoïdal en jeu ;
  - `talk` : bouche ouverte 3×2 px (affiché quand l'ennemi lance un slogan) ;
  - `attack` : yeux agrandis 2×2 avec pupille, bouche grande ouverte avec dents,
    utilisé pendant les piqués kamikazes ;
  - `hit` : version glitchée de `idle` — chaque ligne de pixels est décalée
    horizontalement de façon pseudo-aléatoire déterministe + pixels blancs parasites.

Côté DOM (cartes d'intro de niveau), les mêmes sprites peuvent être animés en CSS :

```html
<div class="pixel-head macron idle"> ... </div>
```

```css
.pixel-head        { image-rendering: pixelated; animation: floatIdle 1.2s infinite steps(2); }
.pixel-head.talk   { animation: talkMouth 0.25s infinite steps(2); }
.pixel-head.attack { animation: attackShake 0.15s infinite steps(2); }
.pixel-head.hit    { animation: glitchHit 0.12s infinite steps(2); }
```

(Les keyframes `floatIdle`, `talkMouth`, `attackShake` et `glitchHit` sont définies
dans `style.css`.)

## 🏆 Leaderboard

- Top 100 façon flipper, onglets **Global / Mois / Semaine / Jour** (filtrage des
  dates en local).
- Nom limité à **12 caractères**, filtre d'insultes simple (avec normalisation
  leet-speak), enregistrement de : `name`, `score`, `levelReached`,
  `finalOrientation`, `date`, `duration`, `defeatedBosses`, `mode`.
- **Anti-triche MVP** : score négatif refusé, plafond de score plausible selon la
  durée de partie, signature locale des entrées. La vraie validation se fera côté
  serveur — voir [`leaderboard-api.md`](leaderboard-api.md).

## 🚀 Performance

- `requestAnimationFrame`, boucle à 60 FPS, `dt` plafonné.
- Projectiles/particules nettoyés dès qu'ils sortent de l'écran.
- Sprites mis en cache (un seul rendu par personnage et par état).
- Canvas 480×854 adapté à l'écran via `aspect-ratio: 9/16` sans déformation.

## 🗺️ Roadmap

- [ ] Leaderboard global (Supabase ou API REST — voir `leaderboard-api.md`)
- [ ] Musique de fond 8-bit par niveau
- [ ] Mode "endless" post-victoire
- [ ] Vibrations mobiles + meilleure gestion des très petits écrans
