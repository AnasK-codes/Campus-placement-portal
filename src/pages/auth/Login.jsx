import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { signInWithEmail, signInWithGoogle } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useRoleBasedNavigation } from '../../hooks/useRoleBasedNavigation';

const LoginContainer = styled.div`
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
`;

const LoginCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  width: 100%;
  max-width: 450px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InputGroup = styled.div`
  text-align: left;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ErrorMessage = styled(motion.div)`
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid rgba(244, 67, 54, 0.2);
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(211, 47, 47, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const GoogleButton = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: white;
  color: #333;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    background: #f8f9fa;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ForgotPassword = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: ${({ theme }) => theme.spacing.md};
  display: inline-block;

  &:hover {
    text-decoration: underline;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spacing.xl} 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
  
  span {
    padding: 0 ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const SignupLink = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const StatusMessage = styled(motion.div)`
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid rgba(33, 150, 243, 0.2);
  font-size: 0.9rem;
  text-align: left;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUserData, userRole } = useAuth();
  const { navigateToRoleDashboard } = useRoleBasedNavigation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmail(formData.email, formData.password);
      
      // Refresh user data to get latest role and profile
      await refreshUserData();
      
      // Small delay to ensure user data is loaded
      setTimeout(() => {
        // Navigate to role-based dashboard or intended page
        if (from === '/dashboard' || from === '/') {
          navigateToRoleDashboard();
        } else {
          navigate(from, { replace: true });
        }
      }, 100);
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Failed to sign in. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
      
      // Refresh user data to get latest role and profile
      await refreshUserData();
      
      // Small delay to ensure user data is loaded
      setTimeout(() => {
        // Navigate to role-based dashboard or intended page
        if (from === '/dashboard' || from === '/') {
          navigateToRoleDashboard();
        } else {
          navigate(from, { replace: true });
        }
      }, 100);
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups and try again.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email using a different sign-in method.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Title>
          Welcome <span>Back</span>
        </Title>
        <Subtitle>
          Sign in to your Campus Portal account
        </Subtitle>

        {location.state?.message && (
          <StatusMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {location.state.message}
          </StatusMessage>
        )}

        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </ErrorMessage>
        )}

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </InputGroup>

          <Button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <ForgotPassword to="/auth/reset-password">
            Forgot your password?
          </ForgotPassword>
        </Form>

        <Divider>
          <span>or</span>
        </Divider>

        <GoogleButton
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>🔍</span>
          Continue with Google
        </GoogleButton>

        <Divider>
          <span></span>
        </Divider>

        <SignupLink>
          Don't have an account? <Link to="/auth/signup">Sign up here</Link>
        </SignupLink>
      </LoginCard>
    </LoginContainer>
  );
};

export default Login;
