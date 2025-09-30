import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { updateUserDocument } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import ProgressBar from './ProgressBar';
import SkillsBadge from './SkillsBadge';

const ProfileContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const AvatarContainer = styled(motion.div)`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 4px solid ${({ theme }) => theme.colors.border};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 20px rgba(211, 47, 47, 0.3);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    font-size: 3rem;
    font-weight: bold;
    color: white;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.fast};
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
  }

  &:hover .overlay {
    opacity: 1;
  }
`;

const UploadButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ProfileMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 0.95rem;

  .icon {
    font-size: 1.1rem;
  }
`;

const CompletionSection = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .icon {
    font-size: 1.4rem;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FormSection = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.surface};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
  }
`;

const FileUploadArea = styled(motion.div)`
  border: 2px dashed ${({ theme, dragOver }) => dragOver ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  background: ${({ theme, dragOver }) => dragOver ? 'rgba(211, 47, 47, 0.05)' : theme.colors.surface};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: rgba(211, 47, 47, 0.05);
  }

  .icon {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .text {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .subtext {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const SaveButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(211, 47, 47, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const ProfileCard = ({ profileData, onUpdate, loading }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: profileData?.name || '',
    email: profileData?.email || currentUser?.email || '',
    phone: profileData?.phone || '',
    department: profileData?.department || '',
    year: profileData?.year || '',
    rollNumber: profileData?.rollNumber || '',
    skills: profileData?.skills || []
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const avatarInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  const calculateCompletion = () => {
    const fields = ['name', 'phone', 'department', 'year', 'rollNumber'];
    const completed = fields.filter(field => formData[field]?.trim()).length;
    const hasAvatar = profileData?.avatarUrl ? 1 : 0;
    const hasResume = profileData?.resumeUrl ? 1 : 0;
    const hasSkills = formData.skills?.length > 0 ? 1 : 0;
    
    return Math.round(((completed + hasAvatar + hasResume + hasSkills) / (fields.length + 3)) * 100);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsUpdate = (skills) => {
    setFormData(prev => ({ ...prev, skills }));
  };

  const handleAvatarUpload = async (file) => {
    if (!file || !currentUser) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${currentUser.uid}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      await updateUserDocument(currentUser.uid, { avatarUrl: downloadURL });
      onUpdate(prev => ({ ...prev, avatarUrl: downloadURL }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleResumeUpload = async (file) => {
    if (!file || !currentUser) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `resumes/${currentUser.uid}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      await updateUserDocument(currentUser.uid, { 
        resumeUrl: downloadURL,
        resumeName: file.name 
      });
      onUpdate(prev => ({ ...prev, resumeUrl: downloadURL, resumeName: file.name }));
    } catch (error) {
      console.error('Error uploading resume:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      await updateUserDocument(currentUser.uid, formData);
      onUpdate(prev => ({ ...prev, ...formData }));
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      handleResumeUpload(file);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: '50px',
              height: '50px',
              border: '3px solid #ddd',
              borderTop: '3px solid #D32F2F',
              borderRadius: '50%',
              margin: '0 auto'
            }}
          />
          <p style={{ marginTop: '1rem', color: '#666' }}>Loading profile...</p>
        </div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarSection>
          <AvatarContainer
            whileHover={{ scale: 1.05 }}
            onClick={() => avatarInputRef.current?.click()}
          >
            {profileData?.avatarUrl ? (
              <img src={profileData.avatarUrl} alt="Avatar" />
            ) : (
              <div className="placeholder">
                {getInitials(formData.name || currentUser?.displayName)}
              </div>
            )}
            <div className="overlay">
              {uploading ? 'Uploading...' : 'Change Photo'}
            </div>
          </AvatarContainer>
          <UploadButton
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </UploadButton>
          <HiddenInput
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files[0] && handleAvatarUpload(e.target.files[0])}
          />
        </AvatarSection>

        <ProfileInfo>
          <ProfileName>{formData.name || 'Student Name'}</ProfileName>
          <ProfileMeta>
            <MetaItem>
              <span className="icon">🎓</span>
              <span>{formData.department || 'Department'}</span>
            </MetaItem>
            <MetaItem>
              <span className="icon">📅</span>
              <span>Year {formData.year || 'N/A'}</span>
            </MetaItem>
            <MetaItem>
              <span className="icon">🆔</span>
              <span>{formData.rollNumber || 'Roll Number'}</span>
            </MetaItem>
            <MetaItem>
              <span className="icon">📧</span>
              <span>{formData.email}</span>
            </MetaItem>
          </ProfileMeta>
        </ProfileInfo>
      </ProfileHeader>

      <CompletionSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SectionTitle>
          <span className="icon">📊</span>
          Profile Completion
        </SectionTitle>
        <ProgressBar
          value={calculateCompletion()}
          label="Complete your profile to increase visibility"
          variant="auto"
          animated={true}
        />
      </CompletionSection>

      <FormGrid>
        <FormSection
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SectionTitle>
            <span className="icon">👤</span>
            Personal Information
          </SectionTitle>
          
          <FormGroup>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
            />
          </FormGroup>
        </FormSection>

        <FormSection
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SectionTitle>
            <span className="icon">🏫</span>
            Academic Information
          </SectionTitle>
          
          <FormGroup>
            <Label htmlFor="department">Department</Label>
            <Select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Electrical">Electrical</option>
              <option value="Other">Other</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="year">Year</Label>
            <Select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
            >
              <option value="">Select Year</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="rollNumber">Roll Number</Label>
            <Input
              id="rollNumber"
              name="rollNumber"
              type="text"
              value={formData.rollNumber}
              onChange={handleInputChange}
              placeholder="Enter your roll number"
            />
          </FormGroup>
        </FormSection>
      </FormGrid>

      <FormSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <SectionTitle>
          <span className="icon">🛠️</span>
          Skills & Expertise
        </SectionTitle>
        <SkillsBadge
          skills={formData.skills}
          onSkillsUpdate={handleSkillsUpdate}
          editable={true}
        />
      </FormSection>

      <FormSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <SectionTitle>
          <span className="icon">📄</span>
          Resume Upload
        </SectionTitle>
        
        {profileData?.resumeUrl ? (
          <div style={{ marginBottom: '1rem' }}>
            <p>Current Resume: <strong>{profileData.resumeName || 'resume.pdf'}</strong></p>
            <a 
              href={profileData.resumeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#D32F2F', textDecoration: 'none' }}
            >
              View Resume →
            </a>
          </div>
        ) : null}

        <FileUploadArea
          dragOver={dragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => resumeInputRef.current?.click()}
          whileHover={{ scale: 1.02 }}
        >
          <div className="icon">📄</div>
          <div className="text">
            {uploading ? 'Uploading Resume...' : 'Drop your resume here or click to browse'}
          </div>
          <div className="subtext">
            Supports PDF and DOCX files (Max 10MB)
          </div>
        </FileUploadArea>

        <HiddenInput
          ref={resumeInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => e.target.files[0] && handleResumeUpload(e.target.files[0])}
        />
      </FormSection>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <SaveButton
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </SaveButton>
      </div>
    </ProfileContainer>
  );
};

export default ProfileCard;
