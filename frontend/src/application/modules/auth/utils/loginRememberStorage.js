/**
 * Preferencias "recordar usuario y contraseña" en este equipo (localStorage).
 * Solo conveniencia de reingreso; no extiende la vigencia del token en servidor.
 */

const KEY_ENABLED = 'incos_login_remember';
const KEY_USERNAME = 'incos_login_username';
const KEY_PASSWORD = 'incos_login_password';

function encodePassword(value) {
  try {
    return btoa(String(value ?? ''));
  } catch {
    return '';
  }
}

function decodePassword(encoded) {
  if (!encoded) return '';
  try {
    return atob(encoded);
  } catch {
    return '';
  }
}

export function isLoginRememberEnabled() {
  return localStorage.getItem(KEY_ENABLED) === '1';
}

/**
 * @returns {{ username: string, password: string } | null}
 */
export function loadRememberedLogin() {
  if (!isLoginRememberEnabled()) return null;
  const username = localStorage.getItem(KEY_USERNAME)?.trim() ?? '';
  const password = decodePassword(localStorage.getItem(KEY_PASSWORD));
  if (!username) return null;
  return { username, password };
}

/**
 * @param {{ username: string, password: string }} credentials
 */
export function saveRememberedLogin(credentials) {
  const username = String(credentials?.username ?? '').trim();
  const password = String(credentials?.password ?? '');
  if (!username) return;
  localStorage.setItem(KEY_ENABLED, '1');
  localStorage.setItem(KEY_USERNAME, username);
  localStorage.setItem(KEY_PASSWORD, encodePassword(password));
}

export function clearRememberedLogin() {
  localStorage.removeItem(KEY_ENABLED);
  localStorage.removeItem(KEY_USERNAME);
  localStorage.removeItem(KEY_PASSWORD);
}
