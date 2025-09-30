import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { PROFILE_MILESTONES } from '../utils/gamificationHelper';

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(211, 47, 47, 0.3);
  }
  50% {
    box-shadow: 0 0 25px rgba(211, 47, 47, 0.8);
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
`;

const confetti = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
`;

const ProgressContainer = styled(motion.div)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  overflow: hidden;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  .progress-title {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  .progress-percentage {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${({ percentage }) => {
    if (percentage >= 100) return 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)';
    if (percentage >= 75) return 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)';
    if (percentage >= 50) return 'linear-gradient(90deg, #2196F3 0%, #1976D2 100%)';
    if (percentage >= 25) return 'linear-gradient(90deg, #FF9800 0%, #F57C00 100%)';
    return 'linear-gradient(90deg, #D32F2F 0%, #B71C1C 100%)';
  }};
  border-radius: 6px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing.sm};

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    animation: ${({ animate }) => animate ? 'shimmer 2s infinite' : 'none'};
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const MilestoneMarkers = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
`;

const MilestoneMarker = styled(motion.div)`
  position: absolute;
  left: ${({ position }) => position}%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  background: ${({ reached, theme }) => reached ? theme.colors.primary : theme.colors.surface};
  border: 2px solid ${({ reached, theme }) => reached ? 'white' : theme.colors.border};
  border-radius: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  cursor: pointer;

  ${({ reached }) => reached && `
    animation: ${glow} 2s infinite;
  `}
`;

const MilestoneTooltip = styled(motion.div)`
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 1000;
  white-space: nowrap;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.border};
  }

  .tooltip-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ProgressDetails = styled(motion.div)`
  margin-top: ${({ theme }) => theme.spacing.lg};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const ProgressItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};

  .item-icon {
    font-size: 1.2rem;
    width: 24px;
    text-align: center;
  }

  .item-content {
    flex: 1;

    .item-title {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: 2px;
    }

    .item-status {
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      color: ${({ completed, theme }) => completed ? theme.colors.success : theme.colors.textSecondary};
    }
  }

  .item-check {
    font-size: 1rem;
    color: ${({ completed, theme }) => completed ? theme.colors.success : theme.colors.textTertiary};
  }
`;

const CelebrationOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CelebrationMessage = styled(motion.div)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  max-width: 300px;
`;

const ConfettiPiece = styled(motion.div)`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${({ color }) => color};
  border-radius: 2px;
`;

const AIMascot = styled(motion.div)`
  position: absolute;
  top: -40px;
  right: -20px;
  font-size: 2rem;
  z-index: 5;
  cursor: pointer;
