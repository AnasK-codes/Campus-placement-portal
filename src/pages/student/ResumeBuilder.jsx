import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import ResumeBuilderForm from '../../components/ResumeBuilderForm';
import ResumePreview from '../../components/ResumePreview';
import resumeParser from '../../utils/resumeParser';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
`;

const BuilderContainer = styled.div`
  min-height: calc(100vh - 70px);
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xl} 0;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg} 0;
  }
`;

const BuilderHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: 0 ${({ theme }) => theme.spacing.xl};

  .main-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xxxl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.md};

    .title-icon {
      font-size: 3rem;
      animation: ${pulse} 2s infinite;
    }

    @media (max-width: 768px) {
      font-size: ${({ theme }) => theme.typography.fontSize.xxl};
      flex-direction: column;
      gap: ${({ theme }) => theme.spacing.sm};
    }
  }

  .subtitle {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.textSecondary};
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const BuilderLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.lg};
  }
`;

const FormSection = styled(motion.div)`
  position: relative;
`;

const PreviewSection = styled(motion.div)`
  position: sticky;
  top: ${({ theme }) => theme.spacing.xl};
  height: fit-content;

  @media (max-width: 1200px) {
    position: static;
    top: auto;
  }
`;

const ProgressTracker = styled(motion.div)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.xl};
  right: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 100;
  min-width: 200px;

  @media (max-width: 768px) {
    bottom: ${({ theme }) => theme.spacing.lg};
    right: ${({ theme }) => theme.spacing.lg};
    left: ${({ theme }) => theme.spacing.lg};
    min-width: auto;
  }

  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${({ theme }) => theme.spacing.md};

    .progress-title {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
      color: ${({ theme }) => theme.colors.text};
    }

    .progress-percentage {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: ${({ theme }) => theme.colors.surface};
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: ${({ theme }) => theme.spacing.sm};

    .progress-fill {
      height: 100%;
      background: ${({ theme }) => theme.colors.gradient};
      border-radius: 4px;
      transition: width 0.5s ease;
    }
  }

  .progress-milestones {
    display: flex;
    justify-content: space-between;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textTertiary};

    .milestone {
      display: flex;
      align-items: center;
      gap: 2px;

      &.completed {
        color: ${({ theme }) => theme.colors.success};
      }
    }
  }
`;

const AIMascot = styled(motion.div)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.xl};
  left: ${({ theme }) => theme.spacing.xl};
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.gradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 101;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MascotTooltip = styled(motion.div)`
  position: absolute;
  bottom: 70px;
  left: 0;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  white-space: nowrap;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};
  max-width: 250px;
  white-space: normal;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 20px;
    border: 8px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.background};
  }
`;

const SkillExtractionAlert = styled(motion.div)`
  position: fixed;
  top: ${({ theme }) => theme.spacing.xl};
  right: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.success};
  color: white;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 102;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};

  .alert-icon {
    font-size: 1.2rem;
    animation: ${pulse} 1s infinite;
  }

  @media (max-width: 768px) {
    top: ${({ theme }) => theme.spacing.lg};
    right: ${({ theme }) => theme.spacing.lg};
    left: ${({ theme }) => theme.spacing.lg};
  }
