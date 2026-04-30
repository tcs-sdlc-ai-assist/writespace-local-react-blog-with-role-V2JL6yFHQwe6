import React from 'react';
import { Link } from 'react-router-dom';
import { getPosts } from '../utils/storage.js';
import BlogCard from '../components/BlogCard.jsx';

/**
 * Authenticated blog list page at '/blogs'.
 * Loads all posts from storage, sorts newest first, displays in responsive grid
 * using BlogCard components. Shows empty state with CTA to '/write' if no posts exist.
 */
function Home() {
  const allPosts = getPosts();

  const sortedPosts = [...allPosts].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-800">
          All Posts
        </h1>
        <Link
          to="/write"
          className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors"
        >
          + New Post
        </Link>
      </div>

      {sortedPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-surface-700 mb-2">
            No posts yet
          </h2>
          <p className="text-surface-500 mb-6">
            Be the first to share your thoughts with the community!
          </p>
          <Link
            to="/write"
            className="inline-block px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors"
          >
            Start Writing
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;