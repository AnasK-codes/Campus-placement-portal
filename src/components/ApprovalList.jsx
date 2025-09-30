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
import { useAuth } from '../contexts/AuthContext';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .icon {
    font-size: 2rem;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  flex: 1;
  min-width: 200px;
  text-align: center;

  .number {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .label {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
`;

const FilterButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, active }) => active ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, active }) => active ? 'white' : theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-weight: 500;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme, active }) => active ? theme.colors.primary : 'rgba(211, 47, 47, 0.1)'};
  }
`;

const ApprovalGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ApprovalCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const UserEmail = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  font-size: 0.9rem;
`;

const RoleBadge = styled.div`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ role, theme }) => {
    switch (role) {
      case 'student': return 'rgba(33, 150, 243, 0.1)';
      case 'faculty': return 'rgba(76, 175, 80, 0.1)';
      case 'recruiter': return 'rgba(255, 152, 0, 0.1)';
      default: return theme.colors.surface;
    }
  }};
  color: ${({ role }) => {
    switch (role) {
      case 'student': return '#2196F3';
      case 'faculty': return '#4CAF50';
      case 'recruiter': return '#FF9800';
      default: return 'inherit';
    }
  }};
  border: 1px solid ${({ role }) => {
    switch (role) {
      case 'student': return '#2196F3';
      case 'faculty': return '#4CAF50';
      case 'recruiter': return '#FF9800';
      default: return 'transparent';
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const UserDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const DetailItem = styled.div`
  .label {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
  
  .value {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all ${({ theme }) => theme.transitions.fast};

  &.approve {
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #45a049, #3d8b40);
    }
  }

  &.reject {
    background: linear-gradient(135deg, #f44336, #d32f2f);
    color: white;

    &:hover {
      background: linear-gradient(135deg, #d32f2f, #c62828);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

const LoadingSpinner = styled(motion.div)`
  width: 50px;
  height: 50px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  margin: ${({ theme }) => theme.spacing.xxl} auto;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const NotificationToast = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${({ type, theme }) => 
    type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : theme.colors.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ApprovalList = ({ onApprovalUpdate }) => {
  const { currentUser } = useAuth();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processing, setProcessing] = useState({});
  const [notification, setNotification] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    faculty: 0,
    recruiters: 0
  });

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('approvalStatus', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const approvals = [];
      snapshot.forEach((doc) => {
        approvals.push({ id: doc.id, ...doc.data() });
      });

      setPendingApprovals(approvals);
      
      // Calculate stats
      const newStats = {
        total: approvals.length,
        students: approvals.filter(a => a.requestedRole === 'student').length,
        faculty: approvals.filter(a => a.requestedRole === 'faculty').length,
        recruiters: approvals.filter(a => a.requestedRole === 'recruiter').length
      };
      setStats(newStats);
      
      // Update parent component
      if (onApprovalUpdate) {
        onApprovalUpdate(newStats.total);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [onApprovalUpdate]);

  const handleApproval = async (userId, action) => {
    setProcessing(prev => ({ ...prev, [userId]: true }));
    
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        approvalStatus: action === 'approve' ? 'approved' : 'rejected',
        approvedAt: serverTimestamp(),
        approvedBy: currentUser.uid
      });

      // Show success notification
      setNotification({
        type: 'success',
        message: `User ${action === 'approve' ? 'approved' : 'rejected'} successfully!`
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);

    } catch (error) {
      console.error('Error updating approval status:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update approval status. Please try again.'
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setProcessing(prev => ({ ...prev, [userId]: false }));
    }
  };

  const filteredApprovals = pendingApprovals.filter(approval => {
    if (filter === 'all') return true;
    return approval.requestedRole === filter;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Header>
        <Title>
          <span className="icon">👥</span>
          Pending Approvals
        </Title>
      </Header>

      <StatsContainer>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="number">{stats.total}</div>
          <div className="label">Total Pending</div>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="number">{stats.students}</div>
          <div className="label">Students</div>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="number">{stats.faculty}</div>
          <div className="label">Faculty</div>
        </StatCard>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="number">{stats.recruiters}</div>
          <div className="label">Recruiters</div>
        </StatCard>
      </StatsContainer>

      <FilterSection>
        {['all', 'student', 'faculty', 'recruiter'].map((filterType) => (
          <FilterButton
            key={filterType}
            active={filter === filterType}
            onClick={() => setFilter(filterType)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filterType === 'all' ? 'All Requests' : `${filterType.charAt(0).toUpperCase() + filterType.slice(1)}s`}
          </FilterButton>
        ))}
      </FilterSection>

      <ApprovalGrid>
        <AnimatePresence>
          {filteredApprovals.length === 0 ? (
            <EmptyState>
              <div className="icon">✅</div>
              <h3>No Pending Approvals</h3>
              <p>All approval requests have been processed.</p>
            </EmptyState>
          ) : (
            filteredApprovals.map((approval, index) => (
              <ApprovalCard
                key={approval.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <CardHeader>
                  <UserInfo>
                    <UserName>{approval.name || 'Unknown User'}</UserName>
                    <UserEmail>{approval.email}</UserEmail>
                  </UserInfo>
                  <RoleBadge role={approval.requestedRole}>
                    {approval.requestedRole}
                  </RoleBadge>
                </CardHeader>

                <UserDetails>
                  <DetailItem>
                    <div className="label">Department</div>
                    <div className="value">{approval.department || 'Not specified'}</div>
                  </DetailItem>
                  <DetailItem>
                    <div className="label">Year</div>
                    <div className="value">{approval.year || 'Not specified'}</div>
                  </DetailItem>
                  <DetailItem>
                    <div className="label">Phone</div>
                    <div className="value">{approval.phone || 'Not provided'}</div>
                  </DetailItem>
                  <DetailItem>
                    <div className="label">Requested On</div>
                    <div className="value">{formatDate(approval.createdAt)}</div>
                  </DetailItem>
                </UserDetails>

                <ActionButtons>
                  <ActionButton
                    className="reject"
                    onClick={() => handleApproval(approval.id, 'reject')}
                    disabled={processing[approval.id]}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {processing[approval.id] ? '⏳' : '❌'} Reject
                  </ActionButton>
                  <ActionButton
                    className="approve"
                    onClick={() => handleApproval(approval.id, 'approve')}
                    disabled={processing[approval.id]}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {processing[approval.id] ? '⏳' : '✅'} Approve
                  </ActionButton>
                </ActionButtons>
              </ApprovalCard>
            ))
          )}
        </AnimatePresence>
      </ApprovalGrid>

      <AnimatePresence>
        {notification && (
          <NotificationToast
            type={notification.type}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
          >
            <span>{notification.type === 'success' ? '✅' : '❌'}</span>
            {notification.message}
          </NotificationToast>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default ApprovalList;
