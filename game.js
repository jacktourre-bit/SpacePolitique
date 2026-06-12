/* =========================================================================
 * BOURRAGE DE CRÂNE : MODE RÉVOLUTION — game.js
 * Moteur principal : boucle de jeu, sprites pixel-art procéduraux,
 * stratégies d'attaque aléatoires par partie, power-ups, influence
 * politique, boss à phases, audio WebAudio 8-bit.
 *
 * Rappel : personne n'est tué ici. Les ennemis sont DÉPROGRAMMÉS et
 * explosent en pixels, confettis et slogans brouillés.
 * ========================================================================= */
"use strict";

/* ============================ CONSTANTES ============================ */
const GAME_W = 480;
const GAME_H = 854;

const DIFFICULTIES = {
  facile:    { key: "facile",    label: "Facile",               speed: 0.75, fire: 0.70, bourrage: 0.70, autoFire: true  },
  normal:    { key: "normal",    label: "Normal",               speed: 1.00, fire: 1.00, bourrage: 1.00, autoFire: false },
  cauchemar: { key: "cauchemar", label: "Cauchemar médiatique", speed: 1.35, fire: 1.50, bourrage: 1.40, autoFire: false }
};

const POWERUP_TYPES = {
  esprit_critique: { sym: "3×", name: "ESPRIT CRITIQUE : TIR TRIPLE", color: "#7df0ff" },
  factcheck:       { sym: "FC", name: "FACT-CHECK : ÉCRAN PURGÉ",     color: "#ffd166" },
  debat:           { sym: "DB", name: "DÉBAT CONTRADICTOIRE : RALENTI", color: "#b07df0" },
  memoire:         { sym: "MH", name: "MÉMOIRE HISTORIQUE : BOUCLIER", color: "#3ddc84" },
  second_degre:    { sym: "2°", name: "SECOND DEGRÉ : -30 BOURRAGE",  color: "#ff7eb6" },
  abstention:      { sym: "Ab", name: "ABSTENTION COSMIQUE : INTANGIBLE", color: "#c0c0d0" },
  /* Armement évolutif */
  canon_plus:      { sym: "C+", name: "CANON SUPPLÉMENTAIRE !",       color: "#7dff7d" },
  missiles:        { sym: "MI", name: "MISSILES FACT-CHECKEURS",      color: "#ff9f1c" },
  pierce:          { sym: "LZ", name: "LASER TRANSPERÇANT",           color: "#ff5fff" },
  /* Bonus spécial : 1 par épisode. Feu continu dévastateur, mais le jeu
   * entier passe en vitesse ×2 pendant l'effet. */
  gros_calibre:    { sym: "GC", name: "LE GROS CALIBRE : FEU CONTINU, VITESSE ×2 !", color: "#ffb0c8" }
};

/* Décalages des canons selon le niveau d'armement (1 à 4 canons) */
const WEAPON_OFFSETS = [[0], [-9, 9], [-15, 0, 15], [-19, -7, 7, 19]];

/* Accélérateur de rythme : +7% de vitesse globale par niveau */
function paceMult() { return 1 + G.levelIndex * 0.07; }

/* Thème musical de chaque niveau (voir music.js) */
const LEVEL_THEMES = ["hall", "corporate", "conserva", "breaking", "punk",
  "rouge", "rose", "forest", "retro", "final"];

/* Les stratégies de trajectoire disponibles — tirées au sort à chaque run */
const PATTERN_NAMES = ["sine", "zigzag", "swoop", "orbit", "steps", "dive"];
const ENTRY_SIDES = ["left", "right", "top", "split"];
const FIRE_MODES = ["aimed", "straight", "spread", "rain"];

/* ============================ CANVAS ============================ */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

/* Détection d'écran tactile : sur mobile/tablette, l'interface est
 * entièrement tactile (tir auto d'office, pilotage au doigt). */
const IS_TOUCH = ("ontouchstart" in window) ||
  (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0);

/* ============================ RNG SEEDÉ ============================ */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let runRng = mulberry32((Date.now() & 0xffffffff) >>> 0);
const rnd = (a, b) => a + runRng() * (b - a);
const pick = (arr) => arr[Math.floor(runRng() * arr.length)];

function hashId(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ============================ AUDIO 8-BIT ============================ */
const AudioFX = {
  ctx: null, muted: false,
  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
  },
  tone(freq, dur, type, vol, slide) {
    if (this.muted || !this.ctx) return;
    const t0 = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.linearRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    g.gain.setValueAtTime(vol || 0.05, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  },
  shoot()    { this.tone(900, 0.07, "square", 0.03, -500); },
  enemyHit() { this.tone(300, 0.05, "sawtooth", 0.03, -80); },
  deprogram(){ this.tone(220, 0.25, "sawtooth", 0.05, -180); this.tone(440, 0.15, "square", 0.03, 200); },
  playerHit(){ this.tone(120, 0.3, "sawtooth", 0.07, -60); },
  powerup()  { this.tone(440, 0.1, "square", 0.05, 220); setTimeout(() => this.tone(660, 0.12, "square", 0.05, 220), 90); },
  alarm()    { this.tone(180, 0.4, "square", 0.06, 80); setTimeout(() => this.tone(180, 0.4, "square", 0.06, 80), 450); },
  fanfare()  {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.22, "square", 0.06), i * 180));
  },
  gameover() { [400, 320, 240, 160].forEach((f, i) => setTimeout(() => this.tone(f, 0.3, "sawtooth", 0.06), i * 220)); }
};

/* =========================================================================
 * SPRITE FACTORY — têtes pixelisées 16×16 (rendues en 32×32) générées
 * par code à partir de la palette + features de chaque personnage.
 * 4 états : idle / talk / attack / hit (glitch).
 * ========================================================================= */
const SpriteFactory = {
  cache: {},
  get(ch) {
    if (!this.cache[ch.id]) {
      this.cache[ch.id] = {
        idle:   this.render(ch, "idle"),
        talk:   this.render(ch, "talk"),
        attack: this.render(ch, "attack"),
        hit:    this.render(ch, "hit")
      };
      ch.spriteFrames = this.cache[ch.id]; // expose pour debug / visages
    }
    return this.cache[ch.id];
  },
  render(ch, state) {
    const c = document.createElement("canvas");
    c.width = 32; c.height = 32;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = false;
    if (state === "hit") {
      // base idle, puis glitch horizontal déterministe + pixels parasites
      const base = this.render(ch, "idle");
      const rng = mulberry32(hashId(ch.id));
      for (let row = 0; row < 16; row++) {
        const off = Math.floor((rng() - 0.5) * 6);
        g.drawImage(base, 0, row * 2, 32, 2, off, row * 2, 32, 2);
      }
      g.fillStyle = "#ffffff";
      for (let i = 0; i < 10; i++) {
        g.fillRect(Math.floor(rng() * 16) * 2, Math.floor(rng() * 16) * 2, 2, 2);
      }
      return c;
    }
    this.drawHead(g, ch, state);
    return c;
  },
  drawHead(g, ch, state) {
    const pal = ch.colorPalette;
    const f = ch.features || {};
    const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x * 2, y * 2, (w || 1) * 2, (h || 1) * 2); };
    const dark = "#1a1422";
    const skinShade = "#00000022";

    /* Épaules / costume */
    P(2, 13, 12, 3, pal.suit);
    P(1, 14, 14, 2, pal.suit);
    /* Cou */
    P(6, 12, 4, 1, pal.skin);
    /* Visage */
    P(3, 3, 10, 9, pal.skin);
    P(4, 2, 8, 1, pal.skin);
    P(4, 12, 8, 1, pal.skin);
    /* Oreilles */
    P(2, 7, 1, 2, pal.skin);
    P(13, 7, 1, 2, pal.skin);
    /* Ombre du menton */
    P(5, 12, 6, 1, skinShade);

    /* Cheveux */
    const H = pal.hair;
    switch (f.hair) {
      case "bald":
        P(3, 3, 1, 2, H); P(12, 3, 1, 2, H); break;
      case "crew":
        P(4, 2, 8, 1, H); P(3, 3, 10, 1, H); break;
      case "short":
        P(4, 1, 8, 1, H); P(3, 2, 10, 2, H); break;
      case "side":
        P(4, 1, 8, 1, H); P(3, 2, 10, 2, H); P(3, 4, 5, 1, H); break;
      case "slick":
        P(3, 1, 10, 1, H); P(3, 2, 10, 2, H); break;
      case "bob":
        P(4, 1, 8, 1, H); P(3, 2, 10, 2, H);
        P(2, 4, 2, 6, H); P(12, 4, 2, 6, H); break;
      case "long":
        P(4, 1, 8, 1, H); P(3, 2, 10, 2, H);
        P(2, 4, 2, 10, H); P(12, 4, 2, 10, H); break;
      case "spiky":
        P(4, 0, 1, 2, H); P(6, 0, 1, 2, H); P(8, 0, 1, 2, H); P(10, 0, 1, 2, H);
        P(3, 2, 10, 2, H); break;
      case "curly":
        P(3, 0, 2, 2, H); P(6, 0, 2, 2, H); P(9, 0, 2, 2, H); P(12, 0, 1, 2, H);
        P(3, 2, 10, 2, H); break;
      default:
        P(3, 2, 10, 2, H);
    }

    /* Sourcils */
    const browY = (f.brows === "high") ? 5 : 6;
    if (f.brows === "angry") {
      P(4, 6, 2, 1, dark); P(6, 7, 1, 1, dark);
      P(10, 6, 2, 1, dark); P(9, 7, 1, 1, dark);
    } else {
      P(4, browY, 3, 1, dark);
      P(9, browY, 3, 1, dark);
    }

    /* Yeux (plus grands en mode attack) */
    if (state === "attack") {
      P(4, 7, 2, 2, "#ffffff"); P(5, 8, 1, 1, dark);
      P(10, 7, 2, 2, "#ffffff"); P(10, 8, 1, 1, dark);
    } else {
      P(5, 8, 1, 1, dark);
      P(10, 8, 1, 1, dark);
    }

    /* Lunettes */
    if (f.glasses) {
      const lg = "#2c2c3a";
      P(4, 7, 3, 1, lg); P(4, 9, 3, 1, lg); P(4, 8, 1, 1, lg); P(6, 8, 1, 1, lg);
      P(9, 7, 3, 1, lg); P(9, 9, 3, 1, lg); P(9, 8, 1, 1, lg); P(11, 8, 1, 1, lg);
      P(7, 8, 2, 1, lg);
    }

    /* Moustache / barbe */
    if (f.mustache) P(6, 9, 4, 1, H);
    if (f.beard) { P(4, 11, 8, 1, H); P(5, 12, 6, 1, H); P(3, 9, 1, 2, H); P(12, 9, 1, 2, H); }

    /* Bouche selon l'état */
    if (state === "talk") {
      P(6, 10, 3, 2, dark); P(7, 11, 1, 1, "#a03030");
    } else if (state === "attack") {
      P(5, 10, 6, 2, dark); P(5, 10, 6, 1, "#ffffff"); P(6, 11, 4, 1, "#a03030");
    } else {
      P(6, 10, 4, 1, dark);
    }

    /* Accessoire */
    const A = pal.accent;
    switch (f.accessory) {
      case "tie":   P(7, 13, 2, 2, A); P(7, 15, 1, 1, A); break;
      case "scarf": P(4, 12, 8, 2, A); break;
      case "bowtie":P(6, 13, 1, 1, A); P(9, 13, 1, 1, A); P(7, 13, 2, 1, "#ffffff"); break;
      case "mic":   P(13, 10, 2, 1, "#222"); P(14, 7, 1, 3, "#444"); P(13, 6, 2, 1, "#999"); break;
      case "badge": P(4, 13, 2, 1, A); P(4, 14, 1, 1, "#ffffff"); break;
    }
  }
};