`;

const GamifiedProgressBar = ({
  percentage = 0,
  title = "Profile Completion",
  showDetails = true,
  showMilestones = true,
  onMilestoneReached,
  profileData = {},
  animateTo,
  className,
  ...props
}) => {
  const [currentPercentage, setCurrentPercentage] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [hoveredMilestone, setHoveredMilestone] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMascot, setShowMascot] = useState(false);

  const milestones = Object.values(PROFILE_MILESTONES);
  const targetPercentage = animateTo !== undefined ? animateTo : percentage;

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPercentage(targetPercentage);
    }, 300);

    return () => clearTimeout(timer);
  }, [targetPercentage]);

  // Check for milestone reached
  useEffect(() => {
    const reachedMilestone = milestones.find(
      milestone => currentPercentage >= milestone.percentage && 
                  (currentPercentage - 10) < milestone.percentage
    );

    if (reachedMilestone && currentPercentage > 0) {
      setCelebrationMessage(reachedMilestone.message);
      setShowCelebration(true);
      setShowMascot(true);
      
      if (reachedMilestone.effect === 'confetti' || reachedMilestone.effect === 'fireworks') {
        setShowConfetti(true);
      }

      if (onMilestoneReached) {
        onMilestoneReached(reachedMilestone);
      }

      // Hide celebration after 3 seconds
      setTimeout(() => {
        setShowCelebration(false);
        setShowConfetti(false);
        setShowMascot(false);
      }, 3000);
    }
  }, [currentPercentage, milestones, onMilestoneReached]);

  const profileItems = [
    {
      title: 'Basic Information',
      completed: !!(profileData.name && profileData.email && profileData.department),
      icon: '👤'
    },
    {
      title: 'Skills Added',
      completed: profileData.skills && profileData.skills.length >= 5,
      icon: '💻'
    },
    {
      title: 'Projects Showcase',
      completed: profileData.projects && profileData.projects.length >= 2,
      icon: '🚀'
    },
    {
      title: 'Resume Uploaded',
      completed: !!profileData.resumeUrl,
      icon: '📄'
    },
    {
      title: 'Certificates Added',
      completed: profileData.certificates && profileData.certificates.length >= 1,
      icon: '🏆'
    },
    {
      title: 'Applications Started',
      completed: profileData.applicationsCount >= 1,
      icon: '📋'
    }
  ];

  const progressVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${currentPercentage}%`,
      transition: { 
        duration: 1.5, 
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  const celebrationVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  return (
    <ProgressContainer className={className} {...props}>
      <ProgressHeader>
        <div className="progress-title">
          <span>📊</span>
          {title}
        </div>
        <motion.div 
          className="progress-percentage"
          key={currentPercentage}
          initial={{ scale: 1.2, color: '#D32F2F' }}
          animate={{ scale: 1, color: '#D32F2F' }}
          transition={{ duration: 0.3 }}
        >
          {Math.round(currentPercentage)}%
        </motion.div>
      </ProgressHeader>

      <ProgressTrack>
        <ProgressFill
          variants={progressVariants}
          initial="initial"
          animate="animate"
          percentage={currentPercentage}
          animate={currentPercentage > 0}
        />

        {showMilestones && (
          <MilestoneMarkers>
            {milestones.map((milestone) => (
              <MilestoneMarker
                key={milestone.percentage}
                position={milestone.percentage}
                reached={currentPercentage >= milestone.percentage}
                onMouseEnter={() => setHoveredMilestone(milestone)}
                onMouseLeave={() => setHoveredMilestone(null)}
                whileHover={{ scale: 1.2 }}
              >
                {currentPercentage >= milestone.percentage ? '✓' : ''}
                
                <AnimatePresence>
                  {hoveredMilestone?.percentage === milestone.percentage && (
                    <MilestoneTooltip
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <div className="tooltip-title">
                        {milestone.title} ({milestone.percentage}%)
                      </div>
                    </MilestoneTooltip>
                  )}
                </AnimatePresence>
              </MilestoneMarker>
            ))}
          </MilestoneMarkers>
        )}
      </ProgressTrack>

      {showDetails && (
        <ProgressDetails
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {profileItems.map((item, index) => (
            <ProgressItem
              key={item.title}
              completed={item.completed}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <span className="item-icon">{item.icon}</span>
              <div className="item-content">
                <div className="item-title">{item.title}</div>
                <div className="item-status">
                  {item.completed ? 'Completed' : 'Pending'}
                </div>
              </div>
              <span className="item-check">
                {item.completed ? '✅' : '⭕'}
              </span>
            </ProgressItem>
          ))}
        </ProgressDetails>
      )}

      <AnimatePresence>
        {showMascot && (
          <AIMascot
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            🤖
          </AIMascot>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCelebration && (
          <CelebrationOverlay>
            <CelebrationMessage
              variants={celebrationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {celebrationMessage}
            </CelebrationMessage>
          </CelebrationOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfetti && (
          <CelebrationOverlay>
            {[...Array(20)].map((_, i) => (
              <ConfettiPiece
                key={i}
                color={confettiColors[i % confettiColors.length]}
                initial={{
                  x: Math.random() * 400 - 200,
                  y: 0,
                  rotate: 0,
                  opacity: 1
                }}
                animate={{
                  y: -200,
                  rotate: 360,
                  opacity: 0
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </ProgressContainer>
  );
};

export default GamifiedProgressBar;
