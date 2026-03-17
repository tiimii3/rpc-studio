const { invoke } = window.__TAURI__.core;

const DRAFT_KEY = "rpc-draft";
const PROFILES_KEY = "rpc-profiles";
const QUICK_SLOTS_KEY = "rpc-quick-slots";
const LANG_KEY = "rpc-language";
const AUTO_APPLY_KEY = "rpc-auto-apply-launch";
const STARTUP_SOURCE_KEY = "rpc-startup-source";
const LAST_ACTIVE_PROFILE_KEY = "rpc-last-active-profile";
const LAST_ACTIVE_PROFILES_KEY = "rpc-last-active-profiles";
// Update these URLs if you publish from a different GitHub repository.
const RELEASES_LATEST_API = "https://api.github.com/repos/tiimii3/rpc-studio/releases/latest";
const RELEASES_PAGE = "https://github.com/tiimii3/rpc-studio/releases/latest";
const AUTO_RECONNECT_MS = 10_000;
const STARTUP_AUTO_APPLY_DELAY_MS = 450;

const fieldIds = [
  "client-id",
  "activity-type",
  "details",
  "state",
  "large-image-key",
  "large-image-text",
  "large-image-link-label",
  "large-image-link-url",
  "small-image-key",
  "small-image-text",
  "small-image-link-label",
  "small-image-link-url",
  "start-elapsed-hours",
  "start-elapsed-minutes",
  "start-timestamp",
  "end-timestamp",
];

const els = {};
let draftSaveTimer = null;

