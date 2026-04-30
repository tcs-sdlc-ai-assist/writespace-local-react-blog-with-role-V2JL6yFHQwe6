import { getUsers, saveUsers, getSession, saveSession, clearSession } from './storage.js';

/**
 * Generate a simple unique ID.
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
}

/**
 * Authenticate a user by username and password.
 * Checks against stored users (including the hard-coded admin).
 * On success, saves the session to storage.
 * @param {string} username
 * @param {string} password
 * @returns {{ success: boolean, error?: string, session?: Object }}
 */
export function login(username, password) {
  if (!username || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  const users = getUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return { success: false, error: 'Invalid username or password.' };
  }

  const session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };

  saveSession(session);
  return { success: true, session };
}

/**
 * Clear the current session (log out).
 */
export function logout() {
  clearSession();
}

/**
 * Register a new user account.
 * Validates inputs, checks for duplicate usernames, creates the user,
 * saves to storage, and starts a session.
 * @param {string} displayName
 * @param {string} username
 * @param {string} password
 * @returns {{ success: boolean, error?: string, session?: Object }}
 */
export function register(displayName, username, password) {
  if (!displayName || !username || !password) {
    return { success: false, error: 'All fields are required.' };
  }

  const users = getUsers();
  const duplicate = users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );

  if (duplicate) {
    return { success: false, error: 'Username already exists.' };
  }

  const newUser = {
    id: generateId(),
    displayName,
    username,
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const session = {
    userId: newUser.id,
    username: newUser.username,
    displayName: newUser.displayName,
    role: newUser.role,
  };

  saveSession(session);
  return { success: true, session };
}

/**
 * Get the current logged-in user session.
 * @returns {Object|null}
 */
export function getCurrentUser() {
  return getSession();
}

/**
 * Check if the current session belongs to an admin user.
 * @returns {boolean}
 */
export function isAdmin() {
  const session = getSession();
  return session !== null && session.role === 'admin';
}