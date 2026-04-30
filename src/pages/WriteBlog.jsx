import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentUser, isAdmin } from '../utils/auth.js';
import { getPosts, savePosts } from '../utils/storage.js';

/**
 * Generate a simple unique ID.
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 10);
}

const TITLE_MAX = 100;
const CONTENT_MAX = 5000;

/**
 * Blog post create and edit form page.
 * Create mode at '/write': generates UUID, sets author info from session, saves new post.
 * Edit mode at '/edit/:id': loads existing post, pre-fills form, enforces ownership
 * (admin can edit all, user only own), updates post.
 * Fields: Title (required, max 100 chars) and Content (required, max 5000 chars)
 * with character counter. Cancel button navigates back. Validates before save.
 */
function WriteBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const userIsAdmin = isAdmin();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    if (isEditMode) {
      const posts = getPosts();
      const post = posts.find((p) => p.id === id);

      if (!post) {
        navigate('/blogs', { replace: true });
        return;
      }

      const canEdit =
        userIsAdmin || currentUser.userId === post.authorId;

      if (!canEdit) {
        navigate('/blogs', { replace: true });
        return;
      }

      setTitle(post.title || '');
      setContent(post.content || '');
    }
  }, [id, isEditMode, navigate, currentUser, userIsAdmin]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError('Title is required.');
      return;
    }

    if (trimmedTitle.length > TITLE_MAX) {
      setError(`Title must be ${TITLE_MAX} characters or fewer.`);
      return;
    }

    if (!trimmedContent) {
      setError('Content is required.');
      return;
    }

    if (trimmedContent.length > CONTENT_MAX) {
      setError(`Content must be ${CONTENT_MAX} characters or fewer.`);
      return;
    }

    setLoading(true);

    try {
      const posts = getPosts();

      if (isEditMode) {
        const postIndex = posts.findIndex((p) => p.id === id);

        if (postIndex === -1) {
          setError('Post not found. It may have been deleted.');
          setLoading(false);
          return;
        }

        posts[postIndex] = {
          ...posts[postIndex],
          title: trimmedTitle,
          content: trimmedContent,
          updatedAt: new Date().toISOString(),
        };

        savePosts(posts);
        navigate(`/blog/${id}`, { replace: true });
      } else {
        const newPost = {
          id: generateId(),
          title: trimmedTitle,
          content: trimmedContent,
          authorId: currentUser.userId,
          authorName: currentUser.displayName,
          authorRole: currentUser.role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        posts.push(newPost);
        savePosts(posts);
        navigate(`/blog/${newPost.id}`, { replace: true });
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate(-1);
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-800">
          {isEditMode ? 'Edit Post' : 'Write a New Post'}
        </h1>
        <p className="mt-2 text-sm text-surface-500">
          {isEditMode
            ? 'Update your post below.'
            : 'Share your thoughts with the community.'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-surface-200 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-surface-700"
              >
                Title
              </label>
              <span
                className={`text-xs ${
                  title.length > TITLE_MAX
                    ? 'text-red-600 font-medium'
                    : 'text-surface-400'
                }`}
              >
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX}
              className="block w-full rounded-md border border-surface-300 px-3 py-2 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Enter your post title"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="content"
                className="block text-sm font-medium text-surface-700"
              >
                Content
              </label>
              <span
                className={`text-xs ${
                  content.length > CONTENT_MAX
                    ? 'text-red-600 font-medium'
                    : 'text-surface-400'
                }`}
              >
                {content.length}/{CONTENT_MAX}
              </span>
            </div>
            <textarea
              id="content"
              name="content"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={CONTENT_MAX}
              rows={12}
              className="block w-full rounded-md border border-surface-300 px-3 py-2 text-sm text-surface-800 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-y"
              placeholder="Write your post content here…"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-800 rounded-md hover:bg-surface-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 text-sm font-semibold rounded-md text-white shadow-sm transition-colors ${
                loading
                  ? 'bg-primary-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {loading
                ? isEditMode
                  ? 'Saving…'
                  : 'Publishing…'
                : isEditMode
                  ? 'Save Changes'
                  : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WriteBlog;