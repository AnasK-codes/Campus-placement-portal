import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import notificationManager from '../utils/notifications';

const ListContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .icon {
    font-size: 2rem;
  }

  .count {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    font-size: 0.9rem;
    margin-left: ${({ theme }) => theme.spacing.sm};
  }
`;

const FilterControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const FilterButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, active }) => active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.background};
  color: ${({ theme, active }) => active ? 'white' : theme.colors.text};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    ${({ active, theme }) => !active && `color: ${theme.colors.primary};`}
  }
`;

const InterviewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InterviewItem = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #FF9800, #FFB74D);
    border-radius: ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0 0;
  }
`;

const InterviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InterviewInfo = styled.div`
  flex: 1;
  min-width: 250px;

  .title {
    font-size: 1.2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .details {
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
      }
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ variant }) => {
    switch (variant) {
      case 'approve': return 'linear-gradient(135deg, #4CAF50, #66BB6A)';
      case 'reject': return 'transparent';
      default: return 'transparent';
    }
  }};
  color: ${({ variant, theme }) => 
    variant === 'approve' ? 'white' : 
    variant === 'reject' ? '#f44336' : theme.colors.text};
  border: ${({ variant }) => 
    variant === 'reject' ? '2px solid #f44336' : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ variant }) => {
      switch (variant) {
        case 'approve': return 'linear-gradient(135deg, #388E3C, #4CAF50)';
        case 'reject': return '#f44336';
        default: return 'transparent';
      }
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

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textSecondary};

  .icon {
    font-size: 4rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const NotificationToast = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${({ type }) => 
    type === 'success' ? 'linear-gradient(135deg, #4CAF50, #66BB6A)' : 
    'linear-gradient(135deg, #f44336, #ef5350)'};
  color: white;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: 600;
`;

const PendingInterviewsList = ({ userRole = 'placement', userId = null }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadPendingInterviews();
  }, [userRole, userId, filter]);

  const loadPendingInterviews = () => {
    try {
      let interviewsQuery = query(
        collection(db, 'interviews'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      // Filter based on user role
      if (userRole === 'student' && userId) {
        interviewsQuery = query(
          collection(db, 'interviews'),
          where('studentIds', 'array-contains', userId),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        );
      } else if (userRole === 'mentor' && userId) {
        interviewsQuery = query(
          collection(db, 'interviews'),
          where('mentorId', '==', userId),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        );
      }

      const unsubscribe = onSnapshot(interviewsQuery, (snapshot) => {
        const interviewsList = [];
        snapshot.forEach((doc) => {
          interviewsList.push({ id: doc.id, ...doc.data() });
        });
        setInterviews(interviewsList);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading pending interviews:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (interviewId) => {
    setActionLoading(prev => ({ ...prev, [interviewId]: 'approving' }));
    
    try {
      await updateDoc(doc(db, 'interviews', interviewId), {
        status: 'confirmed',
        confirmedAt: serverTimestamp(),
        confirmedBy: userId
      });

      await notificationManager.notifyInterviewScheduled(interviewId);

      setNotification({ type: 'success', message: 'Interview approved successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error approving interview:', error);
      setNotification({ type: 'error', message: 'Failed to approve interview.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [interviewId]: null }));
    }
  };

  const handleReject = async (interviewId) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    
    setActionLoading(prev => ({ ...prev, [interviewId]: 'rejecting' }));
    
    try {
      await updateDoc(doc(db, 'interviews', interviewId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelledBy: userId,
        cancellationReason: reason || 'Rejected by user'
      });

      await notificationManager.notifyInterviewCancelled(interviewId, reason);

      setNotification({ type: 'success', message: 'Interview rejected successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error rejecting interview:', error);
      setNotification({ type: 'error', message: 'Failed to reject interview.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setActionLoading(prev => ({ ...prev, [interviewId]: null }));
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

  const filteredInterviews = interviews.filter(interview => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const today = new Date();
      const interviewDate = interview.startTime.toDate();
      return interviewDate.toDateString() === today.toDateString();
    }
    if (filter === 'urgent') {
      const now = new Date();
      const interviewTime = interview.startTime.toDate();
      const hoursUntil = (interviewTime - now) / (1000 * 60 * 60);
      return hoursUntil <= 24 && hoursUntil > 0;
    }
    return true;
  });

  return (
    <ListContainer>
      <ListHeader>
        <Title>
          <span className="icon">⏳</span>
          Pending Interviews
          <span className="count">{filteredInterviews.length}</span>
        </Title>
        
        <FilterControls>
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All ({interviews.length})
          </FilterButton>
          <FilterButton
            active={filter === 'today'}
            onClick={() => setFilter('today')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Today
          </FilterButton>
          <FilterButton
            active={filter === 'urgent'}
            onClick={() => setFilter('urgent')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Urgent (24h)
          </FilterButton>
        </FilterControls>
      </ListHeader>

      {loading ? (
        <EmptyState>
          <div className="icon">⏳</div>
          <h3>Loading pending interviews...</h3>
        </EmptyState>
      ) : filteredInterviews.length === 0 ? (
        <EmptyState>
          <div className="icon">✅</div>
          <h3>No Pending Interviews</h3>
          <p>All interviews have been reviewed!</p>
        </EmptyState>
      ) : (
        <InterviewsList>
          <AnimatePresence>
            {filteredInterviews.map((interview, index) => (
              <InterviewItem
                key={interview.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <InterviewHeader>
                  <InterviewInfo>
                    <div className="title">
                      Interview - {interview.internshipTitle || 'Position'}
                    </div>
                    <div className="details">
                      <div className="detail-item">
                        <span className="icon">🏢</span>
                        <span>{interview.companyName || 'Company'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="icon">📅</span>
                        <span>{formatDateTime(interview.startTime)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="icon">{interview.mode === 'online' ? '💻' : '🏢'}</span>
                        <span>{interview.mode === 'online' ? 'Online Interview' : `Venue: ${interview.venue}`}</span>
                      </div>
                      <div className="detail-item">
                        <span className="icon">👥</span>
                        <span>{interview.studentIds?.length || 0} student(s)</span>
                      </div>
                    </div>
                  </InterviewInfo>

                  <ActionButtons>
                    <ActionButton
                      variant="approve"
                      onClick={() => handleApprove(interview.id)}
                      disabled={actionLoading[interview.id]}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="icon">
                        {actionLoading[interview.id] === 'approving' ? '⏳' : '✅'}
                      </span>
                      {actionLoading[interview.id] === 'approving' ? 'Approving...' : 'Approve'}
                    </ActionButton>

                    <ActionButton
                      variant="reject"
                      onClick={() => handleReject(interview.id)}
                      disabled={actionLoading[interview.id]}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="icon">
                        {actionLoading[interview.id] === 'rejecting' ? '⏳' : '❌'}
                      </span>
                      {actionLoading[interview.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                    </ActionButton>
                  </ActionButtons>
                </InterviewHeader>
              </InterviewItem>
            ))}
          </AnimatePresence>
        </InterviewsList>
      )}

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <NotificationToast
            type={notification.type}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <span>{notification.type === 'success' ? '✅' : '❌'}</span>
            {notification.message}
          </NotificationToast>
        )}
      </AnimatePresence>
    </ListContainer>
  );
};

export default PendingInterviewsList;
