/* =========================================================================
 * BOURRAGE DE CRÂNE : MODE RÉVOLUTION
 * characters.js — Données des caricatures pixelisées.
 *
 * AVERTISSEMENT : toutes les répliques sont fictives, absurdes et
 * satiriques. Aucune citation authentique, aucune accusation réelle.
 * Les ennemis ne sont jamais "tués" : ils sont DÉPROGRAMMÉS.
 * ========================================================================= */
"use strict";

/* Familles satiriques et leur couleur d'interface */
const FAMILY_INFO = {
  centre_technocratique:  { label: "Centre technocratique",   color: "#ffd166" },
  gauche_radicale:        { label: "Gauche radicale",         color: "#ff4d4d" },
  droite_conservatrice:   { label: "Droite conservatrice",    color: "#4d79ff" },
  extreme_droite:         { label: "Extrême droite",          color: "#3550c8" },
  ecologie_politique:     { label: "Écologie politique",      color: "#3ddc84" },
  social_democratie:      { label: "Social-démocratie",       color: "#ff7eb6" },
  souverainisme:          { label: "Souverainisme",           color: "#9b59b6" },
  liberalisme_economique: { label: "Libéralisme économique",  color: "#00c2d1" },
  populisme_mediatique:   { label: "Populisme médiatique",    color: "#ff9f1c" },
  apparatchik_local:      { label: "Apparatchik local",       color: "#a0a0b0" }
};

/* Orientation humoristique finale selon la famille dominante */
const ORIENTATIONS = {
  centre_technocratique:  "Macron-compatible",
  gauche_radicale:        "Insoumis galactique",
  extreme_droite:         "Patriote sous stéroïdes",
  droite_conservatrice:   "Républicain fossilisé",
  ecologie_politique:     "Écolo de combat",
  social_democratie:      "Socialiste nostalgique",
  liberalisme_economique: "Centriste indestructible",
  souverainisme:          "Souverainiste orbital",
  populisme_mediatique:   "Confus mais très motivé",
  apparatchik_local:      "Abstentionniste premium"
};

/* -------------------------------------------------------------------------
 * Chaque personnage :
 *  - enemyType : "petit" | "elite" | "boss"
 *  - features  : pilote le générateur de têtes pixelisées (SpriteFactory)
 *      hair    : bald|crew|short|side|slick|bob|long|spiky|curly
 *      glasses : lunettes pixel
 *      beard / mustache : pilosité
 *      accessory : tie|scarf|bowtie|mic|badge|none
 *      brows   : flat|angry|high
 *  - spriteFrames : générés à l'exécution par SpriteFactory (canvas)
 * ------------------------------------------------------------------------- */
