import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, isAdmin } from '../utils/auth.js';
import { getUsers, saveUsers } from '../utils/storage.js';
import UserRow from '../components/UserRow.jsx';

/**
 * Generate a simple unique ID.
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
}

/**
 * Admin-only user management page at '/admin/users'.
 * Displays a create user form (Display Name, Username, Password, Role select)
 * with validation and unique username check. Lists all users using UserRow component.
 * Delete action with confirmation. Hard-coded admin cannot be deleted.
 * Logged-in user cannot delete own account. Loads/saves via storage.js.
 */
function UserManagement() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  const [users, setUsers] = useState([]);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || !userIsAdmin) {
      navigate('/login', { replace: true });
      return;
    }

    setUsers(getUsers());
  }, [currentUser, userIsAdmin, navigate]);

  function handleCreateUser(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim();

    if (!trimmedDisplayName) {
      setError('Display Name is required.');
      return;
    }

    if (!trimmedUsername) {
      setError('Username is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    const currentUsers = getUsers();
    const duplicate = currentUsers.find(
      (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
    );

    if (duplicate) {
      setError('Username already exists. Please choose a different one.');
      return;
    }

    setLoading(true);

    try {
      const newUser = {
        id: generateId(),
        displayName: trimmedDisplayName,
        username: trimmedUsername,
        password,
        role,
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...currentUsers, newUser];
      saveUsers(updatedUsers);
      setUsers(updatedUsers);

      setDisplayName('');
      setUsername('');
      setPassword('');
      setRole('user');
      setSuccess(`User "${newUser.displayName}" created successfully.`);
      setLoading(false);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  function handleDeleteUser(userId) {
    if (userId === 'admin') {
      return;
    }

    if (currentUser && currentUser.userId === userId) {
      return;
    }

    const userToDelete = users.find((u) => u.id === userId);
    const userName = userToDelete ? userToDelete.displayName : 'this user';

    const confirmed = window.confirm(
      `Are you sure you want to delete "${userName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const currentUsers = getUsers();
      const updatedUsers = currentUsers.filter((u) => u.id !== userId);
      saveUsers(updatedUsers);
      setUsers(updatedUsers);
      setSuccess(`User "${userName}" has been deleted.`);
      setError('');
    } catch {
      setError('Failed to delete user. Please try again.');
    }
  }

  if (!currentUser || !userIsAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">👥</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              User Management
            </h1>
          </div>
          <p className="text-primary-100 text-sm sm:text-base max-w-xl">
            Create new users, manage roles, and remove accounts from the platform.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create User Form */}
        <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6 sm:p-8 mb-10">
          <h2 className="text-lg font-semibold text-surface-800 mb-6">
            Create New User
          </h2>

          <form onSubmit={handleCreateUser} className="space-y-5">
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-surface-700 mb-1"
                >
                  Display Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="block w-full rounded-md border border-surface-300 px-3 py-2 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Enter display name"
                  autoComplete="name"
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-surface-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-md border border-surface-300 px-3 py-2 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-surface-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-surface-300 px-3 py-2 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-surface-700 mb-1"
                >
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full rounded-md border border-surface-300 px-3 py-2 text-sm text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 text-sm font-semibold rounded-md text-white shadow-sm transition-colors ${
                  loading
                    ? 'bg-primary-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                {loading ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>

        {/* Users List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-surface-800">
              All Users ({users.length})
            </h2>
          </div>

          {users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onDelete={handleDeleteUser}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-surface-200">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-surface-700 mb-2">
                No users found
              </h3>
              <p className="text-surface-500 text-sm">
                Create a new user using the form above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserManagement;