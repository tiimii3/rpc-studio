import { check } from "@tauri-apps/plugin-updater";

const { invoke } = window.__TAURI__.core;

const DRAFT_KEY = "rpc-draft";
const PROFILES_KEY = "rpc-profiles";
const QUICK_SLOTS_KEY = "rpc-quick-slots";
const LANG_KEY = "rpc-language";

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
  "rotation-interval-seconds",
  "rotate-playing",
  "rotate-watching",
  "rotate-listening",
  "rotate-competing",
];

const els = {};
let draftSaveTimer = null;
let previewTicker = null;
let previewStartTimestamp = null;
let previewEndTimestamp = null;
let previewTimestampError = null;
let rotationTimer = null;
let rotationCursor = 0;
let rotationTypes = [];

const i18n = {
  en: {
    eyebrow: "Discord Rich Presence",
    language_label: "Language",
    version_label: "Version",
    current_version_label: "Current version:",
    version_unknown: "unknown",
    subtitle:
      "Set custom details, state, and image assets for your local Discord desktop session.",
    profiles_title: "Profiles",
    profile_name_placeholder: "Profile name",
    save_profile_btn: "Save Profile",
    load_profile_btn: "Load",
    delete_profile_btn: "Delete",
    profiles_hint: "Save and load your full RPC setup with one click.",
    behavior_title: "App Behavior",
    autostart_label: "Launch on system startup",
    tray_hint: "Closing the window with X keeps the app running in the tray/menu bar.",
    updates_title: "Updates",
    check_updates_btn: "Check & Install Update",
    update_idle: "No update check yet.",
    update_checking: "Checking for updates...",
    update_none: "You already have the latest version.",
    update_found: "Update found (v{version}). Downloading and installing...",
    update_installed: "Update installed. Restart RPC Studio to use the new version.",
    status_update_installed: "Update installed.",
    status_update_none: "No new update found.",
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
    preview_title: "Rich Preview",
    preview_hint: "Live local preview of how your card will look before applying presence.",
    preview_no_image: "No Image",
    preview_no_small: "-",
    preview_elapsed_suffix: "elapsed",
    preview_no_timer: "No timer",
    preview_no_buttons: "No buttons",
    validation_title: "Validation Assistant",
    validation_hint: "Checks your setup for invalid values before sending RPC.",
    validate_now_btn: "Validate Now",
    validation_summary_ok: "Ready to apply.",
    validation_summary_issues: "{errors} error(s), {warnings} warning(s)",
    validation_ok_ready_apply: "All checks passed. You can apply presence.",
    validation_err_client_id_format: "Client ID should be numeric (usually 18-19 digits).",
    validation_warn_no_details_state: "Details and State are both empty. Card may look blank.",
    validation_warn_dual_start_sources:
      "Both elapsed start and manual start are set. Elapsed start will be used.",
    validation_err_end_before_start: "End timestamp must be greater than start timestamp.",
    validation_err_large_image_url: "Large image URL must start with http:// or https://.",
    validation_err_small_image_url: "Small image URL must start with http:// or https://.",
    validation_err_large_button_pair: "Large image button label needs a URL.",
    validation_err_small_button_pair: "Small image button label needs a URL.",
    validation_err_large_button_url: "Large image button URL must start with http:// or https://.",
    validation_err_small_button_url: "Small image button URL must start with http:// or https://.",
    validation_err_rotation_interval: "Rotation interval must be a whole number of at least 5 seconds.",
    validation_warn_rotation_empty: "No activity type selected for auto-rotation.",
    rotation_title: "Activity Auto-Rotation",
    rotation_hint: "Rotate activity type automatically (safe RPC mode).",
    rotation_discord_status_note:
      "Discord account status (online/idle/dnd) cannot be changed via official RPC.",
    rotation_interval_placeholder: "seconds (e.g. 30)",
    rotation_start_btn: "Start Rotation",
    rotation_stop_btn: "Stop",
    rotation_stopped: "Rotation stopped.",
    status_rotation_started: "Auto-rotation started.",
    status_rotation_stopped: "Auto-rotation stopped.",
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
    status_slot_assigned: "Slot assigned.",
    status_slot_ran: "Slot started.",
    status_autostart_updated: "Startup setting updated.",
    err_client_id: "Enter Application Client ID.",
    err_timestamp: "Timestamp must be a number (unix seconds).",
    err_non_negative_hours: "Hours must be 0 or more.",
    err_non_negative_minutes: "Minutes must be 0 or more.",
    err_profile_name: "Enter a profile name.",
    err_profile_select: "Select a profile first.",
    err_profile_missing: "Profile not found.",
    err_slot_unassigned: "This slot is empty. Assign a profile first.",
    err_rotation_type_required: "Select at least one activity type for rotation.",
    err_rotation_interval: "Set a valid rotation interval (minimum 5 seconds).",
    default_large_button: "Open Large Image",
    default_small_button: "Open Small Image",
  },
  sl: {
    eyebrow: "Discord Rich Presence",
    language_label: "Jezik",
    version_label: "Verzija",
    current_version_label: "Trenutna verzija:",
    version_unknown: "neznana",
    subtitle: "Nastavi details, state in slike za lokalni Discord desktop session.",
    profiles_title: "Profili",
    profile_name_placeholder: "Ime profila",
    save_profile_btn: "Shrani profil",
    load_profile_btn: "Nalozi",
    delete_profile_btn: "Izbrisi",
    profiles_hint: "Shrani in nalozi celoten RPC setup z enim klikom.",
    behavior_title: "Obnasanje aplikacije",
    autostart_label: "Zazeni ob zagonu sistema",
    tray_hint: "Ko kliknes X, aplikacija ostane aktivna v tray/menu vrstici.",
    updates_title: "Posodobitve",
    check_updates_btn: "Preveri in namesti update",
    update_idle: "Posodobitev se ni preverjena.",
    update_checking: "Preverjam posodobitve...",
    update_none: "Imas najnovejso verzijo.",
    update_found: "Najden update (v{version}). Prenasam in namescam...",
    update_installed: "Update namescen. Za novo verzijo ponovno odpri RPC Studio.",
    status_update_installed: "Update namescen.",
    status_update_none: "Ni nove posodobitve.",
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
    preview_title: "Rich Preview",
    preview_hint: "Lokalni preview kako bo kartica izgledala pred apply.",
    preview_no_image: "Brez slike",
    preview_no_small: "-",
    preview_elapsed_suffix: "preteklo",
    preview_no_timer: "Brez casovnika",
    preview_no_buttons: "Brez gumbov",
    validation_title: "Validation Assistant",
    validation_hint: "Preveri nastavitev in opozori pred posiljanjem RPC.",
    validate_now_btn: "Preveri",
    validation_summary_ok: "Pripravljeno za apply.",
    validation_summary_issues: "{errors} napak, {warnings} opozoril",
    validation_ok_ready_apply: "Vse preverjeno. Lahko uporabis Apply Presence.",
    validation_err_client_id_format: "Client ID mora biti stevilcen (obicajno 18-19 mest).",
    validation_warn_no_details_state: "Details in State sta prazna. Kartica lahko izgleda prazno.",
    validation_warn_dual_start_sources:
      "Nastavljen je elapsed start in rocni start. Uporabljen bo elapsed start.",
    validation_err_end_before_start: "End timestamp mora biti vecji od start timestamp.",
    validation_err_large_image_url: "URL velike slike mora zacet z http:// ali https://.",
    validation_err_small_image_url: "URL male slike mora zacet z http:// ali https://.",
    validation_err_large_button_pair: "Label za gumb velike slike potrebuje tudi URL.",
    validation_err_small_button_pair: "Label za gumb male slike potrebuje tudi URL.",
    validation_err_large_button_url: "URL gumba velike slike mora zacet z http:// ali https://.",
    validation_err_small_button_url: "URL gumba male slike mora zacet z http:// ali https://.",
    validation_err_rotation_interval: "Interval rotacije mora biti celo stevilo in vsaj 5 sekund.",
    validation_warn_rotation_empty: "Za auto-rotation ni izbran noben tip aktivnosti.",
    rotation_title: "Auto-Rotation aktivnosti",
    rotation_hint: "Samodejno menja tip aktivnosti (varen RPC nacin).",
    rotation_discord_status_note:
      "Status racuna Discord (online/idle/dnd) se ne da spreminjati preko uradnega RPC.",
    rotation_interval_placeholder: "sekunde (npr. 30)",
    rotation_start_btn: "Zazeni rotacijo",
    rotation_stop_btn: "Ustavi",
    rotation_stopped: "Rotacija ustavljena.",
    status_rotation_started: "Auto-rotation zagnan.",
    status_rotation_stopped: "Auto-rotation ustavljen.",
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
    status_slot_assigned: "Slot dodeljen.",
    status_slot_ran: "Slot zagnan.",
    status_autostart_updated: "Nastavitev zagona posodobljena.",
    err_client_id: "Vnesi Application Client ID.",
    err_timestamp: "Timestamp mora biti stevilka (unix sekunde).",
    err_non_negative_hours: "Ure morajo biti 0 ali vec.",
    err_non_negative_minutes: "Minute morajo biti 0 ali vec.",
    err_profile_name: "Vnesi ime profila.",
    err_profile_select: "Najprej izberi profil.",
    err_profile_missing: "Profil ne obstaja.",
    err_slot_unassigned: "Ta slot je prazen. Najprej dodeli profil.",
    err_rotation_type_required: "Za rotacijo izberi vsaj en tip aktivnosti.",
    err_rotation_interval: "Nastavi veljaven interval rotacije (najmanj 5 sekund).",
    default_large_button: "Odpri veliko sliko",
    default_small_button: "Odpri malo sliko",
  },
};

