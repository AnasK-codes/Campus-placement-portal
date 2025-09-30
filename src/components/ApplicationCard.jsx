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
  deleteDoc 
} from 'firebase/firestore';
import { db } from '../firebase';

const ApplicationsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const Header = styled.div`
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
`;

const FilterTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-x: auto;
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const FilterTab = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, active }) => active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.background};
  color: ${({ theme, active }) => active ? 'white' : theme.colors.text};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    ${({ active, theme }) => !active && `color: ${theme.colors.primary};`}
  }
`;

const ApplicationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ApplicationItem = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ApplicationHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const ApplicationInfo = styled.div`
  flex: 1;

  .company {
    font-size: 1.3rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .role {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;

    .meta-item {
      display: flex;
      align-items: center;
      gap: ${({ theme }) => theme.spacing.xs};
    }
  }
`;

const StatusBadge = styled.div`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'pending': return 'rgba(255, 193, 7, 0.1)';
      case 'reviewing': return 'rgba(33, 150, 243, 0.1)';
      case 'interview': return 'rgba(156, 39, 176, 0.1)';
      case 'offered': return 'rgba(76, 175, 80, 0.1)';
      case 'rejected': return 'rgba(244, 67, 54, 0.1)';
      case 'withdrawn': return 'rgba(158, 158, 158, 0.1)';
      default: return theme.colors.surface;
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'pending': return '#FF8F00';
      case 'reviewing': return '#1976D2';
      case 'interview': return '#7B1FA2';
      case 'offered': return '#388E3C';
      case 'rejected': return '#D32F2F';
      case 'withdrawn': return '#616161';
      default: return '#666';
    }
  }};
`;

const Timeline = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
`;

const TimelineTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TimelineTrack = styled.div`
  position: relative;
  padding-left: ${({ theme }) => theme.spacing.xl};

  &::before {
    content: '';
    position: absolute;
    left: 10px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const TimelineStep = styled(motion.div)`
  position: relative;
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  
  &:last-child {
    padding-bottom: 0;
  }

  .step-marker {
    position: absolute;
    left: -${({ theme }) => theme.spacing.xl};
    top: 4px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ active, completed, theme }) => {
      if (completed) return theme.colors.primary;
      if (active) return '#FF9800';
      return theme.colors.border;
    }};
    border: 3px solid ${({ theme }) => theme.colors.background};
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: white;
  }

  .step-content {
    .step-title {
      font-weight: 600;
      color: ${({ active, completed, theme }) => {
        if (completed || active) return theme.colors.text;
        return theme.colors.textSecondary;
      }};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }

    .step-date {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }

    .step-description {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      line-height: 1.4;
    }
  }
