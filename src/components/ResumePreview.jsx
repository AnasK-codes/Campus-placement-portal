import React, { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shine = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const PreviewContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(211, 47, 47, 0.1),
      transparent
    );
    animation: ${shine} 3s infinite;
    pointer-events: none;
  }
`;

const PreviewHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  .preview-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};

    .preview-icon {
      font-size: 1.5rem;
    }
  }

  .preview-actions {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: all 0.3s ease;

  &.primary {
    background: ${({ theme }) => theme.colors.gradient};
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
  }

  &.secondary {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.border};

    &:hover {
      background: ${({ theme }) => theme.colors.background};
    }
  }
`;

const ResumeDocument = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background};
  min-height: 800px;
  font-family: 'Georgia', serif;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const ResumeSection = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  animation: ${fadeIn} 0.5s ease-out;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PersonalHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 2px;
    background: ${({ theme }) => theme.colors.gradient};
  }

  .name {
    font-size: 2.5rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .contact-info {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};

    .contact-item {
      display: flex;
      align-items: center;
      gap: ${({ theme }) => theme.spacing.xs};

      .contact-icon {
        color: ${({ theme }) => theme.colors.primary};
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      gap: ${({ theme }) => theme.spacing.xs};
    }
  }
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-left: ${({ theme }) => theme.spacing.lg};

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 100%;
    background: ${({ theme }) => theme.colors.gradient};
    border-radius: 2px;
  }
`;

const SectionContent = styled.div`
  padding-left: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.text};

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    text-align: justify;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: ${({ theme }) => theme.spacing.sm};
      position: relative;
      padding-left: ${({ theme }) => theme.spacing.md};

      &::before {
        content: '▸';
        position: absolute;
        left: 0;
        color: ${({ theme }) => theme.colors.primary};
        font-weight: bold;
      }
    }
  }
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const SkillTag = styled(motion.span)`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => `${theme.colors.primary}15`};
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-align: center;
  border: 1px solid ${({ theme }) => `${theme.colors.primary}30`};
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}25`};
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;

  .empty-icon {
    font-size: 3rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    opacity: 0.5;
  }
