import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../firebase';
import FeedbackFormDetailed from '../../components/FeedbackFormDetailed';

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px rgba(211, 47, 47, 0.3);
  }
  50% {
    box-shadow: 0 0 25px rgba(211, 47, 47, 0.6);
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const PageHeader = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl} auto;
  text-align: center;

  .page-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xxxl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .page-subtitle {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};

    .breadcrumb-link {
      color: ${({ theme }) => theme.colors.primary};
      text-decoration: none;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }

    .breadcrumb-separator {
      color: ${({ theme }) => theme.colors.border};
    }
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const MainContent = styled.div`
  /* Main content styles handled by FeedbackFormDetailed */
`;

const Sidebar = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1024px) {
    order: -1;
  }
`;

const ProgressCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};

  .progress-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};

    .progress-icon {
      font-size: 1.5rem;
      color: ${({ theme }) => theme.colors.primary};
    }

    .progress-title {
      font-size: ${({ theme }) => theme.typography.fontSize.md};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text};
    }
  }

  .progress-steps {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const ProgressStep = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all 0.3s ease;

  &.completed {
    background: ${({ theme }) => `${theme.colors.success}10`};
    color: ${({ theme }) => theme.colors.success};
  }

  &.current {
    background: ${({ theme }) => `${theme.colors.primary}10`};
    color: ${({ theme }) => theme.colors.primary};
    animation: ${glow} 2s infinite;
  }

  &.pending {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  .step-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
    flex-shrink: 0;

    &.completed {
      background: ${({ theme }) => theme.colors.success};
      color: white;
    }

    &.current {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
    }

    &.pending {
      background: ${({ theme }) => theme.colors.border};
      color: ${({ theme }) => theme.colors.textTertiary};
    }
  }

  .step-text {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }
`;

const TipsCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};

  .tips-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};

    .tips-icon {
      font-size: 1.5rem;
    }

    .tips-title {
      font-size: ${({ theme }) => theme.typography.fontSize.md};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text};
    }
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};

    .tip-item {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      color: ${({ theme }) => theme.colors.textSecondary};
      line-height: 1.5;
      padding-left: ${({ theme }) => theme.spacing.md};
      position: relative;

      &::before {
        content: '💡';
        position: absolute;
        left: 0;
        top: 0;
      }
    }
  }
`;

const LoadingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .loading-content {
    background: ${({ theme }) => theme.colors.background};
    border-radius: ${({ theme }) => theme.borderRadius.xl};
    padding: ${({ theme }) => theme.spacing.xl};
    text-align: center;
    max-width: 400px;
    width: 90%;

    .loading-icon {
      font-size: 3rem;
      margin-bottom: ${({ theme }) => theme.spacing.lg};
      animation: ${glow} 1.5s infinite;
    }

    .loading-title {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: ${({ theme }) => theme.spacing.sm};
    }

    .loading-description {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      color: ${({ theme }) => theme.colors.textSecondary};
      line-height: 1.5;
    }
  }
`;

