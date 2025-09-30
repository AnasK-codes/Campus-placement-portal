import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ACHIEVEMENTS } from '../utils/gamificationHelper';

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
`;

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

const AchievementContainer = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme, unlocked }) => 
    unlocked 
      ? `linear-gradient(135deg, ${theme.colors.surface} 0%, ${theme.colors.background} 100%)`
      : theme.colors.surface
  };
  border: 2px solid ${({ theme, unlocked }) => 
    unlocked ? theme.colors.primary : theme.colors.border
  };
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;

  ${({ unlocked }) => unlocked && `
    animation: ${glow} 2s infinite;
  `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  ${({ locked, theme }) => locked && `
    opacity: 0.6;
    filter: grayscale(50%);
    border-style: dashed;
    border-color: ${theme.colors.textTertiary};
  `}
`;

const AchievementIcon = styled(motion.div)`
  font-size: 3rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ color, theme }) => 
    color ? `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)` : theme.colors.primary
  };
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;

  ${({ unlocked }) => unlocked && `
    animation: ${bounce} 2s infinite;
  `}
`;

const AchievementContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  .achievement-title {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  }

  .achievement-description {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0;
  }

  .achievement-date {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textTertiary};
    margin: 0;
  }

  .achievement-progress {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    margin: 0;
  }
`;

const UnlockEffect = styled(motion.div)`
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

const UnlockMessage = styled(motion.div)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  max-width: 200px;
`;

const SparkleEffect = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 5;
`;

const Sparkle = styled(motion.div)`
  position: absolute;
  width: 6px;
  height: 6px;
  background: ${({ color }) => color || '#FFD700'};
  border-radius: 50%;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 2px;
  overflow: hidden;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 2px;
`;

const NewBadge = styled(motion.div)`
  position: absolute;
  top: -8px;
  right: -8px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  z-index: 5;
`;

const AchievementCard = ({
  achievement,
  unlocked = false,
  isNew = false,
  progress = 0,
  showProgress = false,
  onUnlock,
  animateUnlock = false,
  className,
  ...props
}) => {
  const [showUnlockEffect, setShowUnlockEffect] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const achievementData = achievement.id ? 
    ACHIEVEMENTS[achievement.id.toUpperCase()] || achievement : 
    achievement;

  useEffect(() => {
    if (animateUnlock && unlocked) {
      setShowUnlockEffect(true);
      setShowSparkles(true);
      
      if (onUnlock) {
        onUnlock(achievement);
      }

      // Hide effects after animation
      setTimeout(() => {
        setShowUnlockEffect(false);
        setShowSparkles(false);
      }, 3000);
    }
  }, [animateUnlock, unlocked, achievement, onUnlock]);

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
  };

  const cardVariants = {
    initial: { scale: 0.8, opacity: 0, y: 20 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  const unlockVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const sparkleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (i) => ({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
      y: [0, Math.sin(i * 60 * Math.PI / 180) * 40],
      transition: {
        duration: 2,
        delay: i * 0.2,
        ease: "easeOut"
      }
    })
  };

  return (
    <AchievementContainer
      className={className}
      unlocked={unlocked}
      locked={!unlocked && !showProgress}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {isNew && (
        <NewBadge
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
        >
          NEW!
        </NewBadge>
      )}

      <AchievementIcon 
        color={achievementData.color}
        unlocked={unlocked && animateUnlock}
      >
        {achievementData.icon || '🏆'}
      </AchievementIcon>

      <AchievementContent>
        <h3 className="achievement-title">
          {achievementData.name || 'Achievement'}
        </h3>
        <p className="achievement-description">
          {achievementData.description || 'Complete this achievement to unlock rewards'}
        </p>
        
        {unlocked && achievement.dateUnlocked && (
          <p className="achievement-date">
            Unlocked on {formatDate(achievement.dateUnlocked)}
          </p>
        )}

        {showProgress && !unlocked && (
          <>
            <p className="achievement-progress">
              Progress: {Math.round(progress)}%
            </p>
            <ProgressBar>
              <ProgressFill
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </ProgressBar>
          </>
        )}
      </AchievementContent>

      <AnimatePresence>
        {showSparkles && (
          <SparkleEffect>
            {[...Array(6)].map((_, i) => (
              <Sparkle
                key={i}
                custom={i}
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
                color={achievementData.color || '#FFD700'}
              />
            ))}
          </SparkleEffect>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUnlockEffect && (
          <UnlockEffect>
            <UnlockMessage
              variants={unlockVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              🎉 Achievement Unlocked! 🎉
            </UnlockMessage>
          </UnlockEffect>
        )}
      </AnimatePresence>
    </AchievementContainer>
  );
};

// Achievements Grid Component
export const AchievementsGrid = ({ 
  achievements = [], 
  unlockedAchievements = [],
  onAchievementClick,
  showProgress = false,
  userProgress = {},
  className 
}) => {
  const [animatingAchievements, setAnimatingAchievements] = useState(new Set());

  useEffect(() => {
    // Check for newly unlocked achievements
    const newlyUnlocked = unlockedAchievements.filter(achievement => 
      achievement.dateUnlocked && 
      Date.now() - new Date(achievement.dateUnlocked).getTime() < 5000 // Within last 5 seconds
    );

    if (newlyUnlocked.length > 0) {
      const newAnimatingSet = new Set(newlyUnlocked.map(a => a.id));
      setAnimatingAchievements(newAnimatingSet);
      
      setTimeout(() => setAnimatingAchievements(new Set()), 4000);
    }
  }, [unlockedAchievements]);

  const allAchievements = Object.values(ACHIEVEMENTS);
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <AchievementsContainer
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {allAchievements.map((achievement, index) => {
        const isUnlocked = unlockedIds.has(achievement.id);
        const unlockedData = unlockedAchievements.find(a => a.id === achievement.id);
        const progress = userProgress[achievement.id] || 0;
        const isNew = unlockedData && 
          Date.now() - new Date(unlockedData.dateUnlocked).getTime() < 24 * 60 * 60 * 1000; // Within 24 hours

        return (
          <AchievementCard
            key={achievement.id}
            achievement={unlockedData || achievement}
            unlocked={isUnlocked}
            isNew={isNew}
            progress={progress}
            showProgress={showProgress}
            animateUnlock={animatingAchievements.has(achievement.id)}
            onUnlock={onAchievementClick}
            onClick={() => onAchievementClick && onAchievementClick(achievement)}
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        );
      })}
    </AchievementsContainer>
  );
};

const AchievementsContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

export default AchievementCard;
