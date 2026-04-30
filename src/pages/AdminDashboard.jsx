import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, isAdmin } from '../utils/auth.js';
import { getPosts, savePosts, getUsers } from '../utils/storage.js';
import StatCard from '../components/StatCard.jsx';
import { getAvatar } from '../components/Avatar.jsx';

/**
 * Format an ISO date string to a human-readable format.
 * @param {string} dateString - ISO date string
 * @returns {string}
 */
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Truncate text to a given max length, appending ellipsis if needed.
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum character length
 * @returns {string}
 */
function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}

/**
 * Admin-only dashboard page at '/admin'.
 * Displays gradient banner header, stat cards (total posts, total users,
 * admin count, user count), quick-action buttons, and recent posts section
 * with edit/delete controls. Loads data from storage.js.
 */
function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!currentUser || !userIsAdmin) {
      navigate('/login', { replace: true });
      return;
    }

    setPosts(getPosts());
    setUsers(getUsers());
  }, [currentUser, userIsAdmin, navigate]);

  const totalPosts = posts.length;
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role === 'user').length;

  const recentPosts = [...posts]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  function handleDeletePost(postId) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const currentPosts = getPosts();
      const updatedPosts = currentPosts.filter((p) => p.id !== postId);
      savePosts(updatedPosts);
      setPosts(updatedPosts);
    } catch {
      // Silently handle — post may already be deleted
    }
  }

  if (!currentUser || !userIsAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Gradient Banner Header */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">👑</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-primary-100 text-sm sm:text-base max-w-xl">
            Welcome back, {currentUser.displayName}. Here&apos;s an overview of your WriteSpace platform.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            label="Total Posts"
            value={totalPosts}
            icon={<span>📝</span>}
            color="primary"
          />
          <StatCard
            label="Total Users"
            value={totalUsers}
            icon={<span>👥</span>}
            color="blue"
          />
          <StatCard
            label="Admins"
            value={adminCount}
            icon={<span>👑</span>}
            color="violet"
          />
          <StatCard
            label="Users"
            value={userCount}
            icon={<span>📖</span>}
            color="green"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-surface-800 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              to="/write"
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Write New Post
            </Link>
            <Link
              to="/admin/users"
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 hover:bg-primary-100 rounded-md transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Manage Users
            </Link>
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-800">
              Recent Posts
            </h2>
            <Link
              to="/blogs"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              View all →
            </Link>
          </div>

          {recentPosts.length > 0 ? (
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-sm border border-surface-200 border-l-4 border-l-primary-500 p-4 hover:shadow-md transition-shadow flex items-start justify-between gap-4"
                >
                  <Link
                    to={`/blog/${post.id}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="text-sm font-semibold text-surface-800 hover:text-primary-700 transition-colors truncate">
                      {post.title}
                    </h3>
                    <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                      {truncate(post.content, 120)}
                    </p>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center space-x-1.5">
                        {getAvatar(post.authorRole || 'user')}
                        <span className="text-xs font-medium text-surface-600">
                          {post.authorName || 'Unknown'}
                        </span>
                      </div>
                      <span className="text-xs text-surface-400">
                        {formatDate(post.createdAt)}
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Link
                      to={`/edit/${post.id}`}
                      className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                      aria-label={`Edit post ${post.title}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      aria-label={`Delete post ${post.title}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-surface-200">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-surface-700 mb-2">
                No posts yet
              </h3>
              <p className="text-surface-500 mb-6 text-sm">
                Get started by creating the first post on the platform.
              </p>
              <Link
                to="/write"
                className="inline-block px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors"
              >
                Write a Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;