import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';
import * as auth from '../utils/auth.js';

vi.mock('../utils/auth.js', () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
  isAdmin: vi.fn(),
}));

function renderLoginPage(initialEntries = ['/login']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<div>Admin Dashboard</div>} />
        <Route path="/blogs" element={<div>Blogs Page</div>} />
        <Route path="/" element={<div>Landing Page</div>} />
        <Route path="/register" element={<div>Register Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getCurrentUser.mockReturnValue(null);
    auth.isAdmin.mockReturnValue(false);
  });

  describe('form rendering', () => {
    it('renders the login form with username and password fields', () => {
      renderLoginPage();

      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders the WriteSpace branding', () => {
      renderLoginPage();

      expect(screen.getByText(/writespace/i)).toBeInTheDocument();
    });

    it('renders the welcome back heading', () => {
      renderLoginPage();

      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    it('renders a link to the register page', () => {
      renderLoginPage();

      expect(screen.getByText(/register here/i)).toBeInTheDocument();
    });
  });

  describe('successful login', () => {
    it('redirects admin user to /admin on successful login', async () => {
      const user = userEvent.setup();

      auth.login.mockReturnValue({
        success: true,
        session: {
          userId: 'admin',
          username: 'admin',
          displayName: 'Admin',
          role: 'admin',
        },
      });

      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'admin');
      await user.type(screen.getByLabelText(/password/i), 'admin');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      expect(auth.login).toHaveBeenCalledWith('admin', 'admin');
    });

    it('redirects regular user to /blogs on successful login', async () => {
      const user = userEvent.setup();

      auth.login.mockReturnValue({
        success: true,
        session: {
          userId: 'user-1',
          username: 'testuser',
          displayName: 'Test User',
          role: 'user',
        },
      });

      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Blogs Page')).toBeInTheDocument();
      });

      expect(auth.login).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  describe('failed login', () => {
    it('displays error message on invalid credentials', async () => {
      const user = userEvent.setup();

      auth.login.mockReturnValue({
        success: false,
        error: 'Invalid username or password.',
      });

      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'wronguser');
      await user.type(screen.getByLabelText(/password/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });
    });

    it('displays generic error message when login returns no error string', async () => {
      const user = userEvent.setup();

      auth.login.mockReturnValue({
        success: false,
      });

      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'someuser');
      await user.type(screen.getByLabelText(/password/i), 'somepass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      });
    });

    it('displays error message when login throws an exception', async () => {
      const user = userEvent.setup();

      auth.login.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'someuser');
      await user.type(screen.getByLabelText(/password/i), 'somepass');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('already authenticated redirect', () => {
    it('redirects authenticated admin user to /admin', async () => {
      auth.getCurrentUser.mockReturnValue({
        userId: 'admin',
        username: 'admin',
        displayName: 'Admin',
        role: 'admin',
      });
      auth.isAdmin.mockReturnValue(true);

      renderLoginPage();

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });

    it('redirects authenticated regular user to /blogs', async () => {
      auth.getCurrentUser.mockReturnValue({
        userId: 'user-1',
        username: 'testuser',
        displayName: 'Test User',
        role: 'user',
      });
      auth.isAdmin.mockReturnValue(false);

      renderLoginPage();

      await waitFor(() => {
        expect(screen.getByText('Blogs Page')).toBeInTheDocument();
      });
    });
  });

  describe('form interaction', () => {
    it('updates username and password fields as user types', async () => {
      const user = userEvent.setup();

      renderLoginPage();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(usernameInput, 'myuser');
      await user.type(passwordInput, 'mypass');

      expect(usernameInput).toHaveValue('myuser');
      expect(passwordInput).toHaveValue('mypass');
    });

    it('clears previous error on new submission attempt', async () => {
      const user = userEvent.setup();

      auth.login
        .mockReturnValueOnce({
          success: false,
          error: 'Invalid username or password.',
        })
        .mockReturnValueOnce({
          success: true,
          session: {
            userId: 'user-1',
            username: 'testuser',
            displayName: 'Test User',
            role: 'user',
          },
        });

      renderLoginPage();

      await user.type(screen.getByLabelText(/username/i), 'wrong');
      await user.type(screen.getByLabelText(/password/i), 'wrong');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid username or password.')).toBeInTheDocument();
      });

      await user.clear(screen.getByLabelText(/username/i));
      await user.clear(screen.getByLabelText(/password/i));
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Blogs Page')).toBeInTheDocument();
      });
    });
  });
});