const i18n = {
  en: {
    eyebrow: "Discord Rich Presence",
    language_label: "Language",
    version_label: "Version",
    updates_title: "Updates",
    update_check_btn: "Check for updates",
    update_download_btn: "Download",
    update_idle: "Click to check for a newer version.",
    update_hint: "Checks latest release and shows Download if a newer version exists.",
    update_checking: "Checking for updates...",
    update_up_to_date: "You are up to date ({current}).",
    update_available: "New version available: {latest} (current: {current}).",
    update_error: "Could not check updates right now. Try again in a bit.",
    subtitle:
      "Set custom details, state, and image assets for your local Discord desktop session.",
    profiles_title: "Profiles",
    profile_name_placeholder: "Profile name",
    save_profile_btn: "Save Profile",
    load_profile_btn: "Load",
    delete_profile_btn: "Delete",
    export_config_btn: "Export Config",
    import_config_btn: "Import Config",
    profiles_hint: "Save and load your full RPC setup with one click.",
    behavior_title: "App Behavior",
    autostart_label: "Launch on system startup",
    auto_apply_label: "Auto-apply on app launch",
    auto_apply_source_label: "Startup source",
    auto_apply_source_last: "Last active profile",
    auto_apply_source_slot_a: "Quick Slot A",
    auto_apply_source_slot_b: "Quick Slot B",
    auto_apply_source_slot_c: "Quick Slot C",
    auto_apply_hint: "On launch, app can auto-connect and apply your chosen startup profile.",
    tray_hint: "Closing the window with X keeps the app running in the tray/menu bar.",
    quick_slots_title: "Quick Slots (A/B/C)",
    assign_slot_btn: "Assign",
    run_slot_btn: "Run",
    quick_slots_hint: "Pick a profile, assign it to A/B/C, then run it in one click.",
    slot_unassigned: "Unassigned",
    client_id_label: "Application Client ID",
    client_id_placeholder: "123456789012345678",
    connect_btn: "Connect",
    disconnect_btn: "Disconnect",
    disconnect_all_btn: "Disconnect All",
    client_hint:
      'The app name shown in Discord (for example "RCP+") comes from this Client ID app in Developer Portal.',
    connected_sessions_label: "Connected sessions:",
    connected_sessions_none: "None",
    status_table: "Status Table",
    field_column: "Field",
    value_column: "Value",
    row_activity_type: "Activity Type",
    activity_playing: "Playing",
    activity_watching: "Watching",
    activity_listening: "Listening",
    activity_competing: "Competing",
    row_details: "Details",
    details_placeholder: "In RPC Studio",
    row_state: "State",
    state_placeholder: "Building sniper update",
    row_large_image: "Large Image (Asset Key or URL)",
    large_image_placeholder: "logo or https://...",
    row_large_text: "Large Image Text",
    large_text_placeholder: "RPC Studio",
    row_large_click: "Large Image Click URL (Button)",
    large_click_label_placeholder: "Open Large Image",
    row_small_image: "Small Image (Asset Key or URL)",
    small_image_placeholder: "sniper or https://...",
    row_small_text: "Small Image Text",
    small_text_placeholder: "Scoped",
    row_small_click: "Small Image Click URL (Button)",
    small_click_label_placeholder: "Open Small Image",
    url_placeholder: "https://...",
    row_start_elapsed: "Start At (elapsed)",
    hours_placeholder: "hours (e.g. 5)",
    minutes_placeholder: "minutes (e.g. 22)",
    row_start_manual: "Start Timestamp (manual)",
    row_end: "End Timestamp",
    timestamp_placeholder: "unix seconds (optional)",
    apply_btn: "Apply Presence",
    clear_btn: "Clear Presence",
    no_profiles: "No profiles",
    status_connected: "Connected.",
    status_disconnected: "Disconnected.",
    status_presence_updated: "Presence updated.",
    status_presence_cleared: "Presence cleared.",
    status_disconnected_all: "All sessions disconnected.",
    status_profile_saved: "Profile saved.",
    status_profile_loaded: "Profile loaded.",
    status_profile_deleted: "Profile deleted.",
    status_config_exported: "Config exported.",
    status_config_imported: "Config imported.",
    status_slot_assigned: "Slot assigned.",
    status_slot_ran: "Slot started.",
    status_autostart_updated: "Startup setting updated.",
    status_auto_apply_updated: "Auto-apply setting updated.",
    status_auto_reconnected: "Discord reconnected automatically.",
    status_startup_applied: "Startup profile auto-applied.",
    err_client_id: "Enter Application Client ID.",
    err_timestamp: "Timestamp must be a number (unix seconds).",
    err_non_negative_hours: "Hours must be 0 or more.",
    err_non_negative_minutes: "Minutes must be 0 or more.",
    err_profile_name: "Enter a profile name.",
    err_profile_select: "Select a profile first.",
    err_profile_missing: "Profile not found.",
    err_slot_unassigned: "This slot is empty. Assign a profile first.",
    err_import_invalid: "Invalid config file format.",
    default_large_button: "Open Large Image",
    default_small_button: "Open Small Image",
  },
  sl: {
    eyebrow: "Discord Rich Presence",
    language_label: "Jezik",
    version_label: "Verzija",
    updates_title: "Posodobitve",
    update_check_btn: "Preveri posodobitve",
    update_download_btn: "Prenesi",
    update_idle: "Klikni za preverjanje nove verzije.",
    update_hint: "Preveri zadnji release in pokaze Prenesi, ce je nova verzija.",
    update_checking: "Preverjam posodobitve...",
    update_up_to_date: "Imas zadnjo verzijo ({current}).",
    update_available: "Nova verzija je na voljo: {latest} (trenutna: {current}).",
    update_error: "Posodobitev trenutno ni bilo mogoce preveriti. Poskusi znova.",
    subtitle:
      "Nastavi details, state in slike za lokalni Discord desktop session.",
    profiles_title: "Profili",
    profile_name_placeholder: "Ime profila",
    save_profile_btn: "Shrani profil",
    load_profile_btn: "Nalozi",
    delete_profile_btn: "Izbrisi",
    export_config_btn: "Izvozi config",
    import_config_btn: "Uvozi config",
    profiles_hint: "Shrani in nalozi celoten RPC setup z enim klikom.",
    behavior_title: "Obnasanje aplikacije",
    autostart_label: "Zazeni ob zagonu sistema",
    auto_apply_label: "Samodejno nastavi ob zagonu aplikacije",
    auto_apply_source_label: "Vir ob zagonu",
    auto_apply_source_last: "Nazadnje aktiven profil",
    auto_apply_source_slot_a: "Hitri slot A",
    auto_apply_source_slot_b: "Hitri slot B",
    auto_apply_source_slot_c: "Hitri slot C",
    auto_apply_hint: "Ob zagonu lahko aplikacija samodejno poveze in nastavi izbrani profil.",
    tray_hint: "Ko kliknes X, aplikacija ostane aktivna v tray/menu vrstici.",
    quick_slots_title: "Hitri sloti (A/B/C)",
    assign_slot_btn: "Dodeli",
    run_slot_btn: "Zazeni",
    quick_slots_hint: "Izberi profil, dodeli ga A/B/C, potem ga zazeni z enim klikom.",
    slot_unassigned: "Ni dodeljeno",
    client_id_label: "Application Client ID",
    client_id_placeholder: "123456789012345678",
    connect_btn: "Povezi",
    disconnect_btn: "Odklopi",
    disconnect_all_btn: "Odklopi vse",
    client_hint:
      'Ime v Discordu (npr. "RCP+") pride iz te aplikacije v Developer Portalu za ta Client ID.',
    connected_sessions_label: "Povezane seje:",
    connected_sessions_none: "Nobena",
    status_table: "Status tabela",
    field_column: "Polje",
    value_column: "Vrednost",
    row_activity_type: "Tip aktivnosti",
    activity_playing: "Playing",
    activity_watching: "Watching",
    activity_listening: "Listening",
    activity_competing: "Competing",
    row_details: "Details",
    details_placeholder: "V RPC Studio",
    row_state: "State",
    state_placeholder: "Gradim sniper update",
    row_large_image: "Velika slika (Asset key ali URL)",
    large_image_placeholder: "logo ali https://...",
    row_large_text: "Text velike slike",
    large_text_placeholder: "RPC Studio",
    row_large_click: "Klik URL za veliko sliko (gumb)",
    large_click_label_placeholder: "Odpri veliko sliko",
    row_small_image: "Mala slika (Asset key ali URL)",
    small_image_placeholder: "sniper ali https://...",
    row_small_text: "Text male slike",
    small_text_placeholder: "Scoped",
    row_small_click: "Klik URL za malo sliko (gumb)",
    small_click_label_placeholder: "Odpri malo sliko",
    url_placeholder: "https://...",
    row_start_elapsed: "Start At (pretekli cas)",
    hours_placeholder: "ure (npr. 5)",
    minutes_placeholder: "minute (npr. 22)",
    row_start_manual: "Start timestamp (rocno)",
    row_end: "End timestamp",
    timestamp_placeholder: "unix sekunde (opcijsko)",
    apply_btn: "Nastavi presence",
    clear_btn: "Pobrisi presence",
    no_profiles: "Ni profilov",
    status_connected: "Povezano.",
    status_disconnected: "Odklopljeno.",
    status_presence_updated: "Presence posodobljen.",
    status_presence_cleared: "Presence pobrisan.",
    status_disconnected_all: "Vse seje odklopljene.",
    status_profile_saved: "Profil shranjen.",
    status_profile_loaded: "Profil nalozen.",
    status_profile_deleted: "Profil izbrisan.",
    status_config_exported: "Config izvozen.",
    status_config_imported: "Config uvozen.",
    status_slot_assigned: "Slot dodeljen.",
    status_slot_ran: "Slot zagnan.",
    status_autostart_updated: "Nastavitev zagona posodobljena.",
    status_auto_apply_updated: "Nastavitev samodejnega zagona je posodobljena.",
    status_auto_reconnected: "Discord je bil samodejno ponovno povezan.",
    status_startup_applied: "Zagonski profil je bil samodejno nastavljen.",
    err_client_id: "Vnesi Application Client ID.",
    err_timestamp: "Timestamp mora biti stevilka (unix sekunde).",
    err_non_negative_hours: "Ure morajo biti 0 ali vec.",
    err_non_negative_minutes: "Minute morajo biti 0 ali vec.",
    err_profile_name: "Vnesi ime profila.",
    err_profile_select: "Najprej izberi profil.",
    err_profile_missing: "Profil ne obstaja.",
    err_slot_unassigned: "Ta slot je prazen. Najprej dodeli profil.",
    err_import_invalid: "Neveljaven format config datoteke.",
    default_large_button: "Odpri veliko sliko",
    default_small_button: "Odpri malo sliko",
  },
};