const FinalizeFeedback = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  const [applicationData, setApplicationData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [internshipData, setInternshipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (applicationId) {
      loadApplicationData();
    }
  }, [applicationId]);

  const loadApplicationData = async () => {
    try {
      setLoading(true);

      // Get application data
      const applicationDoc = await getDoc(doc(db, 'applications', applicationId));
      if (!applicationDoc.exists()) {
        addNotification({
          type: 'error',
          title: 'Application Not Found',
          message: 'The requested application could not be found.',
          duration: 5000
        });
        navigate('/mentor/dashboard');
        return;
      }

      const appData = applicationDoc.data();
      setApplicationData(appData);

      // Verify mentor permissions
      if (appData.mentorId !== currentUser.uid) {
        addNotification({
          type: 'error',
          title: 'Access Denied',
          message: 'You can only provide feedback for your assigned students.',
          duration: 5000
        });
        navigate('/mentor/dashboard');
        return;
      }

      // Get student and internship data
      const [studentDoc, internshipDoc] = await Promise.all([
        getDoc(doc(db, 'users', appData.studentId)),
        getDoc(doc(db, 'internships', appData.internshipId))
      ]);

      if (studentDoc.exists()) {
        setStudentData(studentDoc.data());
      }

      if (internshipDoc.exists()) {
        setInternshipData(internshipDoc.data());
      }

      // Determine current step based on application status
      if (appData.mentorFeedback?.status === 'finalized') {
        setCurrentStep(4);
      } else if (appData.mentorFeedback?.status === 'draft') {
        setCurrentStep(2);
      } else if (appData.status === 'completed') {
        setCurrentStep(1);
      }

    } catch (error) {
      console.error('Error loading application data:', error);
      addNotification({
        type: 'error',
        title: 'Loading Error',
        message: 'Failed to load application data. Please try again.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async (feedbackData) => {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        mentorFeedback: {
          ...feedbackData,
          status: 'draft',
          lastUpdated: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });

      setCurrentStep(2);
      addNotification({
        type: 'success',
        title: 'Draft Saved',
        message: 'Your feedback has been saved as a draft.',
        duration: 3000
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  };

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      setSubmitting(true);
      setCurrentStep(3);

      // Update application with finalized feedback
      await updateDoc(doc(db, 'applications', applicationId), {
        mentorFeedback: {
          ...feedbackData,
          status: 'finalized',
          finalizedAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });

      // Generate certificate using Cloud Function
      const generateCertificate = httpsCallable(functions, 'generateCertificate');
      const result = await generateCertificate({ applicationId });

      if (result.data.success) {
        setCurrentStep(4);
        addNotification({
          type: 'success',
          title: 'Feedback Submitted Successfully! 🎉',
          message: 'Certificate has been generated and the student has been notified.',
          duration: 8000
        });

        // Navigate back to dashboard after a delay
        setTimeout(() => {
          navigate('/mentor/dashboard');
        }, 3000);
      } else {
        throw new Error(result.data.message || 'Certificate generation failed');
      }

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setCurrentStep(2);
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error.message || 'Failed to submit feedback and generate certificate. Please try again.',
        duration: 8000
      });
    } finally {
      setSubmitting(false);
    }
  };

  const progressSteps = [
    {
      id: 1,
      title: 'Review Application',
      description: 'Review student performance and internship details'
    },
    {
      id: 2,
      title: 'Provide Feedback',
      description: 'Rate performance and provide detailed comments'
    },
    {
      id: 3,
      title: 'Generate Certificate',
      description: 'Process feedback and create certificate'
    },
    {
      id: 4,
      title: 'Complete',
      description: 'Certificate generated and student notified'
    }
  ];

  const feedbackTips = [
    'Be specific and constructive in your feedback comments',
    'Consider the student\'s growth throughout the internship',
    'Highlight both strengths and areas for improvement',
    'Use examples from actual work or projects when possible',
    'Rate fairly based on expectations for their level',
    'Remember this feedback will be part of their permanent record'
  ];

  if (loading) {
    return (
      <PageContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '3rem' }}>⏳</div>
          <p>Loading application data...</p>
        </div>
      </PageContainer>
    );
  }

  if (!applicationData || !studentData || !internshipData) {
    return (
      <PageContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '3rem' }}>❌</div>
          <p>Failed to load application data.</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="page-title">Finalize Student Feedback</h1>
        <p className="page-subtitle">
          Provide comprehensive feedback and generate completion certificate
        </p>
        <div className="breadcrumb">
          <span 
            className="breadcrumb-link"
            onClick={() => navigate('/mentor/dashboard')}
          >
            Mentor Dashboard
          </span>
          <span className="breadcrumb-separator">›</span>
          <span>Finalize Feedback</span>
        </div>
      </PageHeader>

      <ContentContainer>
        <MainContent>
          <FeedbackFormDetailed
            studentData={studentData}
            internshipData={internshipData}
            onSubmit={handleSubmitFeedback}
            onSaveDraft={handleSaveDraft}
            initialData={applicationData.mentorFeedback}
          />
        </MainContent>

        <Sidebar>
          <ProgressCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="progress-header">
              <span className="progress-icon">📋</span>
              <span className="progress-title">Progress</span>
            </div>
            <div className="progress-steps">
              {progressSteps.map((step) => (
                <ProgressStep
                  key={step.id}
                  className={
                    step.id < currentStep ? 'completed' :
                    step.id === currentStep ? 'current' : 'pending'
                  }
                >
                  <div className={`step-icon ${
                    step.id < currentStep ? 'completed' :
                    step.id === currentStep ? 'current' : 'pending'
                  }`}>
                    {step.id < currentStep ? '✓' : step.id}
                  </div>
                  <div>
                    <div className="step-text">{step.title}</div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      opacity: 0.7,
                      marginTop: '0.25rem'
                    }}>
                      {step.description}
                    </div>
                  </div>
                </ProgressStep>
              ))}
            </div>
          </ProgressCard>

          <TipsCard
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="tips-header">
              <span className="tips-icon">💡</span>
              <span className="tips-title">Feedback Tips</span>
            </div>
            <div className="tips-list">
              {feedbackTips.map((tip, index) => (
                <div key={index} className="tip-item">
                  {tip}
                </div>
              ))}
            </div>
          </TipsCard>
        </Sidebar>
      </ContentContainer>

      {/* Loading Overlay */}
      <AnimatePresence>
        {submitting && (
          <LoadingOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="loading-content">
              <div className="loading-icon">🎓</div>
              <h3 className="loading-title">
                {currentStep === 3 ? 'Generating Certificate...' : 'Processing...'}
              </h3>
              <p className="loading-description">
                {currentStep === 3 
                  ? 'Please wait while we process your feedback and generate the completion certificate. This may take a few moments.'
                  : 'Processing your request...'
                }
              </p>
            </div>
          </LoadingOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default FinalizeFeedback;
