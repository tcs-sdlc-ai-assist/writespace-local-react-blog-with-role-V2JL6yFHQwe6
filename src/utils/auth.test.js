import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  login,
  logout,
  register,
  getCurrentUser,
  isAdmin,
} from './auth.js';
import {
  getUsers,
  saveUsers,
  getSession,
  saveSession,
  clearSession,
} from './storage.js';

describe('auth.js', () => {
  beforeEach(() => {
    localStorage.clear();
    // Ensure admin user is present
    localStorage.setItem(
      'writespace_users',
      JSON.stringify([
        {
          id: 'admin',
          displayName: 'Admin',
          username: 'admin',
          password: 'admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
      ])
    );
    localStorage.removeItem('writespace_session');
  });

  describe('login', () => {
    it('successfully logs in the admin user with correct credentials', () => {
      const result = login('admin', 'admin');
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.userId).toBe('admin');
      expect(result.session.username).toBe('admin');
      expect(result.session.displayName).toBe('Admin');
      expect(result.session.role).toBe('admin');
    });

    it('saves session to storage on successful login', () => {
      login('admin', 'admin');
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.userId).toBe('admin');
    });

    it('successfully logs in a regular user with correct credentials', () => {
      const users = getUsers();
      users.push({
        id: 'user-1',
        displayName: 'Test User',
        username: 'testuser',
        password: 'password123',
        role: 'user',
        createdAt: new Date().toISOString(),
      });
      saveUsers(users);

      const result = login('testuser', 'password123');
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.userId).toBe('user-1');
      expect(result.session.username).toBe('testuser');
      expect(result.session.displayName).toBe('Test User');
      expect(result.session.role).toBe('user');
    });

    it('returns error for invalid username', () => {
      const result = login('nonexistent', 'admin');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password.');
    });

    it('returns error for invalid password', () => {
      const result = login('admin', 'wrongpassword');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password.');
    });

    it('returns error when username is empty', () => {
      const result = login('', 'admin');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required.');
    });

    it('returns error when password is empty', () => {
      const result = login('admin', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required.');
    });

    it('returns error when both fields are empty', () => {
      const result = login('', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required.');
    });

    it('returns error when username is null', () => {
      const result = login(null, 'admin');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required.');
    });

    it('returns error when password is null', () => {
      const result = login('admin', null);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username and password are required.');
    });
  });

  describe('logout', () => {
    it('clears the session from storage', () => {
      login('admin', 'admin');
      expect(getSession()).not.toBeNull();

      logout();
      expect(getSession()).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => logout()).not.toThrow();
    });
  });

  describe('register', () => {
    it('successfully registers a new user', () => {
      const result = register('Jane Doe', 'janedoe', 'mypassword');
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session.username).toBe('janedoe');
      expect(result.session.displayName).toBe('Jane Doe');
      expect(result.session.role).toBe('user');
      expect(result.session.userId).toBeDefined();
    });

    it('saves the new user to storage', () => {
      register('Jane Doe', 'janedoe', 'mypassword');
      const users = getUsers();
      const jane = users.find((u) => u.username === 'janedoe');
      expect(jane).toBeDefined();
      expect(jane.displayName).toBe('Jane Doe');
      expect(jane.password).toBe('mypassword');
      expect(jane.role).toBe('user');
      expect(jane.createdAt).toBeDefined();
    });

    it('saves session on successful registration', () => {
      register('Jane Doe', 'janedoe', 'mypassword');
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.username).toBe('janedoe');
    });

    it('returns error for duplicate username (exact match)', () => {
      register('First User', 'testuser', 'pass1');
      const result = register('Second User', 'testuser', 'pass2');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username already exists.');
    });

    it('returns error for duplicate username (case-insensitive)', () => {
      register('First User', 'TestUser', 'pass1');
      const result = register('Second User', 'testuser', 'pass2');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username already exists.');
    });

    it('returns error when trying to register with admin username', () => {
      const result = register('Fake Admin', 'admin', 'fakepass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Username already exists.');
    });

    it('returns error when displayName is empty', () => {
      const result = register('', 'newuser', 'pass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required.');
    });

    it('returns error when username is empty', () => {
      const result = register('New User', '', 'pass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required.');
    });

    it('returns error when password is empty', () => {
      const result = register('New User', 'newuser', '');
      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required.');
    });

    it('returns error when all fields are null', () => {
      const result = register(null, null, null);
      expect(result.success).toBe(false);
      expect(result.error).toBe('All fields are required.');
    });

    it('assigns role user to newly registered users', () => {
      const result = register('Regular User', 'regularuser', 'pass123');
      expect(result.success).toBe(true);
      expect(result.session.role).toBe('user');

      const users = getUsers();
      const user = users.find((u) => u.username === 'regularuser');
      expect(user.role).toBe('user');
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when no session exists', () => {
      const user = getCurrentUser();
      expect(user).toBeNull();
    });

    it('returns the session object after login', () => {
      login('admin', 'admin');
      const user = getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.userId).toBe('admin');
      expect(user.username).toBe('admin');
      expect(user.displayName).toBe('Admin');
      expect(user.role).toBe('admin');
    });

    it('returns the session object after registration', () => {
      register('New Person', 'newperson', 'pass');
      const user = getCurrentUser();
      expect(user).not.toBeNull();
      expect(user.username).toBe('newperson');
      expect(user.role).toBe('user');
    });

    it('returns null after logout', () => {
      login('admin', 'admin');
      expect(getCurrentUser()).not.toBeNull();

      logout();
      expect(getCurrentUser()).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('returns false when no session exists', () => {
      expect(isAdmin()).toBe(false);
    });

    it('returns true when logged in as admin', () => {
      login('admin', 'admin');
      expect(isAdmin()).toBe(true);
    });

    it('returns false when logged in as regular user', () => {
      register('Regular', 'regular', 'pass');
      expect(isAdmin()).toBe(false);
    });

    it('returns false after admin logs out', () => {
      login('admin', 'admin');
      expect(isAdmin()).toBe(true);

      logout();
      expect(isAdmin()).toBe(false);
    });
  });

  describe('integration flows', () => {
    it('register then login with same credentials works', () => {
      const regResult = register('Flow User', 'flowuser', 'flowpass');
      expect(regResult.success).toBe(true);

      logout();

      const loginResult = login('flowuser', 'flowpass');
      expect(loginResult.success).toBe(true);
      expect(loginResult.session.username).toBe('flowuser');
      expect(loginResult.session.displayName).toBe('Flow User');
    });

    it('multiple users can be registered and logged in separately', () => {
      register('User One', 'userone', 'pass1');
      logout();

      register('User Two', 'usertwo', 'pass2');
      logout();

      const result1 = login('userone', 'pass1');
      expect(result1.success).toBe(true);
      expect(result1.session.displayName).toBe('User One');

      logout();

      const result2 = login('usertwo', 'pass2');
      expect(result2.success).toBe(true);
      expect(result2.session.displayName).toBe('User Two');
    });

    it('login overwrites previous session', () => {
      login('admin', 'admin');
      expect(getCurrentUser().userId).toBe('admin');

      register('Another User', 'another', 'pass');
      expect(getCurrentUser().username).toBe('another');
    });
  });
});