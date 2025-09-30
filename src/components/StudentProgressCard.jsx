import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import ProgressBar from './ProgressBar';
import aiRecommendationEngine from '../utils/aiRecommendation';

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
    background: ${({ profileHealth }) => {
      if (profileHealth >= 80) return 'linear-gradient(90deg, #4CAF50, #66BB6A)';
      if (profileHealth >= 60) return 'linear-gradient(90deg, #2196F3, #64B5F6)';
      if (profileHealth >= 40) return 'linear-gradient(90deg, #FF9800, #FFB74D)';
      return 'linear-gradient(90deg, #f44336, #ef5350)';
    }};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StudentInfo = styled.div`
  flex: 1;
  min-width: 250px;
`;

const StudentName = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1.1rem;
  }
`;

const StudentDetails = styled.div`
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
  }
`;

const HealthBadge = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ health }) => {
    if (health >= 80) return 'rgba(76, 175, 80, 0.1)';
    if (health >= 60) return 'rgba(33, 150, 243, 0.1)';
    if (health >= 40) return 'rgba(255, 152, 0, 0.1)';
    return 'rgba(244, 67, 54, 0.1)';
  }};
  color: ${({ health }) => {
    if (health >= 80) return '#4CAF50';
    if (health >= 60) return '#2196F3';
    if (health >= 40) return '#FF9800';
    return '#f44336';
  }};
  border: 1px solid ${({ health }) => {
    if (health >= 80) return '#4CAF50';
    if (health >= 60) return '#2196F3';
    if (health >= 40) return '#FF9800';
    return '#f44336';
  }};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  .icon {
    font-size: 1rem;
  }
`;

const ProgressSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProgressItem = styled.div`
  .progress-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};

    .percentage {
      color: ${({ color }) => color || 'var(--primary)'};
      font-weight: 700;
    }
  }
`;

const ApplicationsSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.md};

    .title {
      font-size: 1rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      display: flex;
      align-items: center;
      gap: ${({ theme }) => theme.spacing.sm};
    }

    .count {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
      padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
      border-radius: ${({ theme }) => theme.borderRadius.md};
      font-size: 0.8rem;
      font-weight: 600;
    }
  }
`;

const ApplicationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 200px;
  overflow-y: auto;
`;

const ApplicationItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 4px solid ${({ status }) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#f44336';
      case 'pending': return '#FF9800';
      case 'interview': return '#2196F3';
      default: return '#9E9E9E';
    }
  }};

  .application-info {
    flex: 1;

    .role {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      font-size: 0.9rem;
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }

    .company {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }

  .status-badge {
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    background: ${({ status }) => {
      switch (status) {
        case 'approved': return 'rgba(76, 175, 80, 0.1)';
        case 'rejected': return 'rgba(244, 67, 54, 0.1)';
        case 'pending': return 'rgba(255, 152, 0, 0.1)';
        case 'interview': return 'rgba(33, 150, 243, 0.1)';
        default: return 'rgba(158, 158, 158, 0.1)';
      }
    }};
    color: ${({ status }) => {
      switch (status) {
        case 'approved': return '#4CAF50';
        case 'rejected': return '#f44336';
        case 'pending': return '#FF9800';
        case 'interview': return '#2196F3';
        default: return '#9E9E9E';
      }
    }};
  }
`;

const AISection = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .ai-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-weight: 600;
    color: #667eea;
    font-size: 1rem;
  }

  .suggestions-grid {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    padding: ${({ theme }) => theme.spacing.sm};
    background: rgba(255, 255, 255, 0.1);
    border-radius: ${({ theme }) => theme.borderRadius.md};
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.text};

    .suggestion-icon {
      font-size: 1rem;
    }

    .suggestion-text {
      flex: 1;
    }

    .priority-badge {
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      background: ${({ priority }) => {
        switch (priority) {
          case 'high': return 'rgba(244, 67, 54, 0.2)';
          case 'medium': return 'rgba(255, 152, 0, 0.2)';
          default: return 'rgba(158, 158, 158, 0.2)';
        }
      }};
      color: ${({ priority }) => {
        switch (priority) {
          case 'high': return '#f44336';
          case 'medium': return '#FF9800';
          default: return '#9E9E9E';
        }
      }};
    }
  }
`;

const SkillsSection = styled.div`
  .skills-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.md};

    .title {
      font-size: 1rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
    }

    .skills-count {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }

  .skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const SkillTag = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.8rem;
  font-weight: 500;
  background: ${({ strength, theme }) => {
    switch (strength) {
      case 'strong': return 'rgba(76, 175, 80, 0.1)';
      case 'moderate': return 'rgba(33, 150, 243, 0.1)';
      case 'weak': return 'rgba(255, 152, 0, 0.1)';
      default: return theme.colors.surface;
    }
  }};
  color: ${({ strength, theme }) => {
    switch (strength) {
      case 'strong': return '#4CAF50';
      case 'moderate': return '#2196F3';
      case 'weak': return '#FF9800';
      default: return theme.colors.text;
    }
  }};
  border: 1px solid ${({ strength }) => {
    switch (strength) {
      case 'strong': return '#4CAF50';
      case 'moderate': return '#2196F3';
      case 'weak': return '#FF9800';
      default: return 'transparent';
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(motion.button)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.gradient : 'transparent'};
  color: ${({ variant, theme }) => 
    variant === 'primary' ? 'white' : theme.colors.primary};
  border: ${({ variant, theme }) => 
    variant === 'primary' ? 'none' : `2px solid ${theme.colors.primary}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ variant, theme }) => 
      variant === 'primary' ? theme.colors.gradient : theme.colors.primary};
    color: white;
  }

  .icon {
    font-size: 1rem;
  }
