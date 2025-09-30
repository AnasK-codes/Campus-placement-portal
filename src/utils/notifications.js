// Notifications Utility for Interview Scheduler
// AI-powered reminders and notifications system

import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase';

class NotificationManager {
  constructor() {
    this.notificationTypes = {
      INTERVIEW_SCHEDULED: 'interview_scheduled',
      INTERVIEW_REMINDER: 'interview_reminder',
      INTERVIEW_CANCELLED: 'interview_cancelled',
      INTERVIEW_RESCHEDULED: 'interview_rescheduled',
      INTERVIEW_CONFIRMED: 'interview_confirmed',
      CONFLICT_DETECTED: 'conflict_detected',
      AI_SUGGESTION: 'ai_suggestion'
    };

    this.reminderIntervals = {
      '24_hours': 24 * 60 * 60 * 1000, // 24 hours in milliseconds
      '2_hours': 2 * 60 * 60 * 1000,   // 2 hours in milliseconds
      '30_minutes': 30 * 60 * 1000     // 30 minutes in milliseconds
    };

    this.aiInsights = {
      preparationTips: [
        "Review the company's recent projects and achievements",
        "Prepare specific examples of your technical skills in action",
        "Research the interviewer's background on LinkedIn",
        "Practice explaining your projects in simple terms",
        "Prepare thoughtful questions about the role and company culture"
      ],
      technicalPrep: [
        "Review fundamental concepts in your field of study",
        "Practice coding problems on platforms like LeetCode or HackerRank",
        "Prepare to explain your project architecture and decisions",
        "Review common interview questions for your role",
        "Set up your development environment for technical demonstrations"
      ],
      softSkillsTips: [
        "Practice the STAR method for behavioral questions",
        "Prepare examples of teamwork and leadership experiences",
        "Think about challenges you've overcome and lessons learned",
        "Practice clear and concise communication",
        "Prepare to discuss your career goals and motivations"
      ]
    };
  }

