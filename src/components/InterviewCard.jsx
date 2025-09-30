import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import conflictChecker from '../utils/conflictChecker';
import notificationManager from '../utils/notifications';

const CardContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme, status }) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#f44336';
      case 'completed': return '#2196F3';
      default: return theme.colors.border;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ status }) => {
      switch (status) {
        case 'confirmed': return 'linear-gradient(90deg, #4CAF50, #66BB6A)';
        case 'pending': return 'linear-gradient(90deg, #FF9800, #FFB74D)';
        case 'cancelled': return 'linear-gradient(90deg, #f44336, #ef5350)';
        case 'completed': return 'linear-gradient(90deg, #2196F3, #64B5F6)';
        default: return 'linear-gradient(90deg, #9E9E9E, #BDBDBD)';
      }
    }};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }

  ${({ hasConflicts }) => hasConflicts && `
    animation: pulse-red 2s infinite;
    
    @keyframes pulse-red {
      0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
      100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
    }
  `}
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InterviewInfo = styled.div`
  flex: 1;
  min-width: 250px;
`;

const InterviewTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .company-icon {
    width: 40px;
    height: 40px;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background: ${({ theme }) => theme.colors.gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1rem;
  }
`;

const InterviewDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;

  .detail-item {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};

    .icon {
      font-size: 1rem;
      min-width: 20px;
    }

    .label {
      font-weight: 500;
      min-width: 80px;
    }
  }
`;

const StatusBadge = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ status }) => {
    switch (status) {
      case 'confirmed': return 'rgba(76, 175, 80, 0.1)';
      case 'pending': return 'rgba(255, 152, 0, 0.1)';
      case 'cancelled': return 'rgba(244, 67, 54, 0.1)';
      case 'completed': return 'rgba(33, 150, 243, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#f44336';
      case 'completed': return '#2196F3';
      default: return '#9E9E9E';
    }
  }};
  border: 1px solid ${({ status }) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#f44336';
      case 'completed': return '#2196F3';
      default: return '#9E9E9E';
    }
  }};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  .icon {
    font-size: 1rem;
  }
`;

const TimeSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  position: relative;

  .time-header {
    display: flex;
    justify-content: between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
  }

  .time-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
  }

  .time-item {
    .label {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }

    .value {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      font-size: 0.9rem;
    }
  }
`;

const ParticipantsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .participants-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
  }

  .participants-list {
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const ParticipantChip = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, type }) => {
    switch (type) {
      case 'student': return 'rgba(33, 150, 243, 0.1)';
      case 'mentor': return 'rgba(76, 175, 80, 0.1)';
      case 'interviewer': return 'rgba(156, 39, 176, 0.1)';
      default: return theme.colors.surface;
    }
  }};
  color: ${({ type }) => {
    switch (type) {
      case 'student': return '#2196F3';
      case 'mentor': return '#4CAF50';
      case 'interviewer': return '#9C27B0';
      default: return 'inherit';
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.8rem;
  font-weight: 500;

  .avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${({ type }) => {
      switch (type) {
        case 'student': return '#2196F3';
        case 'mentor': return '#4CAF50';
        case 'interviewer': return '#9C27B0';
        default: return '#9E9E9E';
      }
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.7rem;
    font-weight: bold;
  }
`;

const ConflictAlert = styled(motion.div)`
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(229, 57, 53, 0.1));
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .conflict-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-weight: 600;
    color: #f44336;
    font-size: 0.9rem;
  }

  .conflicts-list {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
  }

  .conflict-item {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text};

    .conflict-icon {
      font-size: 1rem;
      color: #f44336;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(motion.button)`
  flex: 1;
  min-width: 120px;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'primary': return theme.colors.gradient;
      case 'success': return 'linear-gradient(135deg, #4CAF50, #66BB6A)';
      case 'danger': return 'linear-gradient(135deg, #f44336, #ef5350)';
      case 'warning': return 'linear-gradient(135deg, #FF9800, #FFB74D)';
      default: return 'transparent';
    }
  }};
  color: ${({ variant, theme }) => 
    variant === 'secondary' ? theme.colors.primary : 'white'};
  border: ${({ variant, theme }) => 
    variant === 'secondary' ? `2px solid ${theme.colors.primary}` : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ variant, theme }) => {
      if (variant === 'secondary') return theme.colors.primary;
      return variant === 'primary' ? theme.colors.gradient : 
             variant === 'success' ? 'linear-gradient(135deg, #388E3C, #4CAF50)' :
             variant === 'danger' ? 'linear-gradient(135deg, #D32F2F, #f44336)' :
             variant === 'warning' ? 'linear-gradient(135deg, #F57C00, #FF9800)' :
             'transparent';
    }};
    color: white;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .icon {
    font-size: 1rem;
  }
