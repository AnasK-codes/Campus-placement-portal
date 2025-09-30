import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { SKILL_LEVELS } from '../utils/gamificationHelper';

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(211, 47, 47, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(211, 47, 47, 0.6);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

const BadgeContainer = styled(motion.div)`
  position: relative;
  display: inline-block;
  margin: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
`;

const Badge = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ level, suggested }) => {
    if (suggested) return 'transparent';
    const skillLevel = Object.values(SKILL_LEVELS).find(l => l.level === level);
    return skillLevel ? skillLevel.gradient : SKILL_LEVELS.BRONZE.gradient;
  }};
  border: 2px solid ${({ level, suggested, theme }) => {
    if (suggested) return theme.colors.primary;
    const skillLevel = Object.values(SKILL_LEVELS).find(l => l.level === level);
    return skillLevel ? skillLevel.color : SKILL_LEVELS.BRONZE.color;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  color: ${({ suggested, theme }) => suggested ? theme.colors.text : 'white'};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-shadow: ${({ suggested }) => suggested ? 'none' : '0 1px 2px rgba(0,0,0,0.3)'};
  overflow: hidden;
  min-width: 80px;
  justify-content: center;

  ${({ suggested }) => suggested && `
    background: transparent;
    border-style: dashed;
    animation: ${glow} 2s infinite;
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const BadgeIcon = styled(motion.span)`
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BadgeText = styled(motion.span)`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LevelUpEffect = styled(motion.div)`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 30px;
  height: 30px;
  background: ${({ theme }) => theme.colors.gradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
  font-weight: bold;
  z-index: 10;
`;

const Tooltip = styled(motion.div)`
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 1000;
  min-width: 200px;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 8px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.border};
  }

  .tooltip-title {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .tooltip-level {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .tooltip-date {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textTertiary};
  }

  .tooltip-suggestion {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

const ParticleEffect = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 5;
`;

const Particle = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${({ color }) => color || '#FFD700'};
  border-radius: 50%;
`;

const SuggestionPulse = styled(motion.div)`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  opacity: 0.6;
`;

const SkillBadge = ({
  skill,
  suggested = false,
  onBadgeClick,
  showLevelUp = false,
  animateUnlock = false,
  className,
  ...props
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const skillLevel = skill ? Object.values(SKILL_LEVELS).find(l => l.level === skill.level) : null;

  useEffect(() => {
    if (animateUnlock) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [animateUnlock]);

  const handleClick = () => {
    if (onBadgeClick) {
      onBadgeClick(skill);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Recently added';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString();
  };

  const badgeVariants = {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: { 
      scale: 1, 
      rotate: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: { 
      scale: 1.1, 
      rotate: 5,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.95 }
  };

  const particleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (i) => ({
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      x: [0, Math.cos(i * 60 * Math.PI / 180) * 30],
      y: [0, Math.sin(i * 60 * Math.PI / 180) * 30],
      transition: {
        duration: 1.5,
        delay: i * 0.1,
        ease: "easeOut"
      }
    })
  };

  const tooltipVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  const pulseVariants = {
    initial: { scale: 1, opacity: 0.6 },
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.6, 0.3, 0.6],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <BadgeContainer
      className={className}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={handleClick}
      {...props}
    >
      {suggested && (
        <SuggestionPulse
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        />
      )}

      <Badge
        level={skill?.level}
        suggested={suggested}
        variants={badgeVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
      >
        <BadgeIcon>
          {suggested ? '💡' : skillLevel?.icon || '🔧'}
        </BadgeIcon>
        
        <BadgeText>
          {skill?.skillName || 'New Skill'}
        </BadgeText>

        {showLevelUp && (
          <LevelUpEffect
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          >
            ⬆️
          </LevelUpEffect>
        )}
      </Badge>

      <AnimatePresence>
        {showParticles && (
          <ParticleEffect>
            {[...Array(6)].map((_, i) => (
              <Particle
                key={i}
                custom={i}
                variants={particleVariants}
                initial="initial"
                animate="animate"
                color={skillLevel?.color || '#FFD700'}
              />
            ))}
          </ParticleEffect>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTooltip && (
          <Tooltip
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {suggested ? (
              <>
                <div className="tooltip-title">💡 Suggested Skill</div>
                <div className="tooltip-suggestion">
                  {skill?.reason || 'Adding this skill could improve your internship matches'}
                </div>
                {skill?.impact && (
                  <div className="tooltip-suggestion">
                    Impact: {skill.impact}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="tooltip-title">
                  {skill?.skillName}
                </div>
                <div className="tooltip-level">
                  Level: {skillLevel?.name} {skillLevel?.icon}
                </div>
                <div className="tooltip-date">
                  Last updated: {formatDate(skill?.lastUpdated)}
                </div>
                {skill?.projects && (
                  <div className="tooltip-date">
                    Projects: {skill.projects} | Experience: {skill.experience || 0} months
                  </div>
                )}
              </>
            )}
          </Tooltip>
        )}
      </AnimatePresence>
    </BadgeContainer>
  );
};

// Skill Badges Grid Component
export const SkillBadgesGrid = ({ 
  skills = [], 
  suggestions = [], 
  onSkillClick, 
  onSuggestionClick,
  showAnimations = true,
  maxDisplay = 12,
  className 
}) => {
  const [animatingSkills, setAnimatingSkills] = useState(new Set());

  useEffect(() => {
    if (showAnimations && skills.length > 0) {
      // Animate new skills
      const newSkills = skills.filter(skill => 
        skill.lastUpdated && 
        Date.now() - new Date(skill.lastUpdated).getTime() < 5000 // Within last 5 seconds
      );
      
      if (newSkills.length > 0) {
        const newAnimatingSkills = new Set(newSkills.map(skill => skill.skillName));
        setAnimatingSkills(newAnimatingSkills);
        
        setTimeout(() => setAnimatingSkills(new Set()), 3000);
      }
    }
  }, [skills, showAnimations]);

  const displaySkills = skills.slice(0, maxDisplay);
  const displaySuggestions = suggestions.slice(0, Math.max(0, maxDisplay - displaySkills.length));

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
    <SkillBadgesContainer
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {displaySkills.map((skill, index) => (
        <SkillBadge
          key={skill.skillName}
          skill={skill}
          onBadgeClick={onSkillClick}
          animateUnlock={animatingSkills.has(skill.skillName)}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
      
      {displaySuggestions.map((suggestion, index) => (
        <SkillBadge
          key={`suggestion-${suggestion.skillName}`}
          skill={suggestion}
          suggested={true}
          onBadgeClick={onSuggestionClick}
          style={{ animationDelay: `${(displaySkills.length + index) * 0.1}s` }}
        />
      ))}
    </SkillBadgesContainer>
  );
};

const SkillBadgesContainer = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  min-height: 80px;
  align-items: flex-start;
  align-content: flex-start;

  @media (max-width: 768px) {
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

export default SkillBadge;