/* ============================ ÉTAT GLOBAL ============================ */
const G = {
  screen: "title",
  paused: false,
  diff: DIFFICULTIES.normal,
  autoFire: false,
  levelIndex: 0,
  score: 0,
  lives: 3,
  bourrage: 0,
  influences: {},
  combo: 0,
  comboTimer: 0,
  dodgeTimer: 0,
  startTime: 0,
  defeatedBosses: [],
  flow: { state: "idle", timer: 0 },
  waveIndex: 0,
  plan: null,
  banner: null,
  shake: 0,
  bourrageFlash: 0,
  time: 0,
  victory: false
};

const player = {
  x: GAME_W / 2, y: GAME_H - 110,
  r: 13,
  speed: 280,
  cooldown: 0,
  invuln: 0,
  triple: 0, slowField: 0, shield: 0, intangible: 0,
  weaponLevel: 1,          // nombre de canons (1 à 4)
  weaponType: "laser",     // laser | missiles | pierce
  calibre: 0,              // timer du GROS CALIBRE (feu continu + jeu ×2)
  touchTarget: null, touchFiring: false
};

let bullets = [];     // pensées critiques du joueur
let shots = [];       // projectiles-mots ennemis
let enemies = [];
let powerups = [];
let particles = [];
let texts = [];       // textes flottants
let crystals = [];    // cristaux de discours (phase 4 Larcher)
let spawnQueue = [];
let stars = [];
let brains = [];

/* ============================ DOM ============================ */
const $ = (id) => document.getElementById(id);
const SCREEN_IDS = ["screen-title", "screen-difficulty", "screen-levelintro",
  "screen-pause", "screen-gameover", "screen-victory", "screen-leaderboard", "screen-credits"];

function showScreen(name) {
  for (const id of SCREEN_IDS) $(id).classList.toggle("hidden", id !== name);
  const inGame = (name === null);
  $("hud").classList.toggle("hidden", !inGame);
  $("touch-controls").classList.toggle("hidden", !inGame);
  G.screen = name || "playing";
}

/* ============================ FOND ÉTOILÉ / CÉRÉBRAL ============================ */
function initBackground() {
  stars = [];
  for (let i = 0; i < 70; i++) {
    stars.push({ x: Math.random() * GAME_W, y: Math.random() * GAME_H,
      s: Math.random() * 2 + 0.5, v: Math.random() * 30 + 12 });
  }
  brains = [];
  for (let i = 0; i < 5; i++) {
    brains.push({ x: Math.random() * GAME_W, y: Math.random() * GAME_H,
      r: Math.random() * 26 + 14, v: Math.random() * 8 + 4, ph: Math.random() * 7 });
  }
}

/* ============================ PLANIFICATEUR DE STRATÉGIES ============================
 * C'est ici que chaque partie devient unique : pour chaque vague du niveau,
 * on tire au sort (avec le seed du run) la trajectoire, le côté d'entrée,
 * le mode de tir, l'amplitude, la fréquence et la probabilité de kamikaze.
 * ============================================================================ */
function planLevel(level) {
  const waves = [];
  for (let w = 0; w < level.waves; w++) {
    waves.push({
      pattern: pick(PATTERN_NAMES),
      entry: pick(ENTRY_SIDES),
      fireMode: level.mechanics.includes("spread_shots") && runRng() < 0.5 ? "spread" : pick(FIRE_MODES),
      amp: rnd(30, 90) * (level.mechanics.includes("tight_formation") ? 0.5 : 1),
      freq: rnd(0.8, 2.2),
      kamikazeChance: (waves.length && waves[w - 1] ? 0 : 0) + (runRng() < 0.4 ? rnd(0.15, 0.45) : 0.08),
      speedJitter: rnd(0.85, 1.3),
      stagger: rnd(0.25, 0.55)
    });
  }
  return { waves, bossDash: runRng() < 0.5, bossDir: runRng() < 0.5 ? 1 : -1 };
}

/* ============================ SPAWN ============================ */
function spawnWave() {
  const level = LEVELS[G.levelIndex];
  const wavePlan = G.plan.waves[G.waveIndex];
  const count = level.enemiesPerWave;
  const cols = Math.min(count, 5);
  const rows = Math.ceil(count / cols);
  let n = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols && n < count; c++, n++) {
      const charId = level.roster[Math.floor(runRng() * level.roster.length)];
      const slotX = 60 + (c + 0.5) * (GAME_W - 120) / cols;
      const slotY = 110 + r * 70;
      spawnQueue.push({ charId, slotX, slotY, delay: n * wavePlan.stagger, isBoss: false });
    }
  }
  toast("VAGUE " + (G.waveIndex + 1) + " — stratégie : " + wavePlan.pattern.toUpperCase(), "#7df0ff");
}

function makeEnemy(charId, slotX, slotY, isBoss, bossHp) {
  const ch = CHARACTERS_BY_ID[charId];
  const level = LEVELS[G.levelIndex];
  const wavePlan = G.plan.waves[Math.min(G.waveIndex, G.plan.waves.length - 1)];
  const entry = wavePlan.entry;
  let sx = slotX, sy = -50;
  if (!isBoss) {
    if (entry === "left") { sx = -50; sy = rnd(60, 240); }
    else if (entry === "right") { sx = GAME_W + 50; sy = rnd(60, 240); }
    else if (entry === "split") {
      sx = (slotX < GAME_W / 2) ? -50 : GAME_W + 50; sy = rnd(60, 240);
    }
  }
  const scale = isBoss ? (charId === "larcher" ? 6.5 : 3) : (ch.enemyType === "elite" ? 1.9 : 1.5);
  const e = {
    ch, isBoss,
    x: sx, y: sy, slotX, slotY,
    t: 0, entryT: 0, entryDur: isBoss ? 2.0 : 1.2,
    sx, sy,
    hp: isBoss ? bossHp : Math.max(1, Math.round(ch.hp * level.hpMult)),
    maxHp: isBoss ? bossHp : Math.max(1, Math.round(ch.hp * level.hpMult)),
    scale, r: 16 * scale * 0.72,
    pattern: isBoss ? "boss" : wavePlan.pattern,
    amp: wavePlan.amp, freq: wavePlan.freq,
    phase: rnd(0, Math.PI * 2),
    fireMode: wavePlan.fireMode,
    fireTimer: rnd(1.0, 3.0),
    speed: ch.speed * wavePlan.speedJitter * G.diff.speed * paceMult(),
    state: "idle", stateTimer: 0,
    diveTimer: runRng() < wavePlan.kamikazeChance ? rnd(3, 9) : Infinity,
    diving: false, diveT: 0, diveTx: 0, diveTy: 0,
    revived: false,
    minionTimer: 3, crystalTimer: 0,
    bossPhase: -1
  };
  return e;
}

function spawnBosses() {
  const level = LEVELS[G.levelIndex];
  const ids = level.boss;
  ids.forEach((id, i) => {
    const slotX = ids.length === 1 ? GAME_W / 2 : (i === 0 ? GAME_W * 0.3 : GAME_W * 0.7);
    const slotY = id === "larcher" ? 120 : 140;
    const e = makeEnemy(id, slotX, slotY, true, level.bossHp);
    e.phase = i * Math.PI; // désynchronise les duos
    enemies.push(e);
    const ch = CHARACTERS_BY_ID[id];
    toast("« " + ch.introLine + " »", "#ffd166", 3.2);
  });
  banner([level.bossTitle], 2.6, "#ff3355");
  AudioFX.alarm();
  Music.play(G.levelIndex === LEVELS.length - 1 ? "final" : "boss");
}

function spawnMinion() {
  const minis = ["editorialiste", "sondeur", "communicant", "militant",
    "borne", "faure", "chenu", "jadot", "hidalgo", "marechal"];
  const id = minis[Math.floor(runRng() * minis.length)];
  const e = makeEnemy(id, rnd(60, GAME_W - 60), rnd(180, 300), false, 0);
  e.pattern = pick(PATTERN_NAMES.filter(p => p !== "steps"));
  enemies.push(e);
}

function spawnCrystals() {
  crystals = [];
  for (let i = 0; i < 3; i++) {
    crystals.push({ x: 90 + i * 150, y: rnd(280, 360), hp: 8, t: rnd(0, 6), r: 18 });
  }
  toast("DÉTRUIS LES CRISTAUX DE DISCOURS !", "#ff3355", 3);
}

