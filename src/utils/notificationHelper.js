import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';

// Notification types and their configurations
export const NOTIFICATION_TYPES = {
  APPLICATION_SUBMITTED: {
    type: 'application',
    category: 'Application',
    priority: 'medium',
    icon: '📋',
    sound: 'notification'
  },
  APPLICATION_APPROVED: {
    type: 'approval',
    category: 'Application',
    priority: 'high',
    icon: '✅',
    sound: 'success'
  },
  APPLICATION_REJECTED: {
    type: 'rejection',
    category: 'Application',
    priority: 'high',
    icon: '❌',
    sound: 'alert'
  },
  INTERVIEW_SCHEDULED: {
    type: 'interview',
    category: 'Interview',
    priority: 'high',
    icon: '📅',
    sound: 'alert'
  },
  INTERVIEW_RESCHEDULED: {
    type: 'interview',
    category: 'Interview',
    priority: 'high',
    icon: '🔄',
    sound: 'notification'
  },
  INTERVIEW_REMINDER: {
    type: 'reminder',
    category: 'Interview',
    priority: 'high',
    icon: '⏰',
    sound: 'alert'
  },
  CERTIFICATE_GENERATED: {
    type: 'certificate',
    category: 'Achievement',
    priority: 'high',
    icon: '🏆',
    sound: 'success'
  },
  FEEDBACK_SUBMITTED: {
    type: 'update',
    category: 'Feedback',
    priority: 'medium',
    icon: '📝',
    sound: 'notification'
  },
  AI_SKILL_SUGGESTION: {
    type: 'ai_suggestion',
    category: 'AI Recommendation',
    priority: 'low',
    icon: '🤖',
    sound: 'notification'
  },
  PROFILE_INCOMPLETE: {
    type: 'reminder',
    category: 'Profile',
    priority: 'medium',
    icon: '👤',
    sound: 'notification'
  },
  SEAT_ALERT: {
    type: 'update',
    category: 'Internship',
    priority: 'high',
    icon: '⚠️',
    sound: 'alert'
  },
  MENTOR_ASSIGNED: {
    type: 'update',
    category: 'Mentorship',
    priority: 'medium',
    icon: '👨‍🏫',
    sound: 'notification'
  }
};

