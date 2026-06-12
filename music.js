/* =========================================================================
 * BOURRAGE DE CRÂNE : MODE RÉVOLUTION — music.js
 * Moteur de musique chiptune "16-bit" 100% WebAudio, zéro fichier audio.
 *
 * Style SNES : lead à deux oscillateurs carrés légèrement désaccordés
 * (effet chorus) + écho, basse triangle, batterie en bruit blanc filtré.
 * Le tempo suit l'accélérateur de rythme du jeu (paceMult) et DOUBLE
 * pendant le GROS CALIBRE.
 *
 * API : Music.play(name) / Music.stop() / Music.setMuted(b) / Music.setPaused(b)
 * Thèmes : "title", "levelA", "levelB", "levelC", "boss", "final"
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
   * Thèmes : bass/drums sur 16 pas, lead sur 32 pas (doubles-croches).
   * 0 = silence. Drums : k = kick, s = snare, h = hi-hat, . = rien.
   * ---------------------------------------------------------------------- */
  const THEMES = {
    title: {
      bpm: 104,
      bass: [45,0,0,45, 48,0,0,48, 43,0,0,43, 50,0,48,47],
      lead: [69,0,72,74, 76,0,74,72, 69,0,67,69, 72,0,0,0,
             69,0,72,74, 76,0,79,76, 74,0,72,67, 69,0,0,0],
      drums: "k.h.s.h.k.h.s.h."
    },
    levelA: {
      bpm: 120,
      bass: [40,0,40,0, 43,0,43,0, 45,0,45,0, 43,0,38,0],
      lead: [64,0,67,0, 71,69,67,64, 0,62,64,67, 64,0,0,0,
             64,0,67,0, 71,69,67,71, 74,0,71,69, 67,0,64,0],
      drums: "k.h.s.h.k.h.s.hh"
    },
    levelB: {
      bpm: 126,
      bass: [36,0,36,36, 39,0,39,0, 41,0,41,0, 43,0,39,38],
      lead: [60,0,63,65, 67,0,65,63, 60,0,63,0, 65,63,62,60,
             60,0,63,65, 67,0,70,67, 65,0,63,62, 60,0,0,0],
      drums: "k.hhs.h.k.hhs.h."
    },
    levelC: {
      bpm: 122,
      bass: [38,0,45,0, 38,0,45,0, 41,0,48,0, 43,0,45,0],
      lead: [62,0,65,69, 0,67,65,62, 64,0,62,64, 65,0,0,0,
             62,0,65,69, 0,72,70,69, 67,65,64,62, 62,0,0,0],
      drums: "k.h.s.h.kkh.s.h."
    },
    boss: {
      bpm: 148,
      bass: [38,38,0,38, 38,38,0,38, 36,36,0,36, 41,0,40,0],
      lead: [62,0,63,62, 0,62,65,0, 62,0,63,62, 0,69,68,65,
             62,0,63,62, 0,62,65,0, 70,0,69,68, 65,0,62,0],
      drums: "k.k.s.k.k.k.s.kh"
    },
    final: {
      bpm: 100,
      bass: [33,0,33,0, 36,0,33,0, 31,0,31,0, 38,0,36,0],
      lead: [57,0,0,60, 64,0,63,60, 57,0,0,55, 57,0,0,0,
             57,0,0,60, 64,0,67,66, 63,0,60,63, 57,0,0,0],
      drums: "k...s...k..ks..h"
    }
  };

  /* ----------------------------------------------------------------------
   * Initialisation paresseuse (après un geste utilisateur)
   * ---------------------------------------------------------------------- */
  function ensure() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    /* Réutilise le contexte des bruitages si disponible */
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

  function leadNote(t, midi, dur) {
    /* Deux carrés désaccordés = chorus 16-bit */
    for (const det of [-6, 6]) {
      const o = ctx.createOscillator();
      o.type = "square";
      o.frequency.value = F(midi);
      o.detune.value = det;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.030, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(master); g.connect(delaySend);
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
    /* Suit l'accélérateur de rythme du jeu et le GROS CALIBRE */
    if (typeof paceMult === "function") mult *= paceMult();
    if (typeof player !== "undefined" && player.calibre > 0) mult *= 2;
    return theme.bpm * Math.min(2.6, mult);
  }

  function scheduleStep(s, t) {
    const stepDur = 60 / currentBpm() / 4;
    const b = theme.bass[s % theme.bass.length];
    if (b) bassNote(t, b, stepDur * 1.8);
    const l = theme.lead[s % theme.lead.length];
    if (l) leadNote(t, l, stepDur * 1.6);
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
   * API publique
   * ---------------------------------------------------------------------- */
  function play(name) {
    if (!ensure()) return;
    if (themeName === name && timerId) return; // déjà en cours
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

  return { play, stop, setMuted, setPaused };
})();