/* ============================ FLOW DU NIVEAU ============================ */
function startRun(diffKey) {
  G.diff = DIFFICULTIES[diffKey];
  G.autoFire = G.diff.autoFire || IS_TOUCH;
  $("btn-autofire").classList.toggle("active", G.autoFire);
  runRng = mulberry32(((Date.now() & 0xffffffff) ^ (Math.random() * 0xffffffff)) >>> 0);
  G.levelIndex = 0;
  G.score = 0; G.lives = 3; G.bourrage = 0;
  G.influences = {}; G.combo = 0; G.comboTimer = 0; G.dodgeTimer = 0;
  G.defeatedBosses = []; G.victory = false;
  G.startTime = Date.now();
  player.weaponLevel = 1; player.weaponType = "laser"; player.calibre = 0;
  showLevelIntro();
}

function showLevelIntro() {
  const level = LEVELS[G.levelIndex];
  $("intro-level-name").textContent = "NIVEAU " + level.id + " — " + level.name;
  $("intro-level-text").textContent = level.intro;
  const cast = $("intro-cast");
  cast.innerHTML = "";
  const castIds = [...new Set([...level.boss, ...level.roster])].slice(0, 4);
  for (const id of castIds) {
    const ch = CHARACTERS_BY_ID[id];
    const card = document.createElement("div");
    card.className = "cast-card";
    const cv = document.createElement("canvas");
    cv.width = 32; cv.height = 32;
    cv.getContext("2d").drawImage(SpriteFactory.get(ch).talk, 0, 0);
    const nameEl = document.createElement("div");
    nameEl.className = "cast-name";
    nameEl.textContent = ch.displayName;
    const lineEl = document.createElement("div");
    lineEl.className = "cast-line";
    lineEl.textContent = "« " + ch.introLine + " »";
    card.appendChild(cv); card.appendChild(nameEl); card.appendChild(lineEl);
    cast.appendChild(card);
  }
  Music.play("title");
  showScreen("screen-levelintro");
}

function beginLevel() {
  const level = LEVELS[G.levelIndex];
  bullets = []; shots = []; enemies = []; powerups = [];
  particles = []; texts = []; crystals = []; spawnQueue = [];
  G.plan = planLevel(level);
  G.waveIndex = 0;
  G.flow = { state: "wave", timer: 0 };
  player.x = GAME_W / 2; player.y = GAME_H - 110;
  player.cooldown = 0; player.invuln = 1;
  player.triple = 0; player.slowField = 0; player.shield = 0; player.intangible = 0;
  player.touchTarget = null;
  /* Le bonus spécial GROS CALIBRE est GARANTI une fois par épisode :
   * il tombe tôt, retombe s'il est raté, et est forcé avant le boss */
  G.specialTimer = rnd(5, 14);
  G.specialDropped = false;
  G.calibreCaught = false;
  spawnWave();
  showScreen(null);
  banner(["NIVEAU " + level.id, level.name], 2.2, "#7df0ff");
  if (G.levelIndex > 0) {
    toast("RYTHME +" + Math.round((paceMult() - 1) * 100) + "% !", "#ff9f1c", 2.2);
  }
  if (IS_TOUCH && G.levelIndex === 0) {
    toast("GLISSE TON DOIGT POUR PILOTER — TIR AUTOMATIQUE", "#7df0ff", 4);
  }
  AudioFX.ensure();
  /* Un thème 16-bit par famille politique du niveau */
  Music.play(LEVEL_THEMES[G.levelIndex] || "hall");
}

function onWaveCleared() {
  const level = LEVELS[G.levelIndex];
  if (G.waveIndex < level.waves - 1) {
    G.waveIndex++;
    G.flow = { state: "wave_break", timer: 1.0 };
  } else {
    G.flow = { state: "boss_incoming", timer: 2.0 };
    banner(["⚠ ALERTE BOSS ⚠"], 1.8, "#ff3355");
    AudioFX.alarm();
    /* Si le Gros Calibre de l'épisode n'est pas encore tombé, on le force */
    if (!G.specialDropped && !G.calibreCaught) G.specialTimer = 0.01;
  }
}

function onBossesDefeated() {
  const level = LEVELS[G.levelIndex];
  for (const id of level.boss) {
    const ch = CHARACTERS_BY_ID[id];
    G.defeatedBosses.push(ch.displayName);
    toast("« " + ch.defeatLine + " »", "#ffd166", 3);
  }
  confettiBurst(GAME_W / 2, 200, 60);
  AudioFX.fanfare();
  G.flow = { state: "level_clear", timer: 2.6 };
  banner(["ZONE DÉPROGRAMMÉE !"], 2.4, "#3ddc84");
}

function nextLevelOrVictory() {
  if (G.levelIndex >= LEVELS.length - 1) {
    endRun(true);
  } else {
    G.levelIndex++;
    showLevelIntro();
  }
}

function endRun(victory) {
  G.victory = victory;
  Music.stop();
  const duration = Math.floor((Date.now() - G.startTime) / 1000);
  G.runDuration = duration;
  if (victory) {
    $("v-score").textContent = G.score;
    $("v-name").value = localStorage.getItem("bdc_player_name") || "";
    showScreen("screen-victory");
    AudioFX.fanfare();
  } else {
    const sature = G.bourrage >= 100;
    $("go-title").textContent = sature ? "CERVEAU SATURÉ" : "NEURONE DÉSACTIVÉ";
    $("go-score").textContent = G.score;
    $("go-level").textContent = (G.levelIndex + 1) + " / " + LEVELS.length;
    $("go-orientation").textContent = computeOrientation();
    $("go-name").value = localStorage.getItem("bdc_player_name") || "";
    showScreen("screen-gameover");
    AudioFX.gameover();
  }
}

/* Orientation politique humoristique selon les influences subies */
function computeOrientation() {
  const entries = Object.entries(G.influences).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, e) => s + e[1], 0);
  if (total < 25) return "Abstentionniste premium";
  if (entries.length >= 2 && entries[1][1] >= entries[0][1] * 0.9) return "Confus mais très motivé";
  return ORIENTATIONS[entries[0][0]] || "Confus mais très motivé";
}

/* ============================ EFFETS VISUELS ============================ */
function banner(lines, dur, color) {
  G.banner = { lines, t: 0, dur: dur || 2, color: color || "#7df0ff" };
}
function toast(text, color, dur) {
  texts.push({ x: GAME_W / 2, y: GAME_H * 0.62, text, color: color || "#fff",
    t: 0, dur: dur || 1.6, vy: -18, size: 13, center: true });
}
function floatText(x, y, text, color, size) {
  texts.push({ x, y, text, color: color || "#fff", t: 0, dur: 1.1, vy: -40, size: size || 12, center: true });
}
function burst(x, y, color, n, speed) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = (Math.random() * 0.7 + 0.3) * (speed || 160);
    particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      t: 0, dur: Math.random() * 0.5 + 0.35, color, size: Math.random() * 4 + 2 });
  }
}
function confettiBurst(x, y, n) {
  const cols = ["#ff5fb0", "#7df0ff", "#ffd166", "#3ddc84", "#ffffff", "#b07df0"];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = Math.random() * 220 + 60;
    particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80,
      t: 0, dur: Math.random() * 0.9 + 0.6, color: cols[i % cols.length],
      size: Math.random() * 5 + 2, grav: true });
  }
}
/* Slogan brouillé : lettres mélangées qui s'éparpillent */
function scrambleSlogan(x, y, word) {
  const letters = word.replace(/\s/g, "").split("");
  for (let i = 0; i < Math.min(letters.length, 8); i++) {
    texts.push({ x: x + (Math.random() - 0.5) * 40, y: y + (Math.random() - 0.5) * 30,
      text: letters[Math.floor(Math.random() * letters.length)],
      color: "#9fb2dd", t: 0, dur: 0.8, vy: -60 - Math.random() * 60, size: 10, center: true });
  }
}

/* ============================ DÉPROGRAMMATION ============================ */
function deprogram(e, giveScore) {
  const idx = enemies.indexOf(e);
  if (idx >= 0) enemies.splice(idx, 1);

  burst(e.x, e.y, e.ch.colorPalette.suit, 14, 180);
  burst(e.x, e.y, e.ch.colorPalette.accent, 8, 120);
  confettiBurst(e.x, e.y, e.isBoss ? 40 : 10);
  scrambleSlogan(e.x, e.y, e.ch.attackLine);
  AudioFX.deprogram();

  if (giveScore) {
    G.combo = (G.comboTimer > 0) ? G.combo + 1 : 1;
    G.comboTimer = 2.0;
    const mult = 1 + 0.1 * Math.min(G.combo - 1, 10);
    const pts = Math.round(e.ch.scoreValue * mult);
    G.score += pts;
    floatText(e.x, e.y, "+" + pts + (G.combo > 1 ? "  COMBO ×" + G.combo : ""), "#ffd166");
  }

  /* Mécanique "revenants" (niveau 9) : il revient avec un bouclier de pixels */
  const level = LEVELS[G.levelIndex];
  if (!e.isBoss && level.mechanics.includes("revenants") && !e.revived && runRng() < 0.5) {
    const copy = makeEnemy(e.ch.id, e.slotX, e.slotY, false, 0);
    copy.revived = true;
    copy.hp = Math.max(1, Math.ceil(e.maxHp / 2));
    copy.maxHp = copy.hp;
    setTimeout(() => { if (G.screen === "playing" && G.flow.state !== "level_clear") enemies.push(copy); }, 1800);
  }

  /* Drop de power-up */
  if (!e.isBoss) {
    const chance = e.ch.enemyType === "elite" ? 0.4 : 0.12;
    if (runRng() < chance) dropPowerup(e.x, e.y);
  } else {
    dropPowerup(e.x - 25, e.y); dropPowerup(e.x + 25, e.y);
  }
}

function dropPowerup(x, y) {
  /* Tirage pondéré : les canons supplémentaires tombent plus souvent.
   * Le GROS CALIBRE n'est PAS dans ce tirage : il arrive une fois par
   * épisode, programmé par beginLevel(). */
  const pool = ["canon_plus", "canon_plus", "missiles", "pierce",
    "esprit_critique", "factcheck", "debat", "memoire", "second_degre", "abstention"];
  const type = pool[Math.floor(runRng() * pool.length)];
  powerups.push({ x, y, type, vy: 70, t: 0 });
}

