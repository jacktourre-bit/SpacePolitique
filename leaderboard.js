/* =========================================================================
 * BOURRAGE DE CRÂNE : MODE RÉVOLUTION
 * leaderboard.js — Classement local (MVP localStorage).
 *
 * En production : remplacer par l'API décrite dans leaderboard-api.md
 * (Supabase / REST). L'interface publique reste identique.
 * ========================================================================= */
"use strict";

const Leaderboard = (() => {

  const STORAGE_KEY = "bdc_leaderboard_v1";
  const MAX_ENTRIES = 100;
  const MAX_NAME_LEN = 12;
  const SALT = "neurone-libre-2026";

  /* Filtre anti-insultes très simple (MVP). En production : liste serveur. */
  const BANNED_WORDS = [
    "con", "connard", "connasse", "pute", "putain", "salope", "salaud",
    "encule", "enculé", "merde", "fdp", "ntm", "batard", "bâtard",
    "bite", "couille", "nique", "niquer", "pd", "nazi", "hitler"
  ];

  /* Normalise le leet-speak (c0nn4rd → connard) avant le filtrage */
  const LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" };

  function sanitizeName(raw) {
    let name = String(raw || "").trim().slice(0, MAX_NAME_LEN);
    if (!name) name = "NEURONE";
    const lower = name.toLowerCase()
      .replace(/[01345 7@$]/g, ch => LEET[ch] || "")
      .replace(/[^a-zà-ÿ]/gi, "");
    for (const w of BANNED_WORDS) {
      if (lower.includes(w)) return "CENSURÉ";
    }
    return name;
  }

  /* Signature locale très simple (anti-bidouille naïve, pas une vraie sécurité) */
  function hashString(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    }
    return (h >>> 0).toString(36);
  }

  function signEntry(e) {
    return hashString(SALT + "|" + e.name + "|" + e.score + "|" + e.date);
  }

  /* Anti-triche MVP : score plausible par rapport à la durée de partie */
  function isPlausible(entry) {
    if (typeof entry.score !== "number" || entry.score < 0) return false;
    const seconds = Math.max(1, entry.duration || 1);
    const maxPlausible = seconds * 400 + 5000;
    return entry.score <= maxPlausible;
  }

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (_) {
      return [];
    }
  }

  function saveAll(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) { /* stockage plein ou désactivé : on ignore */ }
  }

  /**
   * Ajoute une partie au classement.
   * @param {object} data {name, score, levelReached, finalOrientation,
   *                       duration, defeatedBosses, mode}
   * @returns {object|null} l'entrée enregistrée
   */
  function addEntry(data) {
    const entry = {
      name: sanitizeName(data.name),
      score: Math.max(0, Math.floor(data.score || 0)),
      levelReached: data.levelReached || 1,
      finalOrientation: data.finalOrientation || "Inconnu",
      date: new Date().toISOString(),
      duration: Math.floor(data.duration || 0),
      defeatedBosses: data.defeatedBosses || [],
      mode: data.mode || "normal"
    };
    if (!isPlausible(entry)) return null;
    entry.sig = signEntry(entry);

    const list = loadAll();
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    saveAll(list.slice(0, MAX_ENTRIES * 3)); // marge pour les filtres par période
    return entry;
  }

  /**
   * Top des scores filtré par période.
   * @param {"global"|"month"|"week"|"day"} period
   * @param {number} limit
   */
  function getTop(period, limit) {
    limit = limit || MAX_ENTRIES;
    const now = Date.now();
    const spans = {
      day: 24 * 3600 * 1000,
      week: 7 * 24 * 3600 * 1000,
      month: 30 * 24 * 3600 * 1000
    };
    let list = loadAll().filter(e => e.sig === signEntry(e)); // entrées intègres
    if (period && period !== "global" && spans[period]) {
      list = list.filter(e => now - Date.parse(e.date) <= spans[period]);
    }
    return list.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  function clearAll() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  return { addEntry, getTop, sanitizeName, clearAll, MAX_NAME_LEN };
})();
