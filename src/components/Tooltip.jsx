import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const TooltipContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled(motion.div)`
  position: absolute;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  max-width: 300px;
  backdrop-filter: blur(10px);
  
  /* Position variants */
  ${({ position }) => {
    switch (position) {
      case 'top':
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
        `;
      case 'bottom':
        return `
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
        `;
      case 'left':
        return `
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-right: 8px;
        `;
      case 'right':
        return `
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 8px;
        `;
      default:
        return `
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
        `;
    }
  }}

  /* Arrow */
  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: 6px solid transparent;
    
    ${({ position, theme }) => {
      switch (position) {
        case 'top':
          return `
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-top-color: ${theme.colors.background};
          `;
        case 'bottom':
          return `
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-bottom-color: ${theme.colors.background};
          `;
        case 'left':
          return `
            left: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-left-color: ${theme.colors.background};
          `;
        case 'right':
          return `
            right: 100%;
            top: 50%;
            transform: translateY(-50%);
            border-right-color: ${theme.colors.background};
          `;
        default:
          return `
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-top-color: ${theme.colors.background};
          `;
      }
    }}
  }

  @media (max-width: 768px) {
    max-width: 250px;
    white-space: normal;
    word-wrap: break-word;
  }
`;

const TooltipHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ hasContent }) => hasContent ? '4px' : '0'};
  
  .icon {
    font-size: 1rem;
    flex-shrink: 0;
  }
  
  .title {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const TooltipBody = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

const TooltipActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
`;

const TooltipButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ primary, theme }) => primary ? theme.colors.primary : 'transparent'};
  color: ${({ primary, theme }) => primary ? '#FFFFFF' : theme.colors.primary};
  border: ${({ primary, theme }) => primary ? 'none' : `1px solid ${theme.colors.primary}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ primary, theme }) => primary ? theme.colors.primaryDark : theme.colors.primary};
    color: #FFFFFF;
    transform: scale(1.05);
  }
`;

const Tooltip = ({
  children,
  content,
  title,
  icon,
  position = 'top',
  trigger = 'hover',
  delay = 0,
  duration = 200,
  actions,
  className,
  disabled = false,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setShouldShow(true);
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsVisible(false);
    // Keep shouldShow true briefly to allow exit animation
    setTimeout(() => setShouldShow(false), duration);
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover' || trigger === 'both') {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover' || trigger === 'both') {
      hideTooltip();
    }
  };

  const handleClick = () => {
    if (trigger === 'click' || trigger === 'both') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  const handleFocus = () => {
    if (trigger === 'focus') {
      showTooltip();
    }
  };

  const handleBlur = () => {
    if (trigger === 'focus') {
      hideTooltip();
    }
  };

  // Animation variants
  const tooltipVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
      x: position === 'left' ? 10 : position === 'right' ? -10 : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        duration: duration / 1000,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
      x: position === 'left' ? 10 : position === 'right' ? -10 : 0,
      transition: {
        duration: duration / 1000,
      },
    },
  };

  // Simple content (string)
  const renderSimpleContent = () => (
    <TooltipBody>{content}</TooltipBody>
  );

  // Complex content (object with title, content, actions)
  const renderComplexContent = () => (
    <>
      {(title || icon) && (
        <TooltipHeader hasContent={!!content}>
          {icon && <span className="icon">{icon}</span>}
          {title && <span className="title">{title}</span>}
        </TooltipHeader>
      )}
      
      {content && <TooltipBody>{content}</TooltipBody>}
      
      {actions && actions.length > 0 && (
        <TooltipActions>
          {actions.map((action, index) => (
            <TooltipButton
              key={index}
              primary={action.primary}
              onClick={(e) => {
                e.stopPropagation();
                if (action.onClick) {
                  action.onClick();
                }
                hideTooltip();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {action.label}
            </TooltipButton>
          ))}
        </TooltipActions>
      )}
    </>
  );

  if (!content && !title) {
    return children;
  }

  return (
    <TooltipContainer
      ref={containerRef}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
      
      <AnimatePresence>
        {shouldShow && (
          <TooltipContent
            position={position}
            variants={tooltipVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            exit="exit"
          >
            {typeof content === 'string' && !title && !actions
              ? renderSimpleContent()
              : renderComplexContent()
            }
          </TooltipContent>
        )}
      </AnimatePresence>
    </TooltipContainer>
  );
};

// Predefined tooltip variants for common use cases
export const InfoTooltip = ({ children, ...props }) => (
  <Tooltip icon="ℹ️" position="top" {...props}>
    {children}
  </Tooltip>
);

export const HelpTooltip = ({ children, ...props }) => (
  <Tooltip icon="❓" position="top" {...props}>
    {children}
  </Tooltip>
);

export const WarningTooltip = ({ children, ...props }) => (
  <Tooltip icon="⚠️" position="top" {...props}>
    {children}
  </Tooltip>
);

export const SuccessTooltip = ({ children, ...props }) => (
  <Tooltip icon="✅" position="top" {...props}>
    {children}
  </Tooltip>
);

export const AITooltip = ({ children, ...props }) => (
  <Tooltip icon="🤖" position="top" {...props}>
    {children}
  </Tooltip>
);

export default Tooltip;
