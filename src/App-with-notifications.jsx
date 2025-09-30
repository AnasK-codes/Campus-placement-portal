import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { lightTheme, darkTheme } from './styles/theme';
import GlobalStyles from './styles/GlobalStyles';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationSystem from './components/NotificationSystem';

// Import pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import StudentDashboard from './pages/student/StudentDashboard';
import MentorDashboard from './pages/mentor/MentorDashboard';
import PlacementDashboard from './pages/placement/PlacementDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import InterviewScheduler from './pages/placement/InterviewScheduler';
import FeedbackDashboard from './pages/mentor/FeedbackDashboard';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';

const AppContent = () => {
  const { isDarkMode } = useTheme();

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyles />
      <Router>
        <div className="App">
          <ErrorBoundary>
            <AuthProvider>
              <NotificationProvider>
                <Navbar />
                
                {/* Global Notification System - Available on all pages */}
                <NotificationSystem 
                  showIcon={true}
                  showToasts={true}
                  enableSound={true}
                  showMascot={true}
                />
                
                <main>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* Protected Student Routes */}
                    <Route 
                      path="/student/*" 
                      element={
                        <ProtectedRoute requiredRoles={['student']}>
                          <StudentDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Protected Mentor Routes */}
                    <Route 
                      path="/mentor/*" 
                      element={
                        <ProtectedRoute requiredRoles={['mentor', 'faculty']}>
                          <MentorDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/mentor/feedback" 
                      element={
                        <ProtectedRoute requiredRoles={['mentor', 'faculty']}>
                          <FeedbackDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Protected Placement Routes */}
                    <Route 
                      path="/placement/*" 
                      element={
                        <ProtectedRoute requiredRoles={['placement']}>
                          <PlacementDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    <Route 
                      path="/placement/interviews" 
                      element={
                        <ProtectedRoute requiredRoles={['placement']}>
                          <InterviewScheduler />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Protected Admin Routes */}
                    <Route 
                      path="/admin/*" 
                      element={
                        <ProtectedRoute requiredRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Catch-all route */}
                    <Route path="*" element={<div>404 - Page Not Found</div>} />
                  </Routes>
                </main>
                
                <Footer />
              </NotificationProvider>
            </AuthProvider>
          </ErrorBoundary>
        </div>
      </Router>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
};

export default App;

// Example of how to use notifications in any component
export const ExampleNotificationUsage = () => {
  const { 
    notifications, 
    unreadCount, 
    notifyApplicationApproved,
    notifyInterviewScheduled,
    notifyCertificateGenerated 
  } = useNotifications();

  const handleApplicationApproval = async () => {
    await notifyApplicationApproved('student123', {
      internshipTitle: 'Frontend Developer',
      company: 'Tech Corp',
      applicationId: 'app123',
      mentorName: 'Dr. Smith'
    });
  };

  const handleInterviewScheduling = async () => {
    await notifyInterviewScheduled('student123', {
      internshipTitle: 'Backend Developer',
      company: 'StartupXYZ',
      interviewDate: '2024-01-15',
      interviewTime: '10:00 AM',
      interviewId: 'interview123'
    });
  };

  const handleCertificateGeneration = async () => {
    await notifyCertificateGenerated('student123', {
      internshipTitle: 'Full Stack Developer',
      company: 'Innovation Labs',
      certificateId: 'cert123',
      certificateType: 'excellence'
    });
  };

  return (
    <div>
      <h3>Notification System Demo</h3>
      <p>Total Notifications: {notifications.length}</p>
      <p>Unread Count: {unreadCount}</p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={handleApplicationApproval}>
          Send Approval Notification
        </button>
        <button onClick={handleInterviewScheduling}>
          Send Interview Notification
        </button>
        <button onClick={handleCertificateGeneration}>
          Send Certificate Notification
        </button>
      </div>
    </div>
  );
};