`;

const ResumeBuilder = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  
  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    summary: '',
    education: '',
    experience: '',
    projects: '',
    skills: []
  });

  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showUpdateIndicator, setShowUpdateIndicator] = useState(false);
  const [showMascotTooltip, setShowMascotTooltip] = useState(false);
  const [showSkillAlert, setShowSkillAlert] = useState(false);
  const [mascotMessage, setMascotMessage] = useState('');

  useEffect(() => {
    // Load existing resume data
    const loadResumeData = async () => {
      if (currentUser) {
        try {
          const existingData = await resumeParser.getResumeData(currentUser.uid);
          if (existingData) {
            setResumeData(existingData);
          }
        } catch (error) {
          console.error('Error loading resume data:', error);
        }
      }
    };

    loadResumeData();
  }, [currentUser]);

  useEffect(() => {
    const completion = resumeParser.calculateResumeCompletion(resumeData);
    setCompletionPercentage(completion);

    // Show AI mascot tips based on completion
    if (completion === 25) {
      setMascotMessage("Great start! Add your experience to boost your profile! 🚀");
      triggerMascotTip();
    } else if (completion === 50) {
      setMascotMessage("Halfway there! Don't forget to add your projects! 💼");
      triggerMascotTip();
    } else if (completion === 75) {
      setMascotMessage("Almost done! Add some skills to complete your resume! ⭐");
      triggerMascotTip();
    } else if (completion === 100) {
      setMascotMessage("Perfect! Your resume is complete and ready to impress! 🎉");
      triggerMascotTip();
    }
  }, [resumeData]);

  const triggerMascotTip = () => {
    setShowMascotTooltip(true);
    setTimeout(() => setShowMascotTooltip(false), 5000);
  };

  const handleResumeUpdate = (updatedData) => {
    setResumeData(updatedData);
    setShowUpdateIndicator(true);
    setTimeout(() => setShowUpdateIndicator(false), 2000);

    // Check for new skills and show alert
    if (updatedData.skills && updatedData.skills.length > resumeData.skills.length) {
      setShowSkillAlert(true);
      setTimeout(() => setShowSkillAlert(false), 4000);
    }
  };

  const handleDownload = async (data) => {
    try {
      await resumeParser.saveResumeData(currentUser.uid, data);
      addNotification({
        type: 'success',
        title: 'Resume Downloaded!',
        message: 'Your resume has been generated and saved successfully.',
        duration: 5000
      });
    } catch (error) {
      console.error('Error saving resume:', error);
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'There was an error saving your resume. Please try again.',
        duration: 5000
      });
    }
  };

  const getMilestones = () => [
    { label: '25%', completed: completionPercentage >= 25 },
    { label: '50%', completed: completionPercentage >= 50 },
    { label: '75%', completed: completionPercentage >= 75 },
    { label: '100%', completed: completionPercentage >= 100 }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <BuilderContainer>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <BuilderHeader>
          <motion.div className="main-title" variants={sectionVariants}>
            <span className="title-icon">📄</span>
            Resume Builder & AI Skill Extractor
          </motion.div>
          <motion.div className="subtitle" variants={sectionVariants}>
            Create a professional resume with AI-powered skill extraction and real-time preview
          </motion.div>
        </BuilderHeader>

        <BuilderLayout>
          <FormSection variants={sectionVariants}>
            <ResumeBuilderForm
              onResumeUpdate={handleResumeUpdate}
              initialData={resumeData}
            />
          </FormSection>

          <PreviewSection variants={sectionVariants}>
            <ResumePreview
              resumeData={resumeData}
              onDownload={handleDownload}
              showUpdateIndicator={showUpdateIndicator}
            />
          </PreviewSection>
        </BuilderLayout>
      </motion.div>

      {/* Progress Tracker */}
      <ProgressTracker
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="progress-header">
          <span className="progress-title">Resume Progress</span>
          <span className="progress-percentage">{completionPercentage}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="progress-milestones">
          {getMilestones().map((milestone, index) => (
            <div
              key={index}
              className={`milestone ${milestone.completed ? 'completed' : ''}`}
            >
              <span>{milestone.completed ? '✓' : '○'}</span>
              <span>{milestone.label}</span>
            </div>
          ))}
        </div>
      </ProgressTracker>

      {/* AI Mascot */}
      <AIMascot
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 300 }}
        onClick={() => setShowMascotTooltip(!showMascotTooltip)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        🤖
        <AnimatePresence>
          {showMascotTooltip && (
            <MascotTooltip
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {mascotMessage || "Hi! I'm here to help you build an amazing resume! Click on me for tips! 😊"}
            </MascotTooltip>
          )}
        </AnimatePresence>
      </AIMascot>

      {/* Skill Extraction Alert */}
      <AnimatePresence>
        {showSkillAlert && (
          <SkillExtractionAlert
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <span className="alert-icon">🎯</span>
            Skills extracted! Update your profile to boost internship matches!
          </SkillExtractionAlert>
        )}
      </AnimatePresence>
    </BuilderContainer>
  );
};

export default ResumeBuilder;
