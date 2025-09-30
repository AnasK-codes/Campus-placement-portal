import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { sendVerificationEmail, logOut } from '../../firebase';

const VerifyContainer = styled.div`
  min-height: calc(100vh - 70px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
`;

const VerifyCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.xxl};
  width: 100%;
  max-width: 600px;
  text-align: center;
`;

const StatusIcon = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'unverified': return 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
      case 'pending': return 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
      case 'verified': return 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
      default: return theme.colors.gradient;
    }
  }};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    background: ${({ $status, theme }) => {
      switch ($status) {
        case 'unverified': return 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)';
        case 'pending': return 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
        case 'verified': return 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)';
        default: return theme.colors.gradient;
      }
    }};
    opacity: 0.2;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.2; }
    50% { transform: scale(1.1); opacity: 0.1; }
    100% { transform: scale(1); opacity: 0.2; }
  }
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const InfoCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin: ${({ theme }) => theme.spacing.xl} 0;
  text-align: left;
`;

const InfoTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.95rem;
    line-height: 1.5;

    &::before {
      content: '•';
      color: ${({ theme }) => theme.colors.primary};
      font-weight: bold;
      margin-top: 2px;
    }
  }
`;

const ContactInfo = styled.div`
  background: rgba(211, 47, 47, 0.05);
  border: 1px solid rgba(211, 47, 47, 0.1);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};

  h4 {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
    margin: ${({ theme }) => theme.spacing.xs} 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const Button = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all ${({ theme }) => theme.transitions.normal};
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &.primary {
    background: ${({ theme }) => theme.colors.gradient};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(211, 47, 47, 0.3);
    }
  }

  &.secondary {
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.border};

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primary};
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'unverified': return 'rgba(255, 152, 0, 0.1)';
      case 'pending': return 'rgba(33, 150, 243, 0.1)';
      case 'verified': return 'rgba(76, 175, 80, 0.1)';
      default: return theme.colors.surface;
    }
  }};
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'unverified': return '#FF9800';
      case 'pending': return '#2196F3';
      case 'verified': return '#4CAF50';
      default: return theme.colors.textSecondary;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const VerifyPending = () => {
  const { currentUser, userProfile, getUserStatus, refreshUserData, isEmailVerified } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const navigate = useNavigate();

  const userStatus = getUserStatus();

  // Auto-refresh user data periodically to check for verification
  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentUser) {
        await currentUser.reload();
        await refreshUserData();
        
        // If email is verified and user is approved, redirect to dashboard
        if (isEmailVerified() && userProfile?.approved) {
          navigate('/dashboard');
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [currentUser, userProfile, isEmailVerified, refreshUserData, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    if (!currentUser || resendCooldown > 0) return;

    setIsResending(true);
    setResendMessage('');

    try {
      await sendVerificationEmail(currentUser);
      setResendMessage('Verification email sent! Please check your inbox.');
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      console.error('Resend verification error:', error);
      setResendMessage('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsCheckingStatus(true);
    setStatusMessage('');
    
    try {
      // Reload Firebase user to get latest email verification status
      await currentUser.reload();
      // Refresh user data from Firestore
      await refreshUserData();
      
      setStatusMessage('Status updated successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Check status error:', error);
      setStatusMessage('Failed to check status. Please try again.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      navigate('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getStatusContent = () => {
    if (!isEmailVerified()) {
      return {
        icon: '📧',
        status: 'unverified',
        title: 'Verify Your Email',
        message: 'We\'ve sent a verification link to your email address. Please check your inbox and click the link to verify your account.',
        badge: '⚠️ Email Not Verified'
      };
    }

    if (userStatus.status === 'pending') {
      return {
        icon: '⏳',
        status: 'pending',
        title: 'Account Pending Approval',
        message: 'Thanks — your account awaits approval from your institute\'s placement team. We\'ll notify you by email once approved.',
        badge: '⏳ Pending Approval'
      };
    }

    return {
      icon: '✅',
      status: 'verified',
      title: 'Account Verified',
      message: 'Your account has been verified and approved! You can now access all features.',
      badge: '✅ Account Active'
    };
  };

  const statusContent = getStatusContent();

  if (!currentUser) {
    navigate('/auth/login');
    return null;
  }

  return (
    <VerifyContainer>
      <VerifyCard
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <StatusIcon $status={statusContent.status}>
          {statusContent.icon}
        </StatusIcon>

        <StatusBadge $status={statusContent.status}>
          {statusContent.badge}
        </StatusBadge>

        <Title>
          {statusContent.title}
        </Title>

        <Message>
          {statusContent.message}
        </Message>

        {(resendMessage || statusMessage) && (
          <Message style={{ color: (resendMessage || statusMessage).includes('Failed') ? '#f44336' : '#4caf50' }}>
            {resendMessage || statusMessage}
          </Message>
        )}

        {!isEmailVerified() && (
          <InfoCard>
            <InfoTitle>
              📋 Next Steps
            </InfoTitle>
            <InfoList>
              <li>Check your email inbox for a verification message</li>
              <li>Click the verification link in the email</li>
              <li>Return to this page - it will automatically update</li>
              <li>If you don't see the email, check your spam folder</li>
            </InfoList>
          </InfoCard>
        )}

        {userStatus.status === 'pending' && isEmailVerified() && (
          <InfoCard>
            <InfoTitle>
              🏫 Approval Process
            </InfoTitle>
            <InfoList>
              <li><strong>Expected Timeline:</strong> 1-2 business days</li>
              <li><strong>Review Process:</strong> Placement team verifies your details</li>
              <li><strong>Notification:</strong> You'll receive an email once approved</li>
              <li><strong>Access:</strong> Full platform access after approval</li>
            </InfoList>

            <ContactInfo>
              <h4>Need Help?</h4>
              <p><strong>Email:</strong> placement@university.edu</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Office Hours:</strong> Mon-Fri, 9AM-5PM</p>
            </ContactInfo>
          </InfoCard>
        )}

        <ActionButtons>
          {!isEmailVerified() && (
            <Button
              className="primary"
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isResending ? '📤 Sending...' : 
               resendCooldown > 0 ? `⏱️ Resend in ${resendCooldown}s` : 
               '📧 Resend Email'}
            </Button>
          )}

          <Button
            className="secondary"
            onClick={handleCheckStatus}
            disabled={isCheckingStatus}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isCheckingStatus ? '🔄 Checking...' : '🔄 Check Status'}
          </Button>

          <Button
            className="secondary"
            onClick={handleSignOut}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚪 Sign Out
          </Button>
        </ActionButtons>

        {statusContent.status === 'verified' && (
          <ActionButtons>
            <Button
              as={Link}
              to="/dashboard"
              className="primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚀 Go to Dashboard
            </Button>
          </ActionButtons>
        )}
      </VerifyCard>
    </VerifyContainer>
  );
};

export default VerifyPending;
