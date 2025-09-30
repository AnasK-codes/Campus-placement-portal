import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import resumeParser from '../utils/resumeParser';
import { SkillBadgesGrid } from './SkillBadge';

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(211, 47, 47, 0.3); }
  50% { box-shadow: 0 0 15px rgba(211, 47, 47, 0.6); }
`;

const FormContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  .title {
    font-size: ${({ theme }) => theme.typography.fontSize.xxl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  .subtitle {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const UploadSection = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  border: 2px dashed ${({ theme, isDragOver }) => 
    isDragOver ? theme.colors.primary : theme.colors.border
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  .upload-icon {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const FormSection = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  .section-title {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InputGroup = styled(motion.div)`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InputField = styled(motion.input)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    animation: ${glow} 2s infinite;
  }
`;

const TextAreaField = styled(motion.textarea)`
  width: 100%;
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    animation: ${glow} 2s infinite;
  }
`;

const SkillsSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};

  .extracted-skills {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.lg};
    background: ${({ theme }) => `${theme.colors.primary}10`};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    border: 1px solid ${({ theme }) => `${theme.colors.primary}30`};

    .skills-header {
      display: flex;
      align-items: center;
      gap: ${({ theme }) => theme.spacing.sm};
      margin-bottom: ${({ theme }) => theme.spacing.md};

      .skills-title {
        font-size: ${({ theme }) => theme.typography.fontSize.md};
        font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
        color: ${({ theme }) => theme.colors.text};
      }
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    flex-direction: column;
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

  &.primary {
    background: ${({ theme }) => theme.colors.gradient};
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.lg};
    }
  }

  &.secondary {
    background: transparent;
    color: ${({ theme }) => theme.colors.primary};
    border: 2px solid ${({ theme }) => theme.colors.primary};

    &:hover {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
    }
  }
`;

const ResumeBuilderForm = ({ onResumeUpdate, initialData = null }) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
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

  const [extractedSkills, setExtractedSkills] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (onResumeUpdate) {
      onResumeUpdate({
        ...formData,
        [field]: value
      });
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsExtracting(true);
    try {
      const text = await resumeParser.extractTextFromPDF(file);
      const parsedData = await resumeParser.parseResume(text);
      
      setExtractedSkills(parsedData.skills);
      
      setFormData(prev => ({
        ...prev,
        ...parsedData.contactInfo,
        skills: [...prev.skills, ...parsedData.skills]
      }));

    } catch (error) {
      console.error('Error processing resume:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      handleFileUpload(pdfFile);
    }
  };

  const addSkillToProfile = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, {
        name: skill.name,
        level: 1,
        category: skill.category,
        addedFrom: 'resume_extraction'
      }]
    }));
  };

  const handleSave = async () => {
    try {
      await resumeParser.saveResumeData(currentUser.uid, formData);
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  };

  return (
    <FormContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <FormHeader>
        <div className="title">
          <span>📄</span>
          Resume Builder
        </div>
        <div className="subtitle">
          Build your professional resume with AI-powered skill extraction
        </div>
      </FormHeader>

      <UploadSection
        isDragOver={isDragOver}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">
          {isExtracting ? '🔄' : '📤'}
        </div>
        <div>
          {isExtracting ? 'Extracting skills from resume...' : 'Upload existing resume (PDF)'}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />
      </UploadSection>

      <AnimatePresence>
        {extractedSkills.length > 0 && (
          <SkillsSection>
            <motion.div
              className="extracted-skills"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="skills-header">
                <span>🤖</span>
                <span className="skills-title">
                  AI Extracted {extractedSkills.length} Skills
                </span>
              </div>
              <SkillBadgesGrid
                skills={[]}
                suggestions={extractedSkills}
                onSuggestionClick={addSkillToProfile}
                maxDisplay={10}
              />
            </motion.div>
          </SkillsSection>
        )}
      </AnimatePresence>

      <FormSection>
        <div className="section-title">
          <span>👤</span>
          Personal Information
        </div>
        <FormGrid>
          <InputGroup>
            <InputField
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />
          </InputGroup>
          <InputGroup>
            <InputField
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />
          </InputGroup>
          <InputGroup>
            <InputField
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />
          </InputGroup>
          <InputGroup>
            <InputField
              type="url"
              placeholder="LinkedIn Profile"
              value={formData.linkedin}
              onChange={(e) => handleInputChange('linkedin', e.target.value)}
              whileFocus={{ scale: 1.02 }}
            />
          </InputGroup>
        </FormGrid>
      </FormSection>

      <FormSection>
        <div className="section-title">
          <span>📝</span>
          Professional Summary
        </div>
        <InputGroup>
          <TextAreaField
            placeholder="Write a brief professional summary..."
            value={formData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            whileFocus={{ scale: 1.01 }}
          />
        </InputGroup>
      </FormSection>

      <FormSection>
        <div className="section-title">
          <span>🎓</span>
          Education
        </div>
        <InputGroup>
          <TextAreaField
            placeholder="List your educational background..."
            value={formData.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
            whileFocus={{ scale: 1.01 }}
          />
        </InputGroup>
      </FormSection>

      <FormSection>
        <div className="section-title">
          <span>💼</span>
          Experience
        </div>
        <InputGroup>
          <TextAreaField
            placeholder="Describe your work experience..."
            value={formData.experience}
            onChange={(e) => handleInputChange('experience', e.target.value)}
            whileFocus={{ scale: 1.01 }}
          />
        </InputGroup>
      </FormSection>

      <FormSection>
        <div className="section-title">
          <span>🚀</span>
          Projects
        </div>
        <InputGroup>
          <TextAreaField
            placeholder="Describe your key projects..."
            value={formData.projects}
            onChange={(e) => handleInputChange('projects', e.target.value)}
            whileFocus={{ scale: 1.01 }}
          />
        </InputGroup>
      </FormSection>

      <ActionButtons>
        <ActionButton
          className="secondary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>👁️</span>
          Preview
        </ActionButton>
        <ActionButton
          className="primary"
          onClick={handleSave}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>💾</span>
          Save Resume
        </ActionButton>
      </ActionButtons>
    </FormContainer>
  );
};

export default ResumeBuilderForm;