// Role-specific notification templates
export const NOTIFICATION_TEMPLATES = {
  student: {
    APPLICATION_APPROVED: (data) => ({
      title: 'Application Approved! 🎉',
      message: `Your application for ${data.internshipTitle} at ${data.company} has been approved by your mentor.`,
      actionUrl: `/applications/${data.applicationId}`,
      actionText: 'View Details'
    }),
    APPLICATION_REJECTED: (data) => ({
      title: 'Application Update',
      message: `Your application for ${data.internshipTitle} needs revision. Check mentor feedback for details.`,
      actionUrl: `/applications/${data.applicationId}`,
      actionText: 'View Feedback'
    }),
    INTERVIEW_SCHEDULED: (data) => ({
      title: 'Interview Scheduled! 📅',
      message: `Your interview for ${data.internshipTitle} is scheduled for ${data.interviewDate} at ${data.interviewTime}.`,
      actionUrl: `/interviews/${data.interviewId}`,
      actionText: 'View Details'
    }),
    CERTIFICATE_GENERATED: (data) => ({
      title: 'Certificate Ready! 🏆',
      message: `Your internship certificate for ${data.internshipTitle} is ready for download.`,
      actionUrl: `/certificates/${data.certificateId}`,
      actionText: 'Download'
    }),
    AI_SKILL_SUGGESTION: (data) => ({
      title: 'AI Skill Recommendation 🤖',
      message: `Add ${data.suggestedSkill} to increase your internship match rate by ${data.improvementPercentage}%.`,
      actionUrl: '/profile/skills',
      actionText: 'Update Skills'
    }),
    PROFILE_INCOMPLETE: (data) => ({
      title: 'Complete Your Profile',
      message: `Your profile is ${data.completionPercentage}% complete. Add missing information to get better internship matches.`,
      actionUrl: '/profile',
      actionText: 'Complete Profile'
    })
  },
  mentor: {
    APPLICATION_SUBMITTED: (data) => ({
      title: 'New Application Pending',
      message: `${data.studentName} has applied for ${data.internshipTitle}. Review and approve/reject the application.`,
      actionUrl: `/mentor/approvals/${data.applicationId}`,
      actionText: 'Review Application'
    }),
    INTERVIEW_RESCHEDULED: (data) => ({
      title: 'Interview Reschedule Request',
      message: `${data.studentName} has requested to reschedule the interview for ${data.internshipTitle}.`,
      actionUrl: `/mentor/interviews/${data.interviewId}`,
      actionText: 'View Request'
    }),
    FEEDBACK_REMINDER: (data) => ({
      title: 'Feedback Reminder',
      message: `Please provide feedback for ${data.studentName}'s completed internship at ${data.company}.`,
      actionUrl: `/mentor/feedback/${data.internshipId}`,
      actionText: 'Submit Feedback'
    })
  },
  placement: {
    APPLICATION_SUBMITTED: (data) => ({
      title: 'New Application Received',
      message: `${data.studentName} applied for ${data.internshipTitle} at ${data.company}.`,
      actionUrl: `/placement/applications/${data.applicationId}`,
      actionText: 'View Application'
    }),
    SEAT_ALERT: (data) => ({
      title: 'Low Seat Alert ⚠️',
      message: `${data.internshipTitle} at ${data.company} has only ${data.remainingSeats} seats remaining out of ${data.totalSeats}.`,
      actionUrl: `/placement/internships/${data.internshipId}`,
      actionText: 'View Internship'
    }),
    INTERVIEW_CONFLICT: (data) => ({
      title: 'Interview Conflict Detected',
      message: `Scheduling conflict detected for ${data.studentName}'s interview on ${data.date}.`,
      actionUrl: `/placement/interviews/${data.interviewId}`,
      actionText: 'Resolve Conflict'
    })
  },
  admin: {
    SYSTEM_ALERT: (data) => ({
      title: 'System Alert',
      message: data.message,
      actionUrl: data.actionUrl,
      actionText: 'View Details'
    }),
    USER_REGISTRATION: (data) => ({
      title: 'New User Registration',
      message: `${data.userName} (${data.role}) has registered and needs approval.`,
      actionUrl: `/admin/users/${data.userId}`,
      actionText: 'Review User'
    })
  }
};

class NotificationHelper {
  constructor() {
    this.listeners = new Map();
  }

