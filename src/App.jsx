import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { getCurrentUser } from './utils/auth.js';
import Navbar from './components/Navbar.jsx';
import PublicNavbar from './components/PublicNavbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Home from './pages/Home.jsx';
import ReadBlog from './pages/ReadBlog.jsx';
import WriteBlog from './pages/WriteBlog.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserManagement from './pages/UserManagement.jsx';

/**
 * Layout component that conditionally renders the appropriate navbar
 * based on the user's authentication state and current route.
 * @param {{ children: React.ReactNode }} props
 */
function Layout({ children }) {
  const location = useLocation();
  const user = getCurrentUser();

  const hideNavbarRoutes = ['/login', '/register'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  if (shouldHideNavbar) {
    return <>{children}</>;
  }

  return (
    <>
      {user ? <Navbar /> : <PublicNavbar />}
      {children}
    </>
  );
}

/**
 * Root application component.
 * Defines all routes using React Router v6 and renders the appropriate
 * navbar for guests vs authenticated users.
 */
function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blog/:id"
            element={
              <ProtectedRoute>
                <ReadBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/write"
            element={
              <ProtectedRoute>
                <WriteBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <WriteBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute adminOnly>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;