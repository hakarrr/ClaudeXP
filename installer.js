// Installs/uninstalls the ClaudeXP Stop hook into ~/.claude/settings.json.
// Merges safely: preserves unrelated keys, keeps other people's hooks,
// backs up the file before modifying.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const HOOK_PATH = path.join(__dirname, 'hook.js');
export const CLAUDE_DIR = path.join(os.homedir(), '.claude');
export const SETTINGS_PATH = path.join(CLAUDE_DIR, 'settings.json');
export const HOOK_COMMAND = `node "${HOOK_PATH}"`;

function stripBom(s) { return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s; }

function readSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) return { existed: false, data: {}, raw: '' };
  const raw = stripBom(fs.readFileSync(SETTINGS_PATH, 'utf8'));
  try {
    const data = raw.trim() ? JSON.parse(raw) : {};
    return { existed: true, data: data ?? {}, raw };
  } catch (err) {
    return { existed: true, invalid: true, error: err.message, raw };
  }
}

function writeSettings(data) {
  if (!fs.existsSync(CLAUDE_DIR)) fs.mkdirSync(CLAUDE_DIR, { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2) + '\n');
}

function backupSettings(raw) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const bak = `${SETTINGS_PATH}.bak-${ts}`;
  fs.writeFileSync(bak, raw);
  return bak;
}

function isOurHook(h) {
  return !!h
    && h.type === 'command'
    && typeof h.command === 'string'
    && /(claudexp|ccxp)[\\/][^\s"']*hook\.js/i.test(h.command);
}

export function hookStatus() {
  const s = readSettings();
  if (!s.existed) return { installed: false, reason: 'no settings.json', path: SETTINGS_PATH };
  if (s.invalid)  return { installed: false, reason: `settings.json invalid: ${s.error}`, path: SETTINGS_PATH };

  const stops = s.data?.hooks?.Stop || [];
  for (const entry of stops) {
    for (const h of (entry.hooks || [])) {
      if (h?.type === 'command' && h?.command === HOOK_COMMAND) {
        return { installed: true, current: true, command: h.command, path: SETTINGS_PATH };
      }
      if (isOurHook(h)) {
        return { installed: true, current: false, command: h.command, path: SETTINGS_PATH };
      }
    }
  }
  return { installed: false, path: SETTINGS_PATH };
}

export function installHook() {
  const s = readSettings();
  if (s.invalid) {
    return { ok: false, reason: `settings.json is not valid JSON (${s.error}). Fix it manually first.`, path: SETTINGS_PATH };
  }

  let backedUp = null;
  if (s.existed && s.raw) backedUp = backupSettings(s.raw);

  const data = s.data || {};
  data.hooks ??= {};
  data.hooks.Stop ??= [];

  // Remove stale ClaudeXP entries (wrong path from a previous location).
  let removedStale = 0;
  for (const entry of data.hooks.Stop) {
    if (!Array.isArray(entry.hooks)) continue;
    const before = entry.hooks.length;
    entry.hooks = entry.hooks.filter(h => {
      if (!isOurHook(h)) return true;
      if (h.command === HOOK_COMMAND) return true; // keep current, dedupe below
      return false;
    });
    removedStale += before - entry.hooks.length;
  }

  let entry = data.hooks.Stop.find(e => (e.matcher ?? '') === '');
  if (!entry) {
    entry = { matcher: '', hooks: [] };
    data.hooks.Stop.push(entry);
  }
  entry.hooks ??= [];

  const already = entry.hooks.some(h => h?.type === 'command' && h?.command === HOOK_COMMAND);
  if (!already) {
    entry.hooks.push({ type: 'command', command: HOOK_COMMAND });
  }

  // Drop empty Stop entries (after stale removal).
  data.hooks.Stop = data.hooks.Stop.filter(e => Array.isArray(e.hooks) && e.hooks.length > 0);

  writeSettings(data);
  return {
    ok: true,
    alreadyInstalled: already && removedStale === 0,
    removedStale,
    path: SETTINGS_PATH,
    backupPath: backedUp,
  };
}

export function uninstallHook() {
  const s = readSettings();
  if (!s.existed) return { ok: true, removed: 0, path: SETTINGS_PATH };
  if (s.invalid)  return { ok: false, reason: `settings.json invalid: ${s.error}`, path: SETTINGS_PATH };

  const stops = s.data?.hooks?.Stop;
  if (!Array.isArray(stops)) return { ok: true, removed: 0, path: SETTINGS_PATH };

  const backedUp = backupSettings(s.raw);

  let removed = 0;
  for (const entry of stops) {
    if (!Array.isArray(entry.hooks)) continue;
    const before = entry.hooks.length;
    entry.hooks = entry.hooks.filter(h => !isOurHook(h));
    removed += before - entry.hooks.length;
  }

  s.data.hooks.Stop = stops.filter(e => Array.isArray(e.hooks) && e.hooks.length > 0);
  if (s.data.hooks.Stop.length === 0) delete s.data.hooks.Stop;
  if (s.data.hooks && Object.keys(s.data.hooks).length === 0) delete s.data.hooks;

  writeSettings(s.data);
  return { ok: true, removed, path: SETTINGS_PATH, backupPath: backedUp };
}