let currentLang = "en";
let lastStatus = { key: "status_disconnected", tone: "neutral", raw: false };
let lastRotationStatus = { key: "rotation_stopped", tone: "neutral", raw: false };
let lastUpdateStatus = { key: "update_idle", tone: "neutral", raw: false };
let appVersionValue = "";

function t(key) {
  return i18n[currentLang]?.[key] ?? i18n.en[key] ?? key;
}

function tf(key, vars = {}) {
  let out = t(key);
  for (const [name, value] of Object.entries(vars)) {
    out = out.replaceAll(`{${name}}`, String(value));
  }
  return out;
}

function text(id) {
  return String(els[id]?.value ?? "").trim();
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

function buildStartTimestamp() {
  const hoursRaw = text("start-elapsed-hours");
  const minutesRaw = text("start-elapsed-minutes");
  if (hoursRaw || minutesRaw) {
    const hours = parseNonNegativeInt(hoursRaw, "hours");
    const minutes = parseNonNegativeInt(minutesRaw, "minutes");
    const elapsedSeconds = hours * 3600 + minutes * 60;
    return Math.floor(Date.now() / 1000) - elapsedSeconds;
  }

  return parseTimestamp(text("start-timestamp"));
}

function collectFormData() {
  const payload = {};
  for (const id of fieldIds) {
    const element = els[id];
    payload[id] =
      element?.type === "checkbox" ? Boolean(element.checked) : String(element?.value ?? "");
  }
  return payload;
}

function applyFormData(payload) {
  if (!payload || typeof payload !== "object") return;
  for (const id of fieldIds) {
    if (!(id in payload)) continue;
    const element = els[id];
    if (!element) continue;

    if (element.type === "checkbox") {
      element.checked = Boolean(payload[id]);
    } else if (typeof payload[id] === "string") {
      element.value = payload[id];
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

function setRotationStatus(value, tone = "neutral", raw = false) {
  lastRotationStatus = { key: value, tone, raw };
  els["rotation-status"].textContent = raw ? value : t(value);
  els["rotation-status"].dataset.tone = tone;
}

function setUpdateStatus(value, tone = "neutral", raw = false) {
  lastUpdateStatus = { key: value, tone, raw };
  els["update-status"].textContent = raw ? value : t(value);
  els["update-status"].dataset.tone = tone;
}

function renderAppVersion() {
  const label = appVersionValue || t("version_unknown");
  els["app-version"].textContent = label;
  els["current-version"].textContent = label;
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
  } catch {
    els["connected-sessions"].textContent = t("connected_sessions_none");
  }
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
    appVersionValue = typeof version === "string" ? version.trim() : "";
  } catch {
    appVersionValue = "";
  }
  renderAppVersion();
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

function buildPresencePayload(activityTypeOverride = null) {
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
    activityType: (activityTypeOverride ?? text("activity-type")) || "playing",
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

function getRotationTypes() {
  const selected = [];
  if (els["rotate-playing"].checked) selected.push("playing");
  if (els["rotate-watching"].checked) selected.push("watching");
  if (els["rotate-listening"].checked) selected.push("listening");
  if (els["rotate-competing"].checked) selected.push("competing");
  return selected;
}

function parseRotationIntervalSeconds() {
  const raw = text("rotation-interval-seconds");
  const value = Number(raw);
  if (!Number.isFinite(value) || !Number.isInteger(value) || value < 5) {
    throw new Error(t("err_rotation_interval"));
  }
  return value;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function looksLikeUrl(value) {
  return value.includes("://");
}

function formatDuration(seconds) {
  const safe = Math.max(0, Math.trunc(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function setPreviewImage(imageId, fallbackId, value, emptyText) {
  const image = els[imageId];
  const fallback = els[fallbackId];

  if (value && isHttpUrl(value)) {
    image.src = value;
    image.style.display = "block";
    fallback.style.display = "none";
    fallback.textContent = emptyText;
  } else {
    image.removeAttribute("src");
    image.style.display = "none";
    fallback.style.display = "inline-flex";
    fallback.textContent = value || emptyText;
  }
}

function updatePreviewTimerText() {
  if (previewTimestampError) {
    els["preview-time"].textContent = previewTimestampError;
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  if (previewStartTimestamp !== null) {
    const elapsed = now - previewStartTimestamp;
    els["preview-time"].textContent = `${formatDuration(elapsed)} ${t("preview_elapsed_suffix")}`;
    return;
  }

  if (previewEndTimestamp !== null) {
    const left = previewEndTimestamp - now;
    if (left > 0) {
      els["preview-time"].textContent = `${formatDuration(left)} left`;
    } else {
      els["preview-time"].textContent = "00:00:00 left";
    }
    return;
  }

  els["preview-time"].textContent = t("preview_no_timer");
}

function renderPreview() {
  const activityMap = {
    playing: t("activity_playing"),
    watching: t("activity_watching"),
    listening: t("activity_listening"),
    competing: t("activity_competing"),
  };

  const activityType = text("activity-type") || "playing";
  els["preview-activity-line"].textContent = activityMap[activityType] || t("activity_playing");
  els["preview-details"].textContent = text("details") || t("details_placeholder");
  els["preview-state"].textContent = text("state") || t("state_placeholder");

  setPreviewImage(
    "preview-large-image",
    "preview-large-fallback",
    text("large-image-key"),
    t("preview_no_image"),
  );
  setPreviewImage(
    "preview-small-image",
    "preview-small-fallback",
    text("small-image-key"),
    t("preview_no_small"),
  );

  const buttonsWrap = els["preview-buttons"];
  buttonsWrap.innerHTML = "";
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

  for (const button of [largeButton, smallButton]) {
    if (!button) continue;
    const anchor = document.createElement("a");
    anchor.className = "preview-button";
    anchor.href = button.url;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.textContent = button.label;
    buttonsWrap.append(anchor);
  }

  if (!buttonsWrap.childElementCount) {
    const none = document.createElement("span");
    none.className = "preview-empty-buttons";
    none.textContent = t("preview_no_buttons");
    buttonsWrap.append(none);
  }

  previewTimestampError = null;
  previewStartTimestamp = null;
  previewEndTimestamp = null;

  try {
    previewStartTimestamp = buildStartTimestamp();
  } catch (error) {
    previewTimestampError =
      typeof error?.message === "string" ? error.message : t("err_timestamp");
  }

  try {
    previewEndTimestamp = parseTimestamp(text("end-timestamp"));
  } catch (error) {
    if (!previewTimestampError) {
      previewTimestampError =
        typeof error?.message === "string" ? error.message : t("err_timestamp");
    }
  }

  updatePreviewTimerText();
}

function renderValidation() {
  const items = [];

  const clientId = text("client-id");
  if (!clientId) {
    items.push({ tone: "error", text: t("err_client_id") });
  } else if (!/^\d{17,20}$/.test(clientId)) {
    items.push({ tone: "error", text: t("validation_err_client_id_format") });
  }

  if (!text("details") && !text("state")) {
    items.push({ tone: "warn", text: t("validation_warn_no_details_state") });
  }

  const hasElapsed = text("start-elapsed-hours") || text("start-elapsed-minutes");
  const hasManualStart = text("start-timestamp");
  if (hasElapsed && hasManualStart) {
    items.push({ tone: "warn", text: t("validation_warn_dual_start_sources") });
  }

  let start = null;
  let end = null;
  let hasStartError = false;

  try {
    start = buildStartTimestamp();
  } catch (error) {
    hasStartError = true;
    items.push({
      tone: "error",
      text: typeof error?.message === "string" ? error.message : t("err_timestamp"),
    });
  }

  try {
    end = parseTimestamp(text("end-timestamp"));
  } catch (error) {
    items.push({
      tone: "error",
      text: typeof error?.message === "string" ? error.message : t("err_timestamp"),
    });
  }

  if (!hasStartError && start !== null && end !== null && end <= start) {
    items.push({ tone: "error", text: t("validation_err_end_before_start") });
  }

  const largeImage = text("large-image-key");
  if (largeImage && looksLikeUrl(largeImage) && !isHttpUrl(largeImage)) {
    items.push({ tone: "error", text: t("validation_err_large_image_url") });
  }

  const smallImage = text("small-image-key");
  if (smallImage && looksLikeUrl(smallImage) && !isHttpUrl(smallImage)) {
    items.push({ tone: "error", text: t("validation_err_small_image_url") });
  }

  const largeLabel = text("large-image-link-label");
  const largeUrl = text("large-image-link-url");
  if (largeLabel && !largeUrl) {
    items.push({ tone: "error", text: t("validation_err_large_button_pair") });
  }
  if (largeUrl && !isHttpUrl(largeUrl)) {
    items.push({ tone: "error", text: t("validation_err_large_button_url") });
  }

  const smallLabel = text("small-image-link-label");
  const smallUrl = text("small-image-link-url");
  if (smallLabel && !smallUrl) {
    items.push({ tone: "error", text: t("validation_err_small_button_pair") });
  }
  if (smallUrl && !isHttpUrl(smallUrl)) {
    items.push({ tone: "error", text: t("validation_err_small_button_url") });
  }

  const intervalRaw = text("rotation-interval-seconds");
  if (intervalRaw) {
    const interval = Number(intervalRaw);
    if (!Number.isFinite(interval) || !Number.isInteger(interval) || interval < 5) {
      items.push({ tone: "error", text: t("validation_err_rotation_interval") });
    }
  }

  if (getRotationTypes().length === 0) {
    items.push({ tone: "warn", text: t("validation_warn_rotation_empty") });
  }

  const list = els["validation-list"];
  list.innerHTML = "";

  const errors = items.filter((item) => item.tone === "error").length;
  const warnings = items.filter((item) => item.tone === "warn").length;

  if (!items.length) {
    const li = document.createElement("li");
    li.className = "validation-item ok";
    li.textContent = t("validation_ok_ready_apply");
    list.append(li);
    els["validation-summary"].textContent = t("validation_summary_ok");
    els["validation-summary"].dataset.tone = "good";
    return { errors: 0, warnings: 0 };
  }

  for (const item of items) {
    const li = document.createElement("li");
    li.className = `validation-item ${item.tone === "error" ? "error" : "warn"}`;
    li.textContent = item.text;
    list.append(li);
  }

  els["validation-summary"].textContent = tf("validation_summary_issues", {
    errors,
    warnings,
  });
  els["validation-summary"].dataset.tone = errors > 0 ? "bad" : "warn";

  return { errors, warnings };
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
  setRotationStatus(lastRotationStatus.key, lastRotationStatus.tone, lastRotationStatus.raw);
  setUpdateStatus(lastUpdateStatus.key, lastUpdateStatus.tone, lastUpdateStatus.raw);
  renderAppVersion();
  refreshConnectedSessions();
  renderPreview();
  renderValidation();
}

async function connectRpc() {
  const clientId = requireClientId();
  await invoke("rpc_connect", { clientId });
  await refreshConnectedSessions();
  setStatus("status_connected", "good");
}

async function disconnectRpc() {
  stopRotation(false);
  const clientId = requireClientId();
  await invoke("rpc_disconnect", { clientId });
  await refreshConnectedSessions();
  setStatus("status_disconnected", "neutral");
}

async function disconnectAllRpc() {
  stopRotation(false);
  await invoke("rpc_disconnect_all");
  await refreshConnectedSessions();
  setStatus("status_disconnected_all", "neutral");
}

async function setAutostartFromUi() {
  const enabled = Boolean(els["autostart-toggle"].checked);
  await invoke("autostart_set_enabled", { enabled });
  setStatus("status_autostart_updated", "good");
}

async function checkAndInstallUpdate() {
  try {
    setUpdateStatus("update_checking", "neutral");

    const update = await check();
    if (!update) {
      setUpdateStatus("update_none", "good");
      setStatus("status_update_none", "neutral");
      return;
    }

    setUpdateStatus(tf("update_found", { version: update.version }), "good", true);
    await update.downloadAndInstall();
    setUpdateStatus("update_installed", "good");
    setStatus("status_update_installed", "good");
  } catch (error) {
    const message =
      typeof error === "string"
        ? error
        : typeof error?.message === "string"
          ? error.message
          : String(error);
    setUpdateStatus(message, "bad", true);
    throw error;
  }
}

async function applyPresence() {
  const validation = renderValidation();
  if (validation.errors > 0) {
    throw new Error(t("validation_summary_issues").replace("{errors}", String(validation.errors)).replace("{warnings}", String(validation.warnings)));
  }

  const clientId = requireClientId();
  const presence = buildPresencePayload();
  await invoke("rpc_set_presence", { clientId, presence });
  setStatus("status_presence_updated", "good");
}

function getSelectedProfileName() {
  return text("profile-select") || text("profile-name");
}

async function runProfileByName(name) {
  const profiles = readProfiles();
  const data = profiles[name];
  if (!data) throw new Error(t("err_profile_missing"));

  applyFormData(data);
  els["profile-name"].value = name;
  refreshProfileSelect(name);

  const clientId = requireClientId();
  await invoke("rpc_connect", { clientId });

  const presence = buildPresencePayload();
  await invoke("rpc_set_presence", { clientId, presence });
  await refreshConnectedSessions();
  saveDraft();
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
  refreshProfileSelect();
  refreshQuickSlots();
  setStatus("status_profile_deleted", "neutral");
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

async function applyRotationStep() {
  if (!rotationTypes.length) {
    throw new Error(t("err_rotation_type_required"));
  }

  const type = rotationTypes[rotationCursor % rotationTypes.length];
  rotationCursor += 1;
  els["activity-type"].value = type;

  const clientId = requireClientId();
  const presence = buildPresencePayload(type);
  await invoke("rpc_set_presence", { clientId, presence });

  renderPreview();
}

function stopRotation(notify = true) {
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }

  rotationTypes = [];
  rotationCursor = 0;
  setRotationStatus("rotation_stopped", "neutral");

  if (notify) {
    setStatus("status_rotation_stopped", "neutral");
  }
}

async function startRotation() {
  const types = getRotationTypes();
  if (!types.length) throw new Error(t("err_rotation_type_required"));
  const intervalSeconds = parseRotationIntervalSeconds();

  const clientId = requireClientId();
  await invoke("rpc_connect", { clientId });

  rotationTypes = types;
  rotationCursor = 0;

  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }

  await applyRotationStep();

  rotationTimer = setInterval(async () => {
    try {
      await applyRotationStep();
    } catch (error) {
      stopRotation(false);
      const message =
        typeof error === "string"
          ? error
          : typeof error?.message === "string"
            ? error.message
            : String(error);
      setStatus(message, "bad", true);
    }
  }, intervalSeconds * 1000);

  const selectedNames = types
    .map((value) => t(`activity_${value}`))
    .join(", ");
  setRotationStatus(`${selectedNames} - ${intervalSeconds}s`, "good", true);

  await refreshConnectedSessions();
  setStatus("status_rotation_started", "good");
}

async function run(action) {
  try {
    await action();
    persistDraft();
    renderPreview();
    renderValidation();
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

window.addEventListener("DOMContentLoaded", () => {
  for (const id of [
    ...fieldIds,
    "profile-select",
    "profile-name",
    "lang-select",
    "autostart-toggle",
  ]) {
    els[id] = document.getElementById(id);
  }

  els.status = document.getElementById("status");
  els.connect = document.getElementById("connect-btn");
  els.disconnect = document.getElementById("disconnect-btn");
  els.disconnectAll = document.getElementById("disconnect-all-btn");
  els["check-updates-btn"] = document.getElementById("check-updates-btn");
  els["update-status"] = document.getElementById("update-status");
  els["app-version"] = document.getElementById("app-version");
  els["current-version"] = document.getElementById("current-version");
  els.apply = document.getElementById("apply-btn");
  els.clear = document.getElementById("clear-btn");
  els.saveProfile = document.getElementById("save-profile-btn");
  els.loadProfile = document.getElementById("load-profile-btn");
  els.deleteProfile = document.getElementById("delete-profile-btn");
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
  els["preview-activity-line"] = document.getElementById("preview-activity-line");
  els["preview-details"] = document.getElementById("preview-details");
  els["preview-state"] = document.getElementById("preview-state");
  els["preview-time"] = document.getElementById("preview-time");
  els["preview-buttons"] = document.getElementById("preview-buttons");
  els["preview-large-image"] = document.getElementById("preview-large-image");
  els["preview-small-image"] = document.getElementById("preview-small-image");
  els["preview-large-fallback"] = document.getElementById("preview-large-fallback");
  els["preview-small-fallback"] = document.getElementById("preview-small-fallback");
  els["validate-btn"] = document.getElementById("validate-btn");
  els["validation-list"] = document.getElementById("validation-list");
  els["validation-summary"] = document.getElementById("validation-summary");
  els["rotation-start-btn"] = document.getElementById("rotation-start-btn");
  els["rotation-stop-btn"] = document.getElementById("rotation-stop-btn");
  els["rotation-status"] = document.getElementById("rotation-status");

  for (const id of fieldIds) {
    if (!els[id]) continue;
    els[id].addEventListener("input", () => {
      saveDraft();
      renderPreview();
      renderValidation();
    });
    els[id].addEventListener("change", () => {
      saveDraft();
      renderPreview();
      renderValidation();
    });
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

  loadDraft();
  refreshProfileSelect();
  refreshQuickSlots();
  applyTranslations();
  refreshConnectedSessions();
  loadAutostartState();
  loadAppVersion();
  renderPreview();
  renderValidation();
  setStatus("status_disconnected", "neutral");
  setRotationStatus("rotation_stopped", "neutral");
  setUpdateStatus("update_idle", "neutral");

  if (previewTicker) clearInterval(previewTicker);
  previewTicker = setInterval(() => {
    updatePreviewTimerText();
  }, 1000);

  els.connect.addEventListener("click", () => run(connectRpc));
  els.disconnect.addEventListener("click", () => run(disconnectRpc));
  els.disconnectAll.addEventListener("click", () => run(disconnectAllRpc));
  els.apply.addEventListener("click", () => run(applyPresence));
  els.clear.addEventListener("click", () => run(clearPresence));

  els.saveProfile.addEventListener("click", () => run(() => saveProfile()));
  els.loadProfile.addEventListener("click", () => run(() => loadProfile()));
  els.deleteProfile.addEventListener("click", () => run(() => deleteProfile()));
  els["assign-slot-a"].addEventListener("click", () => run(() => assignSlot("a")));
  els["assign-slot-b"].addEventListener("click", () => run(() => assignSlot("b")));
  els["assign-slot-c"].addEventListener("click", () => run(() => assignSlot("c")));
  els["run-slot-a"].addEventListener("click", () => run(() => runSlot("a")));
  els["run-slot-b"].addEventListener("click", () => run(() => runSlot("b")));
  els["run-slot-c"].addEventListener("click", () => run(() => runSlot("c")));
  els["autostart-toggle"].addEventListener("change", () => run(setAutostartFromUi));
  els["check-updates-btn"].addEventListener("click", () => run(checkAndInstallUpdate));
  els["validate-btn"].addEventListener("click", () => {
    renderValidation();
    renderPreview();
  });
  els["rotation-start-btn"].addEventListener("click", () => run(startRotation));
  els["rotation-stop-btn"].addEventListener("click", () => run(() => stopRotation(true)));
});
