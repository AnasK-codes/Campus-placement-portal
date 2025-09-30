import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import GlobalStyles from './styles/GlobalStyles';

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyPending from "./pages/auth/VerifyPending";
import ResetPassword from "./pages/auth/ResetPassword";

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MockTest from './pages/student/MockTest';
import BrowseJobs from './pages/student/BrowseJobs';
import ResumeBuilder from './pages/student/ResumeBuilder';
import RecommendedInternships from './pages/student/RecommendedInternships';
import Certificates from './pages/student/Certificates';

// Admin Pages
import RoleApprovals from './pages/admin/RoleApprovals';

// Role-based Dashboard Pages
import AdminDashboard from './pages/dashboards/AdminDashboard';
import FacultyDashboard from './pages/dashboards/FacultyDashboard';
import PlacementDashboard from './pages/dashboards/PlacementDashboard';
import RecruiterDashboard from './pages/dashboards/RecruiterDashboard';

function App() {
  return (
    <ThemeProvider>
      <GlobalStyles />
      <AuthProvider>
        <Router>
          <div id="root">
            <Navbar />
            <main>
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  
                  {/* Protected General Routes */}
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute requiredRoles={["admin", "faculty", "placement", "recruiter", "student"]}>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <ProtectedRoute requiredRoles={["admin", "faculty", "placement", "recruiter", "student"]}>
                        <Settings />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Auth Routes */}
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/signup" element={<Signup />} />
                  <Route
                    path="/auth/reset-password"
                    element={<ResetPassword />}
                  />
                  <Route
                    path="/auth/verify-pending"
                    element={<VerifyPending />}
                  />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute
                        requiredRoles={[
                          "student",
                          "faculty",
                          "placement",
                          "recruiter",
                          "admin",
                        ]}
                      >
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Student Routes */}
                  <Route
                    path="/student/dashboard"
                    element={
                      <ProtectedRoute requiredRoles={["student"]}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/student/mock-test"
                    element={
                      <ProtectedRoute requiredRoles={["student"]}>
                        <MockTest />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/jobs"
                    element={
                      <ProtectedRoute requiredRoles={["student", "faculty", "placement", "recruiter", "admin"]}>
                        <BrowseJobs />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/student/resume-builder"
                    element={
                      <ProtectedRoute requiredRoles={["student"]}>
                        <ResumeBuilder />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/student/recommended-internships"
                    element={
                      <ProtectedRoute requiredRoles={["student"]}>
                        <RecommendedInternships />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/student/certificates"
                    element={
                      <ProtectedRoute requiredRoles={["student"]}>
                        <Certificates />
                      </ProtectedRoute>
                    }
                  />

                  {/* Test Route - Remove in production */}
                  <Route
                    path="/test-dashboard"
                    element={<StudentDashboard />}
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/role-approvals"
                    element={
                      <ProtectedRoute requiredRoles={["placement", "admin"]}>
                        <RoleApprovals />
                      </ProtectedRoute>
                    }
                  />

                  {/* Role-based Dashboard Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requiredRoles={["admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/faculty" 
                    element={
                      <ProtectedRoute requiredRoles={["faculty"]}>
                        <FacultyDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/placement" 
                    element={
                      <ProtectedRoute requiredRoles={["placement"]}>
                        <PlacementDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/recruiter" 
                    element={
                      <ProtectedRoute requiredRoles={["recruiter"]}>
                        <RecruiterDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/student" 
                    element={
                      <ProtectedRoute requiredRoles={["student"]}>
                        <StudentDashboard />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Legacy Routes (for backward compatibility) */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Routes>
              </AnimatePresence>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
