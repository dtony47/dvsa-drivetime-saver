import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import LearnerDashboard from './pages/LearnerDashboard'
import AlertsPage from './pages/AlertsPage'
import InstructorDashboard from './pages/InstructorDashboard'
import InstructorProfile from './pages/InstructorProfile'
import CentreSearch from './pages/CentreSearch'
import BookTest from './pages/BookTest'
import BookingPage from './pages/BookingPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/centres" element={<CentreSearch />} />

        <Route
          path="/learner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['learner']}>
              <LearnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learner/alerts"
          element={
            <ProtectedRoute allowedRoles={['learner']}>
              <AlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/book"
          element={
            <ProtectedRoute allowedRoles={['learner']}>
              <BookTest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instructor/profile"
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <InstructorProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}