`;

const UpdateIndicator = styled(motion.div)`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${({ theme }) => theme.colors.success};
  color: white;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const DownloadProgress = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: 1000;
  text-align: center;
  min-width: 300px;

  .progress-icon {
    font-size: 3rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .progress-text {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .progress-bar {
    width: 100%;
    height: 8px;
    background: ${({ theme }) => theme.colors.surface};
    border-radius: 4px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: ${({ theme }) => theme.colors.gradient};
      border-radius: 4px;
      transition: width 0.3s ease;
    }
  }
`;

const ConfettiOverlay = styled(motion.div)`
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

const ResumePreview = ({ resumeData, onDownload, showUpdateIndicator = false }) => {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const previewRef = useRef(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // In a real implementation, you would use libraries like jsPDF or Puppeteer
      // For now, we'll simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      setDownloadProgress(100);
      
      // Show confetti animation
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // Trigger download callback
      if (onDownload) {
        onDownload(resumeData);
      }

      // Create a simple text file download for demonstration
      const resumeText = generateResumeText(resumeData);
      const blob = new Blob([resumeText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeData.name || 'resume'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading resume:', error);
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
    }
  };

  const generateResumeText = (data) => {
    return `
${data.name || 'Your Name'}
${data.email || ''} | ${data.phone || ''} | ${data.linkedin || ''}

PROFESSIONAL SUMMARY
${data.summary || 'Professional summary not provided.'}

EDUCATION
${data.education || 'Education details not provided.'}

EXPERIENCE
${data.experience || 'Work experience not provided.'}

PROJECTS
${data.projects || 'Projects not provided.'}

SKILLS
${data.skills?.map(skill => skill.name).join(', ') || 'Skills not provided.'}
    `.trim();
  };

  const handlePrint = () => {
    window.print();
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <>
      <PreviewContainer
        ref={previewRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {showUpdateIndicator && (
          <UpdateIndicator
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <span>✓</span>
            Updated
          </UpdateIndicator>
        )}

        <PreviewHeader>
          <div className="preview-title">
            <span className="preview-icon">👁️</span>
            Resume Preview
          </div>
          <div className="preview-actions">
            <ActionButton
              className="secondary"
              onClick={handlePrint}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>🖨️</span>
              Print
            </ActionButton>
            <ActionButton
              className="primary"
              onClick={handleDownload}
              disabled={isDownloading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{isDownloading ? '⏳' : '📥'}</span>
              {isDownloading ? 'Generating...' : 'Download PDF'}
            </ActionButton>
          </div>
        </PreviewHeader>

        <ResumeDocument>
          {/* Personal Information Header */}
          <PersonalHeader>
            <motion.div
              className="name"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              key={resumeData.name}
            >
              {resumeData.name || 'Your Name'}
            </motion.div>
            <div className="contact-info">
              {resumeData.email && (
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  {resumeData.email}
                </div>
              )}
              {resumeData.phone && (
                <div className="contact-item">
                  <span className="contact-icon">📱</span>
                  {resumeData.phone}
                </div>
              )}
              {resumeData.linkedin && (
                <div className="contact-item">
                  <span className="contact-icon">💼</span>
                  {resumeData.linkedin}
                </div>
              )}
            </div>
          </PersonalHeader>

          {/* Professional Summary */}
          {resumeData.summary && (
            <ResumeSection
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              key={`summary-${resumeData.summary}`}
            >
              <SectionTitle>Professional Summary</SectionTitle>
              <SectionContent>
                <p>{resumeData.summary}</p>
              </SectionContent>
            </ResumeSection>
          )}

          {/* Education */}
          {resumeData.education && (
            <ResumeSection
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              key={`education-${resumeData.education}`}
            >
              <SectionTitle>Education</SectionTitle>
              <SectionContent>
                <p>{resumeData.education}</p>
              </SectionContent>
            </ResumeSection>
          )}

          {/* Experience */}
          {resumeData.experience && (
            <ResumeSection
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              key={`experience-${resumeData.experience}`}
            >
              <SectionTitle>Experience</SectionTitle>
              <SectionContent>
                <p>{resumeData.experience}</p>
              </SectionContent>
            </ResumeSection>
          )}

          {/* Projects */}
          {resumeData.projects && (
            <ResumeSection
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              key={`projects-${resumeData.projects}`}
            >
              <SectionTitle>Projects</SectionTitle>
              <SectionContent>
                <p>{resumeData.projects}</p>
              </SectionContent>
            </ResumeSection>
          )}

          {/* Skills */}
          {resumeData.skills && resumeData.skills.length > 0 && (
            <ResumeSection
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              key={`skills-${resumeData.skills.length}`}
            >
              <SectionTitle>Skills</SectionTitle>
              <SectionContent>
                <SkillsGrid>
                  <AnimatePresence>
                    {resumeData.skills.map((skill, index) => (
                      <SkillTag
                        key={skill.name || index}
                        variants={skillVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ delay: index * 0.1 }}
                      >
                        {skill.name || skill}
                      </SkillTag>
                    ))}
                  </AnimatePresence>
                </SkillsGrid>
              </SectionContent>
            </ResumeSection>
          )}

          {/* Empty State */}
          {!resumeData.name && !resumeData.summary && !resumeData.education && 
           !resumeData.experience && !resumeData.projects && 
           (!resumeData.skills || resumeData.skills.length === 0) && (
            <EmptyState>
              <div className="empty-icon">📄</div>
              <p>Start filling out your resume form to see the preview here</p>
            </EmptyState>
          )}
        </ResumeDocument>
      </PreviewContainer>

      {/* Download Progress Modal */}
      <AnimatePresence>
        {isDownloading && (
          <DownloadProgress
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="progress-icon">📄</div>
            <div className="progress-text">
              Generating your professional resume...
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
          </DownloadProgress>
        )}
      </AnimatePresence>

      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <ConfettiOverlay>
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
          </ConfettiOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default ResumePreview;