let currentLang = "en";
let lastStatus = { key: "status_disconnected", tone: "neutral", raw: false };
let lastUpdateState = { key: "update_idle", tone: "neutral", vars: {} };
let currentAppVersion = null;
const desiredClientIds = new Set();
const lastPresenceByClientId = new Map();
let reconnectTimer = null;
let reconnectInFlight = false;
let startupAutoApplyTimer = null;
let startupAutoApplyKickTimer = null;

function t(key) {
  return i18n[currentLang]?.[key] ?? i18n.en[key] ?? key;
}

function formatTemplate(template, vars = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

function normalizeVersion(raw) {
  const value = String(raw ?? "").trim().replace(/^v/i, "");
  return value || null;
}

function versionParts(version) {
  const normalized = normalizeVersion(version);
  if (!normalized) return [];
  return normalized.split(".").map((part) => {
    const match = part.match(/^(\d+)/);
    return match ? Number(match[1]) : 0;
  });
}

function compareVersions(left, right) {
  const a = versionParts(left);
  const b = versionParts(right);
  const size = Math.max(a.length, b.length);
  for (let i = 0; i < size; i += 1) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

function text(id) {
  return els[id].value.trim();
}

function errorText(error) {
  if (typeof error === "string") return error;
  if (typeof error?.message === "string") return error.message;
  return String(error);
}

function parseTimestamp(raw) {
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(t("err_timestamp"));
  }
  return Math.trunc(value);
}

function parseNonNegativeInt(raw, type) {
  if (!raw) return 0;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    if (type === "hours") throw new Error(t("err_non_negative_hours"));
    throw new Error(t("err_non_negative_minutes"));
  }
  return Math.trunc(value);
}

function normalizeFieldValue(raw) {
  return typeof raw === "string" ? raw.trim() : "";
}

function buildStartTimestampFromValues(hoursRawInput, minutesRawInput, manualRawInput) {
  const hoursRaw = normalizeFieldValue(hoursRawInput);
  const minutesRaw = normalizeFieldValue(minutesRawInput);
  if (hoursRaw || minutesRaw) {
    const hours = parseNonNegativeInt(hoursRaw, "hours");
    const minutes = parseNonNegativeInt(minutesRaw, "minutes");
    const elapsedSeconds = hours * 3600 + minutes * 60;
    return Math.floor(Date.now() / 1000) - elapsedSeconds;
  }

  return parseTimestamp(normalizeFieldValue(manualRawInput));
}

function buildStartTimestamp() {
  return buildStartTimestampFromValues(
    text("start-elapsed-hours"),
    text("start-elapsed-minutes"),
    text("start-timestamp"),
  );
}

function collectFormData() {
  const payload = {};
  for (const id of fieldIds) payload[id] = els[id].value;
  return payload;
}

function applyFormData(payload) {
  if (!payload || typeof payload !== "object") return;
  for (const id of fieldIds) {
    if (typeof payload[id] === "string") {
      els[id].value = payload[id];
    }
  }
}

function persistDraft() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(collectFormData()));
}

function saveDraft() {
  if (draftSaveTimer) clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(() => {
    persistDraft();
    draftSaveTimer = null;
  }, 120);
}

function loadDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return;
  try {
    applyFormData(JSON.parse(raw));
  } catch {
    localStorage.removeItem(DRAFT_KEY);
  }
}

function readProfiles() {
  const raw = localStorage.getItem(PROFILES_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function readQuickSlots() {
  const raw = localStorage.getItem(QUICK_SLOTS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed;
  } catch {
    return {};
  }
}

function writeQuickSlots(slots) {
  localStorage.setItem(QUICK_SLOTS_KEY, JSON.stringify(slots));
}

function readAutoApplyEnabled() {
  return localStorage.getItem(AUTO_APPLY_KEY) === "1";
}

function writeAutoApplyEnabled(enabled) {
  localStorage.setItem(AUTO_APPLY_KEY, enabled ? "1" : "0");
}

function readStartupSource() {
  const value = localStorage.getItem(STARTUP_SOURCE_KEY);
  if (value === "slot_a" || value === "slot_b" || value === "slot_c" || value === "last_profile") {
    return value;
  }
  return "last_profile";
}

function writeStartupSource(source) {
  const safe =
    source === "slot_a" || source === "slot_b" || source === "slot_c" ? source : "last_profile";
  localStorage.setItem(STARTUP_SOURCE_KEY, safe);
}

function readLastActiveProfiles(profiles = readProfiles()) {
  const names = [];
  const seen = new Set();

  const rawList = localStorage.getItem(LAST_ACTIVE_PROFILES_KEY);
  if (rawList) {
    try {
      const parsed = JSON.parse(rawList);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const name = typeof item === "string" ? item.trim() : "";
          if (!name || seen.has(name) || !profiles[name]) continue;
          seen.add(name);
          names.push(name);
        }
      }
    } catch {
      // Ignore bad persisted list and fallback below.
    }
  }

  // Backwards compatibility with old single-profile key.
  if (names.length === 0) {
    const legacy = String(localStorage.getItem(LAST_ACTIVE_PROFILE_KEY) || "").trim();
    if (legacy && profiles[legacy]) {
      names.push(legacy);
    }
  }

  return names.slice(0, 5);
}