const CHARACTERS = [

  /* ============== CENTRE TECHNOCRATIQUE ============== */
  {
    id: "macron", displayName: "Macron.exe", realReference: "Emmanuel Macron",
    family: "centre_technocratique", enemyType: "boss",
    hp: 12, speed: 1.2, scoreValue: 500, influenceValue: 12,
    colorPalette: { skin: "#f2c7a5", hair: "#c98f43", suit: "#1e2a5a", accent: "#ffd166" },
    features: { hair: "side", glasses: false, beard: false, mustache: false, accessory: "tie", brows: "high" },
    caricatureNotes: "Costume sombre, regard confiant, posture présidentielle, aura technocratique pixelisée.",
    introLine: "Je vais optimiser ton cerveau avec des réformes en rafale.",
    attackLine: "Start-up Nation dans tes synapses !",
    defeatLine: "Erreur système : contradiction détectée.",
    spriteFrames: null
  },
  {
    id: "philippe", displayName: "Édouard 2.0", realReference: "Édouard Philippe",
    family: "centre_technocratique", enemyType: "elite",
    hp: 8, speed: 1.0, scoreValue: 50, influenceValue: 9,
    colorPalette: { skin: "#ecc3a0", hair: "#b9b9c4", suit: "#2b2b3d", accent: "#7fd1e0" },
    features: { hair: "crew", glasses: false, beard: true, mustache: false, accessory: "tie", brows: "flat" },
    caricatureNotes: "Barbe bicolore pixelisée, calme olympien, regard d'horizon lointain.",
    introLine: "Je reste calme. Ton cerveau, lui, va paniquer.",
    attackLine: "Horizon dégagé, synapses occupées.",
    defeatLine: "Je reviendrai. Plus tard. Peut-être. Sûrement.",
    spriteFrames: null
  },
  {
    id: "attal", displayName: "Attal Turbo", realReference: "Gabriel Attal",
    family: "centre_technocratique", enemyType: "boss",
    hp: 7, speed: 1.6, scoreValue: 500, influenceValue: 8,
    colorPalette: { skin: "#f4cdaa", hair: "#6b4a2d", suit: "#23315e", accent: "#9ad1ff" },
    features: { hair: "short", glasses: false, beard: false, mustache: false, accessory: "tie", brows: "high" },
    caricatureNotes: "Jeune premier pixelisé, débit de parole supersonique, punchlines pré-chargées.",
    introLine: "Punchline chargée. Trois. Deux. Un.",
    attackLine: "Trop tard, c'était déjà viral !",
    defeatLine: "Impossible... mon élément de langage a buggé.",
    spriteFrames: null
  },
  {
    id: "borne", displayName: "Borne Kilométrique", realReference: "Élisabeth Borne",
    family: "centre_technocratique", enemyType: "petit",
    hp: 4, speed: 0.9, scoreValue: 10, influenceValue: 7,
    colorPalette: { skin: "#edc4a3", hair: "#9b9ba6", suit: "#37474f", accent: "#c0e8ef" },
    features: { hair: "bob", glasses: false, beard: false, mustache: false, accessory: "scarf", brows: "flat" },
    caricatureNotes: "Dossier sous le bras, sérieux ministériel, avance droit devant quoi qu'il arrive.",
    introLine: "Le dossier est complet. Ton cerveau aussi, bientôt.",
    attackLine: "Article suivant !",
    defeatLine: "Je prends acte de cette déprogrammation.",
    spriteFrames: null
  },
  {
    id: "darmanin", displayName: "Gérald Firewall", realReference: "Gérald Darmanin",
    family: "centre_technocratique", enemyType: "petit",
    hp: 5, speed: 1.1, scoreValue: 10, influenceValue: 7,
    colorPalette: { skin: "#f0c39c", hair: "#3c2e26", suit: "#1f2937", accent: "#e8e8e8" },
    features: { hair: "short", glasses: false, beard: false, mustache: false, accessory: "tie", brows: "angry" },
    caricatureNotes: "Sourcils froncés en permanence, circule partout, contrôle tout le monde.",
    introLine: "Contrôle de synapses ! Papiers du cerveau, s'il vous plaît.",
    attackLine: "Fermeté pixelisée !",
    defeatLine: "Je porte plainte contre ce niveau.",
    spriteFrames: null
  },
  {
    id: "bayrou", displayName: "Bayrou l'Éternel", realReference: "François Bayrou",
    family: "centre_technocratique", enemyType: "elite",
    hp: 9, speed: 0.8, scoreValue: 50, influenceValue: 9,
    colorPalette: { skin: "#eec5a2", hair: "#cfcfd8", suit: "#3a3a4f", accent: "#f5e6b8" },
    features: { hair: "side", glasses: true, beard: false, mustache: false, accessory: "tie", brows: "flat" },
    caricatureNotes: "Présent dans le jeu depuis la version bêta de 1974. Increvable, imperturbable.",
    introLine: "J'étais déjà là au niveau zéro. Je serai là après les crédits.",
    attackLine: "Centre ! Toujours au centre !",
    defeatLine: "Ce n'est qu'un revers. Rendez-vous dans dix ans.",
    spriteFrames: null
  },
  {
    id: "braun_pivet", displayName: "Yaël Marteau", realReference: "Yaël Braun-Pivet",
    family: "apparatchik_local", enemyType: "petit",
    hp: 4, speed: 1.0, scoreValue: 10, influenceValue: 6,
    colorPalette: { skin: "#f3cba8", hair: "#c98a3f", suit: "#5b2440", accent: "#ffd9a0" },
    features: { hair: "bob", glasses: false, beard: false, mustache: false, accessory: "badge", brows: "flat" },
    caricatureNotes: "Marteau de séance pixelisé, rappelle tout le monde à l'ordre, même les astéroïdes.",
    introLine: "La séance est ouverte. Ton cerveau est à l'ordre du jour.",
    attackLine: "Un peu de silence dans l'hémicycle galactique !",
    defeatLine: "La séance est levée...",
    spriteFrames: null
  },

  /* ============== LIBÉRALISME ÉCONOMIQUE ============== */
  {
    id: "lemaire", displayName: "Bruno Le Livre", realReference: "Bruno Le Maire",
    family: "liberalisme_economique", enemyType: "elite",
    hp: 7, speed: 1.0, scoreValue: 50, influenceValue: 9,
    colorPalette: { skin: "#f1c6a1", hair: "#7d6a55", suit: "#26324e", accent: "#b3e5fc" },
    features: { hair: "short", glasses: false, beard: false, mustache: false, accessory: "tie", brows: "high" },
    caricatureNotes: "Déclame des courbes de croissance comme des alexandrins, roman inédit sous le bras.",
    introLine: "Chapitre 1 : ton déficit d'attention.",
    attackLine: "Croissance ! Compétitivité ! Métaphore !",
    defeatLine: "J'en ferai un roman de 600 pages.",
    spriteFrames: null
  },

  /* ============== DROITE CONSERVATRICE ============== */
  {
    id: "pecresse", displayName: "Pécresse Vortex", realReference: "Valérie Pécresse",
    family: "droite_conservatrice", enemyType: "petit",
    hp: 5, speed: 1.1, scoreValue: 10, influenceValue: 7,
    colorPalette: { skin: "#f2c8a6", hair: "#7a4a28", suit: "#23335f", accent: "#e3ecff" },
    features: { hair: "bob", glasses: false, beard: false, mustache: false, accessory: "scarf", brows: "flat" },
    caricatureNotes: "Tableur Excel en bandoulière, gère la région Espace-de-France.",
    introLine: "J'ai un plan de financement pour ton cerveau.",
    attackLine: "Subvention de slogans !",
    defeatLine: "Le conseil régional galactique en sera informé.",
    spriteFrames: null
  },
  {
    id: "bertrand", displayName: "Xavier des Hauts", realReference: "Xavier Bertrand",
    family: "droite_conservatrice", enemyType: "petit",
    hp: 6, speed: 0.9, scoreValue: 10, influenceValue: 7,
    colorPalette: { skin: "#efc09b", hair: "#4a3a30", suit: "#33415c", accent: "#d9d9d9" },
    features: { hair: "short", glasses: true, beard: false, mustache: false, accessory: "tie", brows: "flat" },
    caricatureNotes: "Parle du terrain même en orbite. Le terrain. Toujours le terrain.",
    introLine: "Moi, je connais le terrain. Même ici, dans l'espace.",
    attackLine: "Proximité orbitale !",
    defeatLine: "Je retourne sur le terrain. Le vrai.",
    spriteFrames: null
  },
  {
    id: "ciotti", displayName: "Ciotti Pivot", realReference: "Éric Ciotti",
    family: "droite_conservatrice", enemyType: "petit",
    hp: 5, speed: 1.2, scoreValue: 10, influenceValue: 7,
    colorPalette: { skin: "#eec19c", hair: "#2e2620", suit: "#1c2540", accent: "#c9d6ff" },
    features: { hair: "slick", glasses: true, beard: false, mustache: false, accessory: "tie", brows: "angry" },
    caricatureNotes: "Change de trajectoire sans clignotant. Personne ne sait où il va, lui non plus.",
    introLine: "Je suis encore à droite. Enfin je crois. Attends, je regarde.",
    attackLine: "Virage stratégique !",
    defeatLine: "Ce n'était pas une défaite, c'était une alliance.",
    spriteFrames: null
  },
  {
    id: "wauquiez", displayName: "Wauquiez Armure", realReference: "Laurent Wauquiez",
    family: "droite_conservatrice", enemyType: "boss",
    hp: 14, speed: 0.9, scoreValue: 500, influenceValue: 10,
    colorPalette: { skin: "#f1c5a0", hair: "#241b14", suit: "#8c1d2f", accent: "#ffb3b3" },
    features: { hair: "side", glasses: false, beard: false, mustache: false, accessory: "tie", brows: "angry" },
    caricatureNotes: "Doudoune rouge légendaire transformée en armure régionale pixelisée.",
    introLine: "Mon armure régionale est invincible. Comme mes convictions du moment.",
    attackLine: "Subvention défensive activée !",
    defeatLine: "Repli stratégique vers le plateau ardéchois.",
    spriteFrames: null
  },
  {
    id: "retailleau", displayName: "Retailleau Granit", realReference: "Bruno Retailleau",
    family: "souverainisme", enemyType: "petit",
    hp: 6, speed: 0.9, scoreValue: 10, influenceValue: 8,
    colorPalette: { skin: "#eec5a4", hair: "#8a8a96", suit: "#2a2f45", accent: "#bcc8e8" },
    features: { hair: "side", glasses: false, beard: false, mustache: false, accessory: "tie", brows: "angry" },
    caricatureNotes: "Visage de granit vendéen, déplore le déclin de la galaxie depuis sa création.",
    introLine: "La galaxie, c'était mieux avant le Big Bang.",
    attackLine: "Restauration de l'ordre sidéral !",
    defeatLine: "C'est la faute du laxisme cosmique.",
    spriteFrames: null
  },
  {
    id: "dati", displayName: "Dati Comète", realReference: "Rachida Dati",
    family: "droite_conservatrice", enemyType: "elite",
    hp: 7, speed: 1.4, scoreValue: 50, influenceValue: 8,
    colorPalette: { skin: "#e8b58c", hair: "#1f1812", suit: "#4a1535", accent: "#ff9ad5" },
    features: { hair: "long", glasses: false, beard: false, mustache: false, accessory: "scarf", brows: "high" },
    caricatureNotes: "Traverse l'écran comme une comète, distribue des punchlines en diagonale.",
    introLine: "Je traverse les majorités comme les galaxies : vite.",
    attackLine: "Punchline du 7e arrondissement !",
    defeatLine: "Je note. Je n'oublie jamais rien.",
    spriteFrames: null
  },
  {
    id: "sarkozy", displayName: "Sarko le Retour", realReference: "Nicolas Sarkozy",
    family: "droite_conservatrice", enemyType: "boss",
    hp: 10, speed: 1.5, scoreValue: 500, influenceValue: 10,
    colorPalette: { skin: "#edbd95", hair: "#2b2118", suit: "#13203f", accent: "#ffd700" },
    features: { hair: "short", glasses: true, beard: false, mustache: false, accessory: "tie", brows: "angry" },
    caricatureNotes: "Petit mais ultra-rapide, talonnettes à réaction, revient à chaque suite du jeu.",
    introLine: "Le retour du retour du retour. Version pixel.",
    attackLine: "Hyperactivité orbitale !",
    defeatLine: "Je reviendrai dans le DLC.",
    spriteFrames: null
  },
  {
    id: "fillon", displayName: "Fillon Fantôme", realReference: "François Fillon",
    family: "droite_conservatrice", enemyType: "boss",
    hp: 10, speed: 0.8, scoreValue: 500, influenceValue: 10,
    colorPalette: { skin: "#edc2a0", hair: "#3a3a40", suit: "#22262e", accent: "#9fb4d8" },
    features: { hair: "side", glasses: false, beard: false, mustache: false, accessory: "tie", brows: "angry" },
    caricatureNotes: "Sourcils légendaires, apparaît et disparaît dans un nuage de dossiers flottants.",
    introLine: "Mes dossiers flottent dans l'espace. Ne les ouvre pas.",
    attackLine: "Rigueur ! Discipline ! Esquive !",
    defeatLine: "Je me retire dans une campagne très, très lointaine.",
    spriteFrames: null
  },

  /* ============== EXTRÊME DROITE / POPULISME MÉDIATIQUE ============== */
  {
    id: "lepen", displayName: "Marine Vortex", realReference: "Marine Le Pen",
    family: "extreme_droite", enemyType: "boss",
    hp: 11, speed: 1.0, scoreValue: 500, influenceValue: 12,
    colorPalette: { skin: "#f3cba6", hair: "#e8d27a", suit: "#1b2a6b", accent: "#7da0ff" },
    features: { hair: "bob", glasses: false, beard: false, mustache: false, accessory: "scarf", brows: "angry" },
    caricatureNotes: "Sourire de plateau TV, chats holographiques en orbite autour d'elle.",
    introLine: "Mes chats holographiques ont déjà hypnotisé la moitié du vaisseau.",
    attackLine: "Vague bleue marine dans tes neurones !",
    defeatLine: "On gagnera la prochaine partie. Comme d'habitude.",
    spriteFrames: null
  },
  {
    id: "bardella", displayName: "Bardella Hologramme", realReference: "Jordan Bardella",
    family: "extreme_droite", enemyType: "boss",
    hp: 9, speed: 1.4, scoreValue: 500, influenceValue: 11,
    colorPalette: { skin: "#f0c6a2", hair: "#1c1610", suit: "#10204d", accent: "#6f9bff" },
    features: { hair: "slick", glasses: false, beard: false, mustache: false, accessory: "tie", brows: "flat" },
    caricatureNotes: "Brushing indestructible, sourire calibré pour les réseaux, filtre selfie permanent.",
    introLine: "Mon brushing résiste au vide spatial. Ton esprit critique, non.",
    attackLine: "Story sponsorisée dans ton cortex !",
    defeatLine: "Dislike. Je signale ce niveau.",
    spriteFrames: null
  },
  {
    id: "zemmour", displayName: "Zemmour Rétro-Propulseur", realReference: "Éric Zemmour",
    family: "populisme_mediatique", enemyType: "elite",
    hp: 8, speed: 0.9, scoreValue: 50, influenceValue: 11,
    colorPalette: { skin: "#ecc09a", hair: "#2a2018", suit: "#2d2d33", accent: "#d0d0d0" },
    features: { hair: "short", glasses: false, beard: false, mustache: false, accessory: "mic", brows: "angry" },
    caricatureNotes: "Vole en marche arrière : il fonce vers le passé. Micro de plateau greffé à la main.",
    introLine: "C'était mieux avant. Avant ce niveau. Avant ce jeu. Avant tout.",
    attackLine: "Déclinisme à fragmentation !",
    defeatLine: "La décadence a encore gagné.",
    spriteFrames: null
  },
  {
    id: "marechal", displayName: "Marion Satellite", realReference: "Marion Maréchal",
    family: "extreme_droite", enemyType: "petit",
    hp: 5, speed: 1.1, scoreValue: 10, influenceValue: 9,
    colorPalette: { skin: "#f4cca9", hair: "#d9b568", suit: "#28304f", accent: "#aebcf0" },
    features: { hair: "long", glasses: false, beard: false, mustache: false, accessory: "scarf", brows: "flat" },
    caricatureNotes: "Orbite entre deux partis, change de trajectoire gravitationnelle sans prévenir.",
    introLine: "Je gravite. Quelque part. À droite de la droite de la droite.",
    attackLine: "Transfert d'orbite familial !",
    defeatLine: "Je rejoins une autre constellation.",
    spriteFrames: null
  },
  {
    id: "chenu", displayName: "Chenu Réacteur", realReference: "Sébastien Chenu",
    family: "extreme_droite", enemyType: "petit",
    hp: 4, speed: 1.2, scoreValue: 10, influenceValue: 8,
    colorPalette: { skin: "#f0c6a4", hair: "#b8a98e", suit: "#1d2a55", accent: "#8fa8e8" },
    features: { hair: "crew", glasses: true, beard: false, mustache: false, accessory: "tie", brows: "flat" },
    caricatureNotes: "Toujours en double sur les plateaux : il a un clone pour chaque matinale.",
    introLine: "Je suis déjà sur trois plateaux en même temps.",
    attackLine: "Interview simultanée !",
    defeatLine: "Coupez l'antenne, vite !",
    spriteFrames: null
  },

  /* ============== GAUCHE RADICALE ============== */
  {
    id: "melenchon", displayName: "Méluche Tribun Cosmique", realReference: "Jean-Luc Mélenchon",
    family: "gauche_radicale", enemyType: "boss",
    hp: 13, speed: 1.0, scoreValue: 500, influenceValue: 12,
    colorPalette: { skin: "#eec3a0", hair: "#8d8d99", suit: "#3d2b4f", accent: "#ff5252" },
    features: { hair: "short", glasses: true, beard: false, mustache: false, accessory: "scarf", brows: "angry" },
    caricatureNotes: "Veste de tribun, mégaphone gravitationnel, fait trembler l'écran quand il parle.",
    introLine: "L'ère du peuple galactique commence MAINTENANT.",
    attackLine: "La sono du cosmos est à MOI !",
    defeatLine: "La déprogrammation, c'est le complot des médias.",
    spriteFrames: null
  },
  {
    id: "ruffin", displayName: "Ruffin Picard Stellaire", realReference: "François Ruffin",
    family: "gauche_radicale", enemyType: "elite",
    hp: 7, speed: 1.1, scoreValue: 50, influenceValue: 9,
    colorPalette: { skin: "#f2c8a4", hair: "#6e5236", suit: "#445533", accent: "#ffe08a" },
    features: { hair: "spiky", glasses: true, beard: false, mustache: false, accessory: "none", brows: "high" },
    caricatureNotes: "Parka pixelisée, caméra militante à l'épaule, débarque toujours là où on ne l'attend pas.",
    introLine: "J'ai fait un documentaire sur ton cerveau. Spoiler : il est exploité.",
    attackLine: "Reportage surprise !",
    defeatLine: "Je retourne en Picardie intersidérale.",
    spriteFrames: null
  },
  {
    id: "autain", displayName: "Autain Nova", realReference: "Clémentine Autain",
    family: "gauche_radicale", enemyType: "petit",
    hp: 5, speed: 1.0, scoreValue: 10, influenceValue: 8,
    colorPalette: { skin: "#f3c9a7", hair: "#8a4b2c", suit: "#5c2333", accent: "#ff8a80" },
    features: { hair: "bob", glasses: false, beard: false, mustache: false, accessory: "scarf", brows: "flat" },
    caricatureNotes: "Tracte à la vitesse de la lumière, distribue des motions dans les couloirs spatiaux.",
    introLine: "J'ai une motion de synthèse pour ton lobe frontal.",
    attackLine: "Tractage hyperluminique !",
    defeatLine: "Je fonde mon propre courant. Encore.",
    spriteFrames: null
  },
  {
    id: "panot", displayName: "Panot Pulsar", realReference: "Mathilde Panot",
    family: "gauche_radicale", enemyType: "petit",
    hp: 5, speed: 1.2, scoreValue: 10, influenceValue: 8,
    colorPalette: { skin: "#f1c7a5", hair: "#4a3018", suit: "#6b1f2a", accent: "#ffb3a0" },
    features: { hair: "long", glasses: false, beard: false, mustache: false, accessory: "badge", brows: "angry" },
    caricatureNotes: "Rappel au règlement permanent, même en apesanteur.",
    introLine: "Rappel au règlement galactique, article 49 alinéa pixel !",
    attackLine: "Motion de censure cérébrale !",
    defeatLine: "Je demande une suspension de séance.",
    spriteFrames: null
  },
  {
    id: "roussel", displayName: "Roussel Barbecue", realReference: "Fabien Roussel",
    family: "gauche_radicale", enemyType: "boss",
    hp: 13, speed: 0.9, scoreValue: 500, influenceValue: 10,
    colorPalette: { skin: "#f0c5a0", hair: "#5a4632", suit: "#8c2230", accent: "#ffcc66" },
    features: { hair: "short", glasses: false, beard: false, mustache: false, accessory: "tie", brows: "high" },
    caricatureNotes: "Tablier de barbecue par-dessus le costume, défend la côte de bœuf interstellaire.",
    introLine: "Le barbecue dialectique est allumé, camarade.",
    attackLine: "Saucisse argumentative !",
    defeatLine: "Bon. Qui veut une merguez de la réconciliation ?",
    spriteFrames: null
  },
  {
    id: "poutou", displayName: "Poutou Mécano", realReference: "Philippe Poutou",
    family: "gauche_radicale", enemyType: "petit",
    hp: 6, speed: 1.0, scoreValue: 10, influenceValue: 8,
    colorPalette: { skin: "#eec6a2", hair: "#4f4338", suit: "#3a4a5a", accent: "#ff6b6b" },
    features: { hair: "curly", glasses: false, beard: true, mustache: false, accessory: "none", brows: "flat" },
    caricatureNotes: "Seul ennemi sans costume : bleu de travail pixelisé, clé à molette anti-système.",
    introLine: "Moi au moins, je répare les vaisseaux au lieu de les taxer.",
    attackLine: "Clé à molette révolutionnaire !",
    defeatLine: "Pas grave, je reprends le boulot lundi.",
    spriteFrames: null
  },

  /* ============== SOCIAL-DÉMOCRATIE ============== */
  {
    id: "hollande", displayName: "Hollande Synthèse", realReference: "François Hollande",
    family: "social_democratie", enemyType: "boss",
    hp: 14, speed: 0.7, scoreValue: 500, influenceValue: 10,
    colorPalette: { skin: "#f0c5a2", hair: "#5a5a64", suit: "#2c3550", accent: "#ffb0d0" },
    features: { hair: "short", glasses: true, beard: false, mustache: false, accessory: "tie", brows: "flat" },
    caricatureNotes: "Scooter spatial, casque vissé, esquive tout en faisant la synthèse de tout.",
    introLine: "D'un côté tu vas perdre, de l'autre tu vas gagner. Moi, je synthétise.",
    attackLine: "Brouillard de synthèse !",
    defeatLine: "Ça va mieux. Enfin, ça allait mieux.",
    spriteFrames: null
  },
  {
    id: "royal", displayName: "Ségolène Sidérale", realReference: "Ségolène Royal",
    family: "social_democratie", enemyType: "elite",
    hp: 7, speed: 1.0, scoreValue: 50, influenceValue: 9,
    colorPalette: { skin: "#f3caa8", hair: "#5e3a22", suit: "#e8e8f0", accent: "#ff9ad5" },
    features: { hair: "bob", glasses: false, beard: false, mustache: false, accessory: "scarf", brows: "high" },
    caricatureNotes: "Tailleur blanc immaculé même dans les nébuleuses, donne son avis sur chaque planète.",
    introLine: "J'ai un avis sur ce niveau. Et sur tous les autres.",
    attackLine: "Ordre juste intersidéral !",
    defeatLine: "C'est une victoire morale. J'en suis sûre.",
    spriteFrames: null
  },
  {
    id: "hidalgo", displayName: "Hidalgo Périph'", realReference: "Anne Hidalgo",
    family: "social_democratie", enemyType: "petit",
    hp: 5, speed: 0.8, scoreValue: 10, influenceValue: 7,
    colorPalette: { skin: "#eec4a2", hair: "#3a2c22", suit: "#7a2240", accent: "#a0e8b0" },
    features: { hair: "bob", glasses: false, beard: false, mustache: false, accessory: "scarf", brows: "flat" },
    caricatureNotes: "Transforme les couloirs spatiaux en pistes cyclables, ralentit tout le trafic galactique.",
    introLine: "Cette voie lactée passe en zone 30.",
    attackLine: "Travaux surprise sur ta trajectoire !",
    defeatLine: "À Paris, ça aurait marché. Enfin presque.",
    spriteFrames: null
  },
  {
    id: "faure", displayName: "Faure Modem", realReference: "Olivier Faure",
    family: "social_democratie", enemyType: "petit",
    hp: 4, speed: 0.9, scoreValue: 10, influenceValue: 7,
    colorPalette: { skin: "#f1c8a6", hair: "#2e2620", suit: "#bc3a5a", accent: "#ffc0d8" },
    features: { hair: "short", glasses: true, beard: false, mustache: false, accessory: "tie", brows: "flat" },
    caricatureNotes: "Tente de recharger la rose pixelisée du parti avec un câble d'alimentation vintage.",
    introLine: "Le parti redémarre. Veuillez patienter... 56k...",
    attackLine: "Mise à jour idéologique !",
    defeatLine: "Connexion perdue avec la base.",
    spriteFrames: null
  },
  {
    id: "aubry", displayName: "Aubry 35h", realReference: "Martine Aubry",
    family: "social_democratie", enemyType: "elite",
    hp: 8, speed: 0.8, scoreValue: 50, influenceValue: 9,
    colorPalette: { skin: "#efc4a1", hair: "#3c3028", suit: "#5a2030", accent: "#ff8aa0" },
    features: { hair: "bob", glasses: false, beard: false, mustache: false, accessory: "scarf", brows: "angry" },
    caricatureNotes: "Gardienne du beffroi de Lille intergalactique, n'attaque que 35 heures par semaine.",
    introLine: "Je ne bombarde ton cerveau que 35 heures par semaine. Acquis social.",
    attackLine: "Pause syndicale offensive !",
    defeatLine: "Quand c'est flou, c'est qu'il y a un boss.",
    spriteFrames: null
  },
  {
    id: "glucksmann", displayName: "Glucksmann Europa", realReference: "Raphaël Glucksmann",
    family: "social_democratie", enemyType: "petit",
    hp: 5, speed: 1.0, scoreValue: 10, influenceValue: 8,
    colorPalette: { skin: "#f2c9a6", hair: "#6a5238", suit: "#1f3a8a", accent: "#ffd700" },
    features: { hair: "spiky", glasses: false, beard: true, mustache: false, accessory: "none", brows: "high" },
    caricatureNotes: "Barbe de trois jours calibrée, drapeau européen en cape de super-héros.",
    introLine: "L'Europe galactique te regarde avec gravité.",
    attackLine: "Essai géopolitique à tête chercheuse !",
    defeatLine: "Je vais écrire une tribune sur cette défaite.",
    spriteFrames: null
  },

  /* ============== ÉCOLOGIE POLITIQUE ============== */
  {
    id: "rousseau", displayName: "Rousseau Totem", realReference: "Sandrine Rousseau",
    family: "ecologie_politique", enemyType: "boss",
    hp: 13, speed: 1.0, scoreValue: 500, influenceValue: 11,
    colorPalette: { skin: "#f2c9a8", hair: "#b5651d", suit: "#1d6b3a", accent: "#7dffb0" },
    features: { hair: "bob", glasses: true, beard: false, mustache: false, accessory: "scarf", brows: "angry" },
    caricatureNotes: "Totem éco-cosmique flottant, transforme les barbecues ennemis en composteurs.",
    introLine: "Ton vaisseau n'est même pas recyclable. On va arranger ça.",
    attackLine: "Déconstruction orbitale !",
    defeatLine: "Cette déprogrammation est un symptôme du patriarcat spatial.",
    spriteFrames: null
  },
  {
    id: "jadot", displayName: "Jadot Photosynthèse", realReference: "Yannick Jadot",
    family: "ecologie_politique", enemyType: "petit",
    hp: 5, speed: 0.9, scoreValue: 10, influenceValue: 8,
    colorPalette: { skin: "#f0c7a4", hair: "#8a7a5e", suit: "#2e7d4f", accent: "#b0ffc8" },
    features: { hair: "crew", glasses: false, beard: true, mustache: false, accessory: "none", brows: "flat" },
    caricatureNotes: "Fonctionne à l'énergie solaire, s'arrête de bouger quand il passe dans l'ombre.",
    introLine: "Mon programme est 100% renouvelable. Tes neurones aussi, bientôt.",
    attackLine: "Éolienne de combat !",
    defeatLine: "Au moins, ma défaite est neutre en carbone.",
    spriteFrames: null
  },
  {
    id: "tondelier", displayName: "Tondelier Bourgeon", realReference: "Marine Tondelier",
    family: "ecologie_politique", enemyType: "petit",
    hp: 4, speed: 1.1, scoreValue: 10, influenceValue: 8,
    colorPalette: { skin: "#f3cba9", hair: "#7a4a28", suit: "#3a8a3a", accent: "#caffb0" },
    features: { hair: "short", glasses: false, beard: false, mustache: false, accessory: "scarf", brows: "high" },
    caricatureNotes: "Veste verte légendaire, fait pousser des lianes pixelisées sur les vaisseaux ennemis.",
    introLine: "Ma veste verte a plus de charisme que ton vaisseau.",
    attackLine: "Liane diplomatique !",
    defeatLine: "Je composte ma défaite pour la suite.",
    spriteFrames: null
  },
  {
    id: "voynet", displayName: "Voynet Ancienne Forêt", realReference: "Dominique Voynet",
    family: "ecologie_politique", enemyType: "petit",
    hp: 5, speed: 0.8, scoreValue: 10, influenceValue: 7,
    colorPalette: { skin: "#eec6a4", hair: "#9a9aa4", suit: "#2a5a3a", accent: "#a0e8c0" },
    features: { hair: "short", glasses: true, beard: false, mustache: false, accessory: "none", brows: "flat" },
    caricatureNotes: "Gardienne de la forêt primaire du gameplay, se souvient de l'écologie d'avant les pixels.",
    introLine: "Je faisais de l'écologie quand ton processeur était à vapeur.",
    attackLine: "Spore de sobriété !",
    defeatLine: "Replantez quelque chose à ma place.",
    spriteFrames: null
  },

  /* ============== BOSS FINAL ============== */
  {
    id: "larcher", displayName: "Larcher Suprême, Gardien du Sénat", realReference: "Gérard Larcher",
    family: "apparatchik_local", enemyType: "boss",
    hp: 60, speed: 0.6, scoreValue: 500, influenceValue: 15,
    colorPalette: { skin: "#f0c2a0", hair: "#d8d8e0", suit: "#3a1020", accent: "#c8a040" },
    features: { hair: "side", glasses: true, beard: false, mustache: false, accessory: "badge", brows: "angry" },
    caricatureNotes: "Boss final géant occupant tout le haut de l'écran. Buffet institutionnel illimité, marteau de séance gravitationnel, écharpe sénatoriale en superconducteur.",
    introLine: "Bienvenue au Sénat. Ici, le temps n'existe pas. Toi non plus, bientôt.",
    attackLine: "PROTOCOLE RÉPUBLICAIN : ACTIVÉ.",
    defeatLine: "Le buffet... fermé ?! C'est un coup d'État.",
    spriteFrames: null
  },

  /* ============== SBIRES MÉDIATIQUES (vrais noms détournés) ============== */
  {
    id: "editorialiste", displayName: "Pascal Pravda", realReference: "Pascal Praud (parodie)",
    family: "populisme_mediatique", enemyType: "petit",
    hp: 2, speed: 1.3, scoreValue: 10, influenceValue: 5,
    colorPalette: { skin: "#e8c0a0", hair: "#777788", suit: "#444455", accent: "#ff9f1c" },
    features: { hair: "slick", glasses: true, beard: false, mustache: false, accessory: "mic", brows: "high" },
    caricatureNotes: "Éditorialiste survolté cloné en série dans les sous-sols des chaînes d'info. S'indigne à la vitesse de la lumière.",
    introLine: "Et vous savez ce qu'on me dit dans l'oreillette ?",
    attackLine: "C'est un scandale ! (lequel ? aucune idée)",
    defeatLine: "On en reparle après la pub.",
    spriteFrames: null
  },
  {
    id: "sondeur", displayName: "Jérôme Fourquetout", realReference: "Jérôme Fourquet (parodie)",
    family: "apparatchik_local", enemyType: "petit",
    hp: 2, speed: 1.1, scoreValue: 10, influenceValue: 4,
    colorPalette: { skin: "#ecc8a8", hair: "#5a5a66", suit: "#2f3e4e", accent: "#80d8ff" },
    features: { hair: "crew", glasses: true, beard: false, mustache: false, accessory: "badge", brows: "flat" },
    caricatureNotes: "Sondologue cosmique : lance des camemberts statistiques à ±12% de marge d'erreur, archipellise tout ce qu'il touche.",
    introLine: "67% de ton cerveau est déjà d'accord avec moi.",
    attackLine: "Échantillon représentatif !",
    defeatLine: "Marge d'erreur dépassée...",
    spriteFrames: null
  },
  {
    id: "communicant", displayName: "Cyril Hanounova", realReference: "Cyril Hanouna (parodie)",
    family: "populisme_mediatique", enemyType: "petit",
    hp: 3, speed: 1.2, scoreValue: 10, influenceValue: 5,
    colorPalette: { skin: "#e6c2a4", hair: "#3a3a44", suit: "#555570", accent: "#caffff" },
    features: { hair: "slick", glasses: false, beard: false, mustache: false, accessory: "mic", brows: "high" },
    caricatureNotes: "Mi-animateur mi-supernova, transforme chaque débat galactique en jeu télé, laisse une traînée de confettis et de sonneries.",
    introLine: "C'est que du live, chéri !",
    attackLine: "Darka intersidéral !",
    defeatLine: "Coupez pas mon émission !!",
    spriteFrames: null
  },
  {
    id: "militant", displayName: "Lassalle l'Errant", realReference: "Jean Lassalle (parodie)",
    family: "apparatchik_local", enemyType: "petit",
    hp: 2, speed: 1.4, scoreValue: 10, influenceValue: 4,
    colorPalette: { skin: "#ecc6a6", hair: "#6a4a30", suit: "#666644", accent: "#ffe080" },
    features: { hair: "spiky", glasses: false, beard: false, mustache: false, accessory: "badge", brows: "high" },
    caricatureNotes: "Berger cosmique égaré loin de sa vallée, traverse la galaxie à pied en chantant et distribue de la ruralité pixelisée.",
    introLine: "Oh !... La belle galaxie que voilà.",
    attackLine: "Vive la montagne !",
    defeatLine: "Je rentre dans ma vallée...",
    spriteFrames: null
  }
];

