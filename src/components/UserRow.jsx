import React from 'react';
import PropTypes from 'prop-types';
import { getCurrentUser } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

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
 * User table row/card component for UserManagement.
 * Displays user avatar, display name, username, role badge pill,
 * created date, and delete button.
 * Delete button is disabled for the hard-coded admin and for the currently logged-in user.
 * @param {{ user: Object, onDelete: Function }} props
 */
function UserRow({ user, onDelete }) {
  const currentUser = getCurrentUser();
  const isHardCodedAdmin = user.id === 'admin';
  const isCurrentUser = currentUser && currentUser.userId === user.id;
  const deleteDisabled = isHardCodedAdmin || isCurrentUser;

  let deleteTooltip = '';
  if (isHardCodedAdmin) {
    deleteTooltip = 'Cannot delete the default admin account';
  } else if (isCurrentUser) {
    deleteTooltip = 'Cannot delete your own account';
  }

  const roleBadgeClasses =
    user.role === 'admin'
      ? 'bg-violet-100 text-violet-700 border border-violet-200'
      : 'bg-indigo-100 text-indigo-700 border border-indigo-200';

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-surface-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 min-w-0">
        <div className="flex-shrink-0">
          {getAvatar(user.role || 'user')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="text-sm font-semibold text-surface-800 truncate">
              {user.displayName}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeClasses}`}
            >
              {user.role}
            </span>
          </div>
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-xs text-surface-500 truncate">
              @{user.username}
            </span>
            {user.createdAt && (
              <span className="text-xs text-surface-400">
                Joined {formatDate(user.createdAt)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 ml-4">
        <button
          type="button"
          onClick={() => onDelete(user.id)}
          disabled={deleteDisabled}
          title={deleteTooltip}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            deleteDisabled
              ? 'text-surface-400 bg-surface-100 cursor-not-allowed'
              : 'text-red-600 hover:text-white hover:bg-red-600 bg-red-50 border border-red-200'
          }`}
          aria-label={`Delete user ${user.displayName}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default UserRow;