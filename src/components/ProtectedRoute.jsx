import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser, isAdmin } from '../utils/auth.js';

/**
 * Route guard component that protects routes based on authentication and role.
 * Redirects unauthenticated users to '/login'.
 * If adminOnly is true, redirects non-admin users to '/blogs'.
 * Renders children if provided, otherwise renders an Outlet for nested routes.
 * @param {{ adminOnly?: boolean, children?: React.ReactNode }} props
 */
function ProtectedRoute({ adminOnly, children }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/blogs" replace />;
  }

  return children ? children : <Outlet />;
}

ProtectedRoute.propTypes = {
  adminOnly: PropTypes.bool,
  children: PropTypes.node,
};

ProtectedRoute.defaultProps = {
  adminOnly: false,
  children: null,
};

export default ProtectedRoute;