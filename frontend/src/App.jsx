import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MarketingPage from './views/MarketingPage';
import Dashboard from './views/Dashboard';
import Analytics from './views/Analytics';
import QueryPage from './views/QueryPage';
import DocumentViewer from './views/DocumentViewer';
import ActivityDetails from './components/recent-activity/ActivityDetails';
import ProfilePage from './views/ProfilePage';
import SettingsPage from './views/SettingsPage';
import UsersPage from './views/UsersPage';
import CoursesPage from './views/CoursesPage';
import CourseDetailPage from './views/CourseDetailPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/query" replace />} />
          <Route path="/login" element={<MarketingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Analytics />} />
            <Route path="query" element={<QueryPage />} />
            <Route path="documents/:id" element={<DocumentViewer />} />
            <Route path="activity/:id" element={<ActivityDetails />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="courses"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <CoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="courses/:id"
              element={
                <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                  <CourseDetailPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
