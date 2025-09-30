import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase';

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
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .certificate-icon {
    width: 40px;
    height: 40px;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    background: linear-gradient(135deg, #FFD700, #FFA500);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
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
    }

    .label {
      font-weight: 500;
      min-width: 80px;
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
      case 'pending': return 'rgba(255, 152, 0, 0.1)';
      case 'failed': return 'rgba(244, 67, 54, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'generated': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'failed': return '#f44336';
      default: return '#9E9E9E';
    }
  }};
  border: 1px solid ${({ status }) => {
    switch (status) {
      case 'generated': return '#4CAF50';
      case 'pending': return '#FF9800';
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
`;

const CertificatePreview = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
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

  .preview-icon {
    font-size: 3rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: #FFD700;
  }

  .preview-text {
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .preview-subtitle {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const InternshipSummary = styled.div`
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

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
  }

  .summary-item {
    .label {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }

    .value {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      font-size: 0.9rem;
    }
  }
`;

const PerformanceMetrics = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .metrics-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1rem;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
  }

  .metric-item {
    text-align: center;
    padding: ${({ theme }) => theme.spacing.md};
    background: ${({ theme }) => theme.colors.background};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border: 1px solid ${({ theme }) => theme.colors.border};

    .metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: ${({ color }) => color || 'var(--primary)'};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }

    .metric-label {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
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

const CertificateCard = ({ certificate, index }) => {
  const [downloading, setDownloading] = useState(false);
  const [showNotification, setShowNotification] = useState(null);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = async () => {
    if (downloading || !certificate.fileUrl) return;

    setDownloading(true);
    try {
      // Get download URL from Firebase Storage
      const downloadUrl = await getDownloadURL(ref(storage, certificate.fileUrl));
      
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
          text: `${certificate.studentName} has successfully completed their internship at ${certificate.companyName}`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `🎉 ${certificate.studentName} has successfully completed their internship as ${certificate.internshipTitle} at ${certificate.companyName}!`
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
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '📄';
    }
  };

  const getPerformanceColor = (rating) => {
    if (rating >= 4.5) return '#4CAF50';
    if (rating >= 4.0) return '#2196F3';
    if (rating >= 3.5) return '#FF9800';
    return '#f44336';
  };

  return (
    <>
      <CardContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
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

          <StatusBadge
            status={certificate.status || 'generated'}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="icon">{getStatusIcon(certificate.status)}</span>
            {certificate.status || 'Generated'}
          </StatusBadge>
        </CertificateHeader>

        <CertificatePreview>
          <div className="preview-icon">🏆</div>
          <div className="preview-text">Internship Completion Certificate</div>
          <div className="preview-subtitle">
            This certificate validates the successful completion of the internship program
          </div>
        </CertificatePreview>

        <InternshipSummary>
          <div className="summary-header">
            <span>📋</span>
            Internship Summary
          </div>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="label">Duration</div>
              <div className="value">{certificate.duration || '3 months'}</div>
            </div>
            <div className="summary-item">
              <div className="label">Department</div>
              <div className="value">{certificate.department || 'Technology'}</div>
            </div>
            <div className="summary-item">
              <div className="label">Mentor</div>
              <div className="value">{certificate.mentorName || 'N/A'}</div>
            </div>
            <div className="summary-item">
              <div className="label">Location</div>
              <div className="value">{certificate.location || 'Remote'}</div>
            </div>
          </div>
        </InternshipSummary>

        {certificate.performance && (
          <PerformanceMetrics>
            <div className="metrics-header">
              <span>📊</span>
              Performance Metrics
            </div>
            <div className="metrics-grid">
              <div className="metric-item">
                <div 
                  className="metric-value" 
                  color={getPerformanceColor(certificate.performance.overall || 4.0)}
                >
                  {certificate.performance.overall || '4.2'}/5
                </div>
                <div className="metric-label">Overall Rating</div>
              </div>
              <div className="metric-item">
                <div className="metric-value" color="#4CAF50">
                  {certificate.performance.projectsCompleted || '5'}
                </div>
                <div className="metric-label">Projects</div>
              </div>
              <div className="metric-item">
                <div className="metric-value" color="#2196F3">
                  {certificate.performance.skillsGained || '8'}
                </div>
                <div className="metric-label">Skills Gained</div>
              </div>
              <div className="metric-item">
                <div className="metric-value" color="#FF9800">
                  {certificate.performance.attendanceRate || '95'}%
                </div>
                <div className="metric-label">Attendance</div>
              </div>
            </div>
          </PerformanceMetrics>
        )}

        <ActionButtons>
          <DownloadButton
            onClick={handleDownload}
            disabled={downloading || !certificate.fileUrl}
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

export default CertificateCard;
