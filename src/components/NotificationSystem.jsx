import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import NotificationIcon from './NotificationIcon';
import NotificationToast from './NotificationToast';

const NotificationSystem = ({ 
  showIcon = true, 
  showToasts = true, 
  className,
  iconProps = {},
  toastProps = {} 
}) => {
  const { currentUser } = useAuth();
  const {
    notifications,
    unreadCount,
    toastQueue,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    removeToast
  } = useNotifications();

  // Don't render if user is not authenticated
  if (!currentUser) {
    return null;
  }

  const handleToastClick = (toast) => {
    handleNotificationClick(toast);
    removeToast(toast.id);
  };

  const handleToastDismiss = (toastId) => {
    removeToast(toastId);
  };

  return (
    <>
      {showIcon && (
        <NotificationIcon
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={markAllAsRead}
          onMarkAsRead={markAsRead}
          className={className}
          {...iconProps}
        />
      )}
      
      {showToasts && (
        <NotificationToast
          notifications={toastQueue}
          onToastClick={handleToastClick}
          onToastDismiss={handleToastDismiss}
          showMascot={true}
          enableSound={true}
          {...toastProps}
        />
      )}
    </>
  );
};

export default NotificationSystem;
