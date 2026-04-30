import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCurrentUser, isAdmin } from '../utils/auth.js';
import { getPosts, savePosts } from '../utils/storage.js';
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
 * Full blog post reading page at '/blog/:id'.
 * Loads post by ID from localStorage. Displays title, author avatar and name,
 * creation date, and full content. Shows Edit and Delete buttons for admin
 * (all posts) or author (own posts). Delete confirms via window.confirm,
 * removes post, redirects to '/blogs'. Shows 'Post not found' message for
 * invalid/missing IDs.
 */
function ReadBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();

  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const posts = getPosts();
    const found = posts.find((p) => p.id === id);

    if (found) {
      setPost(found);
      setNotFound(false);
    } else {
      setPost(null);
      setNotFound(true);
    }
  }, [id]);

  function handleDelete() {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      const posts = getPosts();
      const updatedPosts = posts.filter((p) => p.id !== id);
      savePosts(updatedPosts);
      navigate('/blogs', { replace: true });
    } catch {
      // Silently handle — post may already be deleted
      navigate('/blogs', { replace: true });
    }
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-surface-800 mb-2">
          Post not found
        </h1>
        <p className="text-surface-500 mb-6">
          The post you&apos;re looking for doesn&apos;t exist or may have been deleted.
        </p>
        <Link
          to="/blogs"
          className="inline-block px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors"
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const canEdit =
    currentUser &&
    (userIsAdmin || currentUser.userId === post.authorId);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-800 mb-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              {getAvatar(post.authorRole || 'user')}
              <div>
                <span className="text-sm font-medium text-surface-700 block">
                  {post.authorName || 'Unknown'}
                </span>
                <span className="text-xs text-surface-400">
                  {formatDate(post.createdAt)}
                </span>
              </div>
            </div>
            {canEdit && (
              <div className="flex items-center space-x-3">
                <Link
                  to={`/edit/${post.id}`}
                  className="px-4 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6 sm:p-8">
          <div className="text-surface-700 text-base leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </article>

      <div className="mt-8">
        <Link
          to="/blogs"
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to all posts
        </Link>
      </div>
    </div>
  );
}

export default ReadBlog;