function writeLastActiveProfiles(names) {
  const safe = Array.isArray(names)
    ? names
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 5)
    : [];
  localStorage.setItem(LAST_ACTIVE_PROFILES_KEY, JSON.stringify(safe));
  if (safe.length > 0) {
    localStorage.setItem(LAST_ACTIVE_PROFILE_KEY, safe[0]);
  } else {
    localStorage.removeItem(LAST_ACTIVE_PROFILE_KEY);
  }
}

function rememberLastActiveProfile(name) {
  const safeName = String(name || "").trim();
  if (!safeName) return;
  const profiles = readProfiles();
  if (!profiles[safeName]) return;
  const existing = readLastActiveProfiles(profiles);
  const next = [safeName, ...existing.filter((item) => item !== safeName)];
  writeLastActiveProfiles(next);
}

function forgetLastActiveProfile(name) {
  const safeName = String(name || "").trim();
  if (!safeName) return;
  const existing = readLastActiveProfiles();
  writeLastActiveProfiles(existing.filter((item) => item !== safeName));
}

function isRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function sanitizeFormData(raw) {
  const result = {};
  for (const id of fieldIds) {
    result[id] = typeof raw?.[id] === "string" ? raw[id] : "";
  }
  return result;
}

function sanitizeProfiles(raw) {
  if (!isRecord(raw)) return {};
  const result = {};
  for (const [name, value] of Object.entries(raw)) {
    const safeName = String(name || "").trim();
    if (!safeName || !isRecord(value)) continue;
    result[safeName] = sanitizeFormData(value);
  }
  return result;
}

function sanitizeQuickSlots(raw, profiles = {}) {
  if (!isRecord(raw)) return {};
  const result = {};
  for (const slot of ["a", "b", "c"]) {
    const name = typeof raw[slot] === "string" ? raw[slot].trim() : "";
    if (name && profiles[name]) {
      result[slot] = name;
    }
  }
  return result;
}

function sanitizeLastActiveProfile(value, profiles = {}) {
  const name = typeof value === "string" ? value.trim() : "";
  return name && profiles[name] ? name : "";
}

function sanitizeLastActiveProfiles(value, profiles = {}) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const result = [];
  for (const item of value) {
    const name = typeof item === "string" ? item.trim() : "";
    if (!name || seen.has(name) || !profiles[name]) continue;
    seen.add(name);
    result.push(name);
  }
  return result.slice(0, 5);
}

function refreshProfileSelect(preferredName = "") {
  const profiles = readProfiles();
  const names = Object.keys(profiles).sort((a, b) => a.localeCompare(b));
  const prevValue = preferredName || els["profile-select"].value;

  els["profile-select"].innerHTML = "";

  if (names.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = t("no_profiles");
    els["profile-select"].append(option);
    els["profile-select"].value = "";
    return;
  }

  for (const name of names) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    els["profile-select"].append(option);
  }

  const valueToUse = names.includes(prevValue) ? prevValue : names[0];
  els["profile-select"].value = valueToUse;
  if (!text("profile-name")) {
    els["profile-name"].value = valueToUse;
  }
}

function setStatus(value, tone = "neutral", raw = false) {
  lastStatus = { key: value, tone, raw };
  els.status.textContent = raw ? value : t(value);
  els.status.dataset.tone = tone;
}

function hideUpdateDownload() {
  els["download-update-link"].classList.add("hidden");
  els["download-update-link"].removeAttribute("href");
}

function showUpdateDownload(url) {
  const safeUrl =
    typeof url === "string" && url.startsWith("https://") ? url : RELEASES_PAGE;
  els["download-update-link"].href = safeUrl;
  els["download-update-link"].classList.remove("hidden");
}

function setUpdateStatus(key, tone = "neutral", vars = {}) {
  lastUpdateState = { key, tone, vars };
  els["update-status"].textContent = formatTemplate(t(key), vars);
  els["update-status"].dataset.tone = tone;
}

function trackReconnectSession(clientId, presence = null) {
  const id = String(clientId ?? "").trim();
  if (!id) return;
  desiredClientIds.add(id);
  if (presence && typeof presence === "object") {
    lastPresenceByClientId.set(id, presence);
  }
}

function untrackReconnectSession(clientId) {
  const id = String(clientId ?? "").trim();
  if (!id) return;
  desiredClientIds.delete(id);
  lastPresenceByClientId.delete(id);
}

function clearReconnectSessions() {
  desiredClientIds.clear();
  lastPresenceByClientId.clear();
}

function refreshQuickSlots() {
  const slots = readQuickSlots();
  for (const slot of ["a", "b", "c"]) {
    const name = typeof slots[slot] === "string" ? slots[slot] : "";
    const label = name || t("slot_unassigned");
    els[`slot-${slot}-name`].textContent = label;
    els[`slot-${slot}-name`].title = label;
  }
}

async function refreshConnectedSessions() {
  try {
    const ids = await invoke("rpc_list_connected");
    els["connected-sessions"].textContent =
      ids.length > 0 ? ids.join(", ") : t("connected_sessions_none");
    return ids;
  } catch {
    els["connected-sessions"].textContent = t("connected_sessions_none");
    return [];
  }
}

