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
];

const els = {};
let draftSaveTimer = null;

const i18n = {
  en: {
    eyebrow: "Discord Rich Presence",
    language_label: "Language",
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
    default_large_button: "Open Large Image",
    default_small_button: "Open Small Image",
  },
  sl: {
    eyebrow: "Discord Rich Presence",
    language_label: "Jezik",
    subtitle:
      "Nastavi details, state in slike za lokalni Discord desktop session.",
    profiles_title: "Profili",
    profile_name_placeholder: "Ime profila",
    save_profile_btn: "Shrani profil",
    load_profile_btn: "Nalozi",
    delete_profile_btn: "Izbrisi",
    profiles_hint: "Shrani in nalozi celoten RPC setup z enim klikom.",
    behavior_title: "Obnasanje aplikacije",
    autostart_label: "Zazeni ob zagonu sistema",
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
    default_large_button: "Odpri veliko sliko",
    default_small_button: "Odpri malo sliko",
  },
};

let currentLang = "en";
let lastStatus = { key: "status_disconnected", tone: "neutral", raw: false };

function t(key) {
  return i18n[currentLang]?.[key] ?? i18n.en[key] ?? key;
}

function text(id) {
  return els[id].value.trim();
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
  refreshConnectedSessions();
}

async function connectRpc() {
  const clientId = requireClientId();
  await invoke("rpc_connect", { clientId });
  await refreshConnectedSessions();
  setStatus("status_connected", "good");
}

async function disconnectRpc() {
  const clientId = requireClientId();
  await invoke("rpc_disconnect", { clientId });
  await refreshConnectedSessions();
  setStatus("status_disconnected", "neutral");
}

async function disconnectAllRpc() {
  await invoke("rpc_disconnect_all");
  await refreshConnectedSessions();
  setStatus("status_disconnected_all", "neutral");
}

async function setAutostartFromUi() {
  const enabled = Boolean(els["autostart-toggle"].checked);
  await invoke("autostart_set_enabled", { enabled });
  setStatus("status_autostart_updated", "good");
}

async function applyPresence() {
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

  const presence = {
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

  const clientId = requireClientId();
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

  const presence = {
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

  loadDraft();
  refreshProfileSelect();
  refreshQuickSlots();
  applyTranslations();
  refreshConnectedSessions();
  loadAutostartState();
  setStatus("status_disconnected", "neutral");

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
});
