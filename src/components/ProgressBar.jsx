import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ProgressContainer = styled.div`
  width: 100%;
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: ${({ size }) => {
    switch (size) {
      case 'small': return '6px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'success': return 'linear-gradient(90deg, #4CAF50 0%, #66BB6A 100%)';
      case 'warning': return 'linear-gradient(90deg, #FF9800 0%, #FFB74D 100%)';
      case 'danger': return 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)';
      case 'info': return 'linear-gradient(90deg, #2196F3 0%, #42A5F5 100%)';
      default: return theme.colors.gradient;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  position: relative;
  overflow: hidden;

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
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ProgressText = styled.span`
  font-weight: 600;
  color: ${({ variant, theme }) => {
    switch (variant) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'danger': return '#f44336';
      case 'info': return '#2196F3';
      default: return theme.colors.primary;
    }
  }};
`;

const SkillMatchBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} 0;
`;

const SkillName = styled.span`
  min-width: 100px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const MatchIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 0.8rem;
  color: ${({ matched, theme }) => matched ? '#4CAF50' : '#f44336'};
  font-weight: 600;
`;

const CircularProgress = styled.div`
  position: relative;
  width: ${({ size }) => size || '120px'};
  height: ${({ size }) => size || '120px'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CircularSvg = styled.svg`
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
`;

const CircularTrack = styled.circle`
  fill: none;
  stroke: ${({ theme }) => theme.colors.surface};
  stroke-width: 8;
`;

const CircularFill = styled(motion.circle)`
  fill: none;
  stroke: ${({ variant, theme }) => {
    switch (variant) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'danger': return '#f44336';
      case 'info': return '#2196F3';
      default: return theme.colors.primary;
    }
  }};
  stroke-width: 8;
  stroke-linecap: round;
  filter: drop-shadow(0 0 6px rgba(211, 47, 47, 0.3));
`;

const CircularText = styled.div`
  position: absolute;
  text-align: center;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  
  .percentage {
    font-size: 1.5rem;
    line-height: 1;
  }
  
  .label {
    font-size: 0.7rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ProgressBar = ({ 
  value = 0, 
  max = 100, 
  label, 
  variant = 'primary', 
  size = 'medium',
  showPercentage = true,
  animated = true,
  type = 'linear', // 'linear' or 'circular'
  skills = null, // For skill matching display
  className 
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValue(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(percentage);
    }
  }, [percentage, animated]);

  const getVariantFromPercentage = (percent) => {
    if (percent >= 80) return 'success';
    if (percent >= 60) return 'info';
    if (percent >= 40) return 'warning';
    return 'danger';
  };

  const finalVariant = variant === 'auto' ? getVariantFromPercentage(percentage) : variant;

  if (type === 'circular') {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

    return (
      <CircularProgress size={size} className={className}>
        <CircularSvg>
          <CircularTrack
            cx="60"
            cy="60"
            r={radius}
          />
          <CircularFill
            cx="60"
            cy="60"
            r={radius}
            variant={finalVariant}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray,
              strokeDashoffset: circumference
            }}
          />
        </CircularSvg>
        <CircularText>
          <div className="percentage">{Math.round(animatedValue)}%</div>
          {label && <div className="label">{label}</div>}
        </CircularText>
      </CircularProgress>
    );
  }

  if (skills) {
    return (
      <ProgressContainer className={className}>
        {label && (
          <ProgressLabel>
            <span>{label}</span>
          </ProgressLabel>
        )}
        {skills.map((skill, index) => (
          <SkillMatchBar key={index}>
            <SkillName>{skill.name}</SkillName>
            <ProgressTrack style={{ flex: 1 }}>
              <ProgressFill
                variant={skill.matched ? 'success' : 'danger'}
                initial={{ width: '0%' }}
                animate={{ width: `${skill.matchPercentage || (skill.matched ? 100 : 0)}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </ProgressTrack>
            <MatchIndicator matched={skill.matched}>
              {skill.matched ? '✓' : '✗'}
              {skill.matchPercentage && ` ${skill.matchPercentage}%`}
            </MatchIndicator>
          </SkillMatchBar>
        ))}
      </ProgressContainer>
    );
  }

  return (
    <ProgressContainer className={className}>
      {(label || showPercentage) && (
        <ProgressLabel>
          {label && <span>{label}</span>}
          {showPercentage && (
            <ProgressText variant={finalVariant}>
              {Math.round(animatedValue)}%
            </ProgressText>
          )}
        </ProgressLabel>
      )}
      <ProgressTrack size={size}>
        <ProgressFill
          variant={finalVariant}
          initial={{ width: '0%' }}
          animate={{ width: `${animatedValue}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </ProgressTrack>
    </ProgressContainer>
  );
};

export default ProgressBar;
