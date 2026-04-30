# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added

- **Public Landing Page** — Hero section with gradient background, feature cards highlighting platform capabilities, latest posts preview, and adaptive CTAs for guests vs authenticated users.
- **Authentication System** — Login and registration pages with form validation, inline error messages, and automatic redirection based on user role.
  - Login at `/login` with username and password fields.
  - Registration at `/register` with display name, username, password, and confirm password fields.
  - Passwords validated for match before submission; usernames checked for uniqueness (case-insensitive).
  - Default admin account (`username: admin`, `password: admin`) created automatically on first load.
- **Role-Based Access Control** — `ProtectedRoute` component guards authenticated and admin-only routes.
  - Unauthenticated users redirected to `/login`.
  - Non-admin users redirected to `/blogs` when accessing admin routes.
  - Admin users have full access to all routes including `/admin` and `/admin/users`.
- **Blog CRUD Operations** — Full create, read, update, and delete functionality for blog posts.
  - Create new posts at `/write` with title (max 100 chars) and content (max 5000 chars) fields with live character counters.
  - Read full blog posts at `/blog/:id` with author avatar, name, and creation date.
  - Edit existing posts at `/edit/:id` with pre-filled form; enforces ownership (authors edit own posts, admins edit all).
  - Delete posts with confirmation dialog from the post detail page or admin dashboard.
- **Blog List Page** — Authenticated blog list at `/blogs` displaying all posts sorted newest first in a responsive grid of `BlogCard` components with title, content excerpt, author avatar, and edit icon.
- **Admin Dashboard** — Admin-only overview page at `/admin` featuring:
  - Gradient banner header with welcome message.
  - Stat cards for total posts, total users, admin count, and user count.
  - Quick action buttons for writing new posts and managing users.
  - Recent posts section with inline edit and delete controls.
- **User Management** — Admin-only page at `/admin/users` with:
  - Create user form with display name, username, password, and role selection.
  - Validation for required fields and duplicate username detection.
  - User list rendered with `UserRow` components showing avatar, display name, username, role badge, join date, and delete button.
  - Protection against deleting the default admin account or the currently logged-in user.
- **localStorage Persistence** — All data stored in the browser using three keys:
  - `writespace_users` — Array of user objects with id, displayName, username, password, role, and createdAt.
  - `writespace_posts` — Array of post objects with id, title, content, authorId, authorName, authorRole, createdAt, and updatedAt.
  - `writespace_session` — Current logged-in user session object or null.
  - Graceful fallback to in-memory storage when localStorage is unavailable.
- **Responsive UI** — Tailwind CSS 3 utility-first styling with:
  - Custom color palette (primary, accent, surface) for consistent theming.
  - Mobile-responsive navigation bars with hamburger menu toggle for both guest (`PublicNavbar`) and authenticated (`Navbar`) users.
  - Responsive grid layouts for blog cards, stat cards, and feature sections.
  - Role-aware avatar component with distinct styling for admin and user roles.
- **Navigation** — Dual navbar system:
  - `PublicNavbar` for guests with WriteSpace branding, Login, and Register links.
  - `Navbar` for authenticated users with Blogs, Write, and conditional Admin Dashboard and User Management links, plus user avatar, display name, and Logout button.
  - Navbars hidden on `/login` and `/register` pages for a clean auth experience.
- **Vercel SPA Deployment** — `vercel.json` configured with catch-all rewrite rule to support client-side routing in production.
- **Testing** — Unit and integration tests using Vitest and Testing Library:
  - `ProtectedRoute` tests for authentication and role-based redirects.
  - `LoginPage` tests for form rendering, successful login redirects, error handling, and already-authenticated redirects.
  - `RegisterPage` tests for form rendering, successful registration, validation errors, and already-authenticated redirects.
  - `auth.js` tests for login, logout, register, getCurrentUser, isAdmin, and integration flows.
  - `storage.js` tests for getUsers, saveUsers, getPosts, savePosts, getSession, saveSession, clearSession, schema consistency, and default admin initialization.