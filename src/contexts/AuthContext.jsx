import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  createUserDocument, 
  getUserDocument,
  VALID_ROLES,
  hasPermission
} from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [customClaims, setCustomClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Get user's role from Firestore document
  const refreshUserClaims = async (user) => {
    if (!user) {
      setCustomClaims(null);
      setUserRole(null);
      return;
    }

    try {
      // Get role from Firestore user document instead of custom claims
      const userDoc = await getUserDocument(user.uid);
      const role = userDoc?.role || 'pending';
      setUserRole(role);
      setCustomClaims({ role });
      return { role };
    } catch (error) {
      console.error('Error getting user role:', error);
      setCustomClaims(null);
      setUserRole('pending');
      return null;
    }
  };

  // Force refresh user token to get updated claims
  const forceTokenRefresh = async () => {
    if (currentUser) {
      try {
        await currentUser.getIdToken(true); // Force refresh
        await refreshUserClaims(currentUser);
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }
  };

  // Get user profile from Firestore
  const refreshUserProfile = async (uid) => {
    if (!uid) {
      setUserProfile(null);
      return;
    }

    try {
      const profile = await getUserDocument(uid);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      setUserProfile(null);
      return null;
    }
  };

  // Check if user has specific permission
  const checkPermission = (permission) => {
    return hasPermission(userRole, permission);
  };

  // Check if user has any of the specified roles
  const hasRole = (roles) => {
    if (!userRole) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(userRole);
  };

  // Check if user is approved
  const isApproved = () => {
    return userProfile?.approved === true;
  };

  // Check if user's email is verified
  const isEmailVerified = () => {
    // For test accounts, consider them verified if they're approved in Firestore
    const testEmails = ['admin@test.com', 'faculty@test.com', 'placement@test.com', 'recruiter@test.com', 'student@test.com'];
    if (currentUser?.email && testEmails.includes(currentUser.email) && userProfile?.approved) {
      return true;
    }
    return currentUser?.emailVerified === true;
  };

  // Check if user can access protected content
  const canAccess = (requiredRoles = [], requiredPermissions = []) => {
    // Must be authenticated
    if (!currentUser) return false;
    
    // Must have verified email
    if (!isEmailVerified()) return false;
    
    // Must be approved (except for pending verification page)
    if (!isApproved() && !requiredRoles.includes('pending')) return false;
    
    // Check roles if specified
    if (requiredRoles.length > 0 && !hasRole(requiredRoles)) return false;
    
    // Check permissions if specified
    if (requiredPermissions.length > 0) {
      return requiredPermissions.some(permission => checkPermission(permission));
    }
    
    return true;
  };

  // Get user status for UI display
  const getUserStatus = () => {
    if (!currentUser) return { status: 'unauthenticated', message: 'Not signed in' };
    
    if (!isEmailVerified()) {
      return { 
        status: 'unverified', 
        message: 'Please verify your email address',
        action: 'verify-email'
      };
    }
    
    if (!isApproved()) {
      return { 
        status: 'pending', 
        message: 'Your account is pending approval from the placement team',
        action: 'wait-approval'
      };
    }
    
    return { 
      status: 'active', 
      message: `Signed in as ${userRole}`,
      role: userRole
    };
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setAuthError(null);
      
      try {
        setCurrentUser(user);
        
        if (user) {
          // Get user claims and profile in parallel
          const [claims, profile] = await Promise.all([
            refreshUserClaims(user),
            refreshUserProfile(user.uid)
          ]);
          
          // Create user document if it doesn't exist
          if (!profile) {
            await createUserDocument(user);
            await refreshUserProfile(user.uid);
          }
        } else {
          setUserProfile(null);
          setUserRole(null);
          setCustomClaims(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Refresh user data when needed
  const refreshUserData = async () => {
    if (currentUser) {
      await Promise.all([
        refreshUserClaims(currentUser),
        refreshUserProfile(currentUser.uid)
      ]);
    }
  };

  const value = {
    // User state
    currentUser,
    userProfile,
    userRole,
    customClaims,
    loading,
    authError,
    
    // Status checks
    isEmailVerified,
    isApproved,
    getUserStatus,
    
    // Permission checks
    hasRole,
    checkPermission,
    canAccess,
    
    // Actions
    refreshUserData,
    forceTokenRefresh,
    refreshUserProfile,
    refreshUserClaims,
    
    // Constants
    VALID_ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
