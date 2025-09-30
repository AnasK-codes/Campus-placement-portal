import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const confettiAnimation = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
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

const ModalContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  .modal-icon {
    font-size: 2rem;
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: 50%;
    background: ${({ actionType, theme }) => 
      actionType === 'accepted' 
        ? `${theme.colors.success}20` 
        : `${theme.colors.error}20`
    };
    color: ${({ actionType, theme }) => 
      actionType === 'accepted' 
        ? theme.colors.success 
        : theme.colors.error
    };
  }

  .modal-title {
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

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const OfferSummary = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};

  .company-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.lg};

    .company-logo {
      width: 50px;
      height: 50px;
      border-radius: ${({ theme }) => theme.borderRadius.md};
      background: ${({ theme }) => theme.colors.background};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      border: 1px solid ${({ theme }) => theme.colors.border};
    }

    .company-info {
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
  }

  .offer-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};

    .detail-item {
      text-align: center;

      .detail-label {
        font-size: ${({ theme }) => theme.typography.fontSize.xs};
        color: ${({ theme }) => theme.colors.textSecondary};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: ${({ theme }) => theme.spacing.xs};
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
  }
`;

const WarningMessage = styled.div`
  background: ${({ actionType, theme }) => 
    actionType === 'accepted' 
      ? `${theme.colors.warning}15` 
      : `${theme.colors.info}15`
  };
  border: 1px solid ${({ actionType, theme }) => 
    actionType === 'accepted' 
      ? theme.colors.warning 
      : theme.colors.info
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};

  .warning-icon {
    font-size: 1.2rem;
    color: ${({ actionType, theme }) => 
      actionType === 'accepted' 
        ? theme.colors.warning 
        : theme.colors.info
    };
    margin-top: 2px;
  }

  .warning-content {
    flex: 1;

    .warning-title {
      font-size: ${({ theme }) => theme.typography.fontSize.md};
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
      color: ${({ theme }) => theme.colors.text};
      margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
    }

    .warning-text {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      color: ${({ theme }) => theme.colors.textSecondary};
      margin: 0;
      line-height: 1.5;
    }
  }
`;

const ModalActions = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all 0.3s ease;
  min-width: 120px;
  justify-content: center;

  &.primary {
    background: ${({ actionType, theme }) => 
      actionType === 'accepted' 
        ? theme.colors.success 
        : theme.colors.error
    };
    color: white;

    &:hover {
      background: ${({ actionType, theme }) => 
        actionType === 'accepted' 
          ? theme.colors.successDark 
          : theme.colors.errorDark
      };
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
  }

  &.secondary {
    background: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};
    border: 2px solid ${({ theme }) => theme.colors.border};

    &:hover {
      background: ${({ theme }) => theme.colors.surface};
      color: ${({ theme }) => theme.colors.text};
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CelebrationOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1001;
`;

const ConfettiPiece = styled(motion.div)`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${({ color }) => color};
  border-radius: 2px;
`;

const OfferConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  offer, 
  actionType 
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    
    try {
      await onConfirm();
      
      if (actionType === 'accepted') {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } catch (error) {
      console.error('Error confirming action:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const getModalContent = () => {
    if (actionType === 'accepted') {
      return {
        icon: '🎉',
        title: 'Accept Offer',
        subtitle: 'Congratulations on your offer!',
        warningTitle: 'Important Notice',
        warningText: 'By accepting this offer, all your other pending offers will be automatically rejected. This action cannot be undone.',
        confirmText: 'Yes, Accept Offer',
        confirmIcon: '✓'
      };
    } else {
      return {
        icon: '❌',
        title: 'Reject Offer',
        subtitle: 'Are you sure you want to reject this offer?',
        warningTitle: 'Please Note',
        warningText: 'Once you reject this offer, you cannot change your decision. Make sure you have considered all aspects before proceeding.',
        confirmText: 'Yes, Reject Offer',
        confirmIcon: '✗'
      };
    }
  };

  const content = getModalContent();

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

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  if (!isOpen || !offer) return null;

  return (
    <>
      <AnimatePresence>
        <ModalOverlay
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <ModalContainer
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalHeader actionType={actionType}>
              <div className="modal-icon">{content.icon}</div>
              <div className="modal-title">
                <h2>{content.title}</h2>
                <p>{content.subtitle}</p>
              </div>
              <button className="close-button" onClick={onClose}>
                ×
              </button>
            </ModalHeader>

            <ModalBody>
              <OfferSummary>
                <div className="company-header">
                  <div className="company-logo">
                    {offer.companyLogo || '🏢'}
                  </div>
                  <div className="company-info">
                    <h3 className="company-name">{offer.companyName}</h3>
                    <p className="role-title">{offer.role}</p>
                  </div>
                </div>

                <div className="offer-details">
                  <div className="detail-item">
                    <div className="detail-label">Stipend</div>
                    <div className="detail-value highlight">
                      ₹{offer.stipend?.toLocaleString() || 'Not specified'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Duration</div>
                    <div className="detail-value">
                      {offer.duration || 'Not specified'}
                    </div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Location</div>
                    <div className="detail-value">
                      {offer.location || 'Not specified'}
                    </div>
                  </div>
                </div>
              </OfferSummary>

              <WarningMessage actionType={actionType}>
                <div className="warning-icon">
                  {actionType === 'accepted' ? '⚠️' : 'ℹ️'}
                </div>
                <div className="warning-content">
                  <h4 className="warning-title">{content.warningTitle}</h4>
                  <p className="warning-text">{content.warningText}</p>
                </div>
              </WarningMessage>
            </ModalBody>

            <ModalActions>
              <ActionButton
                className="secondary"
                onClick={onClose}
                disabled={isConfirming}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </ActionButton>
              <ActionButton
                className="primary"
                actionType={actionType}
                onClick={handleConfirm}
                disabled={isConfirming}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isConfirming ? (
                  <>
                    <span>⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>{content.confirmIcon}</span>
                    {content.confirmText}
                  </>
                )}
              </ActionButton>
            </ModalActions>
          </ModalContainer>
        </ModalOverlay>
      </AnimatePresence>

      {/* Celebration Confetti */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationOverlay>
            {[...Array(50)].map((_, i) => (
              <ConfettiPiece
                key={i}
                color={['#D32F2F', '#FF5722', '#FFC107', '#4CAF50', '#2196F3'][i % 5]}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                  scale: 1
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                  scale: [1, 1.2, 0.8, 1]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.02,
                  ease: "easeOut"
                }}
              />
            ))}
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default OfferConfirmationModal;