function applyPowerup(p) {
  const def = POWERUP_TYPES[p.type];
  AudioFX.powerup();
  floatText(player.x, player.y - 30, def.name, def.color, 11);
  switch (p.type) {
    case "esprit_critique": player.triple = 8; break;
    case "factcheck":
      for (const s of shots) burst(s.x, s.y, "#ffd166", 3, 80);
      shots = [];
      break;
    case "debat": player.slowField = 6; break;
    case "memoire": player.shield = 3; break;
    case "second_degre":
      G.bourrage = Math.max(0, G.bourrage - 30);
      break;
    case "abstention": player.intangible = 4; break;
    case "canon_plus":
      if (player.weaponLevel < 4) {
        player.weaponLevel++;
        floatText(player.x, player.y - 45, player.weaponLevel + " CANONS !", "#7dff7d", 14);
      } else {
        G.score += 200;
        floatText(player.x, player.y - 45, "CANONS MAX +200", "#7dff7d", 12);
      }
      break;
    case "missiles":
      player.weaponType = "missiles";
      break;
    case "pierce":
      player.weaponType = "pierce";
      break;
    case "gros_calibre":
      player.calibre = 6;
      G.calibreCaught = true;
      G.shake = 0.6;
      confettiBurst(player.x, player.y, 40);
      banner(["LE GROS CALIBRE !!!", "FEU CONTINU — TOUT VA 2× PLUS VITE"], 2.2, "#ffb0c8");
      Music.stinger("calibre_catch");
      AudioFX.alarm();
      break;
  }
}

/* ============================ ARMEMENT DU JOUEUR ============================ */
function fireWeapon() {
  const offs = WEAPON_OFFSETS[Math.min(WEAPON_OFFSETS.length - 1, player.weaponLevel - 1)];
  switch (player.weaponType) {
    case "missiles":
      player.cooldown = 0.34;
      for (const o of offs) {
        bullets.push({ x: player.x + o, y: player.y - 14, vx: o * 6, vy: -340,
          homing: true, dmg: 2, life: 3, kind: "missile" });
      }
      AudioFX.tone(300, 0.12, "sawtooth", 0.04, -120);
      break;
    case "pierce":
      player.cooldown = 0.3;
      for (const o of offs) {
        bullets.push({ x: player.x + o, y: player.y - 16, vx: 0, vy: -400,
          pierce: 2, dmg: 1, kind: "pierce" });
      }
      AudioFX.tone(1200, 0.08, "square", 0.03, -700);
      break;
    default: /* laser */
      player.cooldown = 0.22;
      for (const o of offs) {
        bullets.push({ x: player.x + o, y: player.y - 16, vx: 0, vy: -460,
          dmg: 1, kind: "laser" });
      }
      AudioFX.shoot();
  }
  /* Esprit Critique : 2 tirs obliques en plus, quel que soit le canon */
  if (player.triple > 0) {
    bullets.push({ x: player.x, y: player.y - 16, vx: Math.sin(-0.25) * 460, vy: -Math.cos(0.25) * 460, dmg: 1, kind: "laser" });
    bullets.push({ x: player.x, y: player.y - 16, vx: Math.sin(0.25) * 460, vy: -Math.cos(0.25) * 460, dmg: 1, kind: "laser" });
  }
  /* Flash de départ sur chaque canon */
  for (const o of offs) burst(player.x + o, player.y - 18, "#9ff5ff", 2, 60);
}

/* ============================ DÉGÂTS AU JOUEUR ============================ */
function hitPlayerWithShot(s) {
  if (player.intangible > 0 || player.invuln > 0) return;
  if (player.shield > 0) {
    player.shield--;
    floatText(player.x, player.y - 25, "BOUCLIER !", "#3ddc84");
    AudioFX.enemyHit();
    return;
  }
  const ch = s.src;
  G.bourrage = Math.min(100, G.bourrage + 8 * G.diff.bourrage);
  addInfluence(s.family, ch ? ch.influenceValue * 0.5 : 3);
  G.dodgeTimer = 0; G.bourrageFlash = 0.35;
  player.invuln = 0.6;
  AudioFX.playerHit();
  floatText(player.x, player.y - 25, s.word + " !", "#ff5fb0", 10);
  if (G.bourrage >= 100) endRun(false);
}

function hitPlayerWithBody(e) {
  if (player.intangible > 0 || player.invuln > 0) { return; }
  if (player.shield > 0) {
    player.shield--;
    floatText(player.x, player.y - 25, "BOUCLIER !", "#3ddc84");
    deprogram(e, false);
    return;
  }
  G.lives--;
  player.weaponLevel = Math.max(1, player.weaponLevel - 1); // on perd un canon
  G.bourrage = Math.min(100, G.bourrage + 15 * G.diff.bourrage);
  addInfluence(e.ch.family, e.ch.influenceValue);
  G.dodgeTimer = 0; G.bourrageFlash = 0.5;
  player.invuln = 1.5;
  G.shake = 0.4;
  AudioFX.playerHit();
  floatText(player.x, player.y - 30, "INFLUENCE " + (FAMILY_INFO[e.ch.family] || {}).label, "#ff3355", 10);
  if (!e.isBoss) deprogram(e, false);
  if (G.lives <= 0 || G.bourrage >= 100) endRun(false);
}

function addInfluence(family, amount) {
  if (!family) return;
  G.influences[family] = (G.influences[family] || 0) + amount;
}

/* ============================ TIR ENNEMI ============================ */
/* Choisit la phrase projetée : punchline du personnage (75%) ou
 * vocabulaire d'ambiance du niveau (25%) */
function pickWord(e) {
  const level = LEVELS[G.levelIndex];
  const pl = e.ch.punchlines;
  if (pl && pl.length && runRng() < 0.75) return pl[Math.floor(runRng() * pl.length)];
  return level.wordPool[Math.floor(runRng() * level.wordPool.length)];
}

function enemyFire(e) {
  const level = LEVELS[G.levelIndex];
  const word = pickWord(e);
  const fam = e.ch.family;
  const col = (FAMILY_INFO[fam] || {}).color || "#fff";
  let baseSpeed = 150 * G.diff.fire * paceMult() * (level.mechanics.includes("fast_shots") ? 1.4 : 1);
  if (player.slowField > 0) baseSpeed *= 0.5;
  e.state = "talk"; e.stateTimer = 0.4;
  burst(e.x, e.y + e.r * 0.5, col, 4, 80); // flash de bouche

  const mk = (vx, vy) => shots.push({ x: e.x, y: e.y + e.r * 0.6, vx, vy, word, family: fam, color: col, src: e.ch, r: 9, t: 0 });
  const aim = () => {
    const dx = player.x - e.x, dy = player.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    mk(dx / d * baseSpeed, dy / d * baseSpeed);
  };
  switch (e.fireMode) {
    case "aimed": aim(); break;
    case "straight": mk(0, baseSpeed); break;
    case "spread":
      for (const a of [-0.35, 0, 0.35]) mk(Math.sin(a) * baseSpeed, Math.cos(a) * baseSpeed);
      break;
    case "rain": mk(rnd(-40, 40), baseSpeed * rnd(0.8, 1.3)); break;
    default: aim();
  }
}

/* Tirs de boss, selon la phase */
function bossFire(e) {
  const level = LEVELS[G.levelIndex];
  const ratio = e.hp / e.maxHp;
  if (e.ch.id === "larcher") { larcherLogic(e); return; }
  const phase = ratio > 0.66 ? 0 : ratio > 0.33 ? 1 : 2;
  if (phase !== e.bossPhase) {
    e.bossPhase = phase;
    if (phase > 0) {
      toast("« " + e.ch.attackLine + " »", "#ff9f1c", 2);
      AudioFX.alarm();
    }
  }
  const word = pickWord(e);
  const col = (FAMILY_INFO[e.ch.family] || {}).color || "#fff";
  let sp = 160 * G.diff.fire * paceMult();
  if (player.slowField > 0) sp *= 0.5;
  burst(e.x, e.y + e.r * 0.5, col, 6, 110); // flash de bouche du boss
  const mk = (vx, vy) => shots.push({ x: e.x, y: e.y + e.r * 0.7, vx, vy, word, family: e.ch.family, color: col, src: e.ch, r: 9, t: 0 });
  const aimAt = (spread) => {
    const dx = player.x - e.x, dy = player.y - e.y;
    const base = Math.atan2(dy, dx);
    mk(Math.cos(base + spread) * sp, Math.sin(base + spread) * sp);
  };
  if (phase === 0) { aimAt(0); }
  else if (phase === 1) { aimAt(-0.3); aimAt(0); aimAt(0.3); }
  else { aimAt(-0.5); aimAt(-0.25); aimAt(0); aimAt(0.25); aimAt(0.5); }
  if (level.mechanics.includes("screen_shake")) G.shake = Math.max(G.shake, 0.15);
  e.state = "talk"; e.stateTimer = 0.4;
}

/* Le boss final et ses 4 phases */
function larcherLogic(e) {
  const ratio = e.hp / e.maxHp;
  const phase = ratio > 0.75 ? 0 : ratio > 0.5 ? 1 : ratio > 0.25 ? 2 : 3;
  if (phase !== e.bossPhase) {
    e.bossPhase = phase;
    const ph = LARCHER_PHASES[phase];
    banner([ph.name], 2.4, "#c8a040");
    toast("« " + ph.line + " »", "#ffd166", 3);
    AudioFX.alarm();
    if (phase === 3) spawnCrystals();
  }
  const words = {
    0: ["PUPITRE", "MARTEAU DE SÉANCE", "AMENDEMENT"],
    1: ["PLATEAU", "NAPPE", "CLOCHE D'ARGENT", "BUFFET"],
    2: ["PROTOCOLE", "SYSTÈME", "RÉSEAU"],
    3: ["DISCOURS", "SATURATION", "MOTION FINALE"]
  }[phase];
  const word = (e.ch.punchlines.length && runRng() < 0.3)
    ? e.ch.punchlines[Math.floor(runRng() * e.ch.punchlines.length)]
    : words[Math.floor(runRng() * words.length)];
  let sp = 150 * G.diff.fire * paceMult();
  if (player.slowField > 0) sp *= 0.5;
  burst(e.x + rnd(-50, 50), e.y + 60, "#c8a040", 6, 110);
  const mk = (vx, vy) => shots.push({ x: e.x + rnd(-60, 60), y: e.y + 70, vx, vy, word, family: e.ch.family, color: "#c8a040", src: e.ch, r: 10, t: 0 });
  const aim = (spread) => {
    const dx = player.x - e.x, dy = player.y - e.y;
    const base = Math.atan2(dy, dx);
    mk(Math.cos(base + spread) * sp, Math.sin(base + spread) * sp);
  };
  if (phase === 0) { mk(-30, sp); mk(0, sp); mk(30, sp); }
  else if (phase === 1) { aim(-0.4); aim(0); aim(0.4); }
  else if (phase === 2) { aim(0); }
  else { aim(-0.2); aim(0.2); }
  e.state = "talk"; e.stateTimer = 0.5;
}

