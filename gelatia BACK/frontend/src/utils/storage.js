const SESSION_KEY = "gelatia-session";
const BRANCH_KEY = "gelatia-active-branch";

export function loadSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(value) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(value));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function loadBranch() {
  try {
    const raw = window.localStorage.getItem(BRANCH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveBranch(value) {
  window.localStorage.setItem(BRANCH_KEY, JSON.stringify(value));
}

export function clearBranch() {
  window.localStorage.removeItem(BRANCH_KEY);
}
