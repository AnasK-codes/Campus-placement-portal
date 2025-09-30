import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileContainer = styled.div`
  min-height: calc(100vh - 70px);
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
`;

const ProfileHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
`;

const ProfileCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProfileSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const InfoValue = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ approved }) => approved ? '#10B981' : '#F59E0B'};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.8rem;
  font-weight: 600;
`;

const EditButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme, variant }) => 
    variant === 'secondary' ? theme.colors.surface : theme.colors.primary};
  color: ${({ theme, variant }) => 
    variant === 'secondary' ? theme.colors.text : 'white'};
  border: 2px solid ${({ theme, variant }) => 
    variant === 'secondary' ? theme.colors.border : theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme, variant }) => 
      variant === 'secondary' ? theme.colors.border : theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`;

const ResumeSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.lg};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.background};
  }

  &.has-file {
    border-style: solid;
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.background};
  }
`;

const ResumeUploadArea = styled.div`
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.lg};

  .upload-icon {
    font-size: 3rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.primary};
  }

  .upload-text {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .upload-subtext {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ResumeFile = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.md};

  .file-info {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
  }

  .file-icon {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  .file-details {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
  }

  .file-name {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }

  .file-size {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  .file-actions {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme, variant }) => {
    switch(variant) {
      case 'danger': return '#f44336';
      case 'success': return '#4caf50';
      default: return theme.colors.primary;
    }
  }};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-1px);
    opacity: 0.9;
  }
`;

const SkillsSection = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const SkillsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const SkillTag = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  .remove-skill {
    cursor: pointer;
    font-weight: bold;
    
    &:hover {
      color: #ffcccb;
    }
  }
`;

const SkillInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.9rem;
  margin-right: ${({ theme }) => theme.spacing.sm};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const QuickActionCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  .action-icon {
    font-size: 2rem;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .action-title {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .action-description {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Profile = () => {
  const { currentUser, userProfile, userRole } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [skills, setSkills] = useState(['JavaScript', 'React', 'Node.js', 'Python']);
  const [newSkill, setNewSkill] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      if (file.size <= 5 * 1024 * 1024) { // 5MB limit
        setResumeFile(file);
      } else {
        alert('File size should be less than 5MB');
      }
    } else {
      alert('Please upload a PDF file');
    }
  };

  const removeResume = () => {
    setResumeFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadResume = () => {
    if (resumeFile) {
      const url = URL.createObjectURL(resumeFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = resumeFile.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addSkill();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!currentUser || !userProfile) {
    return (
      <ProfileContainer>
        <ProfileHeader>
          <Title>Profile</Title>
          <Subtitle>Loading profile information...</Subtitle>
        </ProfileHeader>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Title>My Profile</Title>
        <Subtitle>Manage your account information and preferences</Subtitle>
      </ProfileHeader>

      <ProfileCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ProfileSection>
          <SectionTitle>Basic Information</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>Full Name</InfoLabel>
              <InfoValue>{userProfile.name || 'Not provided'}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Email Address</InfoLabel>
              <InfoValue>{userProfile.email}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Role</InfoLabel>
              <InfoValue>
                <RoleBadge>{userRole}</RoleBadge>
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Account Status</InfoLabel>
              <InfoValue>
                <StatusBadge approved={userProfile.approved}>
                  {userProfile.approved ? 'Approved' : 'Pending'}
                </StatusBadge>
              </InfoValue>
            </InfoItem>
          </InfoGrid>
        </ProfileSection>

        <ProfileSection>
          <SectionTitle>Account Details</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <InfoLabel>User ID</InfoLabel>
              <InfoValue>{userProfile.uid}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Member Since</InfoLabel>
              <InfoValue>
                {userProfile.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Last Updated</InfoLabel>
              <InfoValue>
                {userProfile.updatedAt?.toDate?.()?.toLocaleDateString() || 'Never'}
              </InfoValue>
            </InfoItem>
          </InfoGrid>
        </ProfileSection>

        {/* Resume Section */}
        <ProfileSection>
          <SectionTitle>📄 Resume</SectionTitle>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            style={{ display: 'none' }}
          />
          
          {!resumeFile ? (
            <ResumeSection onClick={() => fileInputRef.current?.click()}>
              <ResumeUploadArea>
                <div className="upload-icon">📄</div>
                <div className="upload-text">Upload Your Resume</div>
                <div className="upload-subtext">
                  Click to browse or drag and drop your PDF resume (Max 5MB)
                </div>
              </ResumeUploadArea>
            </ResumeSection>
          ) : (
            <ResumeSection className="has-file">
              <ResumeFile>
                <div className="file-info">
                  <div className="file-icon">📄</div>
                  <div className="file-details">
                    <div className="file-name">{resumeFile.name}</div>
                    <div className="file-size">{formatFileSize(resumeFile.size)}</div>
                  </div>
                </div>
                <div className="file-actions">
                  <ActionButton
                    variant="success"
                    onClick={downloadResume}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📥 Download
                  </ActionButton>
                  <ActionButton
                    onClick={() => fileInputRef.current?.click()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔄 Replace
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    onClick={removeResume}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🗑️ Remove
                  </ActionButton>
                </div>
              </ResumeFile>
            </ResumeSection>
          )}
        </ProfileSection>

        {/* Skills Section */}
        <ProfileSection>
          <SkillsSection>
            <SectionTitle>🎯 Skills</SectionTitle>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <SkillInput
                type="text"
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <ActionButton onClick={addSkill} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Add Skill
              </ActionButton>
            </div>
            <SkillsContainer>
              {skills.map((skill, index) => (
                <SkillTag key={index}>
                  {skill}
                  <span className="remove-skill" onClick={() => removeSkill(skill)}>
                    ×
                  </span>
                </SkillTag>
              ))}
            </SkillsContainer>
          </SkillsSection>
        </ProfileSection>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <EditButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </EditButton>
          <EditButton
            variant="secondary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/student/resume-builder')}
          >
            🏗️ Resume Builder
          </EditButton>
        </div>
      </ProfileCard>

      {/* Quick Actions */}
      <ProfileCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SectionTitle>🚀 Quick Actions</SectionTitle>
        <QuickActions>
          <QuickActionCard
            onClick={() => navigate('/jobs')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="action-icon">💼</div>
            <div className="action-title">Browse Jobs</div>
            <div className="action-description">Find internships and job opportunities</div>
          </QuickActionCard>

          <QuickActionCard
            onClick={() => navigate('/student/mock-test')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="action-icon">🧠</div>
            <div className="action-title">Take Mock Test</div>
            <div className="action-description">Practice with AI-generated questions</div>
          </QuickActionCard>

          <QuickActionCard
            onClick={() => navigate('/student/recommended-internships')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="action-icon">🎯</div>
            <div className="action-title">Recommendations</div>
            <div className="action-description">Get AI-powered job recommendations</div>
          </QuickActionCard>

          <QuickActionCard
            onClick={() => navigate('/student/certificates')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="action-icon">🏆</div>
            <div className="action-title">Certificates</div>
            <div className="action-description">View and download your certificates</div>
          </QuickActionCard>
        </QuickActions>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default Profile;