/* ============================ MISE À JOUR ============================ */
function update(dt) {
  /* GROS CALIBRE actif : le timer s'écoule en temps réel,
   * mais TOUT LE JEU tourne en vitesse ×2 */
  if (player.calibre > 0) {
    player.calibre -= dt;
    dt *= 2;
  }
  G.time += dt;
  const level = LEVELS[G.levelIndex];

  /* Largage du bonus spécial de l'épisode (garanti tant qu'il n'est pas pris) */
  if (!G.specialDropped && !G.calibreCaught) {
    G.specialTimer -= dt;
    if (G.specialTimer <= 0) {
      G.specialDropped = true;
      powerups.push({ x: rnd(60, GAME_W - 60), y: -30, type: "gros_calibre", vy: 45, t: 0, special: true });
      toast("⚠ LE GROS CALIBRE APPROCHE ⚠", "#ffb0c8", 2.5);
      Music.stinger("calibre");
      AudioFX.powerup();
    }
  }

  /* --- Timers globaux --- */
  if (G.banner) { G.banner.t += dt; if (G.banner.t > G.banner.dur) G.banner = null; }
  if (G.shake > 0) G.shake = Math.max(0, G.shake - dt);
  if (G.bourrageFlash > 0) G.bourrageFlash -= dt;
  if (G.comboTimer > 0) { G.comboTimer -= dt; if (G.comboTimer <= 0) G.combo = 0; }

  /* Bonus d'esquive "Esprit critique" */
  G.dodgeTimer += dt;
  if (G.dodgeTimer >= 12) {
    G.dodgeTimer = 0;
    G.score += 150;
    floatText(player.x, player.y - 40, "ESPRIT CRITIQUE +150", "#7df0ff");
  }

  /* --- Joueur : timers de pouvoirs --- */
  player.cooldown -= dt;
  player.invuln -= dt;
  if (player.triple > 0) player.triple -= dt;
  if (player.slowField > 0) player.slowField -= dt;
  if (player.intangible > 0) player.intangible -= dt;

  /* --- Déplacement joueur --- */
  let mvx = 0, mvy = 0;
  if (Input.left) mvx -= 1;
  if (Input.right) mvx += 1;
  if (Input.up) mvy -= 1;
  if (Input.down) mvy += 1;
  let speed = player.speed;
  if (level.mechanics.includes("player_slow")) speed *= 0.75;
  if (level.mechanics.includes("pink_fog")) speed *= 0.85;
  if (mvx || mvy) {
    const d = Math.hypot(mvx, mvy);
    player.x += mvx / d * speed * dt;
    player.y += mvy / d * speed * dt;
    player.touchTarget = null;
  } else if (player.touchTarget) {
    /* Suivi du doigt : lissage exponentiel, réactif sans téléportation */
    const k = Math.min(1, dt * 11);
    player.x += (player.touchTarget.x - player.x) * k;
    player.y += (player.touchTarget.y - player.y) * k;
  }
  player.x = Math.max(18, Math.min(GAME_W - 18, player.x));
  player.y = Math.max(GAME_H * 0.45, Math.min(GAME_H - 30, player.y));

  /* --- Tir joueur --- */
  if (player.calibre > 0) {
    /* FEU CONTINU : méga-rafales qui transpercent tout */
    if (player.cooldown <= 0) {
      player.cooldown = 0.07;
      bullets.push({ x: player.x, y: player.y - 20, vx: 0, vy: -720,
        dmg: 5, pierce: 99, kind: "mega" });
      burst(player.x, player.y - 22, "#ffb0c8", 3, 90);
      AudioFX.tone(160 + Math.random() * 80, 0.08, "sawtooth", 0.05, -60);
    }
  } else {
    const wantFire = Input.fire || G.autoFire || player.touchFiring;
    if (wantFire && player.cooldown <= 0) fireWeapon();
  }

  /* --- File de spawn --- */
  for (const q of spawnQueue) q.delay -= dt;
  while (spawnQueue.length && spawnQueue[0].delay <= 0) {
    const q = spawnQueue.shift();
    enemies.push(makeEnemy(q.charId, q.slotX, q.slotY, false, 0));
  }

  /* --- Ennemis --- */
  const slowMult = player.slowField > 0 ? 0.5 : 1;
  for (const e of enemies) {
    e.t += dt * slowMult;
    if (e.stateTimer > 0) { e.stateTimer -= dt; if (e.stateTimer <= 0 && e.state !== "attack") e.state = "idle"; }

    if (e.entryT < 1) {
      /* Trajectoire d'entrée : interpolation avec petite ondulation */
      e.entryT = Math.min(1, e.entryT + dt * slowMult / e.entryDur);
      const k = 1 - Math.pow(1 - e.entryT, 3); // ease-out cubic
      const wob = Math.sin(e.entryT * Math.PI * 2 + e.phase) * 24 * (1 - e.entryT);
      e.x = e.sx + (e.slotX - e.sx) * k + wob;
      e.y = e.sy + (e.slotY - e.sy) * k;
    } else if (e.diving) {
      /* Piqué kamikaze */
      e.diveT += dt;
      e.state = "attack";
      const dx = e.diveTx - e.x, dy = e.diveTy - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const sp = 320 * e.speed * slowMult;
      e.x += dx / d * sp * dt;
      e.y += dy / d * sp * dt;
      if (e.y > e.diveTy - 10 || e.diveT > 2.5) {
        e.diving = false; e.state = "idle";
        e.diveTimer = rnd(4, 10);
      }
    } else if (e.isBoss) {
      const t = e.t;
      if (e.ch.id === "larcher") {
        e.x = GAME_W / 2 + Math.sin(t * 0.3) * 40;
        e.y = 120 + Math.sin(t * 0.8) * 10;
      } else {
        e.x = e.slotX + Math.sin(t * 0.55 * e.speed + e.phase) * 130 * (G.plan.bossDir);
        e.y = e.slotY + Math.sin(t * 0.9 + e.phase) * 28;
        if (G.plan.bossDash && Math.sin(t * 0.4 + e.phase) > 0.96) {
          e.y += 120 * dt * 4; // petite avancée menaçante
        }
      }
    } else {
      /* Patterns de vol — paramétrés par le seed du run */
      const t = e.t - e.entryDur;
      switch (e.pattern) {
        case "sine":
          e.x = e.slotX + Math.sin(t * e.freq + e.phase) * e.amp;
          e.y = e.slotY + Math.sin(t * 2 + e.phase) * 10;
          break;
        case "zigzag": {
          const period = 2 / e.freq;
          const saw = (t % period) / period;
          const tri = saw < 0.5 ? saw * 2 : 2 - saw * 2;
          e.x = e.slotX + (tri - 0.5) * 2 * e.amp;
          e.y = e.slotY + Math.min(160, t * 9);
          break;
        }
        case "swoop":
          e.x = e.slotX + Math.sin(t * e.freq + e.phase) * e.amp;
          e.y = e.slotY + Math.sin(t * e.freq * 2 + e.phase) * e.amp * 0.4;
          break;
        case "orbit": {
          const cx = e.slotX + Math.sin(t * 0.3 + e.phase) * 30;
          const cy = e.slotY + Math.min(120, t * 6);
          e.x = cx + Math.cos(t * e.freq + e.phase) * e.amp * 0.7;
          e.y = cy + Math.sin(t * e.freq + e.phase) * e.amp * 0.45;
          break;
        }
        case "steps": {
          const stepTime = 1.2 / e.freq;
          const stepIdx = Math.floor(t / stepTime);
          const dir = (stepIdx % 2 === 0) ? 1 : -1;
          const frac = Math.min(1, (t % stepTime) / (stepTime * 0.3));
          e.x = e.slotX + dir * e.amp * (frac - 0.5) * 2 * 0.5
              + Math.sin(e.phase) * 10;
          e.y = e.slotY + Math.min(180, stepIdx * 14);
          break;
        }
        case "dive":
          e.x = e.slotX + Math.sin(t * e.freq + e.phase) * e.amp;
          e.y = e.slotY + Math.sin(t * 1.4 + e.phase) * 14;
          break;
      }
      /* Déclenchement de piqué kamikaze */
      e.diveTimer -= dt;
      if (e.diveTimer <= 0 && !e.diving) {
        e.diving = true; e.diveT = 0;
        e.diveTx = player.x; e.diveTy = GAME_H - 60;
        toast("« " + e.ch.attackLine + " »", "#ff9f1c", 1.4);
      }
      e.x = Math.max(20, Math.min(GAME_W - 20, e.x));
    }

    /* Tir */
    e.fireTimer -= dt * slowMult;
    if (e.fireTimer <= 0 && e.entryT >= 1) {
      e.fireTimer = (e.isBoss ? rnd(0.8, 1.4) : rnd(1.8, 4.0)) / (G.diff.fire * level.fireRateMult * paceMult());
      if (e.isBoss) bossFire(e); else enemyFire(e);
    }

    /* Larcher : invocations et drain */
    if (e.isBoss && e.ch.id === "larcher" && e.bossPhase === 2) {
      e.minionTimer -= dt;
      const minionCount = enemies.filter(x => !x.isBoss).length;
      if (e.minionTimer <= 0 && minionCount < 5) {
        e.minionTimer = 3.5;
        spawnMinion();
      }
    }
    if (e.isBoss && e.ch.id === "larcher" && e.bossPhase === 3) {
      if (crystals.length > 0) {
        G.bourrage = Math.min(100, G.bourrage + 3 * dt * G.diff.bourrage);
        if (G.bourrage >= 100) { endRun(false); return; }
      } else {
        e.crystalTimer -= dt;
        if (e.crystalTimer <= 0) { e.crystalTimer = 12; spawnCrystals(); }
      }
    }
  }

  /* --- Cristaux de discours --- */
  for (const cr of crystals) cr.t += dt;

  /* --- Balles du joueur --- */
  for (const b of bullets) {
    if (b.homing) {
      /* Missile fact-checkeur : vise l'ennemi (ou le cristal) le plus proche */
      let best = null, bd = Infinity;
      for (const e of enemies) {
        const d = (e.x - b.x) ** 2 + (e.y - b.y) ** 2;
        if (d < bd) { bd = d; best = e; }
      }
      if (!best) for (const cr of crystals) {
        const d = (cr.x - b.x) ** 2 + (cr.y - b.y) ** 2;
        if (d < bd) { bd = d; best = cr; }
      }
      if (best) {
        const want = Math.atan2(best.y - b.y, best.x - b.x);
        const cur = Math.atan2(b.vy, b.vx);
        let diff = want - cur;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const maxTurn = 5 * dt;
        const ang = cur + Math.max(-maxTurn, Math.min(maxTurn, diff));
        const sp = Math.hypot(b.vx, b.vy);
        b.vx = Math.cos(ang) * sp; b.vy = Math.sin(ang) * sp;
      }
      if (b.life !== undefined) { b.life -= dt; if (b.life <= 0) b.dead = true; }
      /* Traînée de fumée */
      if (Math.random() < 0.6) particles.push({ x: b.x, y: b.y, vx: 0, vy: 40,
        t: 0, dur: 0.3, color: "#ff9f1c", size: 2 });
    }
    b.x += b.vx * dt; b.y += b.vy * dt;
  }
  bullets = bullets.filter(b => !b.dead && b.y > -30 && b.y < GAME_H + 30 && b.x > -30 && b.x < GAME_W + 30);

  /* --- Projectiles ennemis --- */
  const shotSlow = player.slowField > 0 ? 0.5 : 1;
  for (const s of shots) { s.t += dt; s.x += s.vx * dt * shotSlow; s.y += s.vy * dt * shotSlow; }
  shots = shots.filter(s => s.y < GAME_H + 30 && s.y > -30 && s.x > -60 && s.x < GAME_W + 60);

  /* --- Power-ups --- */
  for (const p of powerups) { p.t += dt; p.y += p.vy * dt; }
  /* Gros Calibre raté ? Il reviendra : garanti une fois par épisode */
  for (const p of powerups) {
    if (p.type === "gros_calibre" && p.y >= GAME_H + 20 && !G.calibreCaught) {
      G.specialDropped = false;
      G.specialTimer = 7;
      toast("LE GROS CALIBRE REVIENDRA...", "#ffb0c8", 1.8);
    }
  }
  powerups = powerups.filter(p => p.y < GAME_H + 20);

  /* --- Particules / textes --- */
  for (const pa of particles) {
    pa.t += dt; pa.x += pa.vx * dt; pa.y += pa.vy * dt;
    if (pa.grav) pa.vy += 300 * dt;
  }
  particles = particles.filter(pa => pa.t < pa.dur);
  for (const tx of texts) { tx.t += dt; tx.y += tx.vy * dt; }
  texts = texts.filter(tx => tx.t < tx.dur);

  /* --- Collisions : balles → ennemis / cristaux --- */
  for (const b of bullets) {
    let consumed = false;
    for (const e of enemies) {
      if (b.hitSet && b.hitSet.indexOf(e) >= 0) continue; // déjà transpercé
      const dx = b.x - e.x, dy = b.y - e.y;
      if (dx * dx + dy * dy < e.r * e.r) {
        e.hp -= (b.dmg || 1);
        if (e.state !== "attack") { e.state = "hit"; e.stateTimer = 0.15; }
        const impactCol = b.kind === "mega" ? "#ffb0c8" : b.kind === "pierce" ? "#ff5fff" : "#7df0ff";
        burst(b.x, b.y, impactCol, b.kind === "mega" ? 8 : 3, b.kind === "mega" ? 160 : 90);
        AudioFX.enemyHit();
        if (e.hp <= 0) {
          deprogram(e, true);
          if (e.isBoss && !enemies.some(x => x.isBoss)) onBossesDefeated();
        }
        if (b.pierce && b.pierce > 0) {
          b.pierce--;
          (b.hitSet = b.hitSet || []).push(e);
        } else {
          consumed = true;
        }
        break;
      }
    }
    if (!consumed) {
      for (const cr of crystals) {
        const dx = b.x - cr.x, dy = b.y - cr.y;
        if (dx * dx + dy * dy < cr.r * cr.r) {
          cr.hp -= (b.dmg || 1);
          burst(b.x, b.y, "#c8a040", 3, 90);
          AudioFX.enemyHit();
          if (!(b.pierce && b.pierce-- > 0)) consumed = true;
          if (cr.hp <= 0) {
            crystals.splice(crystals.indexOf(cr), 1);
            burst(cr.x, cr.y, "#c8a040", 16, 160);
            floatText(cr.x, cr.y, "DISCOURS BRISÉ +100", "#ffd166");
            G.score += 100;
          }
          break;
        }
      }
    }
    if (consumed) b.dead = true;
  }
  bullets = bullets.filter(b => !b.dead);

  /* --- Collisions : projectiles ennemis → joueur --- */
  for (const s of shots) {
    const dx = s.x - player.x, dy = s.y - player.y;
    const rr = (s.r + 10);
    if (dx * dx + dy * dy < rr * rr) {
      s.dead = true;
      hitPlayerWithShot(s);
      if (G.screen !== "playing") return;
    }
  }
  shots = shots.filter(s => !s.dead);

  /* --- Collisions : corps ennemi → joueur --- */
  for (const e of enemies) {
    const dx = e.x - player.x, dy = e.y - player.y;
    const rr = e.r * 0.8 + player.r;
    if (dx * dx + dy * dy < rr * rr) {
      hitPlayerWithBody(e);
      if (G.screen !== "playing") return;
    }
  }

  /* --- Collisions : power-ups → joueur --- */
  for (const p of powerups) {
    const dx = p.x - player.x, dy = p.y - player.y;
    if (dx * dx + dy * dy < 28 * 28) { p.dead = true; applyPowerup(p); }
  }
  powerups = powerups.filter(p => !p.dead);

  /* --- Progression du niveau --- */
  if (G.flow.state === "wave") {
    if (enemies.length === 0 && spawnQueue.length === 0) onWaveCleared();
  } else if (G.flow.state === "wave_break") {
    G.flow.timer -= dt;
    if (G.flow.timer <= 0) { G.flow.state = "wave"; spawnWave(); }
  } else if (G.flow.state === "boss_incoming") {
    G.flow.timer -= dt;
    if (G.flow.timer <= 0) { G.flow.state = "boss"; spawnBosses(); }
  } else if (G.flow.state === "boss") {
    /* géré par onBossesDefeated */
  } else if (G.flow.state === "level_clear") {
    G.flow.timer -= dt;
    if (G.flow.timer <= 0) nextLevelOrVictory();
  }

  /* --- Fond --- */
  for (const st of stars) { st.y += st.v * dt; if (st.y > GAME_H) { st.y = -3; st.x = Math.random() * GAME_W; } }
  for (const br of brains) { br.y += br.v * dt; if (br.y > GAME_H + br.r) { br.y = -br.r; br.x = Math.random() * GAME_W; } }

  updateHud();
}

