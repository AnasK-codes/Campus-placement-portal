import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase';

const shine = keyframes`
  0% { transform: translateX(-100%) rotate(35deg); }
  100% { transform: translateX(100%) rotate(35deg); }
`;

const CardContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
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
    background: linear-gradient(90deg, #FFD700, #FFA500);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    animation: ${shine} 3s infinite;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
`;

const CertificateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CertificateInfo = styled.div`
  flex: 1;
  min-width: 200px;
`;

const CertificateTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .certificate-icon {
    width: 50px;
    height: 50px;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background: linear-gradient(135deg, #FFD700, #FFA500);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

const CertificateDetails = styled.div`
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
      min-width: 100px;
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
      case 'generated': return 'rgba(76, 175, 80, 0.1)';
      case 'generating': return 'rgba(255, 152, 0, 0.1)';
      case 'failed': return 'rgba(244, 67, 54, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'generated': return '#4CAF50';
      case 'generating': return '#FF9800';
      case 'failed': return '#f44336';
      default: return '#9E9E9E';
    }
  }};
  border: 1px solid ${({ status }) => {
    switch (status) {
      case 'generated': return '#4CAF50';
      case 'generating': return '#FF9800';
      case 'failed': return '#f44336';
      default: return '#9E9E9E';
    }
  }};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  .icon {
    font-size: 1rem;
  }

  ${({ status }) => status === 'generating' && `
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }
  `}
`;

const CertificatePreview = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700);
    z-index: -1;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    opacity: 0.3;
  }

  .preview-header {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .preview-content {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.6;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  .preview-signature {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: ${({ theme }) => theme.spacing.xl};
    padding-top: ${({ theme }) => theme.spacing.lg};
    border-top: 1px solid ${({ theme }) => theme.colors.border};

    .signature-item {
      text-align: center;
      
      .signature-line {
        width: 120px;
        height: 1px;
        background: ${({ theme }) => theme.colors.border};
        margin-bottom: ${({ theme }) => theme.spacing.sm};
      }
      
      .signature-label {
        font-size: 0.8rem;
        color: ${({ theme }) => theme.colors.textSecondary};
      }
    }
  }
`;

const FeedbackSummary = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .summary-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
  }

  .ratings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .rating-item {
    text-align: center;
    
    .rating-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.primary};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
      display: flex;
      align-items: center;
      justify-content: center;
      gap: ${({ theme }) => theme.spacing.xs};
    }
    
    .rating-label {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }

  .feedback-text {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
    font-style: italic;
    padding: ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.colors.background};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border-left: 4px solid ${({ theme }) => theme.colors.primary};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const DownloadButton = styled(motion.button)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .icon {
    font-size: 1.1rem;
  }
`;

const ShareButton = styled(motion.button)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  .icon {
    font-size: 1.1rem;
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

  .icon {
    font-size: 1.2rem;
  }
`;

const AIMascotTooltip = styled(motion.div)`
  position: absolute;
  top: -60px;
  right: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: ${({ theme }) => theme.shadows.md};
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    right: 20px;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid #667eea;
  }
`;