`;

const NotificationToast = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${({ type }) => 
    type === 'success' ? 'linear-gradient(135deg, #4CAF50, #66BB6A)' : 
    type === 'error' ? 'linear-gradient(135deg, #f44336, #ef5350)' :
    'linear-gradient(135deg, #2196F3, #64B5F6)'};
  color: white;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: 600;

  .icon {
    font-size: 1.2rem;
  }
`;

const InterviewCard = ({ interview, onUpdate, onDelete, showActions = true }) => {
  const [loading, setLoading] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [showNotification, setShowNotification] = useState(null);
  const [participantDetails, setParticipantDetails] = useState({
    students: [],
    mentor: null,
    interviewer: null,
    internship: null
  });

  useEffect(() => {
    loadParticipantDetails();
    checkConflicts();
  }, [interview]);

  const loadParticipantDetails = async () => {
    try {
      // Load student details
      const studentPromises = interview.studentIds?.map(id => getDoc(doc(db, 'users', id))) || [];
      const studentDocs = await Promise.all(studentPromises);
      const students = studentDocs.map(doc => doc.exists() ? { id: doc.id, ...doc.data() } : null).filter(Boolean);

      // Load mentor details
      let mentor = null;
      if (interview.mentorId) {
        const mentorDoc = await getDoc(doc(db, 'users', interview.mentorId));
        if (mentorDoc.exists()) {
          mentor = { id: mentorDoc.id, ...mentorDoc.data() };
        }
      }

      // Load interviewer details
      let interviewer = null;
      if (interview.interviewerId) {
        const interviewerDoc = await getDoc(doc(db, 'users', interview.interviewerId));
        if (interviewerDoc.exists()) {
          interviewer = { id: interviewerDoc.id, ...interviewerDoc.data() };
        }
      }

      // Load internship details
      let internship = null;
      if (interview.internshipId) {
        const internshipDoc = await getDoc(doc(db, 'internships', interview.internshipId));
        if (internshipDoc.exists()) {
          internship = { id: internshipDoc.id, ...internshipDoc.data() };
        }
      }

      setParticipantDetails({ students, mentor, interviewer, internship });
    } catch (error) {
      console.error('Error loading participant details:', error);
    }
  };

  const checkConflicts = async () => {
    try {
      const conflictResult = await conflictChecker.checkConflicts(interview, interview.id);
      setConflicts(conflictResult.conflicts || []);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Not specified';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Not specified';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      case 'completed': return '🎉';
      default: return '📅';
    }
  };

  const handleConfirm = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'interviews', interview.id), {
        status: 'confirmed',
        confirmedAt: serverTimestamp()
      });

      // Send notifications
      await notificationManager.notifyInterviewScheduled(interview.id);

      setShowNotification({ type: 'success', message: 'Interview confirmed successfully!' });
      setTimeout(() => setShowNotification(null), 3000);

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error confirming interview:', error);
      setShowNotification({ type: 'error', message: 'Failed to confirm interview. Please try again.' });
      setTimeout(() => setShowNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (loading) return;
    
    const reason = prompt('Please provide a reason for cancellation (optional):');
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'interviews', interview.id), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancellationReason: reason || 'No reason provided'
      });

      // Send notifications
      await notificationManager.notifyInterviewCancelled(interview.id, reason);

      setShowNotification({ type: 'success', message: 'Interview cancelled and participants notified.' });
      setTimeout(() => setShowNotification(null), 3000);

      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error cancelling interview:', error);
      setShowNotification({ type: 'error', message: 'Failed to cancel interview. Please try again.' });
      setTimeout(() => setShowNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = () => {
    // This would open a reschedule modal or navigate to reschedule page
    setShowNotification({ type: 'info', message: 'Reschedule functionality coming soon!' });
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleDelete = async () => {
    if (loading) return;
    
    if (!confirm('Are you sure you want to delete this interview? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'interviews', interview.id));

      setShowNotification({ type: 'success', message: 'Interview deleted successfully.' });
      setTimeout(() => setShowNotification(null), 3000);

      if (onDelete) onDelete(interview.id);
    } catch (error) {
      console.error('Error deleting interview:', error);
      setShowNotification({ type: 'error', message: 'Failed to delete interview. Please try again.' });
      setTimeout(() => setShowNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CardContainer
        status={interview.status}
        hasConflicts={conflicts.length > 0}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.01 }}
      >
        <CardHeader>
          <InterviewInfo>
            <InterviewTitle>
              <div className="company-icon">
                {participantDetails.internship?.company?.charAt(0) || '🏢'}
              </div>
              {participantDetails.internship?.role || 'Interview'} - {participantDetails.internship?.company || 'Company'}
            </InterviewTitle>
            <InterviewDetails>
              <div className="detail-item">
                <span className="icon">📅</span>
                <span className="label">Date:</span>
                <span>{formatDateTime(interview.startTime)}</span>
              </div>
              <div className="detail-item">
                <span className="icon">{interview.mode === 'online' ? '💻' : '🏢'}</span>
                <span className="label">Mode:</span>
                <span>{interview.mode === 'online' ? 'Online' : `In-person at ${interview.venue}`}</span>
              </div>
              <div className="detail-item">
                <span className="icon">⏱️</span>
                <span className="label">Duration:</span>
                <span>
                  {interview.startTime && interview.endTime ? 
                    `${Math.round((interview.endTime.toDate() - interview.startTime.toDate()) / (1000 * 60))} minutes` :
                    'Not specified'
                  }
                </span>
              </div>
            </InterviewDetails>
          </InterviewInfo>

          <StatusBadge
            status={interview.status}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="icon">{getStatusIcon(interview.status)}</span>
            {interview.status || 'Scheduled'}
          </StatusBadge>
        </CardHeader>

        {conflicts.length > 0 && (
          <ConflictAlert
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="conflict-header">
              <span>⚠️</span>
              Scheduling Conflicts Detected
            </div>
            <div className="conflicts-list">
              {conflicts.slice(0, 3).map((conflict, index) => (
                <div key={index} className="conflict-item">
                  <span className="conflict-icon">🚨</span>
                  <span>{conflictChecker.formatConflictMessage(conflict)}</span>
                </div>
              ))}
              {conflicts.length > 3 && (
                <div className="conflict-item">
                  <span className="conflict-icon">➕</span>
                  <span>+{conflicts.length - 3} more conflicts</span>
                </div>
              )}
            </div>
          </ConflictAlert>
        )}

        <TimeSection>
          <div className="time-header">
            <span>🕐 Interview Schedule</span>
          </div>
          <div className="time-details">
            <div className="time-item">
              <div className="label">Start Time</div>
              <div className="value">{formatTime(interview.startTime)}</div>
            </div>
            <div className="time-item">
              <div className="label">End Time</div>
              <div className="value">{formatTime(interview.endTime)}</div>
            </div>
            <div className="time-item">
              <div className="label">Date</div>
              <div className="value">
                {interview.startTime ? 
                  interview.startTime.toDate().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 
                  'Not specified'
                }
              </div>
            </div>
            {interview.mode === 'offline' && interview.venue && (
              <div className="time-item">
                <div className="label">Venue</div>
                <div className="value">{interview.venue}</div>
              </div>
            )}
          </div>
        </TimeSection>

        <ParticipantsSection>
          <div className="participants-header">
            <span>👥 Participants</span>
            <span>{(participantDetails.students?.length || 0) + (participantDetails.mentor ? 1 : 0) + (participantDetails.interviewer ? 1 : 0)} people</span>
          </div>
          <div className="participants-list">
            {participantDetails.students?.map(student => (
              <ParticipantChip key={student.id} type="student">
                <div className="avatar">{getInitials(student.name)}</div>
                <span>{student.name}</span>
              </ParticipantChip>
            ))}
            {participantDetails.mentor && (
              <ParticipantChip type="mentor">
                <div className="avatar">{getInitials(participantDetails.mentor.name)}</div>
                <span>{participantDetails.mentor.name} (Mentor)</span>
              </ParticipantChip>
            )}
            {participantDetails.interviewer && (
              <ParticipantChip type="interviewer">
                <div className="avatar">{getInitials(participantDetails.interviewer.name)}</div>
                <span>{participantDetails.interviewer.name} (Interviewer)</span>
              </ParticipantChip>
            )}
          </div>
        </ParticipantsSection>

        {showActions && (
          <ActionButtons>
            {interview.status === 'pending' && (
              <ActionButton
                variant="success"
                onClick={handleConfirm}
                disabled={loading || conflicts.length > 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="icon">{loading ? '⏳' : '✅'}</span>
                {loading ? 'Confirming...' : 'Confirm'}
              </ActionButton>
            )}

            {(interview.status === 'pending' || interview.status === 'confirmed') && (
              <>
                <ActionButton
                  variant="warning"
                  onClick={handleReschedule}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="icon">📅</span>
                  Reschedule
                </ActionButton>

                <ActionButton
                  variant="danger"
                  onClick={handleCancel}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="icon">❌</span>
                  Cancel
                </ActionButton>
              </>
            )}

            {interview.status === 'cancelled' && (
              <ActionButton
                variant="danger"
                onClick={handleDelete}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="icon">{loading ? '⏳' : '🗑️'}</span>
                {loading ? 'Deleting...' : 'Delete'}
              </ActionButton>
            )}
          </ActionButtons>
        )}
      </CardContainer>

      {/* Notification Toast */}
      <AnimatePresence>
        {showNotification && (
          <NotificationToast
            type={showNotification.type}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <span className="icon">
              {showNotification.type === 'success' ? '✅' : 
               showNotification.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            {showNotification.message}
          </NotificationToast>
        )}
      </AnimatePresence>
    </>
  );
};

export default InterviewCard;