/* ============================ HUD DOM ============================ */
function updateHud() {
  $("hud-score").textContent = "SCORE " + G.score;
  $("hud-level").textContent = "NIV " + (G.levelIndex + 1) + "·V" + (G.waveIndex + 1);
  $("hud-lives").textContent = "❤".repeat(Math.max(0, G.lives));
  $("bourrage-fill").style.width = G.bourrage.toFixed(0) + "%";
  const entries = Object.entries(G.influences).sort((a, b) => b[1] - a[1]);
  const el = $("hud-influence");
  if (entries.length === 0) { el.textContent = "esprit intact"; el.style.color = "#6f7fa8"; }
  else {
    const fam = FAMILY_INFO[entries[0][0]];
    el.textContent = "⚠ " + (fam ? fam.label : entries[0][0]);
    el.style.color = fam ? fam.color : "#fff";
  }
}

/* ============================ RENDU ============================ */
function render() {
  const level = LEVELS[Math.min(G.levelIndex, LEVELS.length - 1)];
  ctx.save();
  if (G.shake > 0) ctx.translate((Math.random() - 0.5) * 10 * G.shake, (Math.random() - 0.5) * 10 * G.shake);

  /* Fond dégradé du niveau */
  const grad = ctx.createLinearGradient(0, 0, 0, GAME_H);
  grad.addColorStop(0, level.bg.top);
  grad.addColorStop(1, level.bg.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(-10, -10, GAME_W + 20, GAME_H + 20);

  /* Cerveaux flottants + synapses */
  for (const br of brains) {
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = "#ff9ad5";
    ctx.beginPath(); ctx.arc(br.x, br.y, br.r, 0, 7); ctx.fill();
    ctx.strokeStyle = "#ff9ad5"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(br.x - br.r, br.y);
    ctx.quadraticCurveTo(br.x, br.y - br.r * 0.8, br.x + br.r, br.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  /* Étoiles */
  ctx.fillStyle = "#cfe0ff";
  for (const st of stars) { ctx.globalAlpha = 0.4 + (st.s / 2.5) * 0.5; ctx.fillRect(st.x, st.y, st.s, st.s); }
  ctx.globalAlpha = 1;

  /* Lianes (niveau 8) */
  if (level.mechanics.includes("vines") && G.screen === "playing") {
    ctx.strokeStyle = "rgba(61,220,132,0.35)"; ctx.lineWidth = 4;
    for (const side of [12, GAME_W - 12]) {
      ctx.beginPath();
      for (let y = 0; y < GAME_H; y += 8) {
        const x = side + Math.sin(y * 0.02 + G.time * 1.2 + side) * 10;
        if (y === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  if (G.screen === "playing") {
    drawCrystals();
    drawEnemies();
    drawShots();
    drawBullets();
    drawPowerups();
    drawPlayer();

    /* Halo sous le doigt (interface tactile) */
    if (pointerIndicator.active) {
      ctx.strokeStyle = "rgba(125,240,255,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pointerIndicator.x, pointerIndicator.y, 24 + Math.sin(G.time * 8) * 3, 0, 7);
      ctx.stroke();
    }
  }

  /* Particules */
  for (const pa of particles) {
    ctx.globalAlpha = 1 - pa.t / pa.dur;
    ctx.fillStyle = pa.color;
    ctx.fillRect(pa.x, pa.y, pa.size, pa.size);
  }
  ctx.globalAlpha = 1;

  /* Textes flottants */
  for (const tx of texts) {
    ctx.globalAlpha = Math.min(1, 2 - 2 * tx.t / tx.dur);
    ctx.fillStyle = tx.color;
    ctx.font = "bold " + tx.size + "px 'Courier New', monospace";
    ctx.textAlign = tx.center ? "center" : "left";
    ctx.fillText(tx.text, tx.x, tx.y);
  }
  ctx.globalAlpha = 1;

  /* Brouillard rose (niveau 7) */
  if (level.mechanics.includes("pink_fog") && G.screen === "playing") {
    ctx.fillStyle = "rgba(255,126,182,0.13)";
    ctx.fillRect(0, 0, GAME_W, GAME_H);
  }

  /* Mode GROS CALIBRE : bords roses pulsants + compteur */
  if (player.calibre > 0 && G.screen === "playing") {
    const a = 0.12 + Math.sin(G.time * 10) * 0.06;
    ctx.fillStyle = "rgba(255,126,182," + a + ")";
    ctx.fillRect(0, 0, GAME_W, 8); ctx.fillRect(0, GAME_H - 8, GAME_W, 8);
    ctx.fillRect(0, 0, 8, GAME_H); ctx.fillRect(GAME_W - 8, 0, 8, GAME_H);
    ctx.fillStyle = "#ffb0c8";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("GROS CALIBRE ×2 — " + player.calibre.toFixed(1) + "s", GAME_W / 2, GAME_H - 16);
  }

  /* Flash de bourrage */
  if (G.bourrageFlash > 0) {
    ctx.fillStyle = "rgba(255,45,122," + (G.bourrageFlash * 0.5) + ")";
    ctx.fillRect(0, 0, GAME_W, GAME_H);
  }

  /* Barre de vie des boss */
  if (G.screen === "playing") {
    const bosses = enemies.filter(e => e.isBoss);
    if (bosses.length) {
      const hp = bosses.reduce((s, b) => s + b.hp, 0);
      const max = bosses.reduce((s, b) => s + b.maxHp, 0);
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(40, 88, GAME_W - 80, 14);
      ctx.fillStyle = "#ff3355";
      ctx.fillRect(42, 90, (GAME_W - 84) * Math.max(0, hp / max), 10);
      ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 2;
      ctx.strokeRect(40, 88, GAME_W - 80, 14);
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 10px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText(level.bossTitle, GAME_W / 2, 84);
    }
    /* Combo */
    if (G.combo > 1) {
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 16px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("COMBO ×" + G.combo, GAME_W / 2, 124);
    }
  }

  /* Bannière centrale */
  if (G.banner) {
    const a = Math.min(1, 3 * (1 - Math.abs(2 * G.banner.t / G.banner.dur - 1)));
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = G.banner.color;
    ctx.textAlign = "center";
    G.banner.lines.forEach((line, i) => {
      ctx.font = "bold " + (i === 0 ? 24 : 17) + "px 'Courier New', monospace";
      ctx.fillText(line, GAME_W / 2, GAME_H * 0.4 + i * 30);
    });
    ctx.globalAlpha = 1;
  }

  ctx.restore();
}

function drawEnemies() {
  for (const e of enemies) {
    const sprites = SpriteFactory.get(e.ch);
    const spr = sprites[e.state] || sprites.idle;
    const bob = Math.sin(G.time * 3 + e.phase) * 3;
    const size = 32 * e.scale;
    ctx.drawImage(spr, e.x - size / 2, e.y - size / 2 + bob, size, size);
    /* Mini barre de vie pour élites et plus */
    if (!e.isBoss && e.maxHp > 4 && e.hp < e.maxHp) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(e.x - 16, e.y - size / 2 - 6 + bob, 32, 4);
      ctx.fillStyle = "#3ddc84";
      ctx.fillRect(e.x - 16, e.y - size / 2 - 6 + bob, 32 * e.hp / e.maxHp, 4);
    }
    if (e.revived) { // halo des revenants
      ctx.strokeStyle = "rgba(255,215,0,0.5)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(e.x, e.y + bob, e.r, 0, 7); ctx.stroke();
    }
  }
}

function drawShots() {
  ctx.textAlign = "center";
  for (const s of shots) {
    /* Traînée lumineuse derrière le projectile */
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = s.color;
    ctx.beginPath(); ctx.arc(s.x - s.vx * 0.03, s.y - s.vy * 0.03, 5, 0, 7); ctx.fill();
    ctx.globalAlpha = 0.08;
    ctx.beginPath(); ctx.arc(s.x - s.vx * 0.06, s.y - s.vy * 0.06, 6, 0, 7); ctx.fill();
    /* Halo + noyau */
    ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.arc(s.x, s.y, 9, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, 7); ctx.fill();
    /* La punchline "pop" : grosse au départ, puis se stabilise */
    const popSize = 9 + Math.max(0, 0.3 - (s.t || 0)) * 26;
    ctx.globalAlpha = 0.9;
    ctx.font = "bold " + popSize.toFixed(0) + "px 'Courier New', monospace";
    ctx.fillText(s.word, s.x, s.y - 9);
    ctx.globalAlpha = 1;
  }
}

function drawBullets() {
  for (const b of bullets) {
    switch (b.kind) {
      case "mega": /* GROS CALIBRE : grosse salve rose qui rase tout */
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#ffb0c8";
        ctx.fillRect(b.x - 9, b.y - 18, 18, 34);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#ff7eb6";
        ctx.fillRect(b.x - 5, b.y - 14, 10, 26);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(b.x - 2, b.y - 10, 4, 16);
        break;
      case "missile":
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(b.x - 3, b.y - 8, 6, 12);
        ctx.fillStyle = "#ff9f1c";
        ctx.fillRect(b.x - 2, b.y + 4, 4, 5 + Math.random() * 4);
        break;
      case "pierce":
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = "#ff5fff";
        ctx.fillRect(b.x - 4, b.y - 14, 8, 24);
        ctx.globalAlpha = 1;
        ctx.fillRect(b.x - 2, b.y - 11, 4, 18);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(b.x - 1, b.y - 8, 2, 12);
        break;
      default: /* laser */
        ctx.fillStyle = "#7df0ff";
        ctx.fillRect(b.x - 2, b.y - 7, 4, 12);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(b.x - 1, b.y - 5, 2, 5);
    }
  }
}

function drawPowerups() {
  for (const p of powerups) {
    const def = POWERUP_TYPES[p.type];
    const bob = Math.sin(p.t * 5) * 3;

    if (p.type === "gros_calibre") {
      /* LE GROS CALIBRE : fusée phallique pixel-art assumée, rose bonbon,
       * qui descend majestueusement avec son halo. Cartoon, zéro réalisme. */
      const x = p.x, y = p.y + bob;
      ctx.globalAlpha = 0.25 + Math.sin(p.t * 7) * 0.1;
      ctx.fillStyle = "#ffb0c8";
      ctx.beginPath(); ctx.arc(x, y, 30, 0, 7); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ff9ec4";
      ctx.fillRect(x - 6, y - 20, 12, 30);            // le fût
      ctx.beginPath(); ctx.arc(x, y - 20, 7, Math.PI, 0); ctx.fill(); // l'ogive arrondie
      ctx.beginPath(); ctx.arc(x - 9, y + 12, 7, 0, 7); ctx.fill();   // réservoir gauche
      ctx.beginPath(); ctx.arc(x + 9, y + 12, 7, 0, 7); ctx.fill();   // réservoir droit
      ctx.fillStyle = "#ff7eb6";
      ctx.fillRect(x - 6, y - 4, 12, 3);              // liseré décoratif
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x - 2, y - 24, 2, 4);              // reflet cartoon
      /* Étincelles d'escorte */
      if (Math.random() < 0.4) particles.push({ x: x + rnd(-18, 18), y: y + rnd(-22, 18),
        vx: 0, vy: -20, t: 0, dur: 0.4, color: "#ffd9e8", size: 2 });
      ctx.fillStyle = "#ffb0c8";
      ctx.font = "bold 9px 'Courier New', monospace";
      ctx.textAlign = "center";
      ctx.fillText("GROS CALIBRE", x, y + 32);
      continue;
    }

    /* Halo pulsant pour tous les bonus */
    ctx.globalAlpha = 0.18 + Math.sin(p.t * 6) * 0.08;
    ctx.fillStyle = def.color;
    ctx.beginPath(); ctx.arc(p.x, p.y + bob, 19, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(5,5,25,0.8)";
    ctx.fillRect(p.x - 12, p.y - 12 + bob, 24, 24);
    ctx.strokeStyle = def.color; ctx.lineWidth = 2;
    ctx.strokeRect(p.x - 12, p.y - 12 + bob, 24, 24);
    ctx.fillStyle = def.color;
    ctx.font = "bold 11px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText(def.sym, p.x, p.y + 4 + bob);
  }
}

function drawCrystals() {
  for (const cr of crystals) {
    const bob = Math.sin(cr.t * 3) * 4;
    ctx.save();
    ctx.translate(cr.x, cr.y + bob);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = "rgba(200,160,64,0.85)";
    ctx.fillRect(-12, -12, 24, 24);
    ctx.strokeStyle = "#ffd166"; ctx.lineWidth = 2;
    ctx.strokeRect(-12, -12, 24, 24);
    ctx.restore();
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 8px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("DISCOURS", cr.x, cr.y + bob - 18);
  }
}

function drawPlayer() {
  const px = player.x, py = player.y;
  const blink = player.invuln > 0 && Math.floor(G.time * 12) % 2 === 0;
  if (blink) return;
  ctx.save();
  if (player.intangible > 0) ctx.globalAlpha = 0.45;

  /* Flamme du réacteur */
  const fl = Math.random() * 6;
  ctx.fillStyle = "#ff9f1c";
  ctx.fillRect(px - 3, py + 12, 6, 8 + fl);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(px - 1, py + 12, 2, 5 + fl * 0.6);

  /* Coque du vaisseau-neurone */
  ctx.fillStyle = "#45c8e8";
  ctx.fillRect(px - 14, py + 2, 28, 10);
  ctx.fillRect(px - 18, py + 6, 36, 6);

  /* Les canons visibles (1 à 4 selon le niveau d'armement) */
  const offs = WEAPON_OFFSETS[Math.min(WEAPON_OFFSETS.length - 1, player.weaponLevel - 1)];
  const cannonCol = player.weaponType === "missiles" ? "#ff9f1c"
    : player.weaponType === "pierce" ? "#ff5fff" : "#9ff5ff";
  ctx.fillStyle = cannonCol;
  for (const o of offs) ctx.fillRect(px + o - 2, py - 16, 4, 8);

  /* Aura du GROS CALIBRE : le vaisseau irradie de rose */
  if (player.calibre > 0) {
    ctx.globalAlpha = 0.3 + Math.sin(G.time * 14) * 0.15;
    ctx.fillStyle = "#ffb0c8";
    ctx.beginPath(); ctx.arc(px, py, 30, 0, 7); ctx.fill();
    ctx.globalAlpha = player.intangible > 0 ? 0.45 : 1;
  }
  /* Dôme */
  ctx.fillStyle = "#9ff5ff";
  ctx.beginPath(); ctx.arc(px, py - 2, 11, Math.PI, 0); ctx.fill();
  /* Le cerveau (rose, avec circonvolutions) */
  ctx.fillStyle = "#ff9ad5";
  ctx.beginPath(); ctx.arc(px, py - 3, 7, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = "#e060a8"; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(px - 5, py - 4); ctx.quadraticCurveTo(px - 1, py - 9, px + 2, py - 4);
  ctx.moveTo(px, py - 5); ctx.quadraticCurveTo(px + 3, py - 8, px + 5, py - 4);
  ctx.stroke();

  /* Bouclier mémoire historique */
  if (player.shield > 0) {
    ctx.strokeStyle = "rgba(61,220,132,0.8)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(px, py, 22 + Math.sin(G.time * 6) * 2, 0, 7); ctx.stroke();
    ctx.fillStyle = "#3ddc84";
    ctx.font = "bold 9px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("×" + player.shield, px + 24, py - 18);
  }
  /* Aura tir triple */
  if (player.triple > 0) {
    ctx.fillStyle = "rgba(125,240,255,0.6)";
    ctx.fillRect(px - 22, py + 4, 4, 6);
    ctx.fillRect(px + 18, py + 4, 4, 6);
  }
  ctx.restore();
}

/* ============================ ENTRÉES ============================ */
const Input = { left: false, right: false, up: false, down: false, fire: false };

const KEYMAP = {
  arrowleft: "left", q: "left", a: "left",
  arrowright: "right", d: "right",
  arrowup: "up", z: "up", w: "up",
  arrowdown: "down", s: "down",
  " ": "fire"
};

window.addEventListener("keydown", (ev) => {
  if (document.activeElement && document.activeElement.tagName === "INPUT") return;
  const k = ev.key.toLowerCase();
  if (KEYMAP[k]) { Input[KEYMAP[k]] = true; ev.preventDefault(); }
  if (k === "p") togglePause();
  if (k === "m") toggleMute();
});
window.addEventListener("keyup", (ev) => {
  const k = ev.key.toLowerCase();
  if (KEYMAP[k]) Input[KEYMAP[k]] = false;
});

/* Tactile / souris : déplacement au doigt + tir maintenu */
function canvasPos(ev) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (ev.clientX - r.left) / r.width * GAME_W,
    y: (ev.clientY - r.top) / r.height * GAME_H
  };
}
/* Le vaisseau vole 90 px AU-DESSUS du doigt pour ne jamais être masqué */
const TOUCH_OFFSET_Y = 90;
const pointerIndicator = { x: 0, y: 0, active: false };

function setTouchTarget(ev) {
  const p = canvasPos(ev);
  pointerIndicator.x = p.x; pointerIndicator.y = p.y;
  player.touchTarget = {
    x: p.x,
    y: Math.max(GAME_H * 0.45, Math.min(GAME_H - 30, p.y - TOUCH_OFFSET_Y))
  };
}
canvas.addEventListener("pointerdown", (ev) => {
  AudioFX.ensure();
  if (G.screen !== "playing" || G.paused) return;
  ev.preventDefault();
  setTouchTarget(ev);
  player.touchFiring = true;
  pointerIndicator.active = true;
  canvas.setPointerCapture(ev.pointerId);
});
canvas.addEventListener("pointermove", (ev) => {
  if (G.screen !== "playing" || G.paused || !player.touchFiring) return;
  ev.preventDefault();
  setTouchTarget(ev);
});
canvas.addEventListener("pointerup", () => { player.touchFiring = false; pointerIndicator.active = false; });
canvas.addEventListener("pointercancel", () => { player.touchFiring = false; pointerIndicator.active = false; });

/* ============================ PAUSE / MUTE ============================ */
function togglePause() {
  if (G.screen !== "playing") return;
  G.paused = !G.paused;
  Music.setPaused(G.paused);
  $("screen-pause").classList.toggle("hidden", !G.paused);
}
function toggleMute() {
  AudioFX.muted = !AudioFX.muted;
  Music.setMuted(AudioFX.muted);
  $("btn-mute").textContent = AudioFX.muted ? "✕" : "♪";
  $("btn-mute").classList.toggle("active", AudioFX.muted);
}

/* ============================ LEADERBOARD UI ============================ */
let lbPeriod = "global";
function showLeaderboard(period) {
  lbPeriod = period || "global";
  document.querySelectorAll(".lb-tab").forEach(b =>
    b.classList.toggle("active", b.dataset.period === lbPeriod));
  const list = Leaderboard.getTop(lbPeriod, 100);
  const wrap = $("lb-list");
  wrap.innerHTML = "";
  if (list.length === 0) {
    wrap.innerHTML = '<div class="lb-empty">Aucun score. Le cerveau collectif est vide.</div>';
  } else {
    list.forEach((e, i) => {
      const row = document.createElement("div");
      row.className = "lb-row" + (i === 0 ? " top1" : "");
      row.innerHTML =
        '<span class="lb-rank">' + (i + 1) + '</span>' +
        '<span class="lb-name">' + escapeHtml(e.name) +
        '<small>NIV ' + e.levelReached + " · " + escapeHtml(e.finalOrientation) + "</small></span>" +
        '<span class="lb-score">' + e.score + "</span>";
      wrap.appendChild(row);
    });
  }
  showScreen("screen-leaderboard");
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function saveScore(nameInputId) {
  const name = $(nameInputId).value;
  try { localStorage.setItem("bdc_player_name", name); } catch (_) {}
  Leaderboard.addEntry({
    name,
    score: G.score,
    levelReached: G.levelIndex + 1,
    finalOrientation: G.victory ? "RÉVOLUTIONNAIRE" : computeOrientation(),
    duration: G.runDuration || 1,
    defeatedBosses: G.defeatedBosses,
    mode: G.diff.key
  });
  showLeaderboard("global");
}

/* ============================ BRANCHEMENT DES BOUTONS ============================ */
$("btn-start").addEventListener("click", () => { AudioFX.ensure(); Music.play("title"); showScreen("screen-difficulty"); });
$("btn-leaderboard").addEventListener("click", () => showLeaderboard("global"));
$("btn-credits").addEventListener("click", () => showScreen("screen-credits"));
$("btn-credits-back").addEventListener("click", () => showScreen("screen-title"));
$("btn-fullscreen").addEventListener("click", () => {
  const el = document.getElementById("game-container");
  if (el.requestFullscreen) el.requestFullscreen();
});
$("btn-diff-back").addEventListener("click", () => showScreen("screen-title"));
document.querySelectorAll(".btn-diff").forEach(b =>
  b.addEventListener("click", () => { AudioFX.ensure(); startRun(b.dataset.diff); }));
$("btn-go").addEventListener("click", () => beginLevel());
$("btn-resume").addEventListener("click", () => togglePause());
$("btn-quit").addEventListener("click", () => {
  G.paused = false;
  Music.setPaused(false);
  Music.play("title");
  $("screen-pause").classList.add("hidden");
  showScreen("screen-title");
});
$("btn-pause").addEventListener("click", () => togglePause());
$("btn-autofire").addEventListener("click", () => {
  G.autoFire = !G.autoFire;
  $("btn-autofire").classList.toggle("active", G.autoFire);
});
$("btn-mute").addEventListener("click", () => toggleMute());
$("btn-save-score").addEventListener("click", () => saveScore("go-name"));
$("btn-save-victory").addEventListener("click", () => saveScore("v-name"));
$("btn-go-menu").addEventListener("click", () => showScreen("screen-title"));
$("btn-v-menu").addEventListener("click", () => showScreen("screen-title"));
$("btn-lb-back").addEventListener("click", () => showScreen("screen-title"));
document.querySelectorAll(".lb-tab").forEach(b =>
  b.addEventListener("click", () => showLeaderboard(b.dataset.period)));

/* ============================ BOUCLE PRINCIPALE ============================ */
let lastTs = 0;
function frame(ts) {
  const dt = Math.min(0.033, (ts - lastTs) / 1000 || 0.016);
  lastTs = ts;
  if (G.screen === "playing" && !G.paused) update(dt);
  else {
    // le fond continue de vivre derrière les menus
    G.time += dt;
    for (const st of stars) { st.y += st.v * dt * 0.4; if (st.y > GAME_H) { st.y = -3; st.x = Math.random() * GAME_W; } }
    for (const br of brains) { br.y += br.v * dt * 0.4; if (br.y > GAME_H + br.r) { br.y = -br.r; br.x = Math.random() * GAME_W; } }
  }
  render();
  requestAnimationFrame(frame);
}

/* La musique démarre automatiquement au tout premier geste (clic, touche,
 * doigt) — les navigateurs interdisent l'audio avant une interaction. */
function unlockAudio() {
  AudioFX.ensure();
  if (G.screen !== "playing") Music.play("title");
}
if (document.addEventListener) {
  document.addEventListener("pointerdown", unlockAudio, { once: true });
  document.addEventListener("keydown", unlockAudio, { once: true });
  document.addEventListener("touchstart", unlockAudio, { once: true });
}

initBackground();
showScreen("screen-title");
requestAnimationFrame(frame);