async function autoReconnectTick() {
  if (reconnectInFlight || desiredClientIds.size === 0) return;
  reconnectInFlight = true;
  try {
    const connected = await invoke("rpc_list_connected");
    const connectedSet = new Set(Array.isArray(connected) ? connected.map(String) : []);

    let recovered = 0;
    for (const clientId of desiredClientIds) {
      const presence = lastPresenceByClientId.get(clientId) ?? null;

      // Health probe for tracked sessions with presence:
      // if this fails, we know the IPC connection is stale and must reconnect.
      if (presence) {
        try {
          await invoke("rpc_set_presence", { clientId, presence });
          continue;
        } catch {
          // reconnect below
        }
      } else if (connectedSet.has(clientId)) {
        // If there is no tracked presence payload and the backend still reports
        // this session as connected, do nothing on this tick.
        continue;
      }

      try {
        await invoke("rpc_connect", { clientId });
        if (presence) {
          await invoke("rpc_set_presence", { clientId, presence });
        }
        recovered += 1;
      } catch {
        // Keep retrying on next tick.
      }
    }

    if (recovered > 0) {
      await refreshConnectedSessions();
      setStatus("status_auto_reconnected", "good");
    }
  } catch {
    // Ignore periodic tick errors; next tick will retry.
  } finally {
    reconnectInFlight = false;
  }
}

