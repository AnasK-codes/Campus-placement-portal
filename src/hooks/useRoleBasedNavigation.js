import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useRoleBasedNavigation = () => {
  const { userRole, currentUser, loading } = useAuth();
  const navigate = useNavigate();

  const getRoleDashboardPath = (role) => {
    const rolePaths = {
      'admin': '/admin',
      'faculty': '/faculty', 
      'placement': '/placement',
      'recruiter': '/recruiter',
      'student': '/student'
    };
    
    return rolePaths[role] || '/dashboard';
  };

  const navigateToRoleDashboard = (role = userRole) => {
    if (role) {
      const path = getRoleDashboardPath(role);
      navigate(path, { replace: true });
    }
  };

  // Auto-redirect authenticated users to their role-based dashboard
  useEffect(() => {
    if (!loading && currentUser && userRole && userRole !== 'pending') {
      // Only redirect if we're on a generic route like /dashboard or /login
      const currentPath = window.location.pathname;
      const genericPaths = ['/dashboard', '/login', '/auth/login', '/'];
      
      if (genericPaths.includes(currentPath)) {
        navigateToRoleDashboard();
      }
    }
  }, [currentUser, userRole, loading]);

  return {
    getRoleDashboardPath,
    navigateToRoleDashboard
  };
};
