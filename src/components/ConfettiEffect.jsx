import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const confettiFall = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
`;

const ConfettiContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
`;

const ConfettiPiece = styled(motion.div)`
  position: absolute;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background: ${({ color }) => color};
  animation: ${confettiFall} ${({ duration }) => duration}s linear forwards;
  border-radius: ${({ shape }) => shape === 'circle' ? '50%' : '2px'};
  
  &.square {
    border-radius: 2px;
  }
  
  &.triangle {
    width: 0;
    height: 0;
    background: transparent;
    border-left: ${({ size }) => size / 2}px solid transparent;
    border-right: ${({ size }) => size / 2}px solid transparent;
    border-bottom: ${({ size }) => size}px solid ${({ color }) => color};
  }
  
  &.star {
    background: transparent;
    position: relative;
    display: inline-block;
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      background: ${({ color }) => color};
    }
    
    &::before {
      width: ${({ size }) => size}px;
      height: ${({ size }) => size}px;
      transform: rotate(45deg);
    }
    
    &::after {
      width: ${({ size }) => size}px;
      height: ${({ size }) => size}px;
      transform: rotate(-45deg);
    }
  }
`;

const CelebrationMessage = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl} ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.shadows.xxl};
  text-align: center;
  z-index: 10000;
  backdrop-filter: blur(10px);
  
  .icon {
    font-size: 4rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    display: block;
  }
  
  .title {
    font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
  
  .message {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  }
  
  .action-button {
    background: ${({ theme }) => theme.colors.gradient};
    color: white;
    border: none;
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.fast};
    
    &:hover {
      transform: translateY(-2px) scale(1.05);
      box-shadow: ${({ theme }) => theme.shadows.lg};
    }
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 9998;
  backdrop-filter: blur(2px);
`;

const ConfettiEffect = ({ 
  trigger, 
  type = 'application', 
  onComplete,
  showMessage = true,
  duration = 3000,
  intensity = 'medium' 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  // Celebration configurations
  const celebrations = {
    application: {
      icon: '🎯',
      title: 'Application Submitted!',
      message: 'Great job! Your application has been submitted successfully.',
      colors: ['#D32F2F', '#FF6659', '#FFFFFF', '#FFD700'],
    },
    certificate: {
      icon: '🏆',
      title: 'Certificate Generated!',
      message: 'Congratulations! Your internship certificate is ready to download.',
      colors: ['#FFD700', '#FFA500', '#D32F2F', '#FFFFFF'],
    },
    profile_complete: {
      icon: '✅',
      title: 'Profile Complete!',
      message: 'Awesome! Your profile is now 100% complete and ready for matching.',
      colors: ['#4CAF50', '#66BB6A', '#D32F2F', '#FFFFFF'],
    },
    interview_scheduled: {
      icon: '📅',
      title: 'Interview Scheduled!',
      message: 'Your interview has been scheduled. Good luck with your preparation!',
      colors: ['#2196F3', '#64B5F6', '#D32F2F', '#FFFFFF'],
    },
    offer_received: {
      icon: '🎉',
      title: 'Offer Received!',
      message: 'Congratulations! You have received an internship offer.',
      colors: ['#9C27B0', '#BA68C8', '#D32F2F', '#FFD700'],
    },
    milestone: {
      icon: '🌟',
      title: 'Milestone Achieved!',
      message: 'You\'ve reached an important milestone in your journey.',
      colors: ['#FF9800', '#FFB74D', '#D32F2F', '#FFFFFF'],
    },
  };

  const intensityConfig = {
    low: { count: 30, sizeRange: [4, 8] },
    medium: { count: 50, sizeRange: [6, 12] },
    high: { count: 80, sizeRange: [8, 16] },
    extreme: { count: 120, sizeRange: [10, 20] },
  };

  const shapes = ['circle', 'square', 'triangle', 'star'];

  useEffect(() => {
    if (trigger) {
      startConfetti();
    }
  }, [trigger]);

  const startConfetti = () => {
    setIsActive(true);
    generateConfetti();

    const timer = setTimeout(() => {
      setIsActive(false);
      setConfettiPieces([]);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => clearTimeout(timer);
  };

  const generateConfetti = () => {
    const config = intensityConfig[intensity];
    const celebration = celebrations[type] || celebrations.application;
    const pieces = [];

    for (let i = 0; i < config.count; i++) {
      const piece = {
        id: i,
        left: Math.random() * 100,
        size: Math.random() * (config.sizeRange[1] - config.sizeRange[0]) + config.sizeRange[0],
        color: celebration.colors[Math.floor(Math.random() * celebration.colors.length)],
        duration: Math.random() * 2 + 2, // 2-4 seconds
        delay: Math.random() * 1000, // 0-1 second delay
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      };
      pieces.push(piece);
    }

    setConfettiPieces(pieces);
  };

  const handleMessageClose = () => {
    setIsActive(false);
    setConfettiPieces([]);
    if (onComplete) {
      onComplete();
    }
  };

  const celebration = celebrations[type] || celebrations.application;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {showMessage && (
            <Overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}

          <ConfettiContainer>
            {confettiPieces.map((piece) => (
              <ConfettiPiece
                key={piece.id}
                size={piece.size}
                color={piece.color}
                duration={piece.duration}
                shape={piece.shape}
                className={piece.shape}
                style={{
                  left: `${piece.left}%`,
                  animationDelay: `${piece.delay}ms`,
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            ))}
          </ConfettiContainer>

          {showMessage && (
            <CelebrationMessage
              initial={{ opacity: 0, scale: 0.5, y: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -50 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                delay: 0.2 
              }}
            >
              <motion.span 
                className="icon"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  delay: 0.5 
                }}
              >
                {celebration.icon}
              </motion.span>
              
              <motion.div 
                className="title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {celebration.title}
              </motion.div>
              
              <motion.div 
                className="message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                {celebration.message}
              </motion.div>
              
              <motion.button
                className="action-button"
                onClick={handleMessageClose}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Awesome!
              </motion.button>
            </CelebrationMessage>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

// Hook for easy confetti triggering
export const useConfetti = () => {
  const [confettiTrigger, setConfettiTrigger] = useState(null);

  const celebrate = (type = 'application', options = {}) => {
    setConfettiTrigger({ type, ...options, timestamp: Date.now() });
  };

  const reset = () => {
    setConfettiTrigger(null);
  };

  return { confettiTrigger, celebrate, reset };
};

export default ConfettiEffect;
