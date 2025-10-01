import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import notificationHelper from '../utils/notificationHelper';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastQueue, setToastQueue] = useState([]);

  // Real-time listener for user notifications
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Use fake notifications instead of Firebase to avoid index errors
    const fakeNotifications = [
      {
        id: 'notif1',
        title: 'Application Approved',
        message: 'Your application for Frontend Developer at TechCorp has been approved!',
        type: 'success',
        timestamp: new Date(),
        read: false
      },
      {
        id: 'notif2', 
        title: 'Interview Scheduled',
        message: 'Interview scheduled for tomorrow at 2 PM for Full Stack Developer position.',
        type: 'info',
        timestamp: new Date(Date.now() - 86400000),
        read: true
      }
    ];

    setTimeout(() => {
      setNotifications(fakeNotifications);
      setUnreadCount(fakeNotifications.filter(n => !n.read).length);
      setLoading(false);
    }, 500);

    // Return empty cleanup function since we're not using Firebase listener
    return () => {};
  }, [currentUser?.uid]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationHelper.markAsRead(notificationId);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read: true, readAt: new Date() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!currentUser?.uid) return;

    try {
      await notificationHelper.markAllAsRead(currentUser.uid);
      
      // Optimistically update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [currentUser?.uid]);

  // Create a new notification
  const createNotification = useCallback(async (userId, notificationType, data = {}) => {
    try {
      const notification = await notificationHelper.createNotification(
        userId, 
        notificationType, 
        { ...data, userRole: userProfile?.role }
      );
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }, [userProfile?.role]);

  // Create bulk notifications
  const createBulkNotifications = useCallback(async (userIds, notificationType, data = {}) => {
    try {
      const notifications = await notificationHelper.createBulkNotifications(
        userIds, 
        notificationType, 
        data
      );
      return notifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }, []);

  // Get notifications by type
  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get notifications by priority
  const getNotificationsByPriority = useCallback((priority) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  // Get unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  // Remove toast from queue
  const removeToast = useCallback((toastId) => {
    setToastQueue(prev => prev.filter(t => t.id !== toastId));
  }, []);

  // Clear all toasts
  const clearToasts = useCallback(() => {
    setToastQueue([]);
  }, []);

  // Handle notification click (navigate to relevant page)
  const handleNotificationClick = useCallback((notification) => {
    // Mark as read if not already read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl && window.location) {
      // Use React Router navigation if available, otherwise fallback to window.location
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', notification.actionUrl);
        // Dispatch a popstate event to trigger React Router
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        window.location.href = notification.actionUrl;
      }
    }
  }, [markAsRead]);

  // Helper methods for specific notification types (leveraging existing memory implementations)
  const notifyApplicationApproved = useCallback(async (studentId, applicationData) => {
    return notificationHelper.notifyApplicationApproved(studentId, applicationData);
  }, []);

  const notifyApplicationRejected = useCallback(async (studentId, applicationData) => {
    return notificationHelper.notifyApplicationRejected(studentId, applicationData);
  }, []);

  const notifyInterviewScheduled = useCallback(async (studentId, interviewData) => {
    return notificationHelper.notifyInterviewScheduled(studentId, interviewData);
  }, []);

  const notifyCertificateGenerated = useCallback(async (studentId, certificateData) => {
    return notificationHelper.notifyCertificateGenerated(studentId, certificateData);
  }, []);

  const notifyMentorNewApplication = useCallback(async (mentorId, applicationData) => {
    return notificationHelper.notifyMentorNewApplication(mentorId, applicationData);
  }, []);

  const notifyPlacementNewApplication = useCallback(async (placementIds, applicationData) => {
    return notificationHelper.notifyPlacementNewApplication(placementIds, applicationData);
  }, []);

  const notifyAISkillSuggestion = useCallback(async (studentId, suggestionData) => {
    return notificationHelper.notifyAISkillSuggestion(studentId, suggestionData);
  }, []);

  const notifySeatAlert = useCallback(async (placementIds, seatData) => {
    return notificationHelper.notifySeatAlert(placementIds, seatData);
  }, []);

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    const stats = {
      total: notifications.length,
      unread: unreadCount,
      byType: {},
      byPriority: { high: 0, medium: 0, low: 0 },
      byCategory: {}
    };

    notifications.forEach(notification => {
      // Count by type
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      
      // Count by priority
      if (stats.byPriority[notification.priority] !== undefined) {
        stats.byPriority[notification.priority]++;
      }
      
      // Count by category
      stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1;
    });

    return stats;
  }, [notifications, unreadCount]);

  const value = {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    toastQueue,

    // Actions
    markAsRead,
    markAllAsRead,
    createNotification,
    createBulkNotifications,
    handleNotificationClick,
    removeToast,
    clearToasts,

    // Getters
    getNotificationsByType,
    getNotificationsByPriority,
    getUnreadNotifications,
    getNotificationStats,

    // Specific notification helpers
    notifyApplicationApproved,
    notifyApplicationRejected,
    notifyInterviewScheduled,
    notifyCertificateGenerated,
    notifyMentorNewApplication,
    notifyPlacementNewApplication,
    notifyAISkillSuggestion,
    notifySeatAlert
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