function startAutoReconnectLoop() {
  if (reconnectTimer) clearInterval(reconnectTimer);
  reconnectTimer = setInterval(() => {
    void autoReconnectTick();
  }, AUTO_RECONNECT_MS);
  window.addEventListener("online", () => {
    void autoReconnectTick();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveStartupProfileNames() {
  const profiles = readProfiles();
  const source = readStartupSource();
  if (source === "last_profile") {
    return readLastActiveProfiles(profiles);
  }
  const slots = readQuickSlots();
  const slotKey = source === "slot_a" ? "a" : source === "slot_b" ? "b" : "c";
  const name = typeof slots[slotKey] === "string" ? slots[slotKey].trim() : "";
  if (name && profiles[name]) return [name];
  return [];
}

async function tryAutoApplyOnLaunch() {
  if (!readAutoApplyEnabled()) return true;
  const profileNames = resolveStartupProfileNames();
  if (profileNames.length === 0) return true;
  const profiles = readProfiles();
  const validNames = profileNames.filter((name) => Boolean(profiles[name]));
  if (validNames.length === 0) return true;

  let appliedCount = 0;
  for (let index = 0; index < validNames.length; index += 1) {
    const name = validNames[index];
    try {
      await runProfileByName(name, {
        applyToForm: index === validNames.length - 1,
        refreshSessions: false,
        saveDraftAfterApply: index === validNames.length - 1,
      });
      appliedCount += 1;
    } catch {
      // Retry failed profiles on next tick.
    }

    // Keep startup smooth when restoring multiple presences.
    if (index < validNames.length - 1) {
      await sleep(80);
    }
  }

  await refreshConnectedSessions();

  if (appliedCount === validNames.length) {
    setStatus("status_startup_applied", "good");
    return true;
  }

  if (appliedCount > 0) {
    setStatus("status_startup_applied", "good");
  }
  return false;
}

function startAutoApplyOnLaunchLoop() {
  if (startupAutoApplyKickTimer) {
    clearTimeout(startupAutoApplyKickTimer);
    startupAutoApplyKickTimer = null;
  }
  if (startupAutoApplyTimer) {
    clearInterval(startupAutoApplyTimer);
    startupAutoApplyTimer = null;
  }

  if (!readAutoApplyEnabled()) return;

  startupAutoApplyKickTimer = setTimeout(() => {
    startupAutoApplyKickTimer = null;
    void (async () => {
      const done = await tryAutoApplyOnLaunch();
      if (done) return;
      startupAutoApplyTimer = setInterval(async () => {
        const ok = await tryAutoApplyOnLaunch();
        if (ok && startupAutoApplyTimer) {
          clearInterval(startupAutoApplyTimer);
          startupAutoApplyTimer = null;
        }
      }, AUTO_RECONNECT_MS);
    })();
  }, STARTUP_AUTO_APPLY_DELAY_MS);
}

async function loadAutostartState() {
  try {
    const enabled = await invoke("autostart_is_enabled");
    els["autostart-toggle"].checked = Boolean(enabled);
  } catch {
    els["autostart-toggle"].checked = false;
  }
}

async function loadAppVersion() {
  try {
    const version = await invoke("app_version");
    currentAppVersion = normalizeVersion(version);
    els["app-version"].textContent = currentAppVersion ? `v${currentAppVersion}` : "-";
  } catch {
    currentAppVersion = null;
    els["app-version"].textContent = "-";
  }
}

async function checkForUpdates() {
  hideUpdateDownload();
  setUpdateStatus("update_checking", "neutral");
  els["check-updates"].disabled = true;

  try {
    if (!currentAppVersion) {
      await loadAppVersion();
    }

    const current = currentAppVersion;
    if (!current) {
      throw new Error("Missing local app version");
    }

    const response = await fetch(RELEASES_LATEST_API, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const release = await response.json();
    const latest = normalizeVersion(release?.tag_name);
    if (!latest) {
      throw new Error("Missing release version");
    }

    if (compareVersions(latest, current) > 0) {
      setUpdateStatus("update_available", "good", {
        latest: `v${latest}`,
        current: `v${current}`,
      });
      showUpdateDownload(release?.html_url || RELEASES_PAGE);
      return;
    }

    setUpdateStatus("update_up_to_date", "neutral", { current: `v${current}` });
  } catch {
    setUpdateStatus("update_error", "bad");
  } finally {
    els["check-updates"].disabled = false;
  }
}

function requireClientId() {
  const clientId = text("client-id");
  if (!clientId) throw new Error(t("err_client_id"));
  return clientId;
}

function buildButton(labelId, urlId, defaultLabelKey) {
  const url = text(urlId);
  if (!url) return null;
  const label = text(labelId) || t(defaultLabelKey);
  return { label, url };
}

function buildButtonFromValues(label, url, defaultLabelKey) {
  const safeUrl = normalizeFieldValue(url);
  if (!safeUrl) return null;
  const safeLabel = normalizeFieldValue(label) || t(defaultLabelKey);
  return { label: safeLabel, url: safeUrl };
}

function buildPresenceFromForm() {
  const largeButton = buildButton(
    "large-image-link-label",
    "large-image-link-url",
    "default_large_button",
  );
  const smallButton = buildButton(
    "small-image-link-label",
    "small-image-link-url",
    "default_small_button",
  );

  return {
    activityType: text("activity-type") || "playing",
    details: text("details") || null,
    state: text("state") || null,
    largeImageKey: text("large-image-key") || null,
    largeImageText: text("large-image-text") || null,
    smallImageKey: text("small-image-key") || null,
    smallImageText: text("small-image-text") || null,
    startTimestamp: buildStartTimestamp(),
    endTimestamp: parseTimestamp(text("end-timestamp")),
    button1Label: largeButton?.label ?? null,
    button1Url: largeButton?.url ?? null,
    button2Label: smallButton?.label ?? null,
    button2Url: smallButton?.url ?? null,
  };
}

function buildPresenceFromData(data) {
  const source = sanitizeFormData(data);
  const largeButton = buildButtonFromValues(
    source["large-image-link-label"],
    source["large-image-link-url"],
    "default_large_button",
  );
  const smallButton = buildButtonFromValues(
    source["small-image-link-label"],
    source["small-image-link-url"],
    "default_small_button",
  );

  return {
    activityType: normalizeFieldValue(source["activity-type"]) || "playing",
    details: normalizeFieldValue(source.details) || null,
    state: normalizeFieldValue(source.state) || null,
    largeImageKey: normalizeFieldValue(source["large-image-key"]) || null,
    largeImageText: normalizeFieldValue(source["large-image-text"]) || null,
    smallImageKey: normalizeFieldValue(source["small-image-key"]) || null,
    smallImageText: normalizeFieldValue(source["small-image-text"]) || null,
    startTimestamp: buildStartTimestampFromValues(
      source["start-elapsed-hours"],
      source["start-elapsed-minutes"],
      source["start-timestamp"],
    ),
    endTimestamp: parseTimestamp(normalizeFieldValue(source["end-timestamp"])),
    button1Label: largeButton?.label ?? null,
    button1Url: largeButton?.url ?? null,
    button2Label: smallButton?.label ?? null,
    button2Url: smallButton?.url ?? null,
  };
}

function applyTranslations() {
  document.documentElement.lang = currentLang;

  for (const element of document.querySelectorAll("[data-i18n]")) {
    const key = element.dataset.i18n;
    element.textContent = t(key);
  }

  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    const key = element.dataset.i18nPlaceholder;
    element.placeholder = t(key);
  }

  refreshProfileSelect(els["profile-select"].value || text("profile-name"));
  refreshQuickSlots();
  setStatus(lastStatus.key, lastStatus.tone, lastStatus.raw);
  setUpdateStatus(lastUpdateState.key, lastUpdateState.tone, lastUpdateState.vars);
  refreshConnectedSessions();
}

async function connectRpc() {
  const clientId = requireClientId();
  await invoke("rpc_connect", { clientId });
  trackReconnectSession(clientId);
  await refreshConnectedSessions();
  setStatus("status_connected", "good");
}

async function disconnectRpc() {
  const clientId = requireClientId();
  await invoke("rpc_disconnect", { clientId });
  untrackReconnectSession(clientId);
  await refreshConnectedSessions();
  setStatus("status_disconnected", "neutral");
}

async function disconnectAllRpc() {
  await invoke("rpc_disconnect_all");
  clearReconnectSessions();
  await refreshConnectedSessions();
  setStatus("status_disconnected_all", "neutral");
}

async function setAutostartFromUi() {
  const enabled = Boolean(els["autostart-toggle"].checked);
  await invoke("autostart_set_enabled", { enabled });
  setStatus("status_autostart_updated", "good");
}

async function applyPresence() {
  const presence = buildPresenceFromForm();
  const clientId = requireClientId();
  await invoke("rpc_set_presence", { clientId, presence });
  trackReconnectSession(clientId, presence);
  setStatus("status_presence_updated", "good");
}

function getSelectedProfileName() {
  return text("profile-select") || text("profile-name");
}

async function runProfileByName(
  name,
  { applyToForm = true, refreshSessions = true, saveDraftAfterApply = true } = {},
) {
  const profiles = readProfiles();
  const data = profiles[name];
  if (!data) throw new Error(t("err_profile_missing"));

  if (applyToForm) {
    applyFormData(data);
    els["profile-name"].value = name;
    refreshProfileSelect(name);
  }

  const clientId = normalizeFieldValue(data["client-id"]);
  if (!clientId) throw new Error(t("err_client_id"));
  await invoke("rpc_connect", { clientId });

  const presence = buildPresenceFromData(data);
  await invoke("rpc_set_presence", { clientId, presence });
  trackReconnectSession(clientId, presence);
  rememberLastActiveProfile(name);
  if (refreshSessions) {
    await refreshConnectedSessions();
  }
  if (applyToForm && saveDraftAfterApply) {
    saveDraft();
  }
}

async function clearPresence() {
  const clientId = requireClientId();
  await invoke("rpc_clear_presence", { clientId });
  setStatus("status_presence_cleared", "neutral");
}

function saveProfile() {
  const name = text("profile-name");
  if (!name) throw new Error(t("err_profile_name"));

  const profiles = readProfiles();
  profiles[name] = collectFormData();
  writeProfiles(profiles);
  refreshProfileSelect(name);
  els["profile-select"].value = name;
  setStatus("status_profile_saved", "good");
}

function loadProfile() {
  const name = text("profile-select") || text("profile-name");
  if (!name) throw new Error(t("err_profile_select"));

  const profiles = readProfiles();
  const data = profiles[name];
  if (!data) throw new Error(t("err_profile_missing"));

  applyFormData(data);
  els["profile-name"].value = name;
  refreshProfileSelect(name);
  saveDraft();
  setStatus("status_profile_loaded", "good");
}

function deleteProfile() {
  const name = text("profile-select") || text("profile-name");
  if (!name) throw new Error(t("err_profile_select"));

  const profiles = readProfiles();
  if (!profiles[name]) throw new Error(t("err_profile_missing"));

  delete profiles[name];
  writeProfiles(profiles);
  forgetLastActiveProfile(name);
  refreshProfileSelect();
  refreshQuickSlots();
  setStatus("status_profile_deleted", "neutral");
}

function exportConfig() {
  const exportedAt = new Date().toISOString();
  const filenameStamp = exportedAt.replace(/[:.]/g, "-");
  const payload = {
    app: "RPC Studio",
    exportedAt,
    version: currentAppVersion ? `v${currentAppVersion}` : null,
    config: {
      draft: collectFormData(),
      profiles: readProfiles(),
      quickSlots: readQuickSlots(),
      language: currentLang,
      selectedProfile: getSelectedProfileName() || null,
      autoApplyOnLaunch: readAutoApplyEnabled(),
      startupSource: readStartupSource(),
      lastActiveProfiles: readLastActiveProfiles(),
      lastActiveProfile: String(localStorage.getItem(LAST_ACTIVE_PROFILE_KEY) || "").trim() || null,
    },
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rpc-studio-config-${filenameStamp}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  setStatus("status_config_exported", "good");
}

function applyImportedConfig(raw) {
  let parsed = raw;
  if (!isRecord(parsed)) {
    throw new Error(t("err_import_invalid"));
  }

  // Support both full export payload (`{ app, config }`) and direct config object.
  if (isRecord(parsed.config)) {
    parsed = parsed.config;
  }

  if (!isRecord(parsed)) {
    throw new Error(t("err_import_invalid"));
  }

  const profiles = sanitizeProfiles(parsed.profiles);
  const draft = sanitizeFormData(parsed.draft);
  const slots = sanitizeQuickSlots(parsed.quickSlots, profiles);

  writeProfiles(profiles);
  writeQuickSlots(slots);
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  applyFormData(draft);

  currentLang = parsed.language === "sl" ? "sl" : "en";
  localStorage.setItem(LANG_KEY, currentLang);
  els["lang-select"].value = currentLang;

  if (typeof parsed.autoApplyOnLaunch === "boolean") {
    writeAutoApplyEnabled(parsed.autoApplyOnLaunch);
  }
  if (typeof parsed.startupSource === "string") {
    writeStartupSource(parsed.startupSource);
  }

  const selectedProfileRaw =
    typeof parsed.selectedProfile === "string" ? parsed.selectedProfile.trim() : "";
  const selectedProfile = selectedProfileRaw && profiles[selectedProfileRaw] ? selectedProfileRaw : "";
  refreshProfileSelect(selectedProfile);

  if (selectedProfile) {
    els["profile-select"].value = selectedProfile;
    els["profile-name"].value = selectedProfile;
  } else {
    const fallback = els["profile-select"].value || "";
    els["profile-name"].value = fallback;
  }

  const importedLastActiveList = sanitizeLastActiveProfiles(parsed.lastActiveProfiles, profiles);
  if (importedLastActiveList.length > 0) {
    writeLastActiveProfiles(importedLastActiveList);
  } else {
    const importedLastActive = sanitizeLastActiveProfile(parsed.lastActiveProfile, profiles);
    if (importedLastActive) {
      writeLastActiveProfiles([importedLastActive]);
    } else if (selectedProfile) {
      writeLastActiveProfiles([selectedProfile]);
    } else {
      writeLastActiveProfiles([]);
    }
  }

  els["auto-apply-toggle"].checked = readAutoApplyEnabled();
  els["startup-source-select"].value = readStartupSource();

  saveDraft();
  refreshQuickSlots();
  applyTranslations();
  startAutoApplyOnLaunchLoop();
}

async function importConfigFromFile(file) {
  if (!file) return;
  let parsed;
  try {
    const textContent = await file.text();
    parsed = JSON.parse(textContent);
  } catch {
    throw new Error(t("err_import_invalid"));
  }

  applyImportedConfig(parsed);
  setStatus("status_config_imported", "good");
}

function assignSlot(slot) {
  const name = getSelectedProfileName();
  if (!name) throw new Error(t("err_profile_select"));

  const profiles = readProfiles();
  if (!profiles[name]) throw new Error(t("err_profile_missing"));

  const slots = readQuickSlots();
  slots[slot] = name;
  writeQuickSlots(slots);
  refreshQuickSlots();
  setStatus("status_slot_assigned", "good");
}

async function runSlot(slot) {
  const slots = readQuickSlots();
  const name = slots[slot];
  if (!name) throw new Error(t("err_slot_unassigned"));
  await runProfileByName(name);
  setStatus("status_slot_ran", "good");
}

async function run(action) {
  try {
    await action();
    persistDraft();
  } catch (error) {
    const message =
      typeof error === "string"
        ? error
        : typeof error?.message === "string"
          ? error.message
          : String(error);
    setStatus(message, "bad", true);
  }
}

function setAutoApplyFromUi() {
  const enabled = Boolean(els["auto-apply-toggle"].checked);
  writeAutoApplyEnabled(enabled);
  startAutoApplyOnLaunchLoop();
  setStatus("status_auto_apply_updated", "good");
}

function setStartupSourceFromUi() {
  writeStartupSource(els["startup-source-select"].value);
  startAutoApplyOnLaunchLoop();
  setStatus("status_auto_apply_updated", "good");
}

window.addEventListener("DOMContentLoaded", () => {
  for (const id of [
    ...fieldIds,
    "profile-select",
    "profile-name",
    "lang-select",
    "autostart-toggle",
    "auto-apply-toggle",
    "startup-source-select",
  ]) {
    els[id] = document.getElementById(id);
  }

  els.status = document.getElementById("status");
  els.connect = document.getElementById("connect-btn");
  els.disconnect = document.getElementById("disconnect-btn");
  els.disconnectAll = document.getElementById("disconnect-all-btn");
  els.apply = document.getElementById("apply-btn");
  els.clear = document.getElementById("clear-btn");
  els.saveProfile = document.getElementById("save-profile-btn");
  els.loadProfile = document.getElementById("load-profile-btn");
  els.deleteProfile = document.getElementById("delete-profile-btn");
  els.exportConfig = document.getElementById("export-config-btn");
  els.importConfig = document.getElementById("import-config-btn");
  els["import-config-input"] = document.getElementById("import-config-input");
  els["connected-sessions"] = document.getElementById("connected-sessions");
  els["assign-slot-a"] = document.getElementById("assign-slot-a-btn");
  els["assign-slot-b"] = document.getElementById("assign-slot-b-btn");
  els["assign-slot-c"] = document.getElementById("assign-slot-c-btn");
  els["run-slot-a"] = document.getElementById("run-slot-a-btn");
  els["run-slot-b"] = document.getElementById("run-slot-b-btn");
  els["run-slot-c"] = document.getElementById("run-slot-c-btn");
  els["slot-a-name"] = document.getElementById("slot-a-name");
  els["slot-b-name"] = document.getElementById("slot-b-name");
  els["slot-c-name"] = document.getElementById("slot-c-name");
  els["app-version"] = document.getElementById("app-version");
  els["check-updates"] = document.getElementById("check-updates-btn");
  els["download-update-link"] = document.getElementById("download-update-link");
  els["update-status"] = document.getElementById("update-status");

  for (const id of fieldIds) {
    els[id].addEventListener("input", saveDraft);
    els[id].addEventListener("change", saveDraft);
  }

  els["profile-select"].addEventListener("change", () => {
    els["profile-name"].value = els["profile-select"].value;
  });

  els["lang-select"].addEventListener("change", () => {
    currentLang = els["lang-select"].value === "sl" ? "sl" : "en";
    localStorage.setItem(LANG_KEY, currentLang);
    applyTranslations();
  });

  currentLang = localStorage.getItem(LANG_KEY) === "sl" ? "sl" : "en";
  els["lang-select"].value = currentLang;
  els["auto-apply-toggle"].checked = readAutoApplyEnabled();
  els["startup-source-select"].value = readStartupSource();

  loadDraft();
  refreshProfileSelect();
  refreshQuickSlots();
  applyTranslations();
  refreshConnectedSessions();
  loadAutostartState();
  loadAppVersion();
  hideUpdateDownload();
  setStatus("status_disconnected", "neutral");
  setUpdateStatus("update_idle", "neutral");
  startAutoReconnectLoop();
  void autoReconnectTick();
  startAutoApplyOnLaunchLoop();

  els.connect.addEventListener("click", () => run(connectRpc));
  els.disconnect.addEventListener("click", () => run(disconnectRpc));
  els.disconnectAll.addEventListener("click", () => run(disconnectAllRpc));
  els.apply.addEventListener("click", () => run(applyPresence));
  els.clear.addEventListener("click", () => run(clearPresence));

  els.saveProfile.addEventListener("click", () => run(() => saveProfile()));
  els.loadProfile.addEventListener("click", () => run(() => loadProfile()));
  els.deleteProfile.addEventListener("click", () => run(() => deleteProfile()));
  els.exportConfig.addEventListener("click", () => run(() => exportConfig()));
  els.importConfig.addEventListener("click", () => {
    els["import-config-input"].click();
  });
  els["import-config-input"].addEventListener("change", () =>
    run(async () => {
      const [file] = els["import-config-input"].files || [];
      if (!file) return;
      await importConfigFromFile(file);
      els["import-config-input"].value = "";
    }),
  );
  els["assign-slot-a"].addEventListener("click", () => run(() => assignSlot("a")));
  els["assign-slot-b"].addEventListener("click", () => run(() => assignSlot("b")));
  els["assign-slot-c"].addEventListener("click", () => run(() => assignSlot("c")));
  els["run-slot-a"].addEventListener("click", () => run(() => runSlot("a")));
  els["run-slot-b"].addEventListener("click", () => run(() => runSlot("b")));
  els["run-slot-c"].addEventListener("click", () => run(() => runSlot("c")));
  els["autostart-toggle"].addEventListener("change", () => run(setAutostartFromUi));
  els["auto-apply-toggle"].addEventListener("change", () => run(() => setAutoApplyFromUi()));
  els["startup-source-select"].addEventListener("change", () => run(() => setStartupSourceFromUi()));
  els["check-updates"].addEventListener("click", () => run(checkForUpdates));
});
