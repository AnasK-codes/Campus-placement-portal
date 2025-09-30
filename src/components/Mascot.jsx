import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(2deg); }
  50% { transform: translateY(-4px) rotate(0deg); }
  75% { transform: translateY(-12px) rotate(-2deg); }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  40%, 43% { transform: translate3d(0, -8px, 0) scale(1.1); }
  70% { transform: translate3d(0, -4px, 0) scale(1.05); }
  90% { transform: translate3d(0, -2px, 0) scale(1.02); }
`;

const MascotContainer = styled(motion.div)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  cursor: pointer;
  user-select: none;

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    transform: scale(0.8);
  }
`;

const MascotCharacter = styled(motion.div)`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.gradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  animation: ${float} 4s ease-in-out infinite;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: ${({ theme }) => theme.colors.gradient};
    border-radius: 50%;
    z-index: -1;
    opacity: 0.3;
    animation: ${float} 4s ease-in-out infinite reverse;
  }

  &.celebrating {
    animation: ${bounce} 0.8s ease-out;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
`;

const TooltipContainer = styled(motion.div)`
  position: absolute;
  bottom: 100px;
  right: 0;
  width: 280px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: 1001;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    right: 24px;
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid ${({ theme }) => theme.colors.background};
  }

  @media (max-width: 768px) {
    width: 240px;
    right: -80px;
  }
`;

const TooltipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  .icon {
    font-size: 1.2rem;
  }

  .title {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const TooltipContent = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TooltipActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
  background: ${({ primary, theme }) => primary ? theme.colors.primary : 'transparent'};
  color: ${({ primary, theme }) => primary ? '#FFFFFF' : theme.colors.primary};
  border: ${({ primary, theme }) => primary ? 'none' : `1px solid ${theme.colors.primary}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
    background: ${({ primary, theme }) => primary ? theme.colors.primaryDark : theme.colors.primary};
    color: #FFFFFF;
  }
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const NotificationBadge = styled(motion.div)`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: ${({ theme }) => theme.colors.error};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  animation: ${bounce} 1s ease-out;
`;

const Mascot = ({ onCelebrate, celebrationTrigger }) => {
  const { currentUser, userProfile } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentTip, setCurrentTip] = useState(null);
  const [celebrating, setCelebrating] = useState(false);
  const [hasNewTip, setHasNewTip] = useState(false);

  // Contextual tips based on user state and actions
  const tips = {
    welcome: {
      icon: '👋',
      title: 'Welcome to Campus Portal!',
      content: 'I\'m your AI guide. Click me anytime for personalized tips and suggestions.',
      action: 'Got it!',
    },
    profileIncomplete: {
      icon: '📝',
      title: 'Complete Your Profile',
      content: 'Upload your skills and resume to get AI-matched internships tailored just for you!',
      action: 'Complete Profile',
      link: '/profile',
    },
    firstApplication: {
      icon: '🎯',
      title: 'Great Choice!',
      content: 'You\'ve applied for your first internship! Keep applying to increase your chances.',
      action: 'View More',
      link: '/internships',
    },
    certificateGenerated: {
      icon: '🏆',
      title: 'Certificate Ready!',
      content: 'Your internship certificate has been generated! Share it with recruiters to boost your profile.',
      action: 'View Certificate',
      link: '/certificates',
    },
    skillsUpdate: {
      icon: '💡',
      title: 'Skill Recommendation',
      content: 'Based on trending internships, consider adding Python and React to your skill set!',
      action: 'Update Skills',
      link: '/profile',
    },
    interviewScheduled: {
      icon: '📅',
      title: 'Interview Scheduled!',
      content: 'Prepare well! Research the company and practice common interview questions.',
      action: 'View Details',
      link: '/interviews',
    },
    mockTestSuggestion: {
      icon: '🧠',
      title: 'Practice Makes Perfect',
      content: 'Take AI-powered mock tests to improve your technical skills and interview performance.',
      action: 'Start Test',
      link: '/mock-tests',
    },
    doubtSolver: {
      icon: '❓',
      title: 'Need Help?',
      content: 'Use our peer-to-peer doubt solver to get instant help from seniors and mentors.',
      action: 'Ask Question',
      link: '/doubts',
    },
  };

  // Determine which tip to show based on user context
  useEffect(() => {
    if (!currentUser) return;

    const determineCurrentTip = () => {
      // Check for celebration triggers first
      if (celebrationTrigger) {
        switch (celebrationTrigger) {
          case 'application_submitted':
            return tips.firstApplication;
          case 'certificate_generated':
            return tips.certificateGenerated;
          case 'interview_scheduled':
            return tips.interviewScheduled;
          default:
            break;
        }
      }

      // Check profile completion
      if (userProfile) {
        const profileCompletion = calculateProfileCompletion(userProfile);
        if (profileCompletion < 70) {
          return tips.profileIncomplete;
        }
      }

      // Random helpful tips
      const randomTips = [tips.skillsUpdate, tips.mockTestSuggestion, tips.doubtSolver];
      return randomTips[Math.floor(Math.random() * randomTips.length)];
    };

    const newTip = determineCurrentTip();
    if (newTip !== currentTip) {
      setCurrentTip(newTip);
      setHasNewTip(true);
    }
  }, [currentUser, userProfile, celebrationTrigger]);

  // Handle celebration animation
  useEffect(() => {
    if (celebrationTrigger) {
      setCelebrating(true);
      setShowTooltip(true);
      setHasNewTip(false);
      
      const timer = setTimeout(() => {
        setCelebrating(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [celebrationTrigger]);

  // Auto-show tooltip for important tips
  useEffect(() => {
    if (hasNewTip && (currentTip?.title.includes('Certificate') || currentTip?.title.includes('Interview'))) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        setHasNewTip(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasNewTip, currentTip]);

  const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;
    
    let completed = 0;
    const fields = ['name', 'email', 'department', 'year', 'skills', 'resume', 'bio'];
    
    fields.forEach(field => {
      if (profile[field] && (Array.isArray(profile[field]) ? profile[field].length > 0 : true)) {
        completed++;
      }
    });
    
    return Math.round((completed / fields.length) * 100);
  };

  const handleMascotClick = () => {
    if (!showTooltip && currentTip) {
      setShowTooltip(true);
      setHasNewTip(false);
    } else {
      setShowTooltip(!showTooltip);
    }
  };

  const handleActionClick = () => {
    if (currentTip?.link) {
      window.location.href = currentTip.link;
    }
    setShowTooltip(false);
    if (onCelebrate) {
      onCelebrate();
    }
  };

  const handleDismiss = () => {
    setShowTooltip(false);
    setHasNewTip(false);
  };

  if (!currentUser) return null;

  return (
    <MascotContainer
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay: 0.5 
      }}
    >
      <MascotCharacter
        className={celebrating ? 'celebrating' : ''}
        onClick={handleMascotClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        🎓
        {hasNewTip && (
          <NotificationBadge
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            !
          </NotificationBadge>
        )}
      </MascotCharacter>

      <AnimatePresence>
        {showTooltip && currentTip && (
          <TooltipContainer
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <CloseButton
              onClick={handleDismiss}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </CloseButton>

            <TooltipHeader>
              <span className="icon">{currentTip.icon}</span>
              <span className="title">{currentTip.title}</span>
            </TooltipHeader>

            <TooltipContent>
              {currentTip.content}
            </TooltipContent>

            <TooltipActions>
              <ActionButton
                onClick={handleDismiss}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Later
              </ActionButton>
              <ActionButton
                primary
                onClick={handleActionClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentTip.action}
              </ActionButton>
            </TooltipActions>
          </TooltipContainer>
        )}
      </AnimatePresence>
    </MascotContainer>
  );
};

export default Mascot;
