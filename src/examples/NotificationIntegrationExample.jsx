import React, { useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Example integration showing how to use the notification system
 * across different components and workflows
 */

// Example: Student Application Workflow
export const StudentApplicationExample = () => {
  const { currentUser } = useAuth();
  const { 
    notifyApplicationApproved,
    notifyApplicationRejected,
    notifyInterviewScheduled,
    notifyCertificateGenerated 
  } = useNotifications();

  const handleApplicationApproval = async (applicationData) => {
    try {
      // When mentor approves application
      await notifyApplicationApproved(applicationData.studentId, {
        internshipTitle: applicationData.internshipTitle,
        company: applicationData.company,
        applicationId: applicationData.id,
        mentorName: currentUser.displayName
      });
      
      console.log('Application approval notification sent');
    } catch (error) {
      console.error('Failed to send approval notification:', error);
    }
  };

  const handleApplicationRejection = async (applicationData, feedback) => {
    try {
      // When mentor rejects application
      await notifyApplicationRejected(applicationData.studentId, {
        internshipTitle: applicationData.internshipTitle,
        company: applicationData.company,
        applicationId: applicationData.id,
        feedback: feedback,
        mentorName: currentUser.displayName
      });
      
      console.log('Application rejection notification sent');
    } catch (error) {
      console.error('Failed to send rejection notification:', error);
    }
  };

  return (
    <div>
      <h3>Student Application Workflow Example</h3>
      <button onClick={() => handleApplicationApproval({
        studentId: 'student123',
        internshipTitle: 'Frontend Developer',
        company: 'Tech Corp',
        id: 'app123'
      })}>
        Approve Application (Demo)
      </button>
      
      <button onClick={() => handleApplicationRejection({
        studentId: 'student123',
        internshipTitle: 'Frontend Developer',
        company: 'Tech Corp',
        id: 'app123'
      }, 'Please improve your portfolio')}>
        Reject Application (Demo)
      </button>
    </div>
  );
};

// Example: Interview Scheduling Integration
export const InterviewSchedulingExample = () => {
  const { notifyInterviewScheduled } = useNotifications();

  const scheduleInterview = async (interviewData) => {
    try {
      // When placement cell schedules interview
      await notifyInterviewScheduled(interviewData.studentId, {
        internshipTitle: interviewData.internshipTitle,
        company: interviewData.company,
        interviewDate: interviewData.date,
        interviewTime: interviewData.time,
        interviewMode: interviewData.mode, // online/offline
        interviewLocation: interviewData.location,
        interviewId: interviewData.id,
        interviewerName: interviewData.interviewer
      });
      
      console.log('Interview scheduled notification sent');
    } catch (error) {
      console.error('Failed to send interview notification:', error);
    }
  };

  return (
    <div>
      <h3>Interview Scheduling Example</h3>
      <button onClick={() => scheduleInterview({
        studentId: 'student123',
        internshipTitle: 'Backend Developer',
        company: 'StartupXYZ',
        date: '2024-01-15',
        time: '10:00 AM',
        mode: 'online',
        location: 'Google Meet',
        id: 'interview123',
        interviewer: 'John Smith'
      })}>
        Schedule Interview (Demo)
      </button>
    </div>
  );
};

// Example: Certificate Generation Integration
export const CertificateGenerationExample = () => {
  const { notifyCertificateGenerated } = useNotifications();

  const generateCertificate = async (certificateData) => {
    try {
      // When mentor completes feedback and certificate is generated
      await notifyCertificateGenerated(certificateData.studentId, {
        internshipTitle: certificateData.internshipTitle,
        company: certificateData.company,
        certificateId: certificateData.id,
        certificateType: certificateData.type, // excellence, completion, participation
        overallRating: certificateData.rating,
        completionDate: certificateData.completionDate,
        mentorName: certificateData.mentorName
      });
      
      console.log('Certificate generation notification sent');
    } catch (error) {
      console.error('Failed to send certificate notification:', error);
    }
  };

  return (
    <div>
      <h3>Certificate Generation Example</h3>
      <button onClick={() => generateCertificate({
        studentId: 'student123',
        internshipTitle: 'Full Stack Developer',
        company: 'Innovation Labs',
        id: 'cert123',
        type: 'excellence',
        rating: 4.8,
        completionDate: '2024-01-20',
        mentorName: 'Dr. Sarah Johnson'
      })}>
        Generate Certificate (Demo)
      </button>
    </div>
  );
};

// Example: AI Skill Suggestion Integration
export const AISkillSuggestionExample = () => {
  const { notifyAISkillSuggestion } = useNotifications();

  const suggestSkill = async (suggestionData) => {
    try {
      // When AI analyzes student profile and suggests improvements
      await notifyAISkillSuggestion(suggestionData.studentId, {
        suggestedSkill: suggestionData.skill,
        improvementPercentage: suggestionData.improvement,
        currentMatchRate: suggestionData.currentMatch,
        projectedMatchRate: suggestionData.projectedMatch,
        reasoning: suggestionData.reasoning,
        skillCategory: suggestionData.category
      });
      
      console.log('AI skill suggestion notification sent');
    } catch (error) {
      console.error('Failed to send AI suggestion notification:', error);
    }
  };

  return (
    <div>
      <h3>AI Skill Suggestion Example</h3>
      <button onClick={() => suggestSkill({
        studentId: 'student123',
        skill: 'React.js',
        improvement: 25,
        currentMatch: 60,
        projectedMatch: 85,
        reasoning: 'Many frontend internships require React.js experience',
        category: 'Frontend Development'
      })}>
        Send AI Suggestion (Demo)
      </button>
    </div>
  );
};

// Example: Placement Cell Seat Alert Integration
export const SeatAlertExample = () => {
  const { notifySeatAlert } = useNotifications();

  const sendSeatAlert = async (alertData) => {
    try {
      // When internship seats are running low
      const placementOfficerIds = ['placement1', 'placement2', 'admin1'];
      
      await notifySeatAlert(placementOfficerIds, {
        internshipTitle: alertData.internshipTitle,
        company: alertData.company,
        remainingSeats: alertData.remainingSeats,
        totalSeats: alertData.totalSeats,
        internshipId: alertData.internshipId,
        urgencyLevel: alertData.urgencyLevel,
        deadline: alertData.deadline
      });
      
      console.log('Seat alert notification sent to placement officers');
    } catch (error) {
      console.error('Failed to send seat alert:', error);
    }
  };

  return (
    <div>
      <h3>Seat Alert Example</h3>
      <button onClick={() => sendSeatAlert({
        internshipTitle: 'Data Science Intern',
        company: 'Analytics Pro',
        remainingSeats: 2,
        totalSeats: 10,
        internshipId: 'intern123',
        urgencyLevel: 'high',
        deadline: '2024-01-25'
      })}>
        Send Seat Alert (Demo)
      </button>
    </div>
  );
};

// Example: Real-time Notification Listener
export const NotificationListenerExample = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    console.log(`Received ${notifications.length} notifications, ${unreadCount} unread`);
  }, [notifications, unreadCount]);

  return (
    <div>
      <h3>Notification Listener Example</h3>
      <p>Total Notifications: {notifications.length}</p>
      <p>Unread Count: {unreadCount}</p>
      
      <div>
        <h4>Recent Notifications:</h4>
        {notifications.slice(0, 5).map(notification => (
          <div 
            key={notification.id} 
            style={{ 
              padding: '10px', 
              margin: '5px 0', 
              border: '1px solid #ccc',
              backgroundColor: notification.read ? '#f9f9f9' : '#fff3cd'
            }}
          >
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
            <small>{notification.category} - {notification.priority} priority</small>
            {!notification.read && (
              <button onClick={() => markAsRead(notification.id)}>
                Mark as Read
              </button>
            )}
          </div>
        ))}
      </div>
      
      {unreadCount > 0 && (
        <button onClick={markAllAsRead}>
          Mark All as Read
        </button>
      )}
    </div>
  );
};

// Main integration example component
const NotificationIntegrationExample = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h1>Notification System Integration Examples</h1>
      <p>These examples show how to integrate the notification system with various workflows:</p>
      
      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        <StudentApplicationExample />
        <InterviewSchedulingExample />
        <CertificateGenerationExample />
        <AISkillSuggestionExample />
        <SeatAlertExample />
        <NotificationListenerExample />
      </div>
      
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Integration Notes:</h3>
        <ul>
          <li><strong>Real-time Updates:</strong> All notifications appear instantly via Firestore listeners</li>
          <li><strong>Toast Notifications:</strong> New notifications slide in from top-right with sound effects</li>
          <li><strong>Role-based Content:</strong> Notification content adapts based on user role (student, mentor, placement, admin)</li>
          <li><strong>Action Integration:</strong> Clicking notifications navigates to relevant pages</li>
          <li><strong>Persistent Storage:</strong> All notifications stored in Firestore for history and analytics</li>
          <li><strong>Mobile Optimized:</strong> Responsive design works perfectly on all devices</li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationIntegrationExample;
