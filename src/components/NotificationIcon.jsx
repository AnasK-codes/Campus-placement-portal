import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

const NotificationContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const NotificationButton = styled(motion.button)`
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.2rem;

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.focus};
  }

  ${({ hasUnread }) => hasUnread && `
    animation: ${pulse} 2s infinite;
  `}
`;

const NotificationBadge = styled(motion.div)`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  background: ${({ theme, priority }) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#FF9800';
      case 'low': return theme.colors.primary;
      default: return theme.colors.primary;
    }
  }};
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0 4px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 2px solid ${({ theme }) => theme.colors.background};

  ${({ animated }) => animated && `
    animation: ${bounce} 0.6s ease-out;
  `}
`;

const DropdownContainer = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 380px;
  max-height: 500px;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: 1000;
  overflow: hidden;
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    width: 320px;
    right: -140px;
  }

  @media (max-width: 480px) {
    width: 280px;
    right: -120px;
  }
`;

const DropdownHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;

  .title {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};

    .icon {
      font-size: 1.3rem;
    }
  }

  .actions {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: scale(1.05);
  }
`;

const NotificationsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const NotificationItem = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }

  &:last-child {
    border-bottom: none;
  }

  ${({ unread, theme }) => unread && `
    background: ${theme.colors.surface};
    border-left: 4px solid ${theme.colors.primary};
  `}
`;

const NotificationIcon = styled.div`
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
      default: return '#9E9E9E';
    }
  }};
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;

  .message {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

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

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};

  .icon {
    font-size: 3rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    opacity: 0.5;
  }

  .message {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const NotificationIconComponent = ({ 
  notifications = [], 
  onNotificationClick, 
  onMarkAllRead,
  onMarkAsRead,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [animatedBadge, setAnimatedBadge] = useState(false);
  const containerRef = useRef(null);
  const { currentUser } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => !n.read && n.priority === 'high').length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Animate badge when unread count changes
  useEffect(() => {
    if (unreadCount > 0) {
      setAnimatedBadge(true);
      const timer = setTimeout(() => setAnimatedBadge(false), 600);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

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

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      onMarkAsRead && onMarkAsRead(notification.id);
    }
    onNotificationClick && onNotificationClick(notification);
    setIsOpen(false);
  };

  const handleMarkAllRead = () => {
    onMarkAllRead && onMarkAllRead();
  };

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
      },
    }),
  };

  if (!currentUser) return null;

  return (
    <NotificationContainer ref={containerRef} className={className}>
      <NotificationButton
        hasUnread={unreadCount > 0}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        🔔
        
        <AnimatePresence>
          {unreadCount > 0 && (
            <NotificationBadge
              priority={highPriorityCount > 0 ? 'high' : 'medium'}
              animated={animatedBadge}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </NotificationBadge>
          )}
        </AnimatePresence>
      </NotificationButton>

      <AnimatePresence>
        {isOpen && (
          <DropdownContainer
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DropdownHeader>
              <div className="title">
                <span className="icon">🔔</span>
                Notifications
                {unreadCount > 0 && (
                  <span style={{ 
                    background: '#D32F2F', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '10px', 
                    fontSize: '0.7rem',
                    marginLeft: '8px'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              
              <div className="actions">
                {unreadCount > 0 && (
                  <ActionButton
                    onClick={handleMarkAllRead}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Mark all read
                  </ActionButton>
                )}
              </div>
            </DropdownHeader>

            <NotificationsList>
              {notifications.length === 0 ? (
                <EmptyState>
                  <div className="icon">🔔</div>
                  <div className="message">No notifications yet</div>
                </EmptyState>
              ) : (
                notifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    unread={!notification.read}
                    onClick={() => handleNotificationClick(notification)}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                    whileHover={{ x: 4 }}
                  >
                    <NotificationIcon type={notification.type}>
                      {getNotificationIcon(notification.type)}
                    </NotificationIcon>
                    
                    <NotificationContent>
                      <div className="category">{notification.category || notification.type}</div>
                      <div className="message">{notification.message}</div>
                      <div className="timestamp">
                        <span>⏰</span>
                        {formatTimestamp(notification.timestamp)}
                      </div>
                    </NotificationContent>
                  </NotificationItem>
                ))
              )}
            </NotificationsList>
          </DropdownContainer>
        )}
      </AnimatePresence>
    </NotificationContainer>
  );
};

export default NotificationIconComponent;
