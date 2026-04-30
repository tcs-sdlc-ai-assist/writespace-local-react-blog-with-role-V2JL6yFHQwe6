import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, isAdmin, logout } from '../utils/auth.js';
import Avatar from './Avatar.jsx';

/**
 * Navigation bar for authenticated users.
 * Displays WriteSpace logo, user avatar, display name, role-aware links,
 * and Logout button. Responsive with mobile menu toggle.
 * Logout calls auth.logout() and redirects to '/'.
 */
function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userIsAdmin = isAdmin();

  function toggleMobileMenu() {
    setMobileMenuOpen((prev) => !prev);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <Link
              to="/blogs"
              className="text-xl font-bold text-primary-700 hover:text-primary-800 transition-colors"
            >
              ✍️ WriteSpace
            </Link>

            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              <Link
                to="/blogs"
                className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary-700 rounded-md hover:bg-primary-50 transition-colors"
              >
                Blogs
              </Link>
              <Link
                to="/write"
                className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary-700 rounded-md hover:bg-primary-50 transition-colors"
              >
                Write
              </Link>
              {userIsAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary-700 rounded-md hover:bg-primary-50 transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/users"
                    className="px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary-700 rounded-md hover:bg-primary-50 transition-colors"
                  >
                    User Management
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar role={user.role} />
              <span className="text-sm font-medium text-surface-700">
                {user.displayName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="sm:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-surface-500 hover:text-surface-700 hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-surface-200">
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center space-x-2 px-3 py-2">
              <Avatar role={user.role} />
              <span className="text-sm font-medium text-surface-700">
                {user.displayName}
              </span>
            </div>
            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary-700 rounded-md hover:bg-primary-50 transition-colors"
            >
              Blogs
            </Link>
            <Link
              to="/write"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary-700 rounded-md hover:bg-primary-50 transition-colors"
            >
              Write
            </Link>
            {userIsAdmin && (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary-700 rounded-md hover:bg-primary-50 transition-colors"
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-medium text-surface-600 hover:text-primary-700 rounded-md hover:bg-primary-50 transition-colors"
                >
                  User Management
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-surface-600 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;