/* Index par id pour un accès rapide */
const CHARACTERS_BY_ID = {};
for (const c of CHARACTERS) CHARACTERS_BY_ID[c.id] = c;

/* -------------------------------------------------------------------------
 * PUNCHLINES D'ATTAQUE — projectiles verbaux de chaque personnage.
 * Mélange de citations publiques célèbres (notoires et documentées),
 * de slogans de campagne et de titres d'œuvres réels, complétés par des
 * phrases stylisées satiriques pour les personnages moins quotables.
 * Utilisées comme projectiles par le moteur (game.js).
 * ------------------------------------------------------------------------- */
const PUNCHLINES = {
  macron:       ["QU'ILS VIENNENT ME CHERCHER", "TRAVERSE LA RUE !", "EN MÊME TEMPS", "POGNON DE DINGUE", "GAULOIS RÉFRACTAIRES"],
  philippe:     ["DES HOMMES QUI LISENT", "DES JOURS HEUREUX", "JE RESTE CALME"],
  attal:        ["J'ASSUME TOTALEMENT", "PUNCHLINE EXPRESS", "DÉJÀ VIRAL"],
  borne:        ["49.3 !", "ARTICLE 49.3 !", "DOSSIER SUIVANT"],
  darmanin:     ["VOUS ÊTES TROP MOLLE !", "CONTRÔLE D'IDENTITÉ", "FERMETÉ RÉPUBLICAINE"],
  bayrou:       ["JE SUIS LÀ DEPUIS 1974", "LE CENTRE, TOUJOURS", "HAUT-COMMISSAIRE AU PLAN"],
  braun_pivet:  ["LA SÉANCE EST OUVERTE", "UN PEU DE SILENCE !", "JE LÈVE LA SÉANCE"],
  lemaire:      ["LA CROISSANCE REVIENDRA", "CHAPITRE 14 : LE DÉFICIT", "FLAUBERT FISCAL"],
  pecresse:     ["JE RESSORS LE KÄRCHER", "JE SUIS UNE FEMME LIBRE", "LE TABLEUR A PARLÉ"],
  bertrand:     ["LE TERRAIN, LE VRAI", "LES HAUTS-DE-FRANCE D'ABORD", "MOI, JE FAIS"],
  ciotti:       ["TOUJOURS PLUS À DROITE", "VIRAGE SANS CLIGNOTANT", "L'ALLIANCE, C'EST MOI"],
  wauquiez:     ["LA DOUDOUNE NE MENT PAS", "PARLER VRAI", "REPLI SUR L'ARDÈCHE"],
  retailleau:   ["RÉTABLIR L'ORDRE", "LA FRANCE DES CLOCHERS", "C'ÉTAIT MIEUX AVANT"],
  dati:         ["PAS DE LEÇONS À RECEVOIR", "JE TRAVERSE TOUT", "COMÈTE DU 7E"],
  sarkozy:      ["CASSE-TOI PAUV' CON", "TRAVAILLER PLUS POUR GAGNER PLUS", "LE RETOUR, ENCORE"],
  fillon:       ["DE GAULLE MIS EN EXAMEN ?", "RIGUEUR !", "JE DEMANDE PARDON"],
  lepen:        ["AU NOM DU PEUPLE", "LA FRANCE APAISÉE", "ON N'A PAS PERDU, PRESQUE"],
  bardella:     ["CE QUE JE CHERCHE", "GÉNÉRATION BARDELLA", "STORY SPONSORISÉE"],
  zemmour:      ["LE SUICIDE FRANÇAIS", "DESTIN FRANÇAIS", "C'ÉTAIT MIEUX EN 1660"],
  marechal:     ["LA RELÈVE FAMILIALE", "CHANGEMENT D'ORBITE", "TRADITION SPATIALE"],
  chenu:        ["JE SUIS SUR 3 PLATEAUX", "MATINALE ÉTERNELLE", "DUPLEX PERMANENT"],
  melenchon:    ["LA RÉPUBLIQUE, C'EST MOI !", "QU'ILS S'EN AILLENT TOUS", "L'ÈRE DU PEUPLE", "LA SONO DU COSMOS"],
  ruffin:       ["MERCI PATRON !", "DEBOUT LA PICARDIE", "REPORTAGE SAUVAGE"],
  autain:       ["MOTION DE SYNTHÈSE", "NOUVEAU COURANT, ENCORE", "TRACT SUPERSONIQUE"],
  panot:        ["RAPPEL AU RÈGLEMENT !", "MOTION DE CENSURE !", "SUSPENSION DE SÉANCE"],
  roussel:      ["UN BON VIN, UNE BONNE VIANDE", "LA GAUCHE DU SAUCISSON", "MERGUEZ POUR TOUS"],
  poutou:       ["PAS D'IMMUNITÉ OUVRIÈRE", "JE RENDS LE COSTUME", "CLÉ À MOLETTE !"],
  hollande:     ["MOI PRÉSIDENT...", "ÇA VA MIEUX", "LE CHANGEMENT C'EST MAINTENANT", "SYNTHÈSE !"],
  royal:        ["LA BRAVITUDE !", "GAGNANT-GAGNANT", "L'ORDRE JUSTE"],
  hidalgo:      ["PARIS À VÉLO", "ZONE 30 GALACTIQUE", "TRAVAUX EN COURS"],
  faure:        ["LA ROSE REDÉMARRE", "CONGRÈS PERMANENT", "MISE À JOUR 56K"],
  aubry:        ["QUAND C'EST FLOU, IL Y A UN LOUP", "35 HEURES !", "LILLE FOREVER"],
  glucksmann:   ["L'EUROPE NOUS REGARDE", "TRIBUNE À SUIVRE", "GRAVITÉ GÉOPOLITIQUE"],
  rousseau:     ["DÉCONSTRUISEZ-VOUS !", "LE BARBECUE EST POLITIQUE", "ÉCOFÉMINISME ORBITAL"],
  jadot:        ["ÉCOLOGIE DE GOUVERNEMENT", "100% RENOUVELABLE", "ÉOLIENNE DE COMBAT"],
  tondelier:    ["LA VESTE VERTE !", "COMPOSTEZ VOS DOGMES", "LIANE DIPLOMATIQUE"],
  voynet:       ["ÉCOLO AVANT L'HEURE", "SPORE DE SOBRIÉTÉ", "REPLANTEZ TOUT ÇA"],
  larcher:      ["LE SÉNAT EST ÉTERNEL", "VIGIE DE LA RÉPUBLIQUE", "BUFFET RÉPUBLICAIN", "PROTOCOLE !"],
  editorialiste:["ON NE PEUT PLUS RIEN DIRE", "LAISSEZ-MOI TERMINER !", "C'EST UN SCANDALE !"],
  sondeur:      ["L'ARCHIPEL FRANÇAIS", "67% D'ACCORD", "MARGE D'ERREUR ±12"],
  communicant:  ["DARKA !", "C'EST QUE DU LIVE !", "FANZONE !"],
  militant:     ["OH ! LA MONTAGNE", "JE SUIS UN PAYSAN", "VIVE LA RURALITÉ"]
};
for (const c of CHARACTERS) c.punchlines = PUNCHLINES[c.id] || [];
