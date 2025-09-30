import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const VerificationContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const VerificationCard = styled(motion.div)`
  max-width: 800px;
  width: 100%;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme, status }) => {
      switch (status) {
        case 'valid': return theme.colors.success;
        case 'invalid': return theme.colors.error;
        default: return theme.colors.primary;
      }
    }};
  }
`;

const VerificationHeader = styled.div`
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;

  .header-icon {
    font-size: 4rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    animation: ${fadeIn} 0.8s ease-out;
  }

  .header-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xxl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    animation: ${fadeIn} 0.8s ease-out 0.2s both;
  }

  .header-subtitle {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    opacity: 0.9;
    animation: ${fadeIn} 0.8s ease-out 0.4s both;
  }
`;

const VerificationBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxxl};

  .spinner {
    width: 60px;
    height: 60px;
    border: 4px solid ${({ theme }) => theme.colors.border};
    border-top: 4px solid ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    animation: ${spin} 1s linear infinite;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  .loading-text {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.text};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }
`;

const StatusIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};

  &.valid {
    background: ${({ theme }) => `${theme.colors.success}20`};
    color: ${({ theme }) => theme.colors.success};
    border: 2px solid ${({ theme }) => theme.colors.success};
  }

  &.invalid {
    background: ${({ theme }) => `${theme.colors.error}20`};
    color: ${({ theme }) => theme.colors.error};
    border: 2px solid ${({ theme }) => theme.colors.error};
  }

  &.expired {
    background: ${({ theme }) => `${theme.colors.warning}20`};
    color: ${({ theme }) => theme.colors.warning};
    border: 2px solid ${({ theme }) => theme.colors.warning};
  }

  .status-icon {
    font-size: 2rem;
  }
`;

