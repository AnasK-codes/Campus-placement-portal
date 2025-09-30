import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { resetPassword } from '../../firebase';

const ResetContainer = styled.div`
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
`;

const ResetCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  width: 100%;
  max-width: 450px;
  text-align: center;
`;

const Icon = styled.div`
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
  line-height: 1.6;
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
`;

const SuccessMessage = styled(motion.div)`
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid rgba(76, 175, 80, 0.2);
  font-size: 0.9rem;
  text-align: left;
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

const BackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: 0.9rem;
  margin-top: ${({ theme }) => theme.spacing.xl};
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover {
    text-decoration: underline;
  }
`;

const InfoBox = styled.div`
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
  text-align: left;

  h4 {
    color: #2196f3;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      align-items: flex-start;
      gap: ${({ theme }) => theme.spacing.sm};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
      color: ${({ theme }) => theme.colors.textSecondary};
      font-size: 0.9rem;

      &::before {
        content: '•';
        color: #2196f3;
        font-weight: bold;
        margin-top: 2px;
      }
    }
  }
`;

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (error) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please wait before trying again.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <ResetContainer>
        <ResetCard
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Icon>✅</Icon>
          
          <Title>
            Email <span>Sent</span>
          </Title>
          
          <Subtitle>
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your inbox and follow the instructions to reset your password.
          </Subtitle>

          <InfoBox>
            <h4>📋 Next Steps</h4>
            <ul>
              <li>Check your email inbox for the reset link</li>
              <li>Click the link to create a new password</li>
              <li>Return to the login page to sign in</li>
              <li>If you don't see the email, check your spam folder</li>
            </ul>
          </InfoBox>

          <BackLink to="/auth/login">
            ← Back to Login
          </BackLink>
        </ResetCard>
      </ResetContainer>
    );
  }

  return (
    <ResetContainer>
      <ResetCard
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Icon>🔑</Icon>
        
        <Title>
          Reset <span>Password</span>
        </Title>
        
        <Subtitle>
          Enter your email address and we'll send you a link to reset your password.
        </Subtitle>

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
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              required
              autoComplete="email"
            />
          </InputGroup>

          <Button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
          </Button>
        </Form>

        <InfoBox>
          <h4>💡 Password Reset Tips</h4>
          <ul>
            <li>Make sure to use the email associated with your account</li>
            <li>The reset link will expire in 1 hour for security</li>
            <li>Check your spam folder if you don't see the email</li>
            <li>Contact support if you continue having issues</li>
          </ul>
        </InfoBox>

        <BackLink to="/auth/login">
          ← Back to Login
        </BackLink>
      </ResetCard>
    </ResetContainer>
  );
};

export default ResetPassword;