  // Send notification to user
  async sendNotification(userId, notificationData) {
    try {
      const notification = {
        userId: userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        read: false,
        priority: notificationData.priority || 'medium',
        createdAt: serverTimestamp(),
        scheduledFor: notificationData.scheduledFor || null,
        actionRequired: notificationData.actionRequired || false,
        expiresAt: notificationData.expiresAt || null
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      
      // If it's an immediate notification, also trigger real-time notification
      if (!notificationData.scheduledFor) {
        await this.triggerRealTimeNotification(userId, notification);
      }

      return { success: true, notificationId: docRef.id };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate AI-powered interview reminders
  async generateInterviewReminder(interviewId, reminderType = '24_hours') {
    try {
      // Get interview details
      const interviewDoc = await getDoc(doc(db, 'interviews', interviewId));
      if (!interviewDoc.exists()) {
        throw new Error('Interview not found');
      }

      const interview = interviewDoc.data();
      const interviewTime = interview.startTime.toDate();
      const now = new Date();
      
      // Calculate reminder time
      const reminderTime = new Date(interviewTime.getTime() - this.reminderIntervals[reminderType]);
      
      // Don't schedule reminders in the past
      if (reminderTime <= now) {
        return { success: false, message: 'Reminder time is in the past' };
      }

      // Get student and company details
      const studentPromises = interview.studentIds.map(id => getDoc(doc(db, 'users', id)));
      const students = await Promise.all(studentPromises);
      
      const internshipDoc = await getDoc(doc(db, 'internships', interview.internshipId));
      const internship = internshipDoc.exists() ? internshipDoc.data() : {};

      // Generate AI insights based on interview timing and student profile
      const aiInsights = await this.generateAIInsights(interview, internship, students);

      // Send reminders to each student
      const reminderPromises = students.map(async (studentDoc, index) => {
        if (!studentDoc.exists()) return;
        
        const student = studentDoc.data();
        const personalizedMessage = this.generatePersonalizedMessage(
          student, 
          interview, 
          internship, 
          reminderType,
          aiInsights
        );

        return this.sendNotification(interview.studentIds[index], {
          type: this.notificationTypes.INTERVIEW_REMINDER,
          title: this.getReminderTitle(reminderType),
          message: personalizedMessage,
          data: {
            interviewId: interviewId,
            interviewTime: interviewTime.toISOString(),
            company: internship.company,
            role: internship.role,
            mode: interview.mode,
            venue: interview.venue,
            aiInsights: aiInsights
          },
          priority: reminderType === '30_minutes' ? 'high' : 'medium',
          scheduledFor: reminderTime
        });
      });

      await Promise.all(reminderPromises);

      return { success: true, message: 'Reminders scheduled successfully' };
    } catch (error) {
      console.error('Error generating interview reminder:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate AI insights for interview preparation
  async generateAIInsights(interview, internship, students) {
    try {
      const insights = {
        preparation: [],
        technical: [],
        softSkills: [],
        companySpecific: [],
        timeManagement: []
      };

      // Analyze interview timing
      const interviewTime = interview.startTime.toDate();
      const hour = interviewTime.getHours();
      
      if (hour < 10) {
        insights.timeManagement.push("Early morning interview - ensure you're well-rested and have breakfast");
      } else if (hour > 16) {
        insights.timeManagement.push("Late afternoon interview - stay energized and maintain enthusiasm");
      }

      // Company-specific insights
      if (internship.company) {
        insights.companySpecific.push(`Research ${internship.company}'s recent news and achievements`);
        insights.companySpecific.push(`Understand ${internship.company}'s mission and values`);
      }

      // Role-specific technical preparation
      if (internship.role) {
        const role = internship.role.toLowerCase();
        if (role.includes('developer') || role.includes('engineer')) {
          insights.technical.push(...this.aiInsights.technicalPrep);
        }
        if (role.includes('data') || role.includes('analyst')) {
          insights.technical.push("Review statistical concepts and data analysis tools");
          insights.technical.push("Prepare to discuss data visualization and insights");
        }
        if (role.includes('design')) {
          insights.technical.push("Prepare your portfolio and design process examples");
          insights.technical.push("Be ready to discuss user experience principles");
        }
      }

      // Skills-based insights
      if (internship.skills && internship.skills.length > 0) {
        const topSkills = internship.skills.slice(0, 3);
        insights.technical.push(`Focus on demonstrating: ${topSkills.join(', ')}`);
      }

      // Interview mode specific tips
      if (interview.mode === 'online') {
        insights.preparation.push("Test your internet connection and video/audio setup");
        insights.preparation.push("Ensure good lighting and a professional background");
        insights.preparation.push("Have a backup communication method ready");
      } else {
        insights.preparation.push(`Plan your route to ${interview.venue} in advance`);
        insights.preparation.push("Arrive 10-15 minutes early");
        insights.preparation.push("Bring physical copies of your resume");
      }

      // General preparation tips
      insights.preparation.push(...this.aiInsights.preparationTips.slice(0, 3));
      insights.softSkills.push(...this.aiInsights.softSkillsTips.slice(0, 3));

      return insights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return {
        preparation: ["Review your resume and be ready to discuss your experiences"],
        technical: ["Prepare for technical questions related to your field"],
        softSkills: ["Practice clear communication and professional demeanor"]
      };
    }
  }

  // Generate personalized reminder message
  generatePersonalizedMessage(student, interview, internship, reminderType, aiInsights) {
    const interviewTime = interview.startTime.toDate();
    const timeString = interviewTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const studentName = student.name || 'Student';
    const company = internship.company || 'the company';
    const role = internship.role || 'internship position';

    let message = '';

    switch (reminderType) {
      case '24_hours':
        message = `Hi ${studentName}! 🎯 Your interview with ${company} for the ${role} position is tomorrow at ${timeString}. `;
        message += `Here's your AI-powered preparation checklist:\n\n`;
        message += `📚 Preparation:\n${aiInsights.preparation.slice(0, 2).map(tip => `• ${tip}`).join('\n')}\n\n`;
        message += `💻 Technical Focus:\n${aiInsights.technical.slice(0, 2).map(tip => `• ${tip}`).join('\n')}\n\n`;
        message += `Good luck! You've got this! 💪`;
        break;

      case '2_hours':
        message = `Hi ${studentName}! ⏰ Your interview with ${company} starts in 2 hours (${timeString}). `;
        message += `Final preparation tips:\n\n`;
        message += `${aiInsights.timeManagement.join('\n')}\n`;
        if (interview.mode === 'online') {
          message += `💻 Online Interview Checklist:\n${aiInsights.preparation.filter(tip => tip.includes('internet') || tip.includes('lighting')).map(tip => `• ${tip}`).join('\n')}`;
        } else {
          message += `🚗 In-Person Interview:\n• Leave now to arrive on time\n• Venue: ${interview.venue}`;
        }
        break;

      case '30_minutes':
        message = `Hi ${studentName}! 🚨 Your interview with ${company} starts in 30 minutes! `;
        if (interview.mode === 'online') {
          message += `Join the meeting now to test your setup. Meeting details are in your email. `;
        } else {
          message += `You should be arriving at ${interview.venue} soon. `;
        }
        message += `Take a deep breath, review your key points, and show them your best self! 🌟`;
        break;

      default:
        message = `Hi ${studentName}! You have an upcoming interview with ${company} at ${timeString}.`;
    }

    return message;
  }

  // Get reminder title based on type
  getReminderTitle(reminderType) {
    const titles = {
      '24_hours': '📅 Interview Tomorrow - Preparation Time!',
      '2_hours': '⏰ Interview in 2 Hours - Final Prep!',
      '30_minutes': '🚨 Interview Starting Soon!'
    };
    return titles[reminderType] || 'Interview Reminder';
  }

  // Send interview scheduled notification
  async notifyInterviewScheduled(interviewId) {
    try {
      const interviewDoc = await getDoc(doc(db, 'interviews', interviewId));
      if (!interviewDoc.exists()) return;

      const interview = interviewDoc.data();
      const interviewTime = interview.startTime.toDate();
      
      // Get participant details
      const [internshipDoc, ...studentDocs] = await Promise.all([
        getDoc(doc(db, 'internships', interview.internshipId)),
        ...interview.studentIds.map(id => getDoc(doc(db, 'users', id)))
      ]);

      const internship = internshipDoc.exists() ? internshipDoc.data() : {};

      // Notify students
      const studentNotifications = studentDocs.map(async (studentDoc, index) => {
        if (!studentDoc.exists()) return;
        
        const student = studentDoc.data();
        return this.sendNotification(interview.studentIds[index], {
          type: this.notificationTypes.INTERVIEW_SCHEDULED,
          title: '🎉 Interview Scheduled!',
          message: `Great news ${student.name}! Your interview with ${internship.company} for the ${internship.role} position has been scheduled for ${interviewTime.toLocaleDateString()} at ${interviewTime.toLocaleTimeString()}.`,
          data: {
            interviewId: interviewId,
            company: internship.company,
            role: internship.role,
            interviewTime: interviewTime.toISOString(),
            mode: interview.mode,
            venue: interview.venue
          },
          priority: 'high',
          actionRequired: true
        });
      });

      // Notify mentor if assigned
      if (interview.mentorId) {
        const mentorDoc = await getDoc(doc(db, 'users', interview.mentorId));
        if (mentorDoc.exists()) {
          const mentor = mentorDoc.data();
          studentNotifications.push(
            this.sendNotification(interview.mentorId, {
              type: this.notificationTypes.INTERVIEW_SCHEDULED,
              title: '📋 Interview Scheduled - Student Update',
              message: `Interview scheduled for your student(s) with ${internship.company} on ${interviewTime.toLocaleDateString()} at ${interviewTime.toLocaleTimeString()}.`,
              data: {
                interviewId: interviewId,
                studentIds: interview.studentIds,
                company: internship.company,
                role: internship.role
              },
              priority: 'medium'
            })
          );
        }
      }

      await Promise.all(studentNotifications);

      // Schedule automatic reminders
      await this.scheduleAutomaticReminders(interviewId);

      return { success: true };
    } catch (error) {
      console.error('Error notifying interview scheduled:', error);
      return { success: false, error: error.message };
    }
  }

  // Schedule automatic reminders for an interview
  async scheduleAutomaticReminders(interviewId) {
    try {
      const reminderPromises = [
        this.generateInterviewReminder(interviewId, '24_hours'),
        this.generateInterviewReminder(interviewId, '2_hours'),
        this.generateInterviewReminder(interviewId, '30_minutes')
      ];

      await Promise.all(reminderPromises);
      return { success: true };
    } catch (error) {
      console.error('Error scheduling automatic reminders:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify about interview cancellation
  async notifyInterviewCancelled(interviewId, reason = '') {
    try {
      const interviewDoc = await getDoc(doc(db, 'interviews', interviewId));
      if (!interviewDoc.exists()) return;

      const interview = interviewDoc.data();
      const internshipDoc = await getDoc(doc(db, 'internships', interview.internshipId));
      const internship = internshipDoc.exists() ? internshipDoc.data() : {};

      // Notify all participants
      const notificationPromises = interview.studentIds.map(studentId =>
        this.sendNotification(studentId, {
          type: this.notificationTypes.INTERVIEW_CANCELLED,
          title: '❌ Interview Cancelled',
          message: `Your interview with ${internship.company} has been cancelled. ${reason ? `Reason: ${reason}` : 'Please contact the placement cell for more information.'}`,
          data: {
            interviewId: interviewId,
            company: internship.company,
            reason: reason
          },
          priority: 'high'
        })
      );

      await Promise.all(notificationPromises);
      return { success: true };
    } catch (error) {
      console.error('Error notifying interview cancelled:', error);
      return { success: false, error: error.message };
    }
  }

  // Notify about interview rescheduling
  async notifyInterviewRescheduled(interviewId, oldTime, newTime, reason = '') {
    try {
      const interviewDoc = await getDoc(doc(db, 'interviews', interviewId));
      if (!interviewDoc.exists()) return;

      const interview = interviewDoc.data();
      const internshipDoc = await getDoc(doc(db, 'internships', interview.internshipId));
      const internship = internshipDoc.exists() ? internshipDoc.data() : {};

      const oldTimeString = new Date(oldTime).toLocaleString();
      const newTimeString = new Date(newTime).toLocaleString();

      // Notify all participants
      const notificationPromises = interview.studentIds.map(studentId =>
        this.sendNotification(studentId, {
          type: this.notificationTypes.INTERVIEW_RESCHEDULED,
          title: '📅 Interview Rescheduled',
          message: `Your interview with ${internship.company} has been rescheduled from ${oldTimeString} to ${newTimeString}. ${reason ? `Reason: ${reason}` : ''}`,
          data: {
            interviewId: interviewId,
            company: internship.company,
            oldTime: oldTime,
            newTime: newTime,
            reason: reason
          },
          priority: 'high',
          actionRequired: true
        })
      );

      await Promise.all(notificationPromises);

      // Reschedule reminders for new time
      await this.scheduleAutomaticReminders(interviewId);

      return { success: true };
    } catch (error) {
      console.error('Error notifying interview rescheduled:', error);
      return { success: false, error: error.message };
    }
  }

  // Trigger real-time notification (for immediate notifications)
  async triggerRealTimeNotification(userId, notification) {
    try {
      // In a real implementation, this would trigger push notifications
      // For now, we'll just log it
      console.log(`Real-time notification for user ${userId}:`, notification.title);
      
      // You could integrate with services like:
      // - Firebase Cloud Messaging (FCM)
      // - Web Push API
      // - Email notifications
      // - SMS notifications
      
      return { success: true };
    } catch (error) {
      console.error('Error triggering real-time notification:', error);
      return { success: false, error: error.message };
    }
  }

  // Get AI suggestions for optimal interview timing
  async getOptimalInterviewTimes(studentIds, duration = 60) {
    try {
      // This is a simplified AI suggestion algorithm
      // In a real implementation, this could analyze:
      // - Student class schedules
      // - Historical interview success rates by time
      // - Interviewer availability patterns
      // - Student performance data

      const suggestions = [];
      const now = new Date();
      
      // Suggest times for the next 5 business days
      for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
        const date = new Date(now);
        date.setDate(date.getDate() + dayOffset);
        
        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        // Suggest optimal time slots based on AI analysis
        const optimalHours = [10, 11, 14, 15]; // 10 AM, 11 AM, 2 PM, 3 PM
        
        for (const hour of optimalHours) {
          const startTime = new Date(date);
          startTime.setHours(hour, 0, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + duration);

          suggestions.push({
            startTime: startTime,
            endTime: endTime,
            confidence: this.calculateTimeSlotConfidence(startTime, studentIds),
            reason: this.getTimeSlotReason(hour)
          });
        }
      }

      // Sort by confidence score
      return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
    } catch (error) {
      console.error('Error getting optimal interview times:', error);
      return [];
    }
  }

  // Calculate confidence score for a time slot
  calculateTimeSlotConfidence(startTime, studentIds) {
    let confidence = 70; // Base confidence

    const hour = startTime.getHours();
    const dayOfWeek = startTime.getDay();

    // Prefer mid-morning and early afternoon
    if (hour >= 10 && hour <= 11) confidence += 20;
    else if (hour >= 14 && hour <= 15) confidence += 15;
    else if (hour >= 9 && hour <= 16) confidence += 10;

    // Prefer Tuesday to Thursday
    if (dayOfWeek >= 2 && dayOfWeek <= 4) confidence += 10;
    else if (dayOfWeek === 1 || dayOfWeek === 5) confidence += 5;

    // Add randomness to simulate AI analysis
    confidence += Math.random() * 10 - 5;

    return Math.min(Math.max(confidence, 0), 100);
  }

  // Get reason for time slot recommendation
  getTimeSlotReason(hour) {
    const reasons = {
      9: "Early morning - students are fresh and focused",
      10: "Optimal time - high success rate for technical interviews",
      11: "Pre-lunch slot - good energy levels",
      14: "Post-lunch - students are alert and ready",
      15: "Afternoon slot - good for behavioral interviews",
      16: "Late afternoon - suitable for final rounds"
    };
    return reasons[hour] || "Good time slot for interviews";
  }
}

// Export singleton instance
export default new NotificationManager();

// Export individual functions for specific use cases
export const {
  sendNotification,
  generateInterviewReminder,
  notifyInterviewScheduled,
  notifyInterviewCancelled,
  notifyInterviewRescheduled,
  getOptimalInterviewTimes
} = new NotificationManager();
