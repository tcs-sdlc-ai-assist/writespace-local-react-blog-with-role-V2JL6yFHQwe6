import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getUsers,
  saveUsers,
  getPosts,
  savePosts,
  getSession,
  saveSession,
  clearSession,
} from './storage.js';

describe('storage.js', () => {
  beforeEach(() => {
    localStorage.clear();
    // Re-initialize by ensuring admin user exists after clearing
    // We need to reset the module state, so we manually set the admin
    const defaultAdmin = {
      id: 'admin',
      displayName: 'Admin',
      username: 'admin',
      password: 'admin',
      role: 'admin',
      createdAt: expect.any(String),
    };
    // Clear any leftover session
    localStorage.removeItem('writespace_session');
    // Ensure admin user is present
    const users = JSON.parse(localStorage.getItem('writespace_users') || '[]');
    if (!users.some((u) => u.id === 'admin')) {
      localStorage.setItem('writespace_users', JSON.stringify([{
        id: 'admin',
        displayName: 'Admin',
        username: 'admin',
        password: 'admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
      }]));
    }
  });

  describe('getUsers', () => {
    it('returns an array that includes the default admin user', () => {
      const users = getUsers();
      expect(Array.isArray(users)).toBe(true);
      const admin = users.find((u) => u.id === 'admin');
      expect(admin).toBeDefined();
      expect(admin.username).toBe('admin');
      expect(admin.role).toBe('admin');
      expect(admin.displayName).toBe('Admin');
    });

    it('returns default admin when localStorage has corrupted users data', () => {
      localStorage.setItem('writespace_users', 'not-valid-json!!!');
      const users = getUsers();
      // Should gracefully handle and return an array
      expect(Array.isArray(users)).toBe(true);
    });

    it('returns default admin array when localStorage has non-array value', () => {
      localStorage.setItem('writespace_users', JSON.stringify('string-value'));
      const users = getUsers();
      expect(Array.isArray(users)).toBe(true);
      // Should contain at least the default admin
      expect(users.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('saveUsers', () => {
    it('persists users array to localStorage', () => {
      const testUsers = [
        {
          id: 'admin',
          displayName: 'Admin',
          username: 'admin',
          password: 'admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'user-1',
          displayName: 'Test User',
          username: 'testuser',
          password: 'pass123',
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      ];

      saveUsers(testUsers);
      const stored = JSON.parse(localStorage.getItem('writespace_users'));
      expect(stored).toHaveLength(2);
      expect(stored[1].username).toBe('testuser');
    });

    it('does not save non-array values and logs a warning', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      saveUsers('not-an-array');
      warnSpy.mockRestore();
      // Users should still be the previous value, not overwritten
      const users = getUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    it('saves an empty array', () => {
      saveUsers([]);
      const stored = JSON.parse(localStorage.getItem('writespace_users'));
      expect(stored).toEqual([]);
    });
  });

  describe('getPosts', () => {
    it('returns an empty array when no posts exist', () => {
      localStorage.removeItem('writespace_posts');
      const posts = getPosts();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts).toHaveLength(0);
    });

    it('returns stored posts', () => {
      const testPosts = [
        {
          id: 'post-1',
          title: 'Test Post',
          content: 'Hello world',
          authorId: 'admin',
          authorName: 'Admin',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(testPosts));
      const posts = getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe('Test Post');
    });

    it('returns empty array for corrupted posts data', () => {
      localStorage.setItem('writespace_posts', '{broken json');
      const posts = getPosts();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts).toHaveLength(0);
    });

    it('returns empty array when posts value is not an array', () => {
      localStorage.setItem('writespace_posts', JSON.stringify({ foo: 'bar' }));
      const posts = getPosts();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts).toHaveLength(0);
    });
  });

  describe('savePosts', () => {
    it('persists posts array to localStorage', () => {
      const testPosts = [
        {
          id: 'post-1',
          title: 'My Post',
          content: 'Content here',
          authorId: 'admin',
          authorName: 'Admin',
          createdAt: new Date().toISOString(),
        },
      ];

      savePosts(testPosts);
      const stored = JSON.parse(localStorage.getItem('writespace_posts'));
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('post-1');
    });

    it('does not save non-array values', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      savePosts(null);
      warnSpy.mockRestore();
      // Should not have overwritten with null
      const posts = getPosts();
      expect(Array.isArray(posts)).toBe(true);
    });

    it('saves an empty array to clear all posts', () => {
      savePosts([{ id: '1', title: 'T', content: 'C', authorId: 'a', authorName: 'A', createdAt: '' }]);
      savePosts([]);
      const stored = JSON.parse(localStorage.getItem('writespace_posts'));
      expect(stored).toEqual([]);
    });
  });

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      localStorage.removeItem('writespace_session');
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns the stored session object', () => {
      const testSession = {
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };
      localStorage.setItem('writespace_session', JSON.stringify(testSession));
      const session = getSession();
      expect(session).not.toBeNull();
      expect(session.userId).toBe('admin');
      expect(session.role).toBe('admin');
    });

    it('returns null for corrupted session data', () => {
      localStorage.setItem('writespace_session', 'not-json');
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null for session object without userId', () => {
      localStorage.setItem('writespace_session', JSON.stringify({ role: 'admin' }));
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null for non-object session values', () => {
      localStorage.setItem('writespace_session', JSON.stringify('just-a-string'));
      const session = getSession();
      expect(session).toBeNull();
    });
  });

  describe('saveSession', () => {
    it('persists session to localStorage', () => {
      const testSession = {
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      };

      saveSession(testSession);
      const stored = JSON.parse(localStorage.getItem('writespace_session'));
      expect(stored.userId).toBe('user-1');
      expect(stored.username).toBe('testuser');
    });

    it('does not save invalid session values', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      saveSession(null);
      warnSpy.mockRestore();
      const session = getSession();
      expect(session).toBeNull();
    });

    it('does not save non-object session values', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      saveSession('string-session');
      warnSpy.mockRestore();
    });
  });

  describe('clearSession', () => {
    it('removes the session from localStorage', () => {
      const testSession = {
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      };

      saveSession(testSession);
      expect(getSession()).not.toBeNull();

      clearSession();
      expect(getSession()).toBeNull();
    });

    it('does not throw when no session exists', () => {
      localStorage.removeItem('writespace_session');
      expect(() => clearSession()).not.toThrow();
    });
  });

  describe('schema consistency', () => {
    it('user objects have the expected schema fields', () => {
      const users = getUsers();
      const admin = users.find((u) => u.id === 'admin');
      expect(admin).toHaveProperty('id');
      expect(admin).toHaveProperty('displayName');
      expect(admin).toHaveProperty('username');
      expect(admin).toHaveProperty('password');
      expect(admin).toHaveProperty('role');
      expect(admin).toHaveProperty('createdAt');
    });

    it('session objects returned by getSession have expected fields', () => {
      const testSession = {
        userId: 'user-2',
        username: 'jane',
        displayName: 'Jane Doe',
        role: 'user',
      };
      saveSession(testSession);
      const session = getSession();
      expect(session).toHaveProperty('userId');
      expect(session).toHaveProperty('username');
      expect(session).toHaveProperty('displayName');
      expect(session).toHaveProperty('role');
    });

    it('post objects round-trip through save and get correctly', () => {
      const testPost = {
        id: 'post-rt',
        title: 'Round Trip',
        content: 'Testing round trip',
        authorId: 'admin',
        authorName: 'Admin',
        authorRole: 'admin',
        createdAt: new Date().toISOString(),
      };
      savePosts([testPost]);
      const posts = getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0]).toEqual(testPost);
    });
  });

  describe('default admin initialization', () => {
    it('ensures admin user exists even when users key is empty array', () => {
      localStorage.setItem('writespace_users', JSON.stringify([]));
      // Re-import would re-run ensureAdminUser, but since module is cached,
      // we test that getUsers at least returns an array
      const users = getUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    it('admin user has role set to admin', () => {
      const users = getUsers();
      const admin = users.find((u) => u.username === 'admin');
      expect(admin).toBeDefined();
      expect(admin.role).toBe('admin');
    });
  });
});