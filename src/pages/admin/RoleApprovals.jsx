import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  db, 
  assignUserRole, 
  VALID_ROLES,
  updateUserDocument,
  getRoleApprovalRequests,
  updateRoleApprovalRequest
} from '../../firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

const AdminContainer = styled.div`
  min-height: calc(100vh - 70px);
  padding: ${({ theme }) => theme.spacing.xl} 0;
  background: ${({ theme }) => theme.colors.surface};
`;

const AdminContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;

  .icon {
    font-size: 2rem;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .value {
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

const FilterTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  overflow-x: auto;
  padding-bottom: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

const FilterTab = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, active }) => 
    active ? theme.colors.primary : theme.colors.background};
  color: ${({ theme, active }) => 
    active ? 'white' : theme.colors.text};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    ${({ active, theme }) => !active && `color: ${theme.colors.primary};`}
  }
`;

const RequestsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const RequestCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const RequestHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const UserInfo = styled.div`
  flex: 1;

  .name {
    font-size: 1.2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .email {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .requested-role {
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    background: rgba(211, 47, 47, 0.1);
    color: ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }
`;

const RequestMeta = styled.div`
  text-align: right;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 768px) {
    text-align: left;
  }

  .date {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .id {
    font-family: monospace;
    background: ${({ theme }) => theme.colors.surface};
    padding: ${({ theme }) => theme.spacing.xs};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
`;

const RequestDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const DetailGroup = styled.div`
  .label {
    font-size: 0.8rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-transform: uppercase;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .value {
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: stretch;
  }
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &.approve {
    background: #4caf50;
    color: white;
    border-color: #4caf50;

    &:hover {
      background: #45a049;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    }
  }

  &.reject {
    background: transparent;
    color: #f44336;
    border-color: #f44336;

    &:hover {
      background: #f44336;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
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

  .message {
    font-size: 1.1rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .submessage {
    font-size: 0.9rem;
  }
`;

const LoadingSpinner = styled(motion.div)`
  width: 40px;
  height: 40px;
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

const RoleApprovals = () => {
  const { currentUser, hasRole } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processingIds, setProcessingIds] = useState(new Set());

  // Check if user has permission to access this page
  const canAccess = hasRole([VALID_ROLES.PLACEMENT, VALID_ROLES.ADMIN]);

  useEffect(() => {
    if (!canAccess || !currentUser) return;

    // Create fake role approval requests
    const fakeRequests = [
      {
        id: 'req1',
        userId: 'user1',
        userEmail: 'john.doe@university.edu',
        requestedRole: VALID_ROLES.STUDENT,
        status: 'pending',
        createdAt: new Date('2024-09-28'),
        additionalInfo: {
          name: 'John Doe',
          studentId: 'CS2021001',
          department: 'Computer Science',
          year: '3rd Year'
        }
      },
      {
        id: 'req2',
        userId: 'user2',
        userEmail: 'jane.smith@university.edu',
        requestedRole: VALID_ROLES.STUDENT,
        status: 'pending',
        createdAt: new Date('2024-09-27'),
        additionalInfo: {
          name: 'Jane Smith',
          studentId: 'EC2021045',
          department: 'Electronics',
          year: '4th Year'
        }
      },
      {
        id: 'req3',
        userId: 'user3',
        userEmail: 'recruiter@techcorp.com',
        requestedRole: VALID_ROLES.RECRUITER,
        status: 'pending',
        createdAt: new Date('2024-09-26'),
        additionalInfo: {
          name: 'Sarah Johnson',
          company: 'TechCorp Solutions',
          position: 'HR Manager',
          companySize: '500+ employees'
        }
      },
      {
        id: 'req4',
        userId: 'user4',
        userEmail: 'dr.patel@university.edu',
        requestedRole: VALID_ROLES.FACULTY,
        status: 'pending',
        createdAt: new Date('2024-09-25'),
        additionalInfo: {
          name: 'Dr. Raj Patel',
          department: 'Computer Science',
          position: 'Assistant Professor',
          experience: '8 years'
        }
      },
      {
        id: 'req5',
        userId: 'user5',
        userEmail: 'alex.kumar@university.edu',
        requestedRole: VALID_ROLES.STUDENT,
        status: 'pending',
        createdAt: new Date('2024-09-24'),
        additionalInfo: {
          name: 'Alex Kumar',
          studentId: 'ME2021078',
          department: 'Mechanical Engineering',
          year: '2nd Year'
        }
      }
    ];

    // Simulate loading delay
    setTimeout(() => {
      setRequests(fakeRequests);
      setLoading(false);
    }, 1000);
  }, [canAccess, currentUser]);

  const handleApprove = async (requestId, userId, requestedRole) => {
    if (processingIds.has(requestId)) return;

    setProcessingIds(prev => new Set(prev).add(requestId));

    try {
      // Update role approval request status
      await updateRoleApprovalRequest(requestId, 'approved', currentUser.uid);
      
      // Assign role to user
      await assignUserRole({ uid: userId, role: requestedRole });
      
      // Update user document
      await updateUserDocument(userId, {
        role: requestedRole,
        approved: true,
        requestedRole: null,
        approvedAt: new Date(),
        approvedBy: currentUser.uid
      });
      
      // Refresh requests
      const requestsData = await getRoleApprovalRequests();
      setRequests(requestsData);
      
      console.log(`Approved ${userId} for role ${requestedRole}`);
      
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleReject = async (requestId, userId) => {
    if (processingIds.has(requestId)) return;

    setProcessingIds(prev => new Set(prev).add(requestId));

    try {
      // Update role approval request status
      await updateRoleApprovalRequest(requestId, 'rejected', currentUser.uid);
      
      // Refresh requests
      const requestsData = await getRoleApprovalRequests();
      setRequests(requestsData);
      
      console.log(`Rejected request ${requestId}`);
      
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const getFilteredRequests = () => {
    return requests.filter(request => {
      switch (filter) {
        case 'pending':
          return request.status === 'pending';
        case 'students':
          return request.requestedRole === VALID_ROLES.STUDENT;
        case 'recruiters':
          return request.requestedRole === VALID_ROLES.RECRUITER;
        case 'faculty':
          return request.requestedRole === VALID_ROLES.FACULTY;
        default:
          return true;
      }
    });
  };

  const getStats = () => {
    const pending = requests.filter(r => r.status === 'pending').length;
    const students = requests.filter(r => r.requestedRole === VALID_ROLES.STUDENT).length;
    const recruiters = requests.filter(r => r.requestedRole === VALID_ROLES.RECRUITER).length;
    const faculty = requests.filter(r => r.requestedRole === VALID_ROLES.FACULTY).length;

    return { pending, students, recruiters, faculty };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case VALID_ROLES.STUDENT: return '🎓';
      case VALID_ROLES.FACULTY: return '👨‍🏫';
      case VALID_ROLES.RECRUITER: return '🏢';
      case VALID_ROLES.PLACEMENT: return '📋';
      default: return '👤';
    }
  };

  if (!canAccess) {
    return (
      <AdminContainer>
        <AdminContent>
          <EmptyState>
            <div className="icon">🚫</div>
            <div className="message">Access Denied</div>
            <div className="submessage">You don't have permission to access this page.</div>
          </EmptyState>
        </AdminContent>
      </AdminContainer>
    );
  }

  const stats = getStats();
  const filteredRequests = getFilteredRequests();

  return (
    <AdminContainer>
      <AdminContent>
        <Header>
          <Title>
            Role <span>Approvals</span>
          </Title>
          <Subtitle>
            Review and approve user role requests for the campus placement portal
          </Subtitle>
        </Header>

        <StatsGrid>
          <StatCard whileHover={{ scale: 1.02 }}>
            <div className="icon">⏳</div>
            <div className="value">{stats.pending}</div>
            <div className="label">Pending Requests</div>
          </StatCard>
          <StatCard whileHover={{ scale: 1.02 }}>
            <div className="icon">🎓</div>
            <div className="value">{stats.students}</div>
            <div className="label">Student Requests</div>
          </StatCard>
          <StatCard whileHover={{ scale: 1.02 }}>
            <div className="icon">🏢</div>
            <div className="value">{stats.recruiters}</div>
            <div className="label">Recruiter Requests</div>
          </StatCard>
          <StatCard whileHover={{ scale: 1.02 }}>
            <div className="icon">👨‍🏫</div>
            <div className="value">{stats.faculty}</div>
            <div className="label">Faculty Requests</div>
          </StatCard>
        </StatsGrid>

        <FilterTabs>
          {[
            { key: 'pending', label: 'Pending', count: stats.pending },
            { key: 'students', label: 'Students', count: stats.students },
            { key: 'recruiters', label: 'Recruiters', count: stats.recruiters },
            { key: 'faculty', label: 'Faculty', count: stats.faculty }
          ].map(tab => (
            <FilterTab
              key={tab.key}
              active={filter === tab.key}
              onClick={() => setFilter(tab.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label} ({tab.count})
            </FilterTab>
          ))}
        </FilterTabs>

        {loading ? (
          <LoadingSpinner />
        ) : filteredRequests.length === 0 ? (
          <EmptyState>
            <div className="icon">📭</div>
            <div className="message">No requests found</div>
            <div className="submessage">
              {filter === 'pending' 
                ? 'All role requests have been processed'
                : `No ${filter} requests at this time`
              }
            </div>
          </EmptyState>
        ) : (
          <RequestsGrid>
            <AnimatePresence>
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RequestHeader>
                    <UserInfo>
                      <div className="name">{request.name || 'Unknown User'}</div>
                      <div className="email">{request.userEmail}</div>
                      {request.requestedRole && (
                        <div className="requested-role">
                          {getRoleIcon(request.requestedRole)} {request.requestedRole}
                        </div>
                      )}
                    </UserInfo>
                    <RequestMeta>
                      <div className="date">
                        {formatDate(request.createdAt)}
                      </div>
                      <div className="id">
                        {request.id.substring(0, 8)}...
                      </div>
                    </RequestMeta>
                  </RequestHeader>

                  <RequestDetails>
                    {request.department && (
                      <DetailGroup>
                        <div className="label">Department</div>
                        <div className="value">{request.department}</div>
                      </DetailGroup>
                    )}
                    {request.year && (
                      <DetailGroup>
                        <div className="label">Year</div>
                        <div className="value">{request.year}</div>
                      </DetailGroup>
                    )}
                    {request.rollNumber && (
                      <DetailGroup>
                        <div className="label">Roll Number</div>
                        <div className="value">{request.rollNumber}</div>
                      </DetailGroup>
                    )}
                    {request.phone && (
                      <DetailGroup>
                        <div className="label">Phone</div>
                        <div className="value">{request.phone}</div>
                      </DetailGroup>
                    )}
                  </RequestDetails>

                  {request.status === 'pending' && (
                    <ActionButtons>
                      <ActionButton
                        className="approve"
                        onClick={() => handleApprove(request.id, request.userId, request.requestedRole)}
                        disabled={processingIds.has(request.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {processingIds.has(request.id) ? '⏳' : '✅'} Approve
                      </ActionButton>
                      <ActionButton
                        className="reject"
                        onClick={() => handleReject(request.id, request.userId)}
                        disabled={processingIds.has(request.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {processingIds.has(request.id) ? '⏳' : '❌'} Reject
                      </ActionButton>
                    </ActionButtons>
                  )}
                </RequestCard>
              ))}
            </AnimatePresence>
          </RequestsGrid>
        )}
      </AdminContent>
    </AdminContainer>
  );
};

export default RoleApprovals;
