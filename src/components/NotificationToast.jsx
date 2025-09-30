import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-width: 400px;
  
  @media (max-width: 768px) {
    right: 16px;
    left: 16px;
    max-width: none;
  }
`;

const ToastItem = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  overflow: hidden;
  cursor: pointer;
  backdrop-filter: blur(10px);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ priority, theme }) => {
      switch (priority) {
        case 'high': return 'linear-gradient(90deg, #f44336, #ef5350)';
        case 'medium': return 'linear-gradient(90deg, #FF9800, #FFB74D)';
        case 'low': return theme.colors.gradient;
        default: return theme.colors.gradient;
      }
    }};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.xxl};
  }
`;

const ToastHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ToastIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  background: ${({ type, theme }) => {
    switch (type) {
      case 'application': return 'rgba(33, 150, 243, 0.1)';
      case 'interview': return 'rgba(156, 39, 176, 0.1)';
      case 'approval': return 'rgba(76, 175, 80, 0.1)';
      case 'rejection': return 'rgba(244, 67, 54, 0.1)';
      case 'certificate': return 'rgba(255, 193, 7, 0.1)';
      case 'ai_suggestion': return 'rgba(211, 47, 47, 0.1)';
      case 'reminder': return 'rgba(156, 39, 176, 0.1)';
      default: return theme.colors.surface;
    }
  }};
  color: ${({ type }) => {
    switch (type) {
      case 'application': return '#2196F3';
      case 'interview': return '#9C27B0';
      case 'approval': return '#4CAF50';
      case 'rejection': return '#f44336';
      case 'certificate': return '#FFC107';
      case 'ai_suggestion': return '#D32F2F';
      case 'reminder': return '#9C27B0';
      default: return '#9E9E9E';
    }
  }};
  border: 1px solid ${({ type }) => {
    switch (type) {
      case 'application': return '#2196F3';
      case 'interview': return '#9C27B0';
      case 'approval': return '#4CAF50';
      case 'rejection': return '#f44336';
      case 'certificate': return '#FFC107';
      case 'ai_suggestion': return '#D32F2F';
      case 'reminder': return '#9C27B0';
      default: return '#9E9E9E';
    }
  }};
`;

const ToastContent = styled.div`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing.md};
  min-width: 0;

  .title {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  }

  .message {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const ToastActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CloseButton = styled(motion.button)`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: scale(1.05);
  }
`;

const ToastFooter = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};

  .timestamp {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
  }

  .category {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const ProgressBar = styled(motion.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: ${({ theme }) => theme.colors.primary};
  opacity: 0.7;
`;

const MascotContainer = styled(motion.div)`
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
  font-size: 0.8rem;
  color: white;
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 2px solid ${({ theme }) => theme.colors.background};
`;

const NotificationToast = ({ 
  notifications = [], 
  onToastClick, 
  onToastDismiss,
  duration = 5000,
  maxToasts = 5,
  enableSound = true,
  showMascot = false
}) => {
  const [visibleToasts, setVisibleToasts] = useState([]);
  const [audioContext, setAudioContext] = useState(null);

  useEffect(() => {
    // Initialize audio context for sound effects
    if (enableSound && !audioContext) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(context);
    }
  }, [enableSound, audioContext]);

  useEffect(() => {
    // Update visible toasts when notifications change
    const newToasts = notifications
      .filter(n => !n.read && !visibleToasts.find(t => t.id === n.id))
      .slice(0, maxToasts - visibleToasts.length)
      .map(notification => ({
        ...notification,
        showTime: Date.now(),
        progress: 100
      }));

    if (newToasts.length > 0) {
      setVisibleToasts(prev => [...prev, ...newToasts]);
      
      // Play sound for new notifications
      if (enableSound && audioContext) {
        newToasts.forEach(toast => {
          playNotificationSound(toast.soundType || 'notification');
        });
      }
    }
  }, [notifications, visibleToasts, maxToasts, enableSound, audioContext]);

  const playNotificationSound = (soundType) => {
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different sound types
      const frequencies = {
        notification: [800, 600],
        success: [800, 1000, 800],
        alert: [1000, 800, 1000, 800],
        error: [400, 300, 400]
      };

      const freq = frequencies[soundType] || frequencies.notification;
      
      oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime);
      if (freq.length > 1) {
        freq.slice(1).forEach((f, i) => {
          oscillator.frequency.setValueAtTime(f, audioContext.currentTime + (i + 1) * 0.1);
        });
      }

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  };

  const handleToastClick = (toast) => {
    if (onToastClick) {
      onToastClick(toast);
    }
    dismissToast(toast.id);
  };

  const dismissToast = (toastId) => {
    setVisibleToasts(prev => prev.filter(t => t.id !== toastId));
    if (onToastDismiss) {
      onToastDismiss(toastId);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application': return '📋';
      case 'interview': return '📅';
      case 'approval': return '✅';
      case 'rejection': return '❌';
      case 'certificate': return '🏆';
      case 'ai_suggestion': return '🤖';
      case 'reminder': return '⏰';
      case 'update': return '🔄';
      default: return '📢';
    }
  };

  const toastVariants = {
    initial: {
      x: 400,
      opacity: 0,
      scale: 0.8,
    },
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      x: 400,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
      },
    },
  };

  const progressVariants = {
    initial: { width: '100%' },
    animate: { 
      width: '0%',
      transition: { 
        duration: duration / 1000,
        ease: 'linear'
      }
    }
  };

  // Auto-dismiss toasts after duration
  useEffect(() => {
    const timers = visibleToasts.map(toast => {
      return setTimeout(() => {
        dismissToast(toast.id);
      }, duration);
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [visibleToasts, duration]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <ToastContainer>
      <AnimatePresence>
        {visibleToasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            priority={toast.priority}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => handleToastClick(toast)}
            style={{ zIndex: 10000 - index }}
          >
            {showMascot && toast.type === 'certificate' && (
              <MascotContainer
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              >
                🎓
              </MascotContainer>
            )}

            <ToastHeader>
              <ToastIcon type={toast.type}>
                {getNotificationIcon(toast.type)}
              </ToastIcon>
              
              <ToastContent>
                <div className="title">{toast.title}</div>
                <div className="message">{toast.message}</div>
              </ToastContent>

              <ToastActions>
                {toast.actionText && (
                  <ActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToastClick(toast);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {toast.actionText}
                  </ActionButton>
                )}
                
                <CloseButton
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissToast(toast.id);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </CloseButton>
              </ToastActions>
            </ToastHeader>

            <ToastFooter>
              <div className="category">{toast.category}</div>
              <div className="timestamp">
                <span>⏰</span>
                {formatTimestamp(toast.timestamp)}
              </div>
            </ToastFooter>

            <ProgressBar
              variants={progressVariants}
              initial="initial"
              animate="animate"
            />
          </ToastItem>
        ))}
      </AnimatePresence>
    </ToastContainer>,
    document.body
  );
};

// Hook for managing toast notifications
export const useNotificationToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (notification) => {
    setToasts(prev => [...prev, { ...notification, id: notification.id || Date.now() }]);
  };

  const dismissToast = (toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    showToast,
    dismissToast,
    clearAllToasts
  };
};

export default NotificationToast;
