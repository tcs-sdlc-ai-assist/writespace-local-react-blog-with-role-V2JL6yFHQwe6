import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../utils/auth.js';
import { getAvatar } from './Avatar.jsx';

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
 * Blog post preview card for list/grid views.
 * Displays title, content excerpt, creation date, author with avatar,
 * accent border, and an edit icon if the current user is admin or post author.
 * @param {{ post: Object }} props
 */
function BlogCard({ post }) {
  const currentUser = getCurrentUser();
  const canEdit =
    currentUser &&
    (currentUser.role === 'admin' || currentUser.userId === post.authorId);

  return (
    <div className="relative bg-white rounded-lg shadow-sm border border-surface-200 border-l-4 border-l-primary-500 hover:shadow-md transition-shadow flex flex-col">
      <Link
        to={`/blog/${post.id}`}
        className="block p-5 flex-1"
      >
        <h2 className="text-lg font-semibold text-surface-800 mb-2 line-clamp-2 hover:text-primary-700 transition-colors">
          {post.title}
        </h2>
        <p className="text-sm text-surface-500 mb-4 leading-relaxed">
          {truncate(post.content, 150)}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-2">
            {getAvatar(post.authorRole || 'user')}
            <span className="text-sm font-medium text-surface-600">
              {post.authorName || 'Unknown'}
            </span>
          </div>
          <span className="text-xs text-surface-400">
            {formatDate(post.createdAt)}
          </span>
        </div>
      </Link>
      {canEdit && (
        <Link
          to={`/edit/${post.id}`}
          className="absolute top-3 right-3 p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
          aria-label="Edit post"
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
      )}
    </div>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    authorId: PropTypes.string.isRequired,
    authorName: PropTypes.string,
    authorRole: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
};

export default BlogCard;