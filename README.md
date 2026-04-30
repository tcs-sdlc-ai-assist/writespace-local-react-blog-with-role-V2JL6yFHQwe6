# WriteSpace

A distraction-free writing platform built with React 18 and Vite. All data is persisted in the browser using localStorage — no backend server or external API required.

## Tech Stack

- **React 18** — UI library
- **React Router v6** — Client-side routing
- **Tailwind CSS 3** — Utility-first styling
- **Vite 5** — Build tool and dev server
- **Vitest** — Unit testing framework
- **Testing Library** — React component testing utilities
- **PropTypes** — Runtime prop validation

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Development

Start the local dev server on port 3000:

```bash
npm run dev
```

The app will open automatically at [http://localhost:3000](http://localhost:3000).

### Build

Create a production build in the `dist/` directory:

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Run Tests

```bash
npm test
```

## Folder Structure

```
writespace/
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
├── vitest.config.js            # Vitest configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── vercel.json                 # Vercel deployment rewrites
├── .env.example                # Environment variable reference
├── .gitignore                  # Git ignore rules
└── src/
    ├── main.jsx                # React DOM entry point
    ├── App.jsx                 # Root component with router and layout
    ├── index.css               # Tailwind CSS directives
    ├── setup.js                # Test setup (jest-dom matchers)
    ├── setupTests.js           # Vitest setup file
    ├── components/
    │   ├── Avatar.jsx          # Role-aware avatar component
    │   ├── BlogCard.jsx        # Blog post preview card
    │   ├── Navbar.jsx          # Authenticated user navigation bar
    │   ├── PublicNavbar.jsx    # Guest navigation bar
    │   ├── ProtectedRoute.jsx  # Auth and role-based route guard
    │   ├── ProtectedRoute.test.jsx
    │   ├── StatCard.jsx        # Admin dashboard statistic card
    │   └── UserRow.jsx         # User management list row
    ├── pages/
    │   ├── LandingPage.jsx     # Public landing page
    │   ├── LoginPage.jsx       # Login form page
    │   ├── LoginPage.test.jsx
    │   ├── RegisterPage.jsx    # Registration form page
    │   ├── RegisterPage.test.jsx
    │   ├── Home.jsx            # Authenticated blog list page
    │   ├── ReadBlog.jsx        # Full blog post reading page
    │   ├── WriteBlog.jsx       # Create and edit blog post page
    │   ├── AdminDashboard.jsx  # Admin overview dashboard
    │   └── UserManagement.jsx  # Admin user management page
    └── utils/
        ├── auth.js             # Authentication logic (login, register, session)
        ├── auth.test.js
        ├── storage.js          # localStorage abstraction layer
        └── storage.test.js
```

## Route Map

| Path            | Component        | Access          | Description                        |
| --------------- | ---------------- | --------------- | ---------------------------------- |
| `/`             | LandingPage      | Public          | Hero section, features, latest posts |
| `/login`        | LoginPage        | Public          | Login form                         |
| `/register`     | RegisterPage     | Public          | Registration form                  |
| `/blogs`        | Home             | Authenticated   | All blog posts list                |
| `/blog/:id`     | ReadBlog         | Authenticated   | Full blog post view                |
| `/write`        | WriteBlog        | Authenticated   | Create a new blog post             |
| `/edit/:id`     | WriteBlog        | Authenticated   | Edit an existing blog post         |
| `/admin`        | AdminDashboard   | Admin only      | Platform overview and stats        |
| `/admin/users`  | UserManagement   | Admin only      | Create, list, and delete users     |

## localStorage Schema

All data is stored in the browser's localStorage under the following keys:

### `writespace_users`

Array of user objects:

```json
[
  {
    "id": "admin",
    "displayName": "Admin",
    "username": "admin",
    "password": "admin",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

A default admin user (`username: admin`, `password: admin`) is automatically created on first load if no users exist.

### `writespace_posts`

Array of blog post objects:

```json
[
  {
    "id": "unique-id",
    "title": "Post Title",
    "content": "Post content body...",
    "authorId": "admin",
    "authorName": "Admin",
    "authorRole": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### `writespace_session`

Current logged-in user session (or `null`):

```json
{
  "userId": "admin",
  "username": "admin",
  "displayName": "Admin",
  "role": "admin"
}
```

## Default Credentials

| Role  | Username | Password |
| ----- | -------- | -------- |
| Admin | `admin`  | `admin`  |

## Usage Guide

1. **Visit the landing page** at `/` to see the hero section and latest posts.
2. **Register** a new account at `/register` or **log in** with existing credentials at `/login`.
3. **Browse posts** at `/blogs` after logging in.
4. **Write a new post** by clicking "Write" in the navigation bar or the "+ New Post" button.
5. **Read a post** by clicking on any blog card to view the full content.
6. **Edit or delete** your own posts from the post detail page. Admins can edit or delete any post.
7. **Admin Dashboard** at `/admin` shows platform statistics, quick actions, and recent posts.
8. **User Management** at `/admin/users` allows admins to create new users, assign roles, and delete accounts.

## Deployment on Vercel

This project is configured for deployment on [Vercel](https://vercel.com/) with SPA client-side routing support.

### Steps

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Vercel will auto-detect the Vite framework. Confirm the following settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. Click **Deploy**.

The included `vercel.json` file handles SPA rewrites so that all routes are served by `index.html`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

No environment variables are required for deployment.

## License

Private