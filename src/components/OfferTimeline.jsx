import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(211, 47, 47, 0.4);
  }
  50% {
    box-shadow: 0 0 20px rgba(211, 47, 47, 0.8);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const TimelineContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const TimelineHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  .timeline-icon {
    font-size: 2rem;
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: 50%;
    background: ${({ theme }) => `${theme.colors.primary}20`};
    color: ${({ theme }) => theme.colors.primary};
  }

  .timeline-title {
    flex: 1;

    h2 {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text};
      margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
    }

    p {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      color: ${({ theme }) => theme.colors.textSecondary};
      margin: 0;
    }
  }

  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: pointer;
    padding: ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    transition: all 0.3s ease;

    &:hover {
      background: ${({ theme }) => theme.colors.surface};
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

const TimelineBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const CompanySummary = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};

  .company-logo {
    width: 60px;
    height: 60px;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    background: ${({ theme }) => theme.colors.background};
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
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &.accepted {
      background: ${({ theme }) => theme.colors.success};
      color: white;
      animation: ${glow} 2s infinite;
    }

    &.rejected {
      background: ${({ theme }) => theme.colors.error};
      color: white;
    }

    &.pending {
      background: ${({ theme }) => theme.colors.warning};
      color: white;
      animation: ${pulse} 1.5s infinite;
    }
  }
`;

const TimelineTrack = styled.div`
  position: relative;
  padding-left: ${({ theme }) => theme.spacing.xl};

  &::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const TimelineStep = styled(motion.div)`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-left: ${({ theme }) => theme.spacing.xl};

  &:last-child {
    margin-bottom: 0;
  }
`;

const StepIndicator = styled(motion.div)`
  position: absolute;
  left: -30px;
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  border: 3px solid;
  background: ${({ theme }) => theme.colors.background};
  z-index: 1;

  ${({ status, theme }) => {
    switch (status) {
      case 'completed':
        return `
          border-color: ${theme.colors.success};
          color: ${theme.colors.success};
          background: ${theme.colors.success}20;
        `;
      case 'current':
        return `
          border-color: ${theme.colors.primary};
          color: ${theme.colors.primary};
          background: ${theme.colors.primary}20;
          animation: ${pulse} 1.5s infinite;
        `;
      case 'pending':
        return `
          border-color: ${theme.colors.border};
          color: ${theme.colors.textTertiary};
          background: ${theme.colors.surface};
        `;
      default:
        return `
          border-color: ${theme.colors.border};
          color: ${theme.colors.textTertiary};
          background: ${theme.colors.surface};
        `;
    }
  }}
`;

const StepContent = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme, status }) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'current':
        return theme.colors.primary;
      default:
        return theme.colors.border;
    }
  }};
  margin-top: ${({ theme }) => theme.spacing.sm};

  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${({ theme }) => theme.spacing.md};

    .step-title {
      font-size: ${({ theme }) => theme.typography.fontSize.md};
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
      color: ${({ theme }) => theme.colors.text};
      margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
    }

    .step-date {
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      color: ${({ theme }) => theme.colors.textSecondary};
      text-align: right;
    }
  }

  .step-description {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
    margin: 0;
  }

  .step-details {
    margin-top: ${({ theme }) => theme.spacing.md};
    padding-top: ${({ theme }) => theme.spacing.md};
    border-top: 1px solid ${({ theme }) => theme.colors.border};

    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: ${({ theme }) => theme.spacing.xs};

      &:last-child {
        margin-bottom: 0;
      }

      .detail-label {
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
        color: ${({ theme }) => theme.colors.textTertiary};
      }

      .detail-value {
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
        color: ${({ theme }) => theme.colors.text};
        font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
      }
    }
  }
`;

const OfferTimeline = ({ offer, onClose }) => {
  const getTimelineSteps = () => {
    const baseSteps = [
      {
        id: 'applied',
        title: 'Application Submitted',
        description: 'Your application has been submitted and is under review.',
        icon: '📝',
        status: 'completed',
        date: offer.appliedAt || offer.createdAt
      },
      {
        id: 'shortlisted',
        title: 'Application Shortlisted',
        description: 'Your application has been shortlisted for the next round.',
        icon: '✅',
        status: offer.shortlistedAt ? 'completed' : 'pending',
        date: offer.shortlistedAt
      },
      {
        id: 'interview',
        title: 'Interview Scheduled',
        description: 'Interview has been scheduled. Prepare well!',
        icon: '🎤',
        status: offer.interviewAt ? 'completed' : 'pending',
        date: offer.interviewAt,
        details: offer.interviewDetails
      },
      {
        id: 'offer',
        title: 'Offer Released',
        description: 'Congratulations! An offer has been extended to you.',
        icon: '🎯',
        status: 'completed',
        date: offer.createdAt,
        details: {
          stipend: offer.stipend,
          duration: offer.duration,
          location: offer.location
        }
      }
    ];

    // Add final step based on offer status
    if (offer.status === 'accepted') {
      baseSteps.push({
        id: 'accepted',
        title: 'Offer Accepted',
        description: 'You have successfully accepted this offer. Congratulations on your placement!',
        icon: '🎉',
        status: 'completed',
        date: offer.acceptedAt
      });
    } else if (offer.status === 'rejected') {
      baseSteps.push({
        id: 'rejected',
        title: 'Offer Rejected',
        description: 'You have declined this offer.',
        icon: '❌',
        status: 'completed',
        date: offer.rejectedAt
      });
    } else {
      baseSteps.push({
        id: 'decision',
        title: 'Decision Pending',
        description: 'Please review the offer and make your decision before the deadline.',
        icon: '⏰',
        status: 'current',
        date: null
      });
    }

    return baseSteps;
  };

  const formatDate = (date) => {
    if (!date) return null;
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const steps = getTimelineSteps();

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5
      }
    })
  };

  const indicatorVariants = {
    hidden: { scale: 0 },
    visible: (index) => ({
      scale: 1,
      transition: {
        delay: index * 0.1 + 0.2,
        type: "spring",
        stiffness: 300
      }
    })
  };

  return (
    <ModalOverlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <TimelineContainer
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <TimelineHeader>
          <div className="timeline-icon">📊</div>
          <div className="timeline-title">
            <h2>Application Timeline</h2>
            <p>Track your application progress</p>
          </div>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </TimelineHeader>

        <TimelineBody>
          <CompanySummary>
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
          </CompanySummary>

          <TimelineTrack>
            {steps.map((step, index) => (
              <TimelineStep
                key={step.id}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <StepIndicator
                  status={step.status}
                  variants={indicatorVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  {step.icon}
                </StepIndicator>

                <StepContent status={step.status}>
                  <div className="step-header">
                    <div>
                      <h4 className="step-title">{step.title}</h4>
                    </div>
                    {step.date && (
                      <div className="step-date">
                        {formatDate(step.date)}
                      </div>
                    )}
                  </div>

                  <p className="step-description">{step.description}</p>

                  {step.details && (
                    <div className="step-details">
                      {typeof step.details === 'object' ? (
                        Object.entries(step.details).map(([key, value]) => (
                          <div key={key} className="detail-row">
                            <span className="detail-label">
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </span>
                            <span className="detail-value">
                              {key === 'stipend' && value 
                                ? `₹${value.toLocaleString()}` 
                                : value || 'Not specified'
                              }
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="detail-row">
                          <span className="detail-value">{step.details}</span>
                        </div>
                      )}
                    </div>
                  )}
                </StepContent>
              </TimelineStep>
            ))}
          </TimelineTrack>
        </TimelineBody>
      </TimelineContainer>
    </ModalOverlay>
  );
};

export default OfferTimeline;
