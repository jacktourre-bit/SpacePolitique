/* =========================================================================
 * BOURRAGE DE CRÂNE : MODE RÉVOLUTION — progress.js
 * Progression sauvegardée (niveaux débloqués), médailles et meilleur score.
 * Stockage localStorage. Interface stable pour une future synchro serveur.
 * ========================================================================= */
"use strict";

const Progress = (() => {

  const K_UNLOCK = "bdc_unlocked";   // plus haut niveau débloqué (1..10)
  const K_MEDALS = "bdc_medals";     // { medalId: true }
  const K_BEST   = "bdc_best";       // meilleur score global
  const K_HAPT   = "bdc_haptics";    // "0" = vibrations off

  /* Catalogue des médailles (trophées) */
  const MEDALS = {
    pacifiste:     { emoji: "🕊️", name: "Pacifiste",        desc: "Finir un niveau sans perdre de vie" },
    intouchable:   { emoji: "✨", name: "Intouchable",      desc: "Finir un niveau sans la moindre égratignure" },
    tireur:        { emoji: "🎯", name: "Tireur d'élite",   desc: "80% de précision sur un niveau" },
    tribun:        { emoji: "🔥", name: "Combo de tribun",  desc: "Atteindre un combo ×10" },
    calibre:       { emoji: "🍆", name: "Calibré",          desc: "Attraper le Gros Calibre" },
    arsenal:       { emoji: "🔫", name: "Arsenal complet",  desc: "Atteindre les 4 canons" },
    senat:         { emoji: "🏛️", name: "Briseur de Sénat", desc: "Vaincre Gérard Larcher" },
    revolution:    { emoji: "🚩", name: "Révolutionnaire",  desc: "Terminer toute la campagne" }
  };

  function getUnlocked() {
    const n = parseInt(localStorage.getItem(K_UNLOCK), 10);
    return (n >= 1 && n <= 10) ? n : 1;
  }
  function unlockLevel(n) {
    n = Math.max(1, Math.min(10, n));
    if (n > getUnlocked()) {
      try { localStorage.setItem(K_UNLOCK, String(n)); } catch (_) {}
    }
  }

  function getMedals() {
    try { return JSON.parse(localStorage.getItem(K_MEDALS)) || {}; }
    catch (_) { return {}; }
  }
  function hasMedal(id) { return !!getMedals()[id]; }
  /* Renvoie true si la médaille est NOUVELLE (première obtention) */
  function awardMedal(id) {
    if (!MEDALS[id]) return false;
    const m = getMedals();
    if (m[id]) return false;
    m[id] = true;
    try { localStorage.setItem(K_MEDALS, JSON.stringify(m)); } catch (_) {}
    return true;
  }

  function getBest() { return parseInt(localStorage.getItem(K_BEST), 10) || 0; }
  function setBest(s) {
    if (s > getBest()) { try { localStorage.setItem(K_BEST, String(s)); } catch (_) {} }
  }

  function getHaptics() { return localStorage.getItem(K_HAPT) !== "0"; }
  function setHaptics(on) { try { localStorage.setItem(K_HAPT, on ? "1" : "0"); } catch (_) {} }

  function resetAll() {
    [K_UNLOCK, K_MEDALS, K_BEST].forEach(k => { try { localStorage.removeItem(k); } catch (_) {} });
  }

  return { MEDALS, getUnlocked, unlockLevel, getMedals, hasMedal, awardMedal,
    getBest, setBest, getHaptics, setHaptics, resetAll };
})();
