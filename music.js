/* =========================================================================
 * BOURRAGE DE CRÂNE : MODE RÉVOLUTION — music.js
 * Moteur de musique chiptune "16-bit" 100% WebAudio, zéro fichier audio.
 *
 * UN THÈME PAR FAMILLE POLITIQUE :
 *  - hall       : niveau 1, arcade d'accueil
 *  - corporate  : Start-up Nation, électro d'entreprise pimpante
 *  - conserva   : droite conservatrice, marche martiale à caisse claire
 *  - breaking   : plateau TV, tension de bandeau "breaking news"
 *  - punk       : gauche radicale, riff rapide à la croche
 *  - rouge      : cantine rouge, hymne ouvrier solennel
 *  - rose       : marais socialiste, groove mou et nostalgique
 *  - forest     : écologie, pentatonique aérienne
 *  - retro      : revenants, synthwave à basse en octaves
 *  - final      : LE SÉNAT — fanfare pompeuse, cuivres sawtooth + accords
 *  - boss       : thème de boss commun, martelé
 *  - title      : menus
 *
 * Style SNES : lead double oscillateur désaccordé + écho, basse triangle,
 * batterie en bruit filtré, accords "cuivres" optionnels par thème.
 * Le tempo suit l'accélérateur de rythme du jeu et DOUBLE pendant le
 * GROS CALIBRE. Music.stinger("calibre") joue le jingle du bonus.
 * ========================================================================= */
"use strict";