const EnhancedCertificateCard = ({ certificate, index, showAITooltip = false }) => {
  const [downloading, setDownloading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);
  const [showTooltip, setShowTooltip] = useState(showAITooltip);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = async () => {
    if (downloading || !certificate.certificateURL) return;

    setDownloading(true);
    try {
      // Get download URL from Firebase Storage
      const downloadUrl = await getDownloadURL(ref(storage, certificate.certificateURL));
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${certificate.studentName}_${certificate.internshipTitle}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowNotification({ type: 'success', message: 'Certificate downloaded successfully!' });
      setTimeout(() => setShowNotification(null), 3000);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      setShowNotification({ type: 'error', message: 'Failed to download certificate. Please try again.' });
      setTimeout(() => setShowNotification(null), 3000);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${certificate.studentName} - Internship Certificate`,
          text: `🎉 ${certificate.studentName} has successfully completed their internship as ${certificate.internshipTitle} at ${certificate.companyName}!`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `🎉 ${certificate.studentName} has successfully completed their internship as ${certificate.internshipTitle} at ${certificate.companyName}! This certificate can be shared with recruiters directly.`
        );
        setShowNotification({ type: 'success', message: 'Certificate details copied to clipboard!' });
        setTimeout(() => setShowNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error sharing certificate:', error);
      setShowNotification({ type: 'error', message: 'Failed to share certificate.' });
      setTimeout(() => setShowNotification(null), 3000);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'generated': return '✅';
      case 'generating': return '⏳';
      case 'failed': return '❌';
      default: return '📄';
    }
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '⭐' : '');
  };

  return (
    <>
      <CardContainer
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.5, 
          delay: index * 0.1,
          type: "spring",
          stiffness: 100
        }}
        whileHover={{ scale: 1.02 }}
      >
        <CertificateHeader>
          <CertificateInfo>
            <CertificateTitle>
              <div className="certificate-icon">🏆</div>
              {certificate.studentName}
            </CertificateTitle>
            <CertificateDetails>
              <div className="detail-item">
                <span className="icon">🏢</span>
                <span className="label">Company:</span>
                <span>{certificate.companyName}</span>
              </div>
              <div className="detail-item">
                <span className="icon">💼</span>
                <span className="label">Role:</span>
                <span>{certificate.internshipTitle}</span>
              </div>
              <div className="detail-item">
                <span className="icon">📅</span>
                <span className="label">Completed:</span>
                <span>{formatDate(certificate.completedAt)}</span>
              </div>
              <div className="detail-item">
                <span className="icon">📄</span>
                <span className="label">Generated:</span>
                <span>{formatDate(certificate.createdAt)}</span>
              </div>
            </CertificateDetails>
          </CertificateInfo>

          <div style={{ position: 'relative' }}>
            <StatusBadge
              status={certificate.status || 'generated'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="icon">{getStatusIcon(certificate.status)}</span>
              {certificate.status === 'generated' ? 'Certificate Generated' : 
               certificate.status === 'generating' ? 'Generating...' : 
               certificate.status || 'Generated'}
            </StatusBadge>

            <AnimatePresence>
              {showTooltip && (
                <AIMascotTooltip
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  This certificate can be shared with recruiters directly! 🚀
                </AIMascotTooltip>
              )}
            </AnimatePresence>
          </div>
        </CertificateHeader>

        <CertificatePreview>
          <div className="preview-header">Certificate of Completion</div>
          <div className="preview-content">
            This is to certify that <strong>{certificate.studentName}</strong> has successfully 
            completed the internship program as <strong>{certificate.internshipTitle}</strong> at{' '}
            <strong>{certificate.companyName}</strong> with outstanding performance and dedication.
          </div>
          <div className="preview-signature">
            <div className="signature-item">
              <div className="signature-line"></div>
              <div className="signature-label">Mentor Signature</div>
            </div>
            <div className="signature-item">
              <div className="signature-line"></div>
              <div className="signature-label">Date</div>
            </div>
          </div>
        </CertificatePreview>

        {certificate.mentorFeedback && (
          <FeedbackSummary>
            <div className="summary-header">
              <span>📊</span>
              Performance Summary
            </div>
            <div className="ratings-grid">
              {Object.entries(certificate.mentorFeedback.ratings).map(([key, value]) => (
                <div key={key} className="rating-item">
                  <div className="rating-value">
                    {value.toFixed(1)} {getRatingStars(value)}
                  </div>
                  <div className="rating-label">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </div>
                </div>
              ))}
            </div>
            {certificate.mentorFeedback.textFeedback && (
              <div className="feedback-text">
                "{certificate.mentorFeedback.textFeedback}"
              </div>
            )}
          </FeedbackSummary>
        )}

        <ActionButtons>
          <DownloadButton
            onClick={handleDownload}
            disabled={downloading || !certificate.certificateURL}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="icon">{downloading ? '⏳' : '📥'}</span>
            {downloading ? 'Downloading...' : 'Download Certificate'}
          </DownloadButton>

          <ShareButton
            onClick={handleShare}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <span className="icon">📤</span>
            Share Achievement
          </ShareButton>
        </ActionButtons>
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
              {showNotification.type === 'success' ? '✅' : '❌'}
            </span>
            {showNotification.message}
          </NotificationToast>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedCertificateCard;
