import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import OfferConfirmationModal from './OfferConfirmationModal';
import OfferTimeline from './OfferTimeline';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(211, 47, 47, 0.3);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 20px rgba(211, 47, 47, 0.6);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.4);
  }
  50% {
    box-shadow: 0 0 25px rgba(76, 175, 80, 0.8);
  }
`;

const flash = keyframes`
  0%, 100% {
    border-color: ${({ theme }) => theme.colors.error};
  }
  50% {
    border-color: transparent;
  }
`;

const OffersContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const OffersHeader = styled.div`
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

  .offers-stats {
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

  @media (max-width: 768px) {
    .offers-stats {
      gap: ${({ theme }) => theme.spacing.md};
    }
  }
`;

const OffersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const OfferCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme, status, isUrgent }) => {
    if (status === 'accepted') return theme.colors.success;
    if (status === 'rejected') return theme.colors.error;
    if (isUrgent) return theme.colors.error;
    return theme.colors.border;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  ${({ status }) => status === 'accepted' && `
    animation: ${glow} 2s infinite;
  `}

  ${({ isUrgent, status }) => isUrgent && status === 'pending' && `
    animation: ${flash} 1s infinite;
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
        default: return theme.colors.gradient;
      }
    }};
  }
`;

const CompanyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .company-logo {
    width: 60px;
    height: 60px;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    background: ${({ theme }) => theme.colors.surface};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
  }

  .company-info {
    flex: 1;

    .company-name {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text};
      margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
    }

    .role-title {
      font-size: ${({ theme }) => theme.typography.fontSize.md};
      color: ${({ theme }) => theme.colors.primary};
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

    &.rejected {
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

const CountdownTimer = styled(motion.div)`
  background: ${({ theme, isUrgent }) => 
    isUrgent ? `${theme.colors.error}15` : `${theme.colors.primary}15`
  };
  border: 1px solid ${({ theme, isUrgent }) => 
    isUrgent ? theme.colors.error : theme.colors.primary
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;

  ${({ isUrgent }) => isUrgent && `
    animation: ${pulse} 1.5s infinite;
  `}

  .countdown-label {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .countdown-time {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme, isUrgent }) => 
      isUrgent ? theme.colors.error : theme.colors.primary
    };
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(motion.button)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all 0.3s ease;

  &.accept {
    background: ${({ theme }) => theme.colors.success};
    color: white;

    &:hover {
      background: ${({ theme }) => theme.colors.successDark};
      transform: translateY(-2px);
    }
  }

  &.reject {
    background: transparent;
    color: ${({ theme }) => theme.colors.error};
    border: 2px solid ${({ theme }) => theme.colors.error};

    &:hover {
      background: ${({ theme }) => theme.colors.error};
      color: white;
    }
  }

  &.view-timeline {
    background: ${({ theme }) => theme.colors.primary};
    color: white;

    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
      transform: translateY(-2px);
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

const OffersDashboard = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [actionType, setActionType] = useState(null); // 'accept' or 'reject'

  useEffect(() => {
    if (!currentUser) return;

    const offersQuery = query(
      collection(db, 'offers'),
      where('studentId', '==', currentUser.uid),
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

  const calculateTimeRemaining = (deadline) => {
    const now = new Date();
    const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
    const timeDiff = deadlineDate - now;

    if (timeDiff <= 0) return { expired: true };

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return {
      days,
      hours,
      minutes,
      isUrgent: timeDiff < 24 * 60 * 60 * 1000, // Less than 24 hours
      expired: false
    };
  };

  const handleOfferAction = (offer, action) => {
    setSelectedOffer(offer);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const confirmOfferAction = async () => {
    try {
      const offerRef = doc(db, 'offers', selectedOffer.id);
      await updateDoc(offerRef, {
        status: actionType,
        updatedAt: serverTimestamp(),
        [`${actionType}At`]: serverTimestamp()
      });

      // If accepting, reject all other pending offers for this student
      if (actionType === 'accepted') {
        const otherOffers = offers.filter(
          offer => offer.id !== selectedOffer.id && offer.status === 'pending'
        );
        
        const updatePromises = otherOffers.map(offer =>
          updateDoc(doc(db, 'offers', offer.id), {
            status: 'auto-rejected',
            updatedAt: serverTimestamp(),
            autoRejectedAt: serverTimestamp()
          })
        );
        
        await Promise.all(updatePromises);
      }

      addNotification({
        type: actionType === 'accepted' ? 'success' : 'info',
        title: `Offer ${actionType === 'accepted' ? 'Accepted' : 'Rejected'}!`,
        message: `You have ${actionType} the offer from ${selectedOffer.companyName}.`,
        duration: 5000
      });

      setShowConfirmModal(false);
      setSelectedOffer(null);
      setActionType(null);
    } catch (error) {
      console.error('Error updating offer:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update offer status. Please try again.',
        duration: 5000
      });
    }
  };

  const getOfferStats = () => {
    const pending = offers.filter(offer => offer.status === 'pending').length;
    const accepted = offers.filter(offer => offer.status === 'accepted').length;
    const rejected = offers.filter(offer => offer.status === 'rejected' || offer.status === 'auto-rejected').length;
    
    return { pending, accepted, rejected, total: offers.length };
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
      <OffersContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading your offers...</p>
        </div>
      </OffersContainer>
    );
  }

  return (
    <OffersContainer>
      <OffersHeader>
        <div className="header-content">
          <span className="header-icon">🎯</span>
          <div className="header-text">
            <h1 className="title">My Offers</h1>
            <p className="subtitle">Manage your internship offers and track deadlines</p>
          </div>
        </div>
        
        {offers.length > 0 && (
          <div className="offers-stats">
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
      </OffersHeader>

      <AnimatePresence>
        {offers.length === 0 ? (
          <EmptyState>
            <div className="empty-icon">📭</div>
            <h2 className="empty-title">No Offers Yet</h2>
            <p className="empty-description">
              Keep applying to internships! Your offers will appear here when companies 
              extend offers to you.
            </p>
          </EmptyState>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <OffersGrid>
              {offers.map((offer) => {
                const timeRemaining = calculateTimeRemaining(offer.deadline);
                
                return (
                  <OfferCard
                    key={offer.id}
                    variants={cardVariants}
                    status={offer.status}
                    isUrgent={timeRemaining.isUrgent && offer.status === 'pending'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <CompanyHeader>
                      <div className="company-logo">
                        {offer.companyLogo || '🏢'}
                      </div>
                      <div className="company-info">
                        <h3 className="company-name">{offer.companyName}</h3>
                        <p className="role-title">{offer.role}</p>
                      </div>
                      <div className={`status-badge ${offer.status}`}>
                        {offer.status}
                      </div>
                    </CompanyHeader>

                    <OfferDetails>
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
                      <div className="detail-row">
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{offer.location || 'Not specified'}</span>
                      </div>
                    </OfferDetails>

                    {offer.status === 'pending' && !timeRemaining.expired && (
                      <CountdownTimer isUrgent={timeRemaining.isUrgent}>
                        <div className="countdown-label">Time to Respond</div>
                        <div className="countdown-time">
                          {timeRemaining.days > 0 && `${timeRemaining.days}d `}
                          {timeRemaining.hours}h {timeRemaining.minutes}m
                        </div>
                      </CountdownTimer>
                    )}

                    <ActionButtons>
                      {offer.status === 'pending' && !timeRemaining.expired ? (
                        <>
                          <ActionButton
                            className="accept"
                            onClick={() => handleOfferAction(offer, 'accepted')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span>✓</span>
                            Accept Offer
                          </ActionButton>
                          <ActionButton
                            className="reject"
                            onClick={() => handleOfferAction(offer, 'rejected')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span>✗</span>
                            Reject Offer
                          </ActionButton>
                        </>
                      ) : (
                        <ActionButton
                          className="view-timeline"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setShowTimeline(true);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>📊</span>
                          View Timeline
                        </ActionButton>
                      )}
                    </ActionButtons>
                  </OfferCard>
                );
              })}
            </OffersGrid>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <OfferConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmOfferAction}
        offer={selectedOffer}
        actionType={actionType}
      />

      {/* Timeline Modal */}
      <AnimatePresence>
        {showTimeline && selectedOffer && (
          <OfferTimeline
            offer={selectedOffer}
            onClose={() => setShowTimeline(false)}
          />
        )}
      </AnimatePresence>
    </OffersContainer>
  );
};

export default OffersDashboard;