  // Create a new notification
  async createNotification(userId, notificationType, data = {}) {
    try {
      const config = NOTIFICATION_TYPES[notificationType];
      if (!config) {
        throw new Error(`Unknown notification type: ${notificationType}`);
      }

      // Get user role to determine template
      const userRole = data.userRole || 'student';
      const template = NOTIFICATION_TEMPLATES[userRole]?.[notificationType];
      
      if (!template) {
        console.warn(`No template found for ${notificationType} and role ${userRole}`);
        return null;
      }

      const templateData = template(data);

      const notification = {
        userId,
        type: config.type,
        category: config.category,
        priority: config.priority,
        icon: config.icon,
        title: templateData.title,
        message: templateData.message,
        actionUrl: templateData.actionUrl,
        actionText: templateData.actionText,
        read: false,
        timestamp: serverTimestamp(),
        data: data,
        soundType: config.sound
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      
      // Return notification with ID for immediate UI updates
      return {
        id: docRef.id,
        ...notification,
        timestamp: new Date() // Use current date for immediate display
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Create notifications for multiple users
  async createBulkNotifications(userIds, notificationType, data = {}) {
    try {
      const batch = writeBatch(db);
      const notifications = [];

      for (const userId of userIds) {
        const config = NOTIFICATION_TYPES[notificationType];
        if (!config) continue;

        const userRole = data.userRoles?.[userId] || 'student';
        const template = NOTIFICATION_TEMPLATES[userRole]?.[notificationType];
        
        if (!template) continue;

        const templateData = template(data);
        const notificationRef = doc(collection(db, 'notifications'));
        
        const notification = {
          userId,
          type: config.type,
          category: config.category,
          priority: config.priority,
          icon: config.icon,
          title: templateData.title,
          message: templateData.message,
          actionUrl: templateData.actionUrl,
          actionText: templateData.actionText,
          read: false,
          timestamp: serverTimestamp(),
          data: data,
          soundType: config.sound
        };

        batch.set(notificationRef, notification);
        notifications.push({
          id: notificationRef.id,
          ...notification,
          timestamp: new Date()
        });
      }

      await batch.commit();
      return notifications;
    } catch (error) {
      console.error('Error creating bulk notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Set up real-time listener for user notifications
  subscribeToNotifications(userId, callback) {
    if (this.listeners.has(userId)) {
      this.listeners.get(userId)();
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(notifications);
    }, (error) => {
      console.error('Error listening to notifications:', error);
    });

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications(userId) {
    if (this.listeners.has(userId)) {
      this.listeners.get(userId)();
      this.listeners.delete(userId);
    }
  }

  // Clean up all listeners
  cleanup() {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  // Get notification statistics
  async getNotificationStats(userId) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const stats = {
        total: 0,
        unread: 0,
        byType: {},
        byPriority: { high: 0, medium: 0, low: 0 }
      };

      snapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;
        
        if (!data.read) {
          stats.unread++;
        }

        stats.byType[data.type] = (stats.byType[data.type] || 0) + 1;
        stats.byPriority[data.priority] = (stats.byPriority[data.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }

  // Helper methods for specific notification types
  async notifyApplicationApproved(studentId, applicationData) {
    return this.createNotification(studentId, 'APPLICATION_APPROVED', {
      ...applicationData,
      userRole: 'student'
    });
  }

  async notifyApplicationRejected(studentId, applicationData) {
    return this.createNotification(studentId, 'APPLICATION_REJECTED', {
      ...applicationData,
      userRole: 'student'
    });
  }

  async notifyInterviewScheduled(studentId, interviewData) {
    return this.createNotification(studentId, 'INTERVIEW_SCHEDULED', {
      ...interviewData,
      userRole: 'student'
    });
  }

  async notifyCertificateGenerated(studentId, certificateData) {
    return this.createNotification(studentId, 'CERTIFICATE_GENERATED', {
      ...certificateData,
      userRole: 'student'
    });
  }

  async notifyMentorNewApplication(mentorId, applicationData) {
    return this.createNotification(mentorId, 'APPLICATION_SUBMITTED', {
      ...applicationData,
      userRole: 'mentor'
    });
  }

  async notifyPlacementNewApplication(placementIds, applicationData) {
    return this.createBulkNotifications(placementIds, 'APPLICATION_SUBMITTED', {
      ...applicationData,
      userRoles: placementIds.reduce((acc, id) => ({ ...acc, [id]: 'placement' }), {})
    });
  }

  async notifyAISkillSuggestion(studentId, suggestionData) {
    return this.createNotification(studentId, 'AI_SKILL_SUGGESTION', {
      ...suggestionData,
      userRole: 'student'
    });
  }

  async notifySeatAlert(placementIds, seatData) {
    return this.createBulkNotifications(placementIds, 'SEAT_ALERT', {
      ...seatData,
      userRoles: placementIds.reduce((acc, id) => ({ ...acc, [id]: 'placement' }), {})
    });
  }
}

// Create singleton instance
const notificationHelper = new NotificationHelper();

export default notificationHelper;
