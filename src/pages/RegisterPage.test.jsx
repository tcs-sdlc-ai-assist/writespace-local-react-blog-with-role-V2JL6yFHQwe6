import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './RegisterPage.jsx';
import * as auth from '../utils/auth.js';

vi.mock('../utils/auth.js', () => ({
  register: vi.fn(),
  getCurrentUser: vi.fn(),
  isAdmin: vi.fn(),
}));

function renderRegisterPage(initialEntries = ['/register']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<div>Admin Dashboard</div>} />
        <Route path="/blogs" element={<div>Blogs Page</div>} />
        <Route path="/" element={<div>Landing Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.getCurrentUser.mockReturnValue(null);
    auth.isAdmin.mockReturnValue(false);
  });

  describe('form rendering', () => {
    it('renders the registration form with all required fields', () => {
      renderRegisterPage();

      expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('renders the WriteSpace branding', () => {
      renderRegisterPage();

      expect(screen.getByText(/writespace/i)).toBeInTheDocument();
    });

    it('renders the create your account heading', () => {
      renderRegisterPage();

      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
    });

    it('renders a link to the login page', () => {
      renderRegisterPage();

      expect(screen.getByText(/sign in here/i)).toBeInTheDocument();
    });
  });

  describe('successful registration', () => {
    it('redirects to /blogs on successful registration', async () => {
      const user = userEvent.setup();

      auth.register.mockReturnValue({
        success: true,
        session: {
          userId: 'user-1',
          username: 'newuser',
          displayName: 'New User',
          role: 'user',
        },
      });

      renderRegisterPage();

      await user.type(screen.getByLabelText(/display name/i), 'New User');
      await user.type(screen.getByLabelText(/^username$/i), 'newuser');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Blogs Page')).toBeInTheDocument();
      });

      expect(auth.register).toHaveBeenCalledWith('New User', 'newuser', 'password123');
    });

    it('trims display name and username before calling register', async () => {
      const user = userEvent.setup();

      auth.register.mockReturnValue({
        success: true,
        session: {
          userId: 'user-2',
          username: 'trimmeduser',
          displayName: 'Trimmed User',
          role: 'user',
        },
      });

      renderRegisterPage();

      await user.type(screen.getByLabelText(/display name/i), '  Trimmed User  ');
      await user.type(screen.getByLabelText(/^username$/i), '  trimmeduser  ');
      await user.type(screen.getByLabelText(/^password$/i), 'pass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'pass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(auth.register).toHaveBeenCalledWith('Trimmed User', 'trimmeduser', 'pass123');
      });
    });
  });

  describe('validation errors', () => {
    it('displays error when display name is empty', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText(/^username$/i), 'someuser');
      await user.type(screen.getByLabelText(/^password$/i), 'pass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'pass123');

      // Clear the display name field to ensure it's empty (required attribute may prevent submit)
      // We need to work around the required attribute by filling then clearing
      const displayNameInput = screen.getByLabelText(/display name/i);
      await user.type(displayNameInput, '   ');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('All fields are required.')).toBeInTheDocument();
      });

      expect(auth.register).not.toHaveBeenCalled();
    });

    it('displays error when passwords do not match', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText(/display name/i), 'Test User');
      await user.type(screen.getByLabelText(/^username$/i), 'testuser');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
      });

      expect(auth.register).not.toHaveBeenCalled();
    });

    it('displays error when username already exists', async () => {
      const user = userEvent.setup();

      auth.register.mockReturnValue({
        success: false,
        error: 'Username already exists.',
      });

      renderRegisterPage();

      await user.type(screen.getByLabelText(/display name/i), 'Duplicate User');
      await user.type(screen.getByLabelText(/^username$/i), 'admin');
      await user.type(screen.getByLabelText(/^password$/i), 'pass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'pass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Username already exists.')).toBeInTheDocument();
      });
    });

    it('displays generic error when register returns no error string', async () => {
      const user = userEvent.setup();

      auth.register.mockReturnValue({
        success: false,
      });

      renderRegisterPage();

      await user.type(screen.getByLabelText(/display name/i), 'Some User');
      await user.type(screen.getByLabelText(/^username$/i), 'someuser');
      await user.type(screen.getByLabelText(/^password$/i), 'pass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'pass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Registration failed. Please try again.')).toBeInTheDocument();
      });
    });

    it('displays error when register throws an exception', async () => {
      const user = userEvent.setup();

      auth.register.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      renderRegisterPage();

      await user.type(screen.getByLabelText(/display name/i), 'Error User');
      await user.type(screen.getByLabelText(/^username$/i), 'erroruser');
      await user.type(screen.getByLabelText(/^password$/i), 'pass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'pass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

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

      renderRegisterPage();

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

      renderRegisterPage();

      await waitFor(() => {
        expect(screen.getByText('Blogs Page')).toBeInTheDocument();
      });
    });
  });

  describe('form interaction', () => {
    it('updates all fields as user types', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      const displayNameInput = screen.getByLabelText(/display name/i);
      const usernameInput = screen.getByLabelText(/^username$/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(displayNameInput, 'My Name');
      await user.type(usernameInput, 'myuser');
      await user.type(passwordInput, 'mypass');
      await user.type(confirmPasswordInput, 'mypass');

      expect(displayNameInput).toHaveValue('My Name');
      expect(usernameInput).toHaveValue('myuser');
      expect(passwordInput).toHaveValue('mypass');
      expect(confirmPasswordInput).toHaveValue('mypass');
    });

    it('clears previous error on new submission attempt', async () => {
      const user = userEvent.setup();

      auth.register
        .mockReturnValueOnce({
          success: false,
          error: 'Username already exists.',
        })
        .mockReturnValueOnce({
          success: true,
          session: {
            userId: 'user-1',
            username: 'newuser',
            displayName: 'New User',
            role: 'user',
          },
        });

      renderRegisterPage();

      await user.type(screen.getByLabelText(/display name/i), 'New User');
      await user.type(screen.getByLabelText(/^username$/i), 'admin');
      await user.type(screen.getByLabelText(/^password$/i), 'pass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'pass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Username already exists.')).toBeInTheDocument();
      });

      await user.clear(screen.getByLabelText(/^username$/i));
      await user.type(screen.getByLabelText(/^username$/i), 'newuser');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('Blogs Page')).toBeInTheDocument();
      });
    });

    it('displays error when username is only whitespace', async () => {
      const user = userEvent.setup();

      renderRegisterPage();

      await user.type(screen.getByLabelText(/display name/i), 'Valid Name');
      await user.type(screen.getByLabelText(/^username$/i), '   ');
      await user.type(screen.getByLabelText(/^password$/i), 'pass123');
      await user.type(screen.getByLabelText(/confirm password/i), 'pass123');
      await user.click(screen.getByRole('button', { name: /create account/i }));

      await waitFor(() => {
        expect(screen.getByText('All fields are required.')).toBeInTheDocument();
      });

      expect(auth.register).not.toHaveBeenCalled();
    });
  });
});