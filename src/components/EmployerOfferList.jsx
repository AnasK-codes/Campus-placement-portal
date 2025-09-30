import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
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

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
`;

const EmployerContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const EmployerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  .header-content {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};

    .header-icon {
      font-size: 2.5rem;
    }

    .header-text {
      .title {
        font-size: ${({ theme }) => theme.typography.fontSize.xxl};
        font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
        color: ${({ theme }) => theme.colors.text};
        margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
      }

      .subtitle {
        font-size: ${({ theme }) => theme.typography.fontSize.md};
        color: ${({ theme }) => theme.colors.textSecondary};
        margin: 0;
      }
    }
  }

  .header-stats {
    display: flex;
    gap: ${({ theme }) => theme.spacing.lg};

    .stat {
      text-align: center;

      .stat-number {
        display: block;
        font-size: ${({ theme }) => theme.typography.fontSize.xl};
        font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
        color: ${({ theme }) => theme.colors.primary};
      }

      .stat-label {
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
        color: ${({ theme }) => theme.colors.textSecondary};
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }
`;

const FiltersSection = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;

  .filter-label {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
  }

  .filter-buttons {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
    flex-wrap: wrap;
  }
`;

const FilterButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, active }) => 
    active ? theme.colors.primary : theme.colors.border
  };
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, active }) => 
    active ? theme.colors.primary : 'transparent'
  };
  color: ${({ theme, active }) => 
    active ? 'white' : theme.colors.text
  };
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme, active }) => 
      active ? theme.colors.primaryDark : theme.colors.surface
    };
  }
`;

const OffersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const OfferCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme, status }) => {
    switch (status) {
      case 'accepted': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      case 'auto-rejected': return theme.colors.error;
      default: return theme.colors.border;
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  ${({ status }) => status === 'pending' && `
    animation: ${pulse} 2s infinite;
  `}

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme, status }) => {
      switch (status) {
        case 'accepted': return theme.colors.success;
        case 'rejected': return theme.colors.error;
        case 'auto-rejected': return theme.colors.error;
        default: return theme.colors.primary;
      }
    }};
  }
`;

const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .student-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.surface};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    border: 2px solid ${({ theme }) => theme.colors.border};
  }

  .student-details {
    flex: 1;

    .student-name {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text};
      margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
    }

    .student-info-text {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      color: ${({ theme }) => theme.colors.textSecondary};
      margin: 0;
    }
  }

  .status-badge {
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &.pending {
      background: ${({ theme }) => `${theme.colors.warning}20`};
      color: ${({ theme }) => theme.colors.warning};
    }

    &.accepted {
      background: ${({ theme }) => `${theme.colors.success}20`};
      color: ${({ theme }) => theme.colors.success};
    }

    &.rejected, &.auto-rejected {
      background: ${({ theme }) => `${theme.colors.error}20`};
      color: ${({ theme }) => theme.colors.error};
    }
  }
`;

const OfferDetails = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.sm};

    .detail-label {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      color: ${({ theme }) => theme.colors.textSecondary};
    }

    .detail-value {
      font-size: ${({ theme }) => theme.typography.fontSize.md};
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
      color: ${({ theme }) => theme.colors.text};

      &.highlight {
        color: ${({ theme }) => theme.colors.primary};
      }
    }
  }
