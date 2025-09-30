import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  onSnapshot,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
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

const RefreshButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AlertsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const AlertCard = styled(motion.div)`
  background: ${({ type }) => {
    switch (type) {
      case 'critical': return 'linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(211, 47, 47, 0.1))';
      case 'warning': return 'linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(245, 124, 0, 0.1))';
      case 'info': return 'linear-gradient(135deg, rgba(33, 150, 243, 0.1), rgba(30, 136, 229, 0.1))';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  border: 1px solid ${({ type }) => {
    switch (type) {
      case 'critical': return '#f44336';
      case 'warning': return '#FF9800';
      case 'info': return '#2196F3';
      default: return 'var(--border)';
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  .icon {
    font-size: 1.5rem;
  }

  .content {
    flex: 1;

    .title {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }

    .message {
      color: ${({ theme }) => theme.colors.textSecondary};
      font-size: 0.9rem;
    }
  }
`;

const SeatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SeatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ urgency }) => {
      switch (urgency) {
        case 'critical': return '#f44336';
        case 'warning': return '#FF9800';
        case 'good': return '#4CAF50';
        default: return '#2196F3';
      }
    }};
  }

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

const CompanyInfo = styled.div`
  flex: 1;

  .company-name {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .role-name {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .location {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const UrgencyBadge = styled.div`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ urgency }) => {
    switch (urgency) {
      case 'critical': return 'rgba(244, 67, 54, 0.1)';
      case 'warning': return 'rgba(255, 152, 0, 0.1)';
      case 'good': return 'rgba(76, 175, 80, 0.1)';
      default: return 'rgba(33, 150, 243, 0.1)';
    }
  }};
  color: ${({ urgency }) => {
    switch (urgency) {
      case 'critical': return '#f44336';
      case 'warning': return '#FF9800';
      case 'good': return '#4CAF50';
      default: return '#2196F3';
    }
  }};
  border: 1px solid ${({ urgency }) => {
    switch (urgency) {
      case 'critical': return '#f44336';
      case 'warning': return '#FF9800';
      case 'good': return '#4CAF50';
      default: return '#2196F3';
    }
  }};
`;

const SeatProgress = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.sm};

    .label {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
    }

    .numbers {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  background: ${({ urgency }) => {
    switch (urgency) {
      case 'critical': return 'linear-gradient(90deg, #f44336, #d32f2f)';
      case 'warning': return 'linear-gradient(90deg, #FF9800, #F57C00)';
      case 'good': return 'linear-gradient(90deg, #4CAF50, #388E3C)';
      default: return 'linear-gradient(90deg, #2196F3, #1976D2)';
    }
  }};
  border-radius: 4px;
`;

const SeatDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const DetailItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  .number {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .label {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

const SeatTracker = () => {
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Load internships
    const internshipsQuery = query(
      collection(db, 'internships'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeInternships = onSnapshot(internshipsQuery, (snapshot) => {
      const internshipsList = [];
      snapshot.forEach((doc) => {
        internshipsList.push({ id: doc.id, ...doc.data() });
      });
      setInternships(internshipsList);
    });

    // Load applications
    const applicationsQuery = query(
      collection(db, 'applications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeApplications = onSnapshot(applicationsQuery, (snapshot) => {
      const applicationsList = [];
      snapshot.forEach((doc) => {
        applicationsList.push({ id: doc.id, ...doc.data() });
      });
      setApplications(applicationsList);
      setLoading(false);
    });

    return () => {
      unsubscribeInternships();
      unsubscribeApplications();
    };
  }, []);

  useEffect(() => {
    // Generate alerts based on seat availability
    const newAlerts = [];
    
    internships.forEach(internship => {
      const acceptedApplications = applications.filter(
        app => app.internshipId === internship.id && app.status === 'offered'
      ).length;
      
      const availableSeats = parseInt(internship.seats) - acceptedApplications;
      const occupancyRate = (acceptedApplications / parseInt(internship.seats)) * 100;

      if (availableSeats <= 0) {
        newAlerts.push({
          id: `full-${internship.id}`,
          type: 'critical',
          icon: '🚨',
          title: 'Seats Full',
          message: `${internship.role} at ${internship.company} has no available seats remaining.`
        });
      } else if (availableSeats <= 2) {
        newAlerts.push({
          id: `low-${internship.id}`,
          type: 'warning',
          icon: '⚠️',
          title: 'Low Seat Availability',
          message: `${internship.role} at ${internship.company} has only ${availableSeats} seats remaining.`
        });
      } else if (occupancyRate >= 80) {
        newAlerts.push({
          id: `high-${internship.id}`,
          type: 'info',
          icon: '📊',
          title: 'High Demand',
          message: `${internship.role} at ${internship.company} is ${Math.round(occupancyRate)}% full.`
        });
      }
    });

    setAlerts(newAlerts);
  }, [internships, applications]);

  const getSeatData = (internship) => {
    const totalSeats = parseInt(internship.seats) || 0;
    const acceptedApplications = applications.filter(
      app => app.internshipId === internship.id && app.status === 'offered'
    ).length;
    const pendingApplications = applications.filter(
      app => app.internshipId === internship.id && ['pending', 'reviewed', 'interviewed'].includes(app.status)
    ).length;
    
    const availableSeats = totalSeats - acceptedApplications;
    const occupancyRate = totalSeats > 0 ? (acceptedApplications / totalSeats) * 100 : 0;

    let urgency = 'good';
    if (availableSeats <= 0) urgency = 'critical';
    else if (availableSeats <= 2 || occupancyRate >= 80) urgency = 'warning';

    return {
      totalSeats,
      acceptedApplications,
      pendingApplications,
      availableSeats,
      occupancyRate,
      urgency
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getUrgencyLabel = (urgency) => {
    switch (urgency) {
      case 'critical': return 'Full';
      case 'warning': return 'Low';
      case 'good': return 'Available';
      default: return 'Normal';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Header>
        <Title>
          <span className="icon">🪑</span>
          Seat Tracker
        </Title>
        <RefreshButton
          onClick={handleRefresh}
          disabled={refreshing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {refreshing ? '🔄' : '↻'} Refresh
        </RefreshButton>
      </Header>

      {alerts.length > 0 && (
        <AlertsSection>
          <AnimatePresence>
            {alerts.map((alert, index) => (
              <AlertCard
                key={alert.id}
                type={alert.type}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <span className="icon">{alert.icon}</span>
                <div className="content">
                  <div className="title">{alert.title}</div>
                  <div className="message">{alert.message}</div>
                </div>
              </AlertCard>
            ))}
          </AnimatePresence>
        </AlertsSection>
      )}

      <SeatGrid>
        {internships.length === 0 ? (
          <EmptyState>
            <div className="icon">🪑</div>
            <h3>No Active Internships</h3>
            <p>No internships are currently available for seat tracking.</p>
          </EmptyState>
        ) : (
          <AnimatePresence>
            {internships.map((internship, index) => {
              const seatData = getSeatData(internship);
              
              return (
                <SeatCard
                  key={internship.id}
                  urgency={seatData.urgency}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <CardHeader>
                    <CompanyInfo>
                      <div className="company-name">{internship.company}</div>
                      <div className="role-name">{internship.role}</div>
                      <div className="location">{internship.location || 'Location not specified'}</div>
                    </CompanyInfo>
                    <UrgencyBadge urgency={seatData.urgency}>
                      {getUrgencyLabel(seatData.urgency)}
                    </UrgencyBadge>
                  </CardHeader>

                  <SeatProgress>
                    <div className="progress-header">
                      <span className="label">Seat Occupancy</span>
                      <span className="numbers">
                        {seatData.acceptedApplications} / {seatData.totalSeats} seats
                      </span>
                    </div>
                    <ProgressBar>
                      <ProgressFill
                        urgency={seatData.urgency}
                        initial={{ width: 0 }}
                        animate={{ width: `${seatData.occupancyRate}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </ProgressBar>
                  </SeatProgress>

                  <SeatDetails>
                    <DetailItem>
                      <div className="number">{seatData.availableSeats}</div>
                      <div className="label">Available</div>
                    </DetailItem>
                    <DetailItem>
                      <div className="number">{seatData.acceptedApplications}</div>
                      <div className="label">Filled</div>
                    </DetailItem>
                    <DetailItem>
                      <div className="number">{seatData.pendingApplications}</div>
                      <div className="label">Pending</div>
                    </DetailItem>
                    <DetailItem>
                      <div className="number">{Math.round(seatData.occupancyRate)}%</div>
                      <div className="label">Occupancy</div>
                    </DetailItem>
                  </SeatDetails>

                  <ActionButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      // Navigate to internship details or applications
                      console.log('View details for:', internship.id);
                    }}
                  >
                    📋 View Applications
                  </ActionButton>
                </SeatCard>
              );
            })}
          </AnimatePresence>
        )}
      </SeatGrid>
    </Container>
  );
};

export default SeatTracker;
