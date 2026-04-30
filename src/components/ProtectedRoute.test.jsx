import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import * as auth from '../utils/auth.js';

vi.mock('../utils/auth.js', () => ({
  getCurrentUser: vi.fn(),
  isAdmin: vi.fn(),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when user is not authenticated', () => {
    auth.getCurrentUser.mockReturnValue(null);
    auth.isAdmin.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/blogs']}>
        <Routes>
          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    auth.getCurrentUser.mockReturnValue({
      userId: 'user-1',
      username: 'testuser',
      displayName: 'Test User',
      role: 'user',
    });
    auth.isAdmin.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/blogs']}>
        <Routes>
          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('redirects non-admin user to /blogs on adminOnly route', () => {
    auth.getCurrentUser.mockReturnValue({
      userId: 'user-1',
      username: 'testuser',
      displayName: 'Test User',
      role: 'user',
    });
    auth.isAdmin.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <div>Admin Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/blogs" element={<div>Blogs Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Blogs Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders children for admin user on adminOnly route', () => {
    auth.getCurrentUser.mockReturnValue({
      userId: 'admin',
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
    });
    auth.isAdmin.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <div>Admin Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/blogs" element={<div>Blogs Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByText('Blogs Page')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated user to /login on adminOnly route', () => {
    auth.getCurrentUser.mockReturnValue(null);
    auth.isAdmin.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <div>Admin Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/blogs" element={<div>Blogs Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('renders children for admin user on non-adminOnly route', () => {
    auth.getCurrentUser.mockReturnValue({
      userId: 'admin',
      username: 'admin',
      displayName: 'Admin',
      role: 'admin',
    });
    auth.isAdmin.mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/blogs']}>
        <Routes>
          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders Outlet when no children are provided and user is authenticated', () => {
    auth.getCurrentUser.mockReturnValue({
      userId: 'user-1',
      username: 'testuser',
      displayName: 'Test User',
      role: 'user',
    });
    auth.isAdmin.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/protected/nested']}>
        <Routes>
          <Route path="/protected" element={<ProtectedRoute />}>
            <Route path="nested" element={<div>Nested Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Nested Content')).toBeInTheDocument();
  });

  it('defaults adminOnly to false when not provided', () => {
    auth.getCurrentUser.mockReturnValue({
      userId: 'user-1',
      username: 'testuser',
      displayName: 'Test User',
      role: 'user',
    });
    auth.isAdmin.mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/blogs']}>
        <Routes>
          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <div>User Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('User Content')).toBeInTheDocument();
  });
});