const CertificateDetails = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const StudentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  .student-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    flex-shrink: 0;
  }

  .student-details {
    flex: 1;

    .student-name {
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }

    .student-department {
      font-size: ${({ theme }) => theme.typography.fontSize.md};
      color: ${({ theme }) => theme.colors.textSecondary};
      margin-bottom: ${({ theme }) => theme.spacing.sm};
    }

    .certificate-type {
      display: inline-block;
      padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
      background: ${({ theme }) => theme.colors.primary}20;
      color: ${({ theme }) => theme.colors.primary};
      border-radius: ${({ theme }) => theme.borderRadius.md};
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const InternshipInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  .info-section {
    .section-title {
      font-size: ${({ theme }) => theme.typography.fontSize.md};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: ${({ theme }) => theme.spacing.md};
      display: flex;
      align-items: center;
      gap: ${({ theme }) => theme.spacing.sm};

      .section-icon {
        font-size: 1.2rem;
        color: ${({ theme }) => theme.colors.primary};
      }
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: ${({ theme }) => theme.spacing.sm};
      padding: ${({ theme }) => theme.spacing.sm} 0;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border}20;

      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .label {
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
        color: ${({ theme }) => theme.colors.textSecondary};
        font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
      }

      .value {
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
        color: ${({ theme }) => theme.colors.text};
        font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
        text-align: right;
      }
    }
  }
`;

const PerformanceMetrics = styled.div`
  .metrics-title {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};

    .metrics-icon {
      font-size: 1.2rem;
      color: ${({ theme }) => theme.colors.primary};
    }
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
      font-size: ${({ theme }) => theme.typography.fontSize.xl};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ color }) => color || '#D32F2F'};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }

    .metric-label {
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      color: ${({ theme }) => theme.colors.textSecondary};
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
`;

const VerificationFooter = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};

  .verification-id {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-family: monospace;
  }

  .verification-date {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const ErrorMessage = styled(motion.div)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxxl};

  .error-icon {
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.error};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  .error-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .error-description {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const CertificateVerification = () => {
  const [searchParams] = useSearchParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const verificationId = searchParams.get('vid');

  useEffect(() => {
    if (!verificationId) {
      setError('No verification ID provided');
      setLoading(false);
      return;
    }

    verifyCertificate(verificationId);
  }, [verificationId]);

  const verifyCertificate = async (vid) => {
    try {
      setLoading(true);
      
      const certificateDoc = await getDoc(doc(db, 'certificates', vid));
      
      if (!certificateDoc.exists()) {
        setVerificationStatus('invalid');
        setError('Certificate not found or invalid verification ID');
        return;
      }

      const certificateData = certificateDoc.data();
      
      // Check if certificate is still valid
      if (!certificateData.isValid) {
        setVerificationStatus('expired');
        setError('This certificate has been revoked or is no longer valid');
        return;
      }

      setCertificate(certificateData);
      setVerificationStatus('valid');
      
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationStatus('invalid');
      setError('Failed to verify certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPerformanceColor = (rating) => {
    if (rating >= 4.5) return '#4CAF50';
    if (rating >= 4.0) return '#2196F3';
    if (rating >= 3.5) return '#FF9800';
    return '#f44336';
  };

  if (loading) {
    return (
      <VerificationContainer>
        <VerificationCard
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <VerificationHeader>
            <div className="header-icon">🔍</div>
            <h1 className="header-title">Certificate Verification</h1>
            <p className="header-subtitle">Campus Placement Portal</p>
          </VerificationHeader>
          
          <LoadingSpinner>
            <div className="spinner"></div>
            <div className="loading-text">Verifying certificate...</div>
          </LoadingSpinner>
        </VerificationCard>
      </VerificationContainer>
    );
  }

  if (error || !certificate) {
    return (
      <VerificationContainer>
        <VerificationCard
          status={verificationStatus}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <VerificationHeader>
            <div className="header-icon">🔍</div>
            <h1 className="header-title">Certificate Verification</h1>
            <p className="header-subtitle">Campus Placement Portal</p>
          </VerificationHeader>

          <StatusIndicator
            className={verificationStatus}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="status-icon">
              {verificationStatus === 'invalid' ? '❌' : '⚠️'}
            </span>
            {verificationStatus === 'invalid' ? 'Certificate Invalid' : 'Certificate Expired'}
          </StatusIndicator>

          <ErrorMessage
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="error-icon">
              {verificationStatus === 'invalid' ? '🚫' : '⏰'}
            </div>
            <h2 className="error-title">
              {verificationStatus === 'invalid' ? 'Invalid Certificate' : 'Expired Certificate'}
            </h2>
            <p className="error-description">{error}</p>
          </ErrorMessage>
        </VerificationCard>
      </VerificationContainer>
    );
  }

  return (
    <VerificationContainer>
      <VerificationCard
        status="valid"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <VerificationHeader>
          <div className="header-icon">✅</div>
          <h1 className="header-title">Certificate Verified</h1>
          <p className="header-subtitle">Campus Placement Portal</p>
        </VerificationHeader>

        <VerificationBody>
          <StatusIndicator
            className="valid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="status-icon">✅</span>
            This certificate is authentic and valid
          </StatusIndicator>

          <CertificateDetails
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <StudentInfo>
              <div className="student-avatar">
                {certificate.studentName?.charAt(0) || 'S'}
              </div>
              <div className="student-details">
                <h2 className="student-name">{certificate.studentName}</h2>
                <p className="student-department">
                  {certificate.studentDepartment || 'Student'}
                </p>
                <span className="certificate-type">
                  {certificate.performance?.category || 'Completion'} Certificate
                </span>
              </div>
            </StudentInfo>

            <InternshipInfo>
              <div className="info-section">
                <h3 className="section-title">
                  <span className="section-icon">🏢</span>
                  Internship Details
                </h3>
                <div className="info-item">
                  <span className="label">Company:</span>
                  <span className="value">{certificate.companyName}</span>
                </div>
                <div className="info-item">
                  <span className="label">Role:</span>
                  <span className="value">{certificate.internshipTitle}</span>
                </div>
                <div className="info-item">
                  <span className="label">Mentor:</span>
                  <span className="value">{certificate.mentorName}</span>
                </div>
              </div>

              <div className="info-section">
                <h3 className="section-title">
                  <span className="section-icon">📅</span>
                  Timeline
                </h3>
                <div className="info-item">
                  <span className="label">Completed:</span>
                  <span className="value">{formatDate(certificate.completionDate)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Generated:</span>
                  <span className="value">{formatDate(certificate.generatedAt)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className="value">Active</span>
                </div>
              </div>
            </InternshipInfo>

            {certificate.performance && (
              <PerformanceMetrics>
                <h3 className="metrics-title">
                  <span className="metrics-icon">📊</span>
                  Performance Summary
                </h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <div 
                      className="metric-value"
                      color={getPerformanceColor(certificate.performance.overall || 4.0)}
                    >
                      {certificate.performance.overall || '4.0'}/5
                    </div>
                    <div className="metric-label">Overall Rating</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value" color="#4CAF50">
                      {certificate.performance.projectsCompleted || '1'}
                    </div>
                    <div className="metric-label">Projects</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value" color="#2196F3">
                      {certificate.performance.skillsGained || '5'}
                    </div>
                    <div className="metric-label">Skills</div>
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
          </CertificateDetails>
        </VerificationBody>

        <VerificationFooter>
          <div className="verification-id">
            Verification ID: {certificate.verificationId}
          </div>
          <div className="verification-date">
            Verified on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </VerificationFooter>
      </VerificationCard>
    </VerificationContainer>
  );
};

export default CertificateVerification;
