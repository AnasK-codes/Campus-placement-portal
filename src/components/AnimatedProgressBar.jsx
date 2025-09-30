import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, useInView } from 'framer-motion';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  margin-bottom: ${({ showLabel, theme }) => showLabel ? theme.spacing.md : 0};
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};

  .label-text {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
  }

  .percentage {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: ${({ size }) => {
    switch (size) {
      case 'xs': return '2px';
      case 'sm': return '4px';
      case 'lg': return '12px';
      case 'xl': return '16px';
      default: return '8px';
    }
  }};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  position: relative;
  overflow: hidden;
  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'success': return 'linear-gradient(90deg, #4CAF50, #66BB6A)';
      case 'warning': return 'linear-gradient(90deg, #FF9800, #FFB74D)';
      case 'error': return 'linear-gradient(90deg, #f44336, #ef5350)';
      case 'info': return 'linear-gradient(90deg, #2196F3, #64B5F6)';
      case 'gradient': return theme.colors.gradient;
      default: return theme.colors.primary;
    }
  }};
  
  ${({ animated }) => animated && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      background-size: 200px 100%;
      animation: ${shimmer} 2s infinite;
    }
  `}

  ${({ pulsing }) => pulsing && `
    animation: ${pulse} 1.5s infinite;
  `}
`;

const ProgressSteps = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ProgressStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textSecondary};
  
  .step-circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
    border: 2px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    transition: all ${({ theme }) => theme.transitions.fast};
    
    ${({ active }) => active && `
      box-shadow: 0 0 0 4px rgba(211, 47, 47, 0.2);
    `}
  }
  
  .step-icon {
    font-size: 10px;
    color: ${({ active }) => active ? 'white' : 'inherit'};
  }
`;

const CounterText = styled(motion.span)`
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.primary};
`;

const AnimatedProgressBar = ({
  value = 0,
  max = 100,
  size = 'md',
  variant = 'primary',
  label,
  showPercentage = true,
  showLabel = true,
  animated = true,
  pulsing = false,
  steps,
  icon,
  className,
  onComplete,
  animateOnView = true,
  countUp = false,
  duration = 1.5,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(animateOnView ? 0 : value);
  const [isComplete, setIsComplete] = useState(false);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });

  const percentage = Math.min(Math.max((displayValue / max) * 100, 0), 100);

  // Animate value when in view
  useEffect(() => {
    if (animateOnView && isInView) {
      const startTime = Date.now();
      const startValue = displayValue;
      const targetValue = value;
      const duration_ms = duration * 1000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration_ms, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (targetValue - startValue) * easeOut;
        
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(targetValue);
          if (targetValue >= max && !isComplete) {
            setIsComplete(true);
            if (onComplete) {
              onComplete();
            }
          }
        }
      };

      requestAnimationFrame(animate);
    } else if (!animateOnView) {
      setDisplayValue(value);
    }
  }, [value, max, isInView, animateOnView, duration, onComplete, isComplete, displayValue]);

  // Count-up animation for percentage display
  const [displayPercentage, setDisplayPercentage] = useState(0);
  
  useEffect(() => {
    if (countUp && isInView) {
      const startTime = Date.now();
      const targetPercentage = percentage;
      const duration_ms = duration * 1000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration_ms, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentPercentage = targetPercentage * easeOut;
        
        setDisplayPercentage(currentPercentage);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setDisplayPercentage(percentage);
    }
  }, [percentage, isInView, countUp, duration]);

  const progressVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${percentage}%`,
      transition: { 
        duration: animateOnView ? duration : 0,
        ease: [0.4, 0, 0.2, 1],
      }
    }
  };

  const getVariantColor = () => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    if (percentage < 40) return 'error';
    return variant;
  };

  const currentVariant = variant === 'auto' ? getVariantColor() : variant;

  return (
    <ProgressContainer ref={ref} showLabel={showLabel} className={className} {...props}>
      {showLabel && (
        <ProgressLabel>
          <div className="label-text">
            {icon && <span className="icon">{icon}</span>}
            {label}
          </div>
          {showPercentage && (
            <div className="percentage">
              {countUp ? (
                <CounterText
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {Math.round(displayPercentage)}%
                </CounterText>
              ) : (
                `${Math.round(percentage)}%`
              )}
            </div>
          )}
        </ProgressLabel>
      )}

      <ProgressTrack size={size}>
        <ProgressFill
          variant={currentVariant}
          animated={animated}
          pulsing={pulsing}
          variants={progressVariants}
          initial={animateOnView ? "initial" : false}
          animate={animateOnView && isInView ? "animate" : { width: `${percentage}%` }}
        />
      </ProgressTrack>

      {steps && (
        <ProgressSteps>
          {steps.map((step, index) => {
            const stepValue = ((index + 1) / steps.length) * max;
            const isActive = displayValue >= stepValue;
            
            return (
              <ProgressStep key={index} active={isActive}>
                <motion.div 
                  className="step-circle"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="step-icon">
                    {isActive ? '✓' : index + 1}
                  </span>
                </motion.div>
                <span>{step}</span>
              </ProgressStep>
            );
          })}
        </ProgressSteps>
      )}
    </ProgressContainer>
  );
};

// Preset progress bar components
export const SkillProgressBar = ({ skill, level, ...props }) => (
  <AnimatedProgressBar
    value={level}
    max={100}
    label={skill}
    variant="gradient"
    animated={true}
    countUp={true}
    {...props}
  />
);

export const ProfileCompletionBar = ({ completion, ...props }) => (
  <AnimatedProgressBar
    value={completion}
    max={100}
    label="Profile Completion"
    icon="👤"
    variant="auto"
    animated={true}
    pulsing={completion < 100}
    {...props}
  />
);

export const StepProgressBar = ({ currentStep, steps, ...props }) => (
  <AnimatedProgressBar
    value={currentStep}
    max={steps.length}
    steps={steps}
    showPercentage={false}
    animated={true}
    {...props}
  />
);

export const CircularProgress = styled(motion.div)`
  width: ${({ size }) => size || '60px'};
  height: ${({ size }) => size || '60px'};
  border-radius: 50%;
  background: conic-gradient(
    ${({ theme }) => theme.colors.primary} ${({ percentage }) => percentage * 3.6}deg,
    ${({ theme }) => theme.colors.surface} 0deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    width: 80%;
    height: 80%;
    background: ${({ theme }) => theme.colors.background};
    border-radius: 50%;
  }
  
  .percentage-text {
    position: relative;
    z-index: 1;
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    font-size: ${({ size }) => {
      const sizeNum = parseInt(size) || 60;
      return `${Math.max(sizeNum / 4, 12)}px`;
    }};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export default AnimatedProgressBar;
