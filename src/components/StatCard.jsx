import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(211, 47, 47, 0.3); }
  50% { box-shadow: 0 0 20px rgba(211, 47, 47, 0.6); }
  100% { box-shadow: 0 0 5px rgba(211, 47, 47, 0.3); }
`;

const CardContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ status }) => {
      switch (status) {
        case 'good': return 'linear-gradient(90deg, #4CAF50, #66BB6A)';
        case 'warning': return 'linear-gradient(90deg, #FF9800, #FFB74D)';
        case 'danger': return 'linear-gradient(90deg, #f44336, #ef5350)';
        default: return 'linear-gradient(90deg, #2196F3, #64B5F6)';
      }
    }};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }

  ${({ trending }) => trending && `
    animation: ${glow} 2s infinite;
  `}
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const IconContainer = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ status }) => {
    switch (status) {
      case 'good': return 'rgba(76, 175, 80, 0.1)';
      case 'warning': return 'rgba(255, 152, 0, 0.1)';
      case 'danger': return 'rgba(244, 67, 54, 0.1)';
      default: return 'rgba(33, 150, 243, 0.1)';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: ${({ status }) => {
    switch (status) {
      case 'good': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'danger': return '#f44336';
      default: return '#2196F3';
    }
  }};
`;

const TrendIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ trend }) => {
    switch (trend) {
      case 'up': return '#4CAF50';
      case 'down': return '#f44336';
      default: return '#9E9E9E';
    }
  }};

  .trend-icon {
    font-size: 1rem;
  }
`;

const CardContent = styled.div`
  .value {
    font-size: 2.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    font-family: 'Inter', sans-serif;
    line-height: 1;
  }

  .label {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 500;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .description {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.4;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 2px;
  margin-top: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${({ status }) => {
    switch (status) {
      case 'good': return 'linear-gradient(90deg, #4CAF50, #66BB6A)';
      case 'warning': return 'linear-gradient(90deg, #FF9800, #FFB74D)';
      case 'danger': return 'linear-gradient(90deg, #f44336, #ef5350)';
      default: return 'linear-gradient(90deg, #2196F3, #64B5F6)';
    }
  }};
  border-radius: 2px;
`;

const AIInsight = styled(motion.div)`
  position: absolute;
  top: -60px;
  right: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    right: 20px;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #667eea;
  }
`;

const StatCard = ({ 
  title, 
  value, 
  icon, 
  status = 'default', 
  trend, 
  trendValue, 
  description,
  progress,
  aiInsight,
  trending = false,
  onClick,
  animationDelay = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [showInsight, setShowInsight] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const counter = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(counter);
    }, animationDelay);

    return () => clearTimeout(timer);
  }, [value, animationDelay]);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➖';
    }
  };

  const formatValue = (val) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toLocaleString();
  };

  return (
    <CardContainer
      status={status}
      trending={trending}
      onClick={onClick}
      onMouseEnter={() => aiInsight && setShowInsight(true)}
      onMouseLeave={() => setShowInsight(false)}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: animationDelay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <CardHeader>
        <IconContainer status={status}>
          {icon}
        </IconContainer>
        
        {trend && (
          <TrendIndicator
            trend={trend}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: animationDelay + 0.3 }}
          >
            <span className="trend-icon">{getTrendIcon(trend)}</span>
            <span>{trendValue}</span>
          </TrendIndicator>
        )}
      </CardHeader>

      <CardContent>
        <motion.div 
          className="value"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: animationDelay + 0.2,
            type: "spring",
            stiffness: 200
          }}
        >
          {formatValue(displayValue)}
        </motion.div>
        
        <div className="label">{title}</div>
        
        {description && (
          <div className="description">{description}</div>
        )}
      </CardContent>

      {progress !== undefined && (
        <ProgressBar>
          <ProgressFill
            status={status}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ 
              delay: animationDelay + 0.5,
              duration: 1,
              ease: "easeOut"
            }}
          />
        </ProgressBar>
      )}

      <AnimatePresence>
        {showInsight && aiInsight && (
          <AIInsight
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            🤖 {aiInsight}
          </AIInsight>
        )}
      </AnimatePresence>
    </CardContainer>
  );
};

export default StatCard;