`;

const ActionButtons = styled.div`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
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

  &.primary {
    background: ${({ theme }) => theme.colors.gradient};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
    }
  }

  &.secondary {
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.border};

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  &.danger {
    background: transparent;
    color: #f44336;
    border-color: #f44336;

    &:hover {
      background: #f44336;
      color: white;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    flex: 1;
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
    font-size: 1.2rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .submessage {
    font-size: 1rem;
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

const ApplicationCard = ({ studentId, loading }) => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loadingApplications, setLoadingApplications] = useState(true);

  const statusFilters = [
    { key: 'all', label: 'All Applications', count: applications.length },
    { key: 'pending', label: 'Pending', count: applications.filter(app => app.status === 'pending').length },
    { key: 'reviewing', label: 'Under Review', count: applications.filter(app => app.status === 'reviewing').length },
    { key: 'interview', label: 'Interview', count: applications.filter(app => app.status === 'interview').length },
    { key: 'offered', label: 'Offered', count: applications.filter(app => app.status === 'offered').length },
    { key: 'rejected', label: 'Rejected', count: applications.filter(app => app.status === 'rejected').length }
  ];

  const timelineSteps = [
    { key: 'applied', title: 'Application Submitted', icon: '📝' },
    { key: 'reviewing', title: 'Under Review', icon: '👀' },
    { key: 'interview', title: 'Interview Scheduled', icon: '🎤' },
    { key: 'decision', title: 'Final Decision', icon: '✅' }
  ];

  useEffect(() => {
    if (!studentId) return;

    const q = query(
      collection(db, 'applications'),
      where('studentId', '==', studentId),
      orderBy('appliedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const applicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApplications(applicationsData);
      setLoadingApplications(false);
    });

    return unsubscribe;
  }, [studentId]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter(app => app.status === activeFilter));
    }
  }, [applications, activeFilter]);

  const handleWithdrawApplication = async (applicationId) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status: 'withdrawn',
        withdrawnAt: new Date()
      });
    } catch (error) {
      console.error('Error withdrawing application:', error);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: 'Pending Review',
      reviewing: 'Under Review',
      interview: 'Interview Scheduled',
      offered: 'Offer Received',
      rejected: 'Not Selected',
      withdrawn: 'Withdrawn'
    };
    return statusMap[status] || status;
  };

  const getTimelineProgress = (status) => {
    const statusOrder = ['pending', 'reviewing', 'interview', 'offered'];
    const currentIndex = statusOrder.indexOf(status);
    
    return timelineSteps.map((step, index) => {
      if (status === 'rejected' || status === 'withdrawn') {
        return {
          ...step,
          completed: index === 0,
          active: false
        };
      }
      
      return {
        ...step,
        completed: index < currentIndex,
        active: index === currentIndex
      };
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading || loadingApplications) {
    return (
      <ApplicationsContainer>
        <LoadingSpinner />
      </ApplicationsContainer>
    );
  }

  return (
    <ApplicationsContainer>
      <Header>
        <Title>
          <span className="icon">📋</span>
          My Applications
        </Title>
        <FilterTabs>
          {statusFilters.map((filter) => (
            <FilterTab
              key={filter.key}
              active={activeFilter === filter.key}
              onClick={() => setActiveFilter(filter.key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.label} ({filter.count})
            </FilterTab>
          ))}
        </FilterTabs>
      </Header>

      {filteredApplications.length === 0 ? (
        <EmptyState>
          <div className="icon">📭</div>
          <div className="message">
            {activeFilter === 'all' ? 'No applications yet' : `No ${activeFilter} applications`}
          </div>
          <div className="submessage">
            {activeFilter === 'all' 
              ? 'Start applying to internships to see them here'
              : 'Applications matching this filter will appear here'
            }
          </div>
        </EmptyState>
      ) : (
        <ApplicationsList>
          <AnimatePresence>
            {filteredApplications.map((application, index) => (
              <ApplicationItem
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ApplicationHeader>
                  <ApplicationInfo>
                    <div className="company">{application.company || 'Company Name'}</div>
                    <div className="role">{application.role || 'Position Title'}</div>
                    <div className="meta">
                      <div className="meta-item">
                        <span>📅</span>
                        <span>Applied: {formatDate(application.appliedAt)}</span>
                      </div>
                      <div className="meta-item">
                        <span>💰</span>
                        <span>Stipend: ₹{application.stipend || 'Not specified'}</span>
                      </div>
                      <div className="meta-item">
                        <span>📍</span>
                        <span>{application.location || 'Remote'}</span>
                      </div>
                    </div>
                  </ApplicationInfo>
                  <StatusBadge status={application.status}>
                    {getStatusDisplay(application.status)}
                  </StatusBadge>
                </ApplicationHeader>

                <Timeline>
                  <TimelineTitle>
                    🗓️ Application Timeline
                  </TimelineTitle>
                  <TimelineTrack>
                    {getTimelineProgress(application.status).map((step, stepIndex) => (
                      <TimelineStep
                        key={step.key}
                        completed={step.completed}
                        active={step.active}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: stepIndex * 0.1 }}
                      >
                        <div className="step-marker">
                          {step.completed ? '✓' : step.active ? '●' : '○'}
                        </div>
                        <div className="step-content">
                          <div className="step-title">{step.title}</div>
                          <div className="step-date">
                            {step.completed || step.active ? formatDate(application.appliedAt) : 'Pending'}
                          </div>
                          {step.active && (
                            <div className="step-description">
                              Your application is currently at this stage
                            </div>
                          )}
                        </div>
                      </TimelineStep>
                    ))}
                  </TimelineTrack>
                </Timeline>

                <ActionButtons>
                  <ActionButton
                    className="secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Details
                  </ActionButton>
                  {(application.status === 'pending' || application.status === 'reviewing') && (
                    <ActionButton
                      className="danger"
                      onClick={() => handleWithdrawApplication(application.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Withdraw
                    </ActionButton>
                  )}
                </ActionButtons>
              </ApplicationItem>
            ))}
          </AnimatePresence>
        </ApplicationsList>
      )}
    </ApplicationsContainer>
  );
};

export default ApplicationCard;
