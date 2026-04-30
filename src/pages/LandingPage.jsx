import React from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, isAdmin } from '../utils/auth.js';
import { getPosts } from '../utils/storage.js';

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
 * Feature card data for the features section.
 */
const features = [
  {
    icon: '✏️',
    title: 'Distraction-Free Writing',
    description:
      'Focus on your words with a clean, minimal editor designed to keep you in the flow.',
  },
  {
    icon: '📚',
    title: 'Organize Your Thoughts',
    description:
      'Create, edit, and manage your blog posts effortlessly — all stored locally in your browser.',
  },
  {
    icon: '🔒',
    title: 'Role-Based Access',
    description:
      'Admin and user roles with protected routes ensure the right people have the right access.',
  },
];

/**
 * Public landing page component at '/'.
 * Features a gradient hero section, feature cards, latest posts preview, and footer.
 * Adapts CTAs based on whether the user is authenticated.
 */
function LandingPage() {
  const user = getCurrentUser();
  const userIsAdmin = isAdmin();

  const allPosts = getPosts();
  const sortedPosts = [...allPosts]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  const dashboardLink = userIsAdmin ? '/admin' : '/blogs';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Your Space to{' '}
            <span className="text-accent-300">Write</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            A distraction-free writing platform where your ideas come to life.
            Create, share, and manage your blog posts with ease.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                to={dashboardLink}
                className="px-8 py-3 text-base font-semibold bg-white text-primary-700 rounded-lg shadow-md hover:bg-primary-50 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 text-base font-semibold bg-white text-primary-700 rounded-lg shadow-md hover:bg-primary-50 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 text-base font-semibold border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary-700 transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-surface-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-800 mb-4">
              Why WriteSpace?
            </h2>
            <p className="text-surface-500 max-w-xl mx-auto">
              Everything you need to start writing and sharing your ideas, right
              in your browser.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-lg shadow-sm border border-surface-200 p-6 hover:shadow-md transition-shadow text-center"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-surface-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-surface-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-800 mb-4">
              Latest Posts
            </h2>
            <p className="text-surface-500 max-w-xl mx-auto">
              Check out what people have been writing about recently.
            </p>
          </div>
          {sortedPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-surface-50 rounded-lg shadow-sm border border-surface-200 border-l-4 border-l-primary-500 p-5 hover:shadow-md transition-shadow flex flex-col"
                >
                  <h3 className="text-lg font-semibold text-surface-800 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-surface-500 mb-4 leading-relaxed flex-1">
                    {truncate(post.content, 120)}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-medium text-surface-600">
                      {post.authorName || 'Unknown'}
                    </span>
                    <span className="text-xs text-surface-400">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📝</div>
              <p className="text-surface-500 text-lg mb-2">
                No posts yet.
              </p>
              <p className="text-surface-400 text-sm">
                Be the first to share your thoughts!
              </p>
              {!user && (
                <Link
                  to="/register"
                  className="inline-block mt-6 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors"
                >
                  Start Writing
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-800 text-surface-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <span className="text-lg font-bold text-white">
                ✍️ WriteSpace
              </span>
              <p className="text-sm text-surface-400 mt-1">
                A distraction-free writing platform.
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <Link
                    to="/blogs"
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    Blogs
                  </Link>
                  <Link
                    to="/write"
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    Write
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm text-surface-400 hover:text-white transition-colors"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="border-t border-surface-700 mt-8 pt-6 text-center">
            <p className="text-xs text-surface-500">
              &copy; {new Date().getFullYear()} WriteSpace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;