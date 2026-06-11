/* =========================================================================
 * BOURRAGE DE CRÂNE : MODE RÉVOLUTION
 * levels.js — Les 10 niveaux de la campagne.
 *
 * Chaque niveau définit son casting, ses vagues, ses projectiles-mots,
 * ses mécaniques spéciales et son (ou ses) boss.
 * Les trajectoires et stratégies réelles sont tirées au sort À CHAQUE
 * PARTIE par le WavePlanner de game.js (seed de run) : deux parties ne
 * se ressemblent jamais.
 * ========================================================================= */
"use strict";

const LEVELS = [
  {
    id: 1,
    name: "Le Hall des Éléments de Langage",
    intro: "Tutoriel : apprends à bouger, tirer et esquiver la novlangue.",
    roster: ["braun_pivet", "editorialiste", "communicant"],
    waves: 2,
    enemiesPerWave: 5,
    hpMult: 0.8,
    fireRateMult: 0.6,
    wordPool: ["ÉLÉMENT DE LANGAGE", "PETITE PHRASE", "NOVLANGUE", "BLA BLA"],
    boss: ["attal"],
    bossTitle: "Gabriel Attal — mode « Punchline rapide »",
    bossHp: 60,
    mechanics: [],
    bg: { top: "#0a0a2a", bottom: "#1a0a3a", accent: "#6a5acd" }
  },
  {
    id: 2,
    name: "La Start-up Nation Orbitale",
    intro: "Des slides, des courbes, des KPI : l'optimisation de tes neurones commence. « Bienvenue dans l'optimisation de tes neurones. »",
    roster: ["philippe", "borne", "lemaire", "darmanin", "communicant"],
    waves: 3,
    enemiesPerWave: 6,
    hpMult: 1.0,
    fireRateMult: 0.9,
    wordPool: ["SLIDE 47", "COURBE DE CROISSANCE", "KPI", "DISRUPTION", "ROADMAP"],
    boss: ["macron"],
    bossTitle: "Macron.exe — Optimiseur Jupitérien",
    bossHp: 90,
    mechanics: [],
    bg: { top: "#061230", bottom: "#0a2a4a", accent: "#ffd166" }
  },
  {
    id: 3,
    name: "La Fosse aux Amendements",
    intro: "Formations défensives, ennemis blindés : la droite tient ses positions.",
    roster: ["pecresse", "bertrand", "ciotti", "retailleau", "dati"],
    waves: 3,
    enemiesPerWave: 6,
    hpMult: 1.5,
    fireRateMult: 0.9,
    wordPool: ["AMENDEMENT SURPRISE", "RAPPEL À L'ORDRE", "VALEURS", "AUTORITÉ"],
    boss: ["wauquiez"],
    bossTitle: "Wauquiez — mode « Armure régionale »",
    bossHp: 120,
    mechanics: ["tight_formation"],
    bg: { top: "#0a1030", bottom: "#202a55", accent: "#4d79ff" }
  },
  {
    id: 4,
    name: "Le Plateau TV Permanent",
    intro: "Breaking news en continu. Les slogans fusent plus vite que la lumière.",
    roster: ["zemmour", "marechal", "chenu", "editorialiste"],
    waves: 3,
    enemiesPerWave: 7,
    hpMult: 1.1,
    fireRateMult: 1.4,
    wordPool: ["BREAKING NEWS", "SLOGAN", "PUNCHLINE", "SONDAGE CHOC", "ALERTE INFO"],
    boss: ["lepen", "bardella"],
    bossTitle: "Marine Vortex & Bardella Hologramme — Duo de prime time",
    bossHp: 80,
    mechanics: ["fast_shots"],
    bg: { top: "#10103a", bottom: "#1b2a6b", accent: "#ff9f1c" }
  },
  {
    id: 5,
    name: "L'Assemblée Volcanique",
    intro: "Vagues de colère, attaques de tribune : la sono du cosmos est branchée.",
    roster: ["ruffin", "autain", "panot", "militant"],
    waves: 3,
    enemiesPerWave: 7,
    hpMult: 1.2,
    fireRateMult: 1.1,
    wordPool: ["MÉGAPHONE", "MOTION", "TRIBUNE", "RAPPEL AU RÈGLEMENT"],
    boss: ["melenchon"],
    bossTitle: "Méluche — mode « Tribun cosmique »",
    bossHp: 140,
    mechanics: ["spread_shots", "screen_shake"],
    bg: { top: "#2a0a1a", bottom: "#5a1020", accent: "#ff5252" }
  },
  {
    id: 6,
    name: "La Cantine Rouge",
    intro: "Ennemis résistants et barbecue dialectique. Ça sent la merguez cosmique.",
    roster: ["poutou", "militant", "autain", "panot"],
    waves: 3,
    enemiesPerWave: 6,
    hpMult: 1.8,
    fireRateMult: 1.0,
    wordPool: ["CAMARADE", "GRÈVE GÉNÉRALE", "ACQUIS SOCIAL", "MERGUEZ"],
    boss: ["roussel"],
    bossTitle: "Roussel — mode « Barbecue dialectique »",
    bossHp: 150,
    mechanics: ["tanky"],
    bg: { top: "#200a0a", bottom: "#4a1515", accent: "#ffcc66" }
  },
  {
    id: 7,
    name: "Le Marais Socialiste",
    intro: "Brouillard rose, promesses contradictoires : tout ralentit, même tes idées.",
    roster: ["royal", "hidalgo", "faure", "aubry", "glucksmann"],
    waves: 3,
    enemiesPerWave: 7,
    hpMult: 1.3,
    fireRateMult: 1.0,
    wordPool: ["PROMESSE FLOUE", "SYNTHÈSE", "MOTION", "CONGRÈS"],
    boss: ["hollande"],
    bossTitle: "Hollande — mode « Synthèse infinie »",
    bossHp: 160,
    mechanics: ["pink_fog", "player_slow"],
    bg: { top: "#2a1020", bottom: "#5a2040", accent: "#ff7eb6" }
  },
  {
    id: 8,
    name: "La Forêt des Injonctions Vertes",
    intro: "Lianes, spores et sobriété subie : ton vaisseau consomme trop, paraît-il.",
    roster: ["jadot", "tondelier", "voynet", "militant"],
    waves: 3,
    enemiesPerWave: 7,
    hpMult: 1.3,
    fireRateMult: 1.1,
    wordPool: ["SOBRIÉTÉ", "SPORE", "LIANE", "COMPOST", "INJONCTION"],
    boss: ["rousseau"],
    bossTitle: "Rousseau — mode « Totem éco-cosmique »",
    bossHp: 170,
    mechanics: ["player_slow", "vines"],
    bg: { top: "#0a2a14", bottom: "#14502a", accent: "#3ddc84" }
  },
  {
    id: 9,
    name: "La Salle des Affaires Classées",
    intro: "Les revenants politiques ne meurent jamais : ils réapparaissent avec un bouclier.",
    roster: ["sarkozy", "fillon", "bayrou", "sondeur"],
    waves: 3,
    enemiesPerWave: 6,
    hpMult: 1.4,
    fireRateMult: 1.2,
    wordPool: ["DOSSIER FLOTTANT", "COMEBACK", "MÉMOIRES", "ARCHIVE"],
    boss: ["sarkozy", "fillon"],
    bossTitle: "Sarko le Retour & Fillon Fantôme — Duo des revenants",
    bossHp: 100,
    mechanics: ["revenants"],
    bg: { top: "#14141e", bottom: "#2a2a3a", accent: "#ffd700" }
  },
  {
    id: 10,
    name: "Le Sénat Final",
    intro: "Le Gardien du Système t'attend, entouré de son buffet institutionnel. Personne n'a jamais vu la fin de son mandat.",
    roster: ["sondeur", "communicant"],
    waves: 1,
    enemiesPerWave: 4,
    hpMult: 1.2,
    fireRateMult: 1.0,
    wordPool: ["PROTOCOLE", "PUPITRE", "AMENDEMENT", "CLOCHE D'ARGENT", "BUFFET"],
    boss: ["larcher"],
    bossTitle: "GÉRARD LARCHER — GARDIEN SUPRÊME DU SÉNAT",
    bossHp: 400,
    mechanics: ["final_boss"],
    bg: { top: "#1a0a14", bottom: "#3a1020", accent: "#c8a040" }
  }
];

/* Phases du boss final (seuils en % de vie restante) */
const LARCHER_PHASES = [
  { until: 0.75, name: "Phase 1 — Protocole Républicain",
    line: "Pupitres et marteaux de séance, en formation !" },
  { until: 0.50, name: "Phase 2 — Buffet Institutionnel",
    line: "Plateaux ! Nappes ! Cloches d'argent ! SERVEZ !" },
  { until: 0.25, name: "Phase 3 — Gardien du Système",
    line: "Tous les camps me servent. Tous. VENEZ, MES PETITS !" },
  { until: 0.00, name: "Phase 4 — Bourrage Terminal",
    line: "Cristaux de discours : SATURATION FINALE." }
];
