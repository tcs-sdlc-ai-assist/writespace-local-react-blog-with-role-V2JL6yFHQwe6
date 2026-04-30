const KEYS = {
  POSTS: 'writespace_posts',
  USERS: 'writespace_users',
  SESSION: 'writespace_session',
};

const DEFAULT_ADMIN = {
  id: 'admin',
  displayName: 'Admin',
  username: 'admin',
  password: 'admin',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

let memoryStore = {
  [KEYS.POSTS]: [],
  [KEYS.USERS]: [DEFAULT_ADMIN],
  [KEYS.SESSION]: null,
};

let localStorageAvailable = true;

/**
 * Check if localStorage is available and functional.
 * @returns {boolean}
 */
function checkLocalStorage() {
  try {
    const testKey = '__writespace_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

localStorageAvailable = checkLocalStorage();

if (!localStorageAvailable) {
  console.warn('WriteSpace: localStorage is unavailable. Data will not persist across page reloads.');
}

/**
 * Read and parse a value from localStorage (or memory fallback).
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
function readFromStorage(key, fallback) {
  if (!localStorageAvailable) {
    const value = memoryStore[key];
    return value !== undefined ? value : fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    console.warn(`WriteSpace: Failed to parse localStorage key "${key}". Returning fallback.`);
    return fallback;
  }
}

/**
 * Write a value to localStorage (or memory fallback).
 * @param {string} key
 * @param {*} value
 */
function writeToStorage(key, value) {
  if (!localStorageAvailable) {
    memoryStore[key] = value;
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`WriteSpace: Failed to write to localStorage key "${key}". Falling back to memory.`);
    memoryStore[key] = value;
  }
}

/**
 * Remove a key from localStorage (or memory fallback).
 * @param {string} key
 */
function removeFromStorage(key) {
  if (!localStorageAvailable) {
    memoryStore[key] = null;
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(`WriteSpace: Failed to remove localStorage key "${key}".`);
    memoryStore[key] = null;
  }
}

/**
 * Ensure the default admin user exists in the users list.
 */
function ensureAdminUser() {
  const users = readFromStorage(KEYS.USERS, []);
  if (!Array.isArray(users) || users.length === 0) {
    writeToStorage(KEYS.USERS, [DEFAULT_ADMIN]);
    return;
  }
  const hasAdmin = users.some((u) => u.id === 'admin' || u.username === 'admin');
  if (!hasAdmin) {
    writeToStorage(KEYS.USERS, [DEFAULT_ADMIN, ...users]);
  }
}

ensureAdminUser();

/**
 * Get all users from storage.
 * @returns {Array<Object>}
 */
export function getUsers() {
  const users = readFromStorage(KEYS.USERS, []);
  if (!Array.isArray(users)) {
    return [DEFAULT_ADMIN];
  }
  return users;
}

/**
 * Save users array to storage.
 * @param {Array<Object>} users
 */
export function saveUsers(users) {
  if (!Array.isArray(users)) {
    console.warn('WriteSpace: saveUsers called with non-array value.');
    return;
  }
  writeToStorage(KEYS.USERS, users);
}

/**
 * Get all posts from storage.
 * @returns {Array<Object>}
 */
export function getPosts() {
  const posts = readFromStorage(KEYS.POSTS, []);
  if (!Array.isArray(posts)) {
    return [];
  }
  return posts;
}

/**
 * Save posts array to storage.
 * @param {Array<Object>} posts
 */
export function savePosts(posts) {
  if (!Array.isArray(posts)) {
    console.warn('WriteSpace: savePosts called with non-array value.');
    return;
  }
  writeToStorage(KEYS.POSTS, posts);
}

/**
 * Get the current session from storage.
 * @returns {Object|null}
 */
export function getSession() {
  const session = readFromStorage(KEYS.SESSION, null);
  if (session && typeof session === 'object' && session.userId) {
    return session;
  }
  return null;
}

/**
 * Save a session object to storage.
 * @param {Object} session
 */
export function saveSession(session) {
  if (!session || typeof session !== 'object') {
    console.warn('WriteSpace: saveSession called with invalid value.');
    return;
  }
  writeToStorage(KEYS.SESSION, session);
}

/**
 * Clear the current session from storage.
 */
export function clearSession() {
  removeFromStorage(KEYS.SESSION);
}