import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG_DIR    = path.join(os.homedir(), '.claudexp');
const CONFIG_PATH   = path.join(CONFIG_DIR, 'config.json');
const COMMUNITY_PATH = path.join(__dirname, 'community.json');

export const CONFIG_PATH_LOCATION = CONFIG_PATH;
export const COMMUNITY_PATH_LOCATION = COMMUNITY_PATH;

export function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch { return {}; }
}

export function saveConfig(cfg) {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  try { fs.chmodSync(CONFIG_PATH, 0o600); } catch {}
}

export function updateConfig(patch) {
  const next = { ...loadConfig(), ...patch };
  saveConfig(next);
  return next;
}

export function loadCommunityConfig() {
  try {
    if (!fs.existsSync(COMMUNITY_PATH)) return {};
    const raw = fs.readFileSync(COMMUNITY_PATH, 'utf8');
    return raw.trim() ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function resolveCloudConfig() {
  const local = loadConfig();
  const community = loadCommunityConfig();
  const url = (local.supabase_url || community.supabase_url || '').replace(/\/+$/, '');
  const key = local.supabase_anon_key || community.supabase_anon_key || '';
  return {
    url,
    key,
    ownerToken: local.owner_token || '',
    claimedUsername: local.claimed_username || '',
    overridden: !!(local.supabase_url || local.supabase_anon_key),
    hasCommunity: !!(community.supabase_url && community.supabase_anon_key),
  };
}

export function hasCloudConfig() {
  const c = resolveCloudConfig();
  return !!(c.url && c.key);
}

export function clearCloudConfig() {
  const cfg = loadConfig();
  delete cfg.supabase_url;
  delete cfg.supabase_anon_key;
  saveConfig(cfg);
}

export function saveClaim(username, ownerToken) {
  updateConfig({ claimed_username: username, owner_token: ownerToken });
}

export function clearClaim() {
  const cfg = loadConfig();
  delete cfg.claimed_username;
  delete cfg.owner_token;
  saveConfig(cfg);
}