const Music = (() => {

  let ctx = null, master = null, delaySend = null;
  let noiseBuf = null;
  let theme = null, themeName = null;
  let step = 0, nextTime = 0, timerId = null;
  let muted = false, paused = false;

  /* Fréquence d'une note MIDI */
  const F = (m) => 440 * Math.pow(2, (m - 69) / 12);

  /* ----------------------------------------------------------------------
   * Thèmes : bass/drums/chords sur 16 pas, lead sur 32 pas.
   * 0 = silence. Drums : k = kick, s = snare, h = hi-hat, . = rien.
   * leadType : forme d'onde du lead (square par défaut, sawtooth = cuivres).
   * ---------------------------------------------------------------------- */
  const THEMES = {
    title: {
      bpm: 104,
      bass: [45,0,0,45, 48,0,0,48, 43,0,0,43, 50,0,48,47],
      lead: [69,0,72,74, 76,0,74,72, 69,0,67,69, 72,0,0,0,
             69,0,72,74, 76,0,79,76, 74,0,72,67, 69,0,0,0],
      drums: "k.h.s.h.k.h.s.h."
    },
    hall: {
      bpm: 116,
      bass: [40,0,40,0, 43,0,43,0, 45,0,45,0, 43,0,38,0],
      lead: [64,0,67,0, 71,69,67,64, 0,62,64,67, 64,0,0,0,
             64,0,67,0, 71,69,67,71, 74,0,71,69, 67,0,64,0],
      drums: "k.h.s.h.k.h.s.hh"
    },
    corporate: { /* électro start-up : majeur pimpant, arpèges, 4 temps au sol */
      bpm: 128,
      bass: [36,0,43,0, 36,0,43,0, 41,0,48,0, 43,0,47,0],
      lead: [60,64,67,72, 67,64,60,64, 65,69,72,77, 72,69,65,69,
             60,64,67,72, 67,64,62,65, 71,67,62,67, 72,0,0,0],
      drums: "k.hhk.hhk.hhk.hh"
    },
    conserva: { /* marche traditionnelle, caisse claire au pas */
      bpm: 116,
      bass: [43,0,43,0, 38,0,38,0, 36,0,36,0, 38,0,43,0],
      lead: [67,0,67,0, 71,0,74,71, 67,0,69,67, 66,0,62,0,
             67,0,67,0, 71,0,74,76, 74,0,71,69, 67,0,0,0],
      drums: "k.s.k.s.k.s.k.ss"
    },
    breaking: { /* bandeau d'alerte permanent : tension chromatique */
      bpm: 138,
      bass: [38,0,38,38, 0,38,0,37, 38,0,38,38, 0,40,0,41],
      lead: [62,0,0,62, 63,0,62,0, 0,65,0,62, 63,62,0,0,
             62,0,0,62, 63,0,67,0, 65,0,63,0, 62,0,0,0],
      drums: "k.h.s.hhk.h.s.hh"
    },
    punk: { /* gauche radicale : riff à la croche, tempo énervé */
      bpm: 168,
      bass: [40,40,40,40, 43,43,43,43, 45,45,45,45, 43,43,41,41],
      lead: [64,0,64,64, 0,64,67,0, 69,0,69,69, 0,67,65,0,
             64,0,64,64, 0,64,67,69, 71,69,67,65, 64,0,0,0],
      drums: "k.s.k.s.k.s.k.s."
    },
    rouge: { /* hymne ouvrier solennel, temps forts appuyés */
      bpm: 108,
      bass: [36,0,0,36, 39,0,0,39, 41,0,0,41, 43,0,39,36],
      lead: [60,0,63,0, 65,0,67,0, 68,0,67,65, 63,0,60,0,
             60,0,63,0, 65,0,70,68, 67,0,65,63, 60,0,0,0],
      drums: "k...s...k...s.hh",
      chords: [[60,63,67],0,0,0, [63,67,70],0,0,0, [65,68,72],0,0,0, [67,70,74],0,0,0]
    },
    rose: { /* marais socialiste : groove mou, nostalgique */
      bpm: 96,
      bass: [41,0,0,0, 45,0,0,0, 38,0,0,0, 43,0,0,0],
      lead: [65,0,69,0, 72,0,69,65, 0,67,0,65, 62,0,0,0,
             65,0,69,0, 72,0,74,72, 69,0,67,65, 65,0,0,0],
      drums: "k..h.s.h..k..s.h"
    },
    forest: { /* écologie : pentatonique aérienne, percussions discrètes */
      bpm: 102,
      bass: [45,0,0,0, 43,0,0,0, 40,0,0,0, 43,0,45,0],
      lead: [69,0,72,0, 74,0,76,0, 79,0,76,74, 72,0,69,0,
             69,0,72,0, 74,0,79,0, 76,0,74,72, 69,0,0,0],
      drums: "..h...h.k.h...h."
    },
    retro: { /* revenants : synthwave, basse en octaves */
      bpm: 118,
      bass: [45,57,45,57, 45,57,45,57, 41,53,41,53, 43,55,43,55],
      lead: [69,0,0,72, 0,0,71,0, 69,0,67,0, 64,0,67,69,
             69,0,0,72, 0,0,76,0, 74,0,72,0, 71,0,69,0],
      drums: "k.h.s.h.k.h.s.h.",
      leadType: "sawtooth"
    },
    boss: {
      bpm: 148,
      bass: [38,38,0,38, 38,38,0,38, 36,36,0,36, 41,0,40,0],
      lead: [62,0,63,62, 0,62,65,0, 62,0,63,62, 0,69,68,65,
             62,0,63,62, 0,62,65,0, 70,0,69,68, 65,0,62,0],
      drums: "k.k.s.k.k.k.s.kh"
    },
    final: { /* LA FANFARE POMPEUSE DU SÉNAT : cuivres, accords, timbales */
      bpm: 104,
      bass: [33,0,33,33, 36,0,36,0, 38,0,38,38, 31,0,33,0],
      lead: [69,0,69,69, 0,69,73,0, 74,0,73,71, 69,0,66,0,
             69,0,69,69, 0,73,76,0, 78,0,76,73, 69,0,0,0],
      drums: "k...k...k..ks.ss",
      leadType: "sawtooth",
      chords: [[57,61,64],0,0,0, [55,59,62],0,0,0, [54,57,62],0,0,0, [55,59,62],0,0,0]
    }
  };

  /* ----------------------------------------------------------------------
   * Initialisation paresseuse (après un geste utilisateur)
   * ---------------------------------------------------------------------- */
  function ensure() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    if (typeof AudioFX !== "undefined") {
      AudioFX.ensure();
      ctx = AudioFX.ctx;
    }
    if (!ctx) ctx = new AC();

    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);

    /* Écho façon SNES */
    const delay = ctx.createDelay(0.5);
    delay.delayTime.value = 0.21;
    const fb = ctx.createGain(); fb.gain.value = 0.25;
    const wet = ctx.createGain(); wet.gain.value = 0.16;
    delay.connect(fb); fb.connect(delay);
    delay.connect(wet); wet.connect(master);
    delaySend = delay;

    /* Buffer de bruit blanc pour la batterie */
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    return true;
  }

  /* ----------------------------------------------------------------------
   * Instruments
   * ---------------------------------------------------------------------- */
  function bassNote(t, midi, dur) {
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = F(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.085, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function leadNote(t, midi, dur, type) {
    /* Deux oscillateurs désaccordés = chorus 16-bit */
    for (const det of [-6, 6]) {
      const o = ctx.createOscillator();
      o.type = type || "square";
      o.frequency.value = F(midi);
      o.detune.value = det;
      const g = ctx.createGain();
      g.gain.setValueAtTime(type === "sawtooth" ? 0.026 : 0.030, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(master); g.connect(delaySend);
      o.start(t); o.stop(t + dur + 0.05);
    }
  }

  function chordNotes(t, midis, dur) {
    /* "Cuivres" : triade sawtooth douce, pour la pompe institutionnelle */
    for (const m of midis) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = F(m);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.016, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + dur + 0.05);
    }
  }

  function drum(t, kind) {
    if (kind === "k") {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(130, t);
      o.frequency.exponentialRampToValueAtTime(38, t + 0.1);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.15);
    } else {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = kind === "h" ? 6500 : 1800;
      const g = ctx.createGain();
      const vol = kind === "h" ? 0.05 : 0.12;
      const dur = kind === "h" ? 0.04 : 0.09;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      src.connect(f); f.connect(g); g.connect(master);
      src.start(t); src.stop(t + dur + 0.02);
    }
  }

  /* ----------------------------------------------------------------------
   * Séquenceur (lookahead)
   * ---------------------------------------------------------------------- */
  function currentBpm() {
    let mult = 1;
    if (typeof paceMult === "function") mult *= paceMult();
    if (typeof player !== "undefined" && player.calibre > 0) mult *= 2;
    return theme.bpm * Math.min(2.6, mult);
  }

  function scheduleStep(s, t) {
    const stepDur = 60 / currentBpm() / 4;
    const b = theme.bass[s % theme.bass.length];
    if (b) bassNote(t, b, stepDur * 1.8);
    const l = theme.lead[s % theme.lead.length];
    if (l) leadNote(t, l, stepDur * 1.6, theme.leadType);
    if (theme.chords) {
      const c = theme.chords[s % theme.chords.length];
      if (c) chordNotes(t, c, stepDur * 3.6);
    }
    const d = theme.drums[s % theme.drums.length];
    if (d && d !== ".") drum(t, d);
  }

  function tick() {
    if (!theme || muted || paused) return;
    const stepDur = 60 / currentBpm() / 4;
    while (nextTime < ctx.currentTime + 0.15) {
      scheduleStep(step, nextTime);
      nextTime += stepDur;
      step = (step + 1) % 32;
    }
  }

  /* ----------------------------------------------------------------------
   * Stingers : jingles courts par-dessus la musique
   * ---------------------------------------------------------------------- */
  const STINGERS = {
    /* L'arrivée du GROS CALIBRE : montée triomphale et goguenarde */
    calibre:       [62, 66, 69, 74, 78],
    /* Le GROS CALIBRE est attrapé : descente surpuissante */
    calibre_catch: [86, 81, 78, 74, 69, 62]
  };

  function stinger(name) {
    if (!ensure() || muted) return;
    const notes = STINGERS[name];
    if (!notes) return;
    const t0 = ctx.currentTime + 0.02;
    notes.forEach((m, i) => {
      const t = t0 + i * 0.09;
      for (const det of [-8, 8]) {
        const o = ctx.createOscillator();
        o.type = "square";
        o.frequency.value = F(m);
        o.detune.value = det;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.05, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        o.connect(g); g.connect(master); g.connect(delaySend);
        o.start(t); o.stop(t + 0.25);
      }
    });
  }

  /* ----------------------------------------------------------------------
   * API publique
   * ---------------------------------------------------------------------- */
  function play(name) {
    if (!ensure()) return;
    /* iOS/Android : le contexte audio peut être suspendu jusqu'à un geste */
    if (ctx.state === "suspended") ctx.resume();
    if (themeName === name && timerId) return;
    theme = THEMES[name];
    themeName = name;
    if (!theme) return;
    step = 0;
    nextTime = ctx.currentTime + 0.06;
    if (!timerId) timerId = setInterval(tick, 40);
  }

  function stop() {
    theme = null; themeName = null;
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  function setMuted(m) {
    muted = m;
    if (master) master.gain.value = m ? 0 : 0.55;
    if (!m && theme && ctx) nextTime = ctx.currentTime + 0.06;
  }

  function setPaused(p) {
    paused = p;
    if (master) master.gain.value = (p || muted) ? 0 : 0.55;
    if (!p && theme && ctx) nextTime = ctx.currentTime + 0.06;
  }

  return { play, stop, setMuted, setPaused, stinger };
})();
