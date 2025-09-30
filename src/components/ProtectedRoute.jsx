import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const LoadingContainer = styled.div`
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.surface};
`;

const LoadingSpinner = styled(motion.div)`
  width: 50px;
  height: 50px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AccessDeniedContainer = styled.div`
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
`;

const AccessDeniedCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  max-width: 500px;
  width: 100%;
`;

const AccessDeniedIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.gradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
`;

const AccessDeniedTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const AccessDeniedMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(211, 47, 47, 0.3);
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ status, theme }) => {
    switch (status) {
      case 'unverified': return 'rgba(255, 193, 7, 0.1)';
      case 'pending': return 'rgba(255, 152, 0, 0.1)';
      case 'active': return 'rgba(76, 175, 80, 0.1)';
      default: return theme.colors.surface;
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case 'unverified': return '#FFC107';
      case 'pending': return '#FF9800';
      case 'active': return '#4CAF50';
      default: return theme.colors.textSecondary;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallbackPath = '/auth/login',
  showAccessDenied = true 
}) => {
  const { 
    currentUser, 
    loading, 
    canAccess, 
    getUserStatus,
    isEmailVerified,
    refreshUserData
  } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </LoadingContainer>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user can access this route
  const hasAccess = canAccess(requiredRoles, requiredPermissions);
  const userStatus = getUserStatus();

  // If user doesn't have access, show appropriate response
  if (!hasAccess) {
    // For unverified email, redirect to verification page
    if (!isEmailVerified()) {
      return <Navigate to="/auth/verify-pending" replace />;
    }

    // For pending approval, redirect to pending page
    if (userStatus.status === 'pending') {
      return <Navigate to="/auth/verify-pending" replace />;
    }

    // For insufficient permissions, show access denied if enabled
    if (showAccessDenied) {
      return (
        <AccessDeniedContainer>
          <AccessDeniedCard
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AccessDeniedIcon>🚫</AccessDeniedIcon>
            
            <StatusBadge status={userStatus.status}>
              {userStatus.status === 'unverified' && '⚠️ Email Not Verified'}
              {userStatus.status === 'pending' && '⏳ Pending Approval'}
              {userStatus.status === 'active' && '✅ Account Active'}
            </StatusBadge>

            <AccessDeniedTitle>Access Restricted</AccessDeniedTitle>
            
            <AccessDeniedMessage>
              {userStatus.status === 'unverified' && 
                'Please verify your email address to access this page. Check your inbox for a verification link.'
              }
              {userStatus.status === 'pending' && 
                'Your account is awaiting approval from the placement team. You\'ll receive an email once approved.'
              }
              {userStatus.status === 'active' && 
                `You don't have the required permissions to access this page. Required roles: ${requiredRoles.join(', ') || 'None specified'}.`
              }
            </AccessDeniedMessage>

            <ActionButton
              onClick={() => {
                if (userStatus.status === 'unverified') {
                  window.location.href = '/auth/verify-pending';
                } else if (userStatus.status === 'pending') {
                  window.location.href = '/auth/verify-pending';
                } else {
                  refreshUserData();
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {userStatus.status === 'unverified' && '📧 Verify Email'}
              {userStatus.status === 'pending' && '🔄 Check Status'}
              {userStatus.status === 'active' && '🔄 Refresh Permissions'}
            </ActionButton>
          </AccessDeniedCard>
        </AccessDeniedContainer>
      );
    }

    // Otherwise redirect to fallback
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // User has access, render the protected content
  return children;
};

export default ProtectedRoute;
