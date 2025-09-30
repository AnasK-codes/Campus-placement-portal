import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(211, 47, 47, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(211, 47, 47, 0.6);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
`;

const BaseCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme, rounded }) => {
    switch (rounded) {
      case 'sm': return theme.borderRadius.md;
      case 'lg': return theme.borderRadius.xl;
      case 'xl': return theme.borderRadius.xxl;
      default: return theme.borderRadius.lg;
    }
  }};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  position: relative;
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: ${({ clickable }) => clickable ? 'pointer' : 'default'};
  
  ${({ hoverable }) => hoverable && `
    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 10px 25px rgba(211, 47, 47, 0.15);
    }
  `}

  ${({ glowing }) => glowing && `
    animation: ${glow} 2s infinite;
  `}

  ${({ floating }) => floating && `
    animation: ${float} 3s ease-in-out infinite;
  `}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${({ accentHeight }) => accentHeight || '4px'};
    background: ${({ accentColor, theme }) => accentColor || theme.colors.gradient};
    opacity: ${({ showAccent }) => showAccent ? 1 : 0};
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }

  ${({ shimmerEffect }) => shimmerEffect && `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.1),
        transparent
      );
      animation: ${shimmer} 3s infinite;
      pointer-events: none;
    }
  `}
`;

const CardHeader = styled.div`
  padding: ${({ theme, compact }) => compact ? theme.spacing.md : theme.spacing.lg};
  border-bottom: ${({ showBorder, theme }) => showBorder ? `1px solid ${theme.colors.border}` : 'none'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  .header-content {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
    flex: 1;
  }

  .header-icon {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  .header-text {
    .title {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
      color: ${({ theme }) => theme.colors.text};
      margin: 0;
    }

    .subtitle {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      color: ${({ theme }) => theme.colors.textSecondary};
      margin: 0;
      margin-top: ${({ theme }) => theme.spacing.xs};
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const CardBody = styled.div`
  padding: ${({ theme, compact }) => compact ? theme.spacing.md : theme.spacing.lg};
  flex: 1;
`;

const CardFooter = styled.div`
  padding: ${({ theme, compact }) => compact ? theme.spacing.md : theme.spacing.lg};
  border-top: ${({ showBorder, theme }) => showBorder ? `1px solid ${theme.colors.border}` : 'none'};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StatusBadge = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  background: ${({ status }) => {
    switch (status) {
      case 'success': return 'rgba(76, 175, 80, 0.1)';
      case 'warning': return 'rgba(255, 152, 0, 0.1)';
      case 'error': return 'rgba(244, 67, 54, 0.1)';
      case 'info': return 'rgba(33, 150, 243, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  
  color: ${({ status }) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#f44336';
      case 'info': return '#2196F3';
      default: return '#9E9E9E';
    }
  }};
  
  border: 1px solid ${({ status }) => {
    switch (status) {
      case 'success': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#f44336';
      case 'info': return '#2196F3';
      default: return '#9E9E9E';
    }
  }};
`;

const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid ${({ theme }) => theme.colors.border};
    border-top: 3px solid ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AnimatedCard = ({
  children,
  title,
  subtitle,
  icon,
  actions,
  footer,
  status,
  loading = false,
  hoverable = true,
  clickable = false,
  glowing = false,
  floating = false,
  shimmerEffect = false,
  showAccent = true,
  accentColor,
  accentHeight,
  rounded = 'md',
  compact = false,
  className,
  onClick,
  ...props
}) => {
  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    hover: hoverable ? {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1]
      }
    } : {},
    tap: clickable ? {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    } : {}
  };

  const badgeVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        delay: 0.2,
        type: "spring",
        stiffness: 300
      }
    }
  };

  return (
    <BaseCard
      className={className}
      hoverable={hoverable}
      clickable={clickable}
      glowing={glowing}
      floating={floating}
      shimmerEffect={shimmerEffect}
      showAccent={showAccent}
      accentColor={accentColor}
      accentHeight={accentHeight}
      rounded={rounded}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      {...props}
    >
      {(title || subtitle || icon || actions) && (
        <CardHeader compact={compact} showBorder={!!children}>
          <div className="header-content">
            {icon && <div className="header-icon">{icon}</div>}
            {(title || subtitle) && (
              <div className="header-text">
                {title && <h3 className="title">{title}</h3>}
                {subtitle && <p className="subtitle">{subtitle}</p>}
              </div>
            )}
          </div>
          
          <div className="header-actions">
            {status && (
              <StatusBadge
                status={status}
                variants={badgeVariants}
                initial="initial"
                animate="animate"
              >
                {status}
              </StatusBadge>
            )}
            {actions}
          </div>
        </CardHeader>
      )}

      {children && (
        <CardBody compact={compact}>
          {children}
        </CardBody>
      )}

      {footer && (
        <CardFooter compact={compact} showBorder={!!children}>
          {footer}
        </CardFooter>
      )}

      {loading && (
        <LoadingOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="spinner" />
        </LoadingOverlay>
      )}
    </BaseCard>
  );
};

// Preset card components
export const InternshipCard = ({ internship, ...props }) => (
  <AnimatedCard
    title={internship?.role}
    subtitle={internship?.company}
    icon="💼"
    status={internship?.status}
    hoverable={true}
    clickable={true}
    showAccent={true}
    {...props}
  />
);

export const StudentCard = ({ student, ...props }) => (
  <AnimatedCard
    title={student?.name}
    subtitle={`${student?.department} • ${student?.year}`}
    icon="👤"
    hoverable={true}
    clickable={true}
    {...props}
  />
);

export const ApplicationCard = ({ application, ...props }) => (
  <AnimatedCard
    title={application?.internshipTitle}
    subtitle={`Applied ${application?.appliedDate}`}
    icon="📋"
    status={application?.status}
    hoverable={true}
    clickable={true}
    glowing={application?.status === 'pending'}
    {...props}
  />
);

export const CertificateCard = ({ certificate, ...props }) => (
  <AnimatedCard
    title={certificate?.title}
    subtitle={certificate?.company}
    icon="🏆"
    status="success"
    hoverable={true}
    clickable={true}
    shimmerEffect={true}
    accentColor="linear-gradient(90deg, #FFD700, #FFA500)"
    {...props}
  />
);

export const StatsCard = ({ title, value, icon, trend, ...props }) => (
  <AnimatedCard
    title={title}
    icon={icon}
    hoverable={true}
    floating={trend === 'up'}
    glowing={trend === 'urgent'}
    {...props}
  >
    <div style={{ 
      fontSize: '2rem', 
      fontWeight: 'bold', 
      color: '#D32F2F',
      textAlign: 'center'
    }}>
      {value}
    </div>
  </AnimatedCard>
);

// Card grid layout
const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${({ minWidth }) => minWidth || '300px'}, 1fr));
  gap: ${({ theme, spacing }) => spacing || theme.spacing.lg};
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

export const CardContainer = ({ children, minWidth, spacing, className }) => (
  <CardGrid minWidth={minWidth} spacing={spacing} className={className}>
    {children}
  </CardGrid>
);

export default AnimatedCard;