`;

const StudentProgressCard = ({ student, index }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        // Load student applications
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('studentId', '==', student.id),
          orderBy('createdAt', 'desc')
        );

        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsList = [];
        applicationsSnapshot.forEach((doc) => {
          applicationsList.push({ id: doc.id, ...doc.data() });
        });

        setApplications(applicationsList);

        // Generate AI suggestions
        generateAISuggestions(student, applicationsList);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading student data:', error);
        setLoading(false);
      }
    };

    loadStudentData();
  }, [student]);

  const generateAISuggestions = (studentData, studentApplications) => {
    const suggestions = [];

    // Profile completion check
    const profileCompletion = calculateProfileCompletion(studentData);
    if (profileCompletion < 80) {
      suggestions.push({
        icon: '👤',
        text: `Complete profile (${Math.round(profileCompletion)}% done). Add missing skills, projects, or experience.`,
        priority: 'high'
      });
    }

    // Skills analysis
    if (!studentData.skills || studentData.skills.length < 5) {
      suggestions.push({
        icon: '🛠️',
        text: 'Add more technical skills to improve internship matching.',
        priority: 'high'
      });
    }

    // Application success rate
    const approvedApps = studentApplications.filter(app => app.status === 'approved').length;
    const totalApps = studentApplications.length;
    if (totalApps > 0 && (approvedApps / totalApps) < 0.3) {
      suggestions.push({
        icon: '📈',
        text: 'Low application success rate. Consider improving profile or targeting better-matched roles.',
        priority: 'medium'
      });
    }

    // Recent activity
    const recentApps = studentApplications.filter(app => {
      const appDate = app.createdAt?.toDate ? app.createdAt.toDate() : new Date(app.createdAt);
      const daysSince = (new Date() - appDate) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });

    if (recentApps.length === 0 && totalApps > 0) {
      suggestions.push({
        icon: '⏰',
        text: 'No recent applications. Encourage student to stay active in job search.',
        priority: 'medium'
      });
    }

    // Missing popular skills
    const popularSkills = ['JavaScript', 'Python', 'React', 'Java', 'SQL', 'Git'];
    const studentSkills = studentData.skills?.map(s => s.toLowerCase()) || [];
    const missingPopularSkills = popularSkills.filter(skill => 
      !studentSkills.includes(skill.toLowerCase())
    );

    if (missingPopularSkills.length > 0) {
      suggestions.push({
        icon: '💡',
        text: `Consider learning ${missingPopularSkills.slice(0, 2).join(', ')} to improve job prospects.`,
        priority: 'low'
      });
    }

    setAiSuggestions(suggestions.slice(0, 4)); // Limit to 4 suggestions
  };

  const calculateProfileCompletion = (studentData) => {
    let score = 0;
    let maxScore = 0;

    // Basic info (20%)
    maxScore += 20;
    if (studentData.name && studentData.email) score += 20;

    // Skills (30%)
    maxScore += 30;
    if (studentData.skills && studentData.skills.length > 0) {
      score += Math.min(studentData.skills.length * 3, 30);
    }

    // Education (20%)
    maxScore += 20;
    if (studentData.department && studentData.year) score += 20;

    // Projects/Experience (20%)
    maxScore += 20;
    if (studentData.projects && studentData.projects.length > 0) {
      score += Math.min(studentData.projects.length * 10, 20);
    }

    // Resume (10%)
    maxScore += 10;
    if (studentData.resumeUrl) score += 10;

    return Math.round((score / maxScore) * 100);
  };

  const getApplicationSuccessRate = () => {
    if (applications.length === 0) return 0;
    const approved = applications.filter(app => app.status === 'approved').length;
    return Math.round((approved / applications.length) * 100);
  };

  const getSkillStrength = (skill) => {
    // Simple heuristic based on skill popularity and student's other skills
    const popularSkills = ['JavaScript', 'Python', 'React', 'Java', 'SQL'];
    if (popularSkills.includes(skill)) return 'strong';
    
    const moderateSkills = ['HTML', 'CSS', 'Git', 'MongoDB', 'Node.js'];
    if (moderateSkills.includes(skill)) return 'moderate';
    
    return 'weak';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getHealthStatus = (completion) => {
    if (completion >= 80) return { label: 'Excellent', icon: '🎯' };
    if (completion >= 60) return { label: 'Good', icon: '✅' };
    if (completion >= 40) return { label: 'Fair', icon: '📈' };
    return { label: 'Needs Attention', icon: '⚠️' };
  };

  const profileCompletion = calculateProfileCompletion(student);
  const successRate = getApplicationSuccessRate();
  const healthStatus = getHealthStatus(profileCompletion);

  return (
    <CardContainer
      profileHealth={profileCompletion}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.01 }}
    >
      <CardHeader>
        <StudentInfo>
          <StudentName>
            <div className="avatar">
              {getInitials(student.name)}
            </div>
            {student.name}
          </StudentName>
          <StudentDetails>
            <div className="detail-item">
              <span className="icon">📧</span>
              {student.email}
            </div>
            <div className="detail-item">
              <span className="icon">🎓</span>
              {student.department} - {student.year}
            </div>
            <div className="detail-item">
              <span className="icon">📱</span>
              {student.phone || 'Not provided'}
            </div>
          </StudentDetails>
        </StudentInfo>

        <HealthBadge
          health={profileCompletion}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="icon">{healthStatus.icon}</span>
          {healthStatus.label}
        </HealthBadge>
      </CardHeader>

      <ProgressSection>
        <ProgressGrid>
          <ProgressItem color="#4CAF50">
            <div className="progress-label">
              <span>Profile Completion</span>
              <span className="percentage">{profileCompletion}%</span>
            </div>
            <ProgressBar
              percentage={profileCompletion}
              color="#4CAF50"
              animated={true}
              variant="auto"
            />
          </ProgressItem>

          <ProgressItem color="#2196F3">
            <div className="progress-label">
              <span>Application Success Rate</span>
              <span className="percentage">{successRate}%</span>
            </div>
            <ProgressBar
              percentage={successRate}
              color="#2196F3"
              animated={true}
              variant="auto"
            />
          </ProgressItem>
        </ProgressGrid>
      </ProgressSection>

      <ApplicationsSection>
        <div className="section-header">
          <div className="title">
            <span>📋</span>
            Recent Applications
          </div>
          <div className="count">{applications.length}</div>
        </div>

        {applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📝</div>
            <p>No applications yet</p>
          </div>
        ) : (
          <ApplicationsList>
            {applications.slice(0, 5).map((app, idx) => (
              <ApplicationItem key={app.id} status={app.status}>
                <div className="application-info">
                  <div className="role">{app.internshipTitle}</div>
                  <div className="company">{app.companyName}</div>
                </div>
                <div className="status-badge">{app.status}</div>
              </ApplicationItem>
            ))}
          </ApplicationsList>
        )}
      </ApplicationsSection>

      {student.skills && student.skills.length > 0 && (
        <SkillsSection>
          <div className="skills-header">
            <div className="title">Skills Portfolio</div>
            <div className="skills-count">{student.skills.length} skills</div>
          </div>
          <div className="skills-grid">
            {student.skills.slice(0, 12).map((skill, idx) => (
              <SkillTag key={idx} strength={getSkillStrength(skill)}>
                {skill}
              </SkillTag>
            ))}
            {student.skills.length > 12 && (
              <SkillTag>+{student.skills.length - 12} more</SkillTag>
            )}
          </div>
        </SkillsSection>
      )}

      {aiSuggestions.length > 0 && (
        <AISection>
          <div className="ai-header">
            <span>🤖</span>
            AI Recommendations for {student.name}
          </div>
          <div className="suggestions-grid">
            {aiSuggestions.map((suggestion, idx) => (
              <div key={idx} className="suggestion-item" priority={suggestion.priority}>
                <span className="suggestion-icon">{suggestion.icon}</span>
                <span className="suggestion-text">{suggestion.text}</span>
                <span className="priority-badge">{suggestion.priority}</span>
              </div>
            ))}
          </div>
        </AISection>
      )}

      <ActionButtons>
        <ActionButton
          variant="primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Navigate to student profile or send message
            console.log('View student profile:', student.id);
          }}
        >
          <span className="icon">👤</span>
          View Profile
        </ActionButton>

        <ActionButton
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Send guidance message or schedule meeting
            console.log('Contact student:', student.id);
          }}
        >
          <span className="icon">💬</span>
          Send Guidance
        </ActionButton>
      </ActionButtons>
    </CardContainer>
  );
};

export default StudentProgressCard;
