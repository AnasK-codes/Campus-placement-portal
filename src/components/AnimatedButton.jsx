import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
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

const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(211, 47, 47, 0);
  }
`;

const BaseButton = styled(motion.button)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ size, theme }) => {
    switch (size) {
      case 'sm': return `${theme.spacing.sm} ${theme.spacing.md}`;
      case 'lg': return `${theme.spacing.lg} ${theme.spacing.xl}`;
      case 'xl': return `${theme.spacing.xl} ${theme.spacing.xxl}`;
      default: return `${theme.spacing.md} ${theme.spacing.lg}`;
    }
  }};
  border: none;
  border-radius: ${({ theme, rounded }) => {
    if (rounded === 'full') return '50px';
    if (rounded === 'lg') return theme.borderRadius.xl;
    return theme.borderRadius.lg;
  }};
  font-size: ${({ size, theme }) => {
    switch (size) {
      case 'sm': return theme.typography.fontSize.sm;
      case 'lg': return theme.typography.fontSize.lg;
      case 'xl': return theme.typography.fontSize.xl;
      default: return theme.typography.fontSize.base;
    }
  }};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  overflow: hidden;
  user-select: none;
  text-decoration: none;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus};
  }

  .button-content {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    z-index: 2;
    position: relative;
  }

  .icon {
    font-size: 1.2em;
    transition: transform ${({ theme }) => theme.transitions.fast};
  }

  .loading-spinner {
    width: 1em;
    height: 1em;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PrimaryButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  box-shadow: ${({ theme }) => theme.shadows.md};

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
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.xl};
    
    &::before {
      left: 100%;
    }
    
    .icon {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  ${({ animated }) => animated && `
    animation: ${pulse} 2s infinite;
  `}
`;

const SecondaryButton = styled(BaseButton)`
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background: ${({ theme }) => theme.colors.primary};
    transition: width ${({ theme }) => theme.transitions.normal};
    z-index: 1;
  }

  &:hover {
    color: white;
    transform: translateY(-2px) scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    
    &::before {
      width: 100%;
    }
    
    .icon {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const GhostButton = styled(BaseButton)`
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid transparent;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px) scale(1.02);
    
    .icon {
      transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const GradientButton = styled(BaseButton)`
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 70%
    );
    background-size: 200% 200%;
    animation: ${shimmer} 2s infinite;
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: ${({ theme }) => theme.shadows.xl};
    
    &::before {
      opacity: 1;
    }
    
    .icon {
      transform: scale(1.1) rotate(5deg);
    }
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const FloatingButton = styled(BaseButton)`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: 1000;
  padding: 0;

  &:hover {
    transform: scale(1.1);
    box-shadow: ${({ theme }) => theme.shadows.xxl};
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
  }
`;

const RippleEffect = styled.span`
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ${ripple} 0.6s linear;
  pointer-events: none;
`;

const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'lg',
  loading = false,
  disabled = false,
  animated = false,
  icon,
  iconPosition = 'left',
  onClick,
  className,
  ...props
}) => {
  const [ripples, setRipples] = React.useState([]);

  const handleClick = (event) => {
    if (loading || disabled) return;

    // Create ripple effect
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    if (onClick) {
      onClick(event);
    }
  };

  const ButtonComponent = {
    primary: PrimaryButton,
    secondary: SecondaryButton,
    ghost: GhostButton,
    gradient: GradientButton,
    floating: FloatingButton,
  }[variant] || PrimaryButton;

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: variant === 'floating' ? 1.1 : 1.02,
      y: variant === 'floating' ? 0 : -2,
    },
    tap: { 
      scale: variant === 'floating' ? 0.95 : 0.98,
      y: 0,
    },
  };

  return (
    <ButtonComponent
      className={className}
      size={size}
      rounded={rounded}
      animated={animated}
      disabled={disabled || loading}
      onClick={handleClick}
      variants={buttonVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      <div className="button-content">
        {loading ? (
          <div className="loading-spinner" />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="icon">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className="icon">{icon}</span>
            )}
          </>
        )}
      </div>

      {ripples.map((ripple) => (
        <RippleEffect
          key={ripple.id}
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </ButtonComponent>
  );
};

// Preset button components
export const PrimaryButton = (props) => (
  <AnimatedButton variant="primary" {...props} />
);

export const SecondaryButton = (props) => (
  <AnimatedButton variant="secondary" {...props} />
);

export const GhostButton = (props) => (
  <AnimatedButton variant="ghost" {...props} />
);

export const GradientButton = (props) => (
  <AnimatedButton variant="gradient" {...props} />
);

export const FloatingActionButton = (props) => (
  <AnimatedButton variant="floating" {...props} />
);

// Button group component
const ButtonGroupContainer = styled.div`
  display: flex;
  gap: ${({ theme, spacing }) => spacing || theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    
    button {
      width: 100%;
    }
  }
`;

export const ButtonGroup = ({ children, spacing, className }) => (
  <ButtonGroupContainer spacing={spacing} className={className}>
    {children}
  </ButtonGroupContainer>
);

export default AnimatedButton;
