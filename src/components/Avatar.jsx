import React from 'react';
import PropTypes from 'prop-types';

/**
 * Get an avatar JSX element based on user role.
 * @param {string} role - The user role ('admin' or 'user')
 * @returns {React.ReactElement} Avatar JSX with role-distinct styling
 */
export function getAvatar(role) {
  if (role === 'admin') {
    return (
      <span
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-violet-200 text-base leading-none"
        role="img"
        aria-label="Admin avatar"
      >
        👑
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-200 text-base leading-none"
      role="img"
      aria-label="User avatar"
    >
      📖
    </span>
  );
}

/**
 * Avatar component that renders a role-aware avatar.
 * @param {{ role: string }} props
 */
function Avatar({ role }) {
  return getAvatar(role);
}

Avatar.propTypes = {
  role: PropTypes.string.isRequired,
};

export default Avatar;