`;

const TimelineInfo = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};

  .timeline-title {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .timeline-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.xs};

    &:last-child {
      margin-bottom: 0;
    }

    .timeline-label {
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      color: ${({ theme }) => theme.colors.textSecondary};
    }

    .timeline-date {
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      color: ${({ theme }) => theme.colors.text};
      font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(motion.button)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all 0.3s ease;

  &.primary {
    background: ${({ theme }) => theme.colors.primary};
    color: white;

    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
      transform: translateY(-2px);
    }
  }

  &.secondary {
    background: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};
    border: 1px solid ${({ theme }) => theme.colors.border};

    &:hover {
      background: ${({ theme }) => theme.colors.surface};
      color: ${({ theme }) => theme.colors.text};
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxxl};
  color: ${({ theme }) => theme.colors.textSecondary};

  .empty-icon {
    font-size: 4rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    opacity: 0.5;
  }

  .empty-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .empty-description {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const EmployerOfferList = () => {
  const { currentUser } = useAuth();
  
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!currentUser) return;

    // In a real implementation, you would filter by employer/company ID
    // For now, we'll show all offers for demonstration
    const offersQuery = query(
      collection(db, 'offers'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(offersQuery, (snapshot) => {
      const offersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOffers(offersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    let filtered = offers;
    
    if (statusFilter !== 'all') {
      filtered = offers.filter(offer => offer.status === statusFilter);
    }
    
    setFilteredOffers(filtered);
  }, [offers, statusFilter]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOfferStats = () => {
    const total = offers.length;
    const pending = offers.filter(offer => offer.status === 'pending').length;
    const accepted = offers.filter(offer => offer.status === 'accepted').length;
    const rejected = offers.filter(offer => 
      offer.status === 'rejected' || offer.status === 'auto-rejected'
    ).length;
    
    return { total, pending, accepted, rejected };
  };

  const handleViewProfile = (studentId) => {
    // Navigate to student profile
    console.log('View profile for student:', studentId);
  };

  const handleSendMessage = (studentId) => {
    // Open messaging interface
    console.log('Send message to student:', studentId);
  };

  const stats = getOfferStats();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  if (loading) {
    return (
      <EmployerContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏢</div>
          <p>Loading your offers...</p>
        </div>
      </EmployerContainer>
    );
  }

  return (
    <EmployerContainer>
      <EmployerHeader>
        <div className="header-content">
          <span className="header-icon">🏢</span>
          <div className="header-text">
            <h1 className="title">My Offers</h1>
            <p className="subtitle">Track student responses to your internship offers</p>
          </div>
        </div>
        
        {offers.length > 0 && (
          <div className="header-stats">
            <div className="stat">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat">
              <span className="stat-number">{stats.accepted}</span>
              <span className="stat-label">Accepted</span>
            </div>
          </div>
        )}
      </EmployerHeader>

      {offers.length > 0 && (
        <FiltersSection>
          <span className="filter-label">Filter by Status:</span>
          <div className="filter-buttons">
            {[
              { key: 'all', label: 'All Offers' },
              { key: 'pending', label: 'Pending' },
              { key: 'accepted', label: 'Accepted' },
              { key: 'rejected', label: 'Rejected' }
            ].map((filter) => (
              <FilterButton
                key={filter.key}
                active={statusFilter === filter.key}
                onClick={() => setStatusFilter(filter.key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {filter.label}
              </FilterButton>
            ))}
          </div>
        </FiltersSection>
      )}

      <AnimatePresence>
        {filteredOffers.length === 0 ? (
          <EmptyState>
            <div className="empty-icon">📭</div>
            <h2 className="empty-title">
              {statusFilter === 'all' ? 'No Offers Yet' : `No ${statusFilter} Offers`}
            </h2>
            <p className="empty-description">
              {statusFilter === 'all' 
                ? 'Start extending offers to qualified students and track their responses here.'
                : `No offers with ${statusFilter} status found. Try adjusting your filter.`
              }
            </p>
          </EmptyState>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <OffersGrid>
              {filteredOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  variants={cardVariants}
                  status={offer.status}
                  whileHover={{ scale: 1.02 }}
                >
                  <StudentInfo>
                    <div className="student-avatar">
                      {offer.studentName?.charAt(0) || '👤'}
                    </div>
                    <div className="student-details">
                      <h3 className="student-name">
                        {offer.studentName || 'Student Name'}
                      </h3>
                      <p className="student-info-text">
                        {offer.studentDepartment || 'Department'} • {offer.studentYear || 'Year'}
                      </p>
                    </div>
                    <div className={`status-badge ${offer.status}`}>
                      {offer.status === 'auto-rejected' ? 'rejected' : offer.status}
                    </div>
                  </StudentInfo>

                  <OfferDetails>
                    <div className="detail-row">
                      <span className="detail-label">Role</span>
                      <span className="detail-value">{offer.role}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Stipend</span>
                      <span className="detail-value highlight">
                        ₹{offer.stipend?.toLocaleString() || 'Not specified'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Duration</span>
                      <span className="detail-value">{offer.duration || 'Not specified'}</span>
                    </div>
                  </OfferDetails>

                  <TimelineInfo>
                    <div className="timeline-title">Timeline</div>
                    <div className="timeline-item">
                      <span className="timeline-label">Offer Sent:</span>
                      <span className="timeline-date">{formatDate(offer.createdAt)}</span>
                    </div>
                    {offer.status !== 'pending' && (
                      <div className="timeline-item">
                        <span className="timeline-label">Response:</span>
                        <span className="timeline-date">
                          {formatDate(offer[`${offer.status}At`])}
                        </span>
                      </div>
                    )}
                    <div className="timeline-item">
                      <span className="timeline-label">Deadline:</span>
                      <span className="timeline-date">{formatDate(offer.deadline)}</span>
                    </div>
                  </TimelineInfo>

                  <ActionButtons>
                    <ActionButton
                      className="secondary"
                      onClick={() => handleViewProfile(offer.studentId)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>👤</span>
                      View Profile
                    </ActionButton>
                    <ActionButton
                      className="primary"
                      onClick={() => handleSendMessage(offer.studentId)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>💬</span>
                      Message
                    </ActionButton>
                  </ActionButtons>
                </OfferCard>
              ))}
            </OffersGrid>
          </motion.div>
        )}
      </AnimatePresence>
    </EmployerContainer>
  );
};

export default EmployerOfferList;
