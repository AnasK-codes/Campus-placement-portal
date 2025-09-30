import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  doc, 
  updateDoc, 
  serverTimestamp, 
  getDoc,
  addDoc,
  collection
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

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
    background: linear-gradient(90deg, #FF9800, #FFB74D);
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
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 1rem;
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

const UrgencyBadge = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ urgent }) => urgent ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)'};
  color: ${({ urgent }) => urgent ? '#f44336' : '#FF9800'};
  border: 1px solid ${({ urgent }) => urgent ? '#f44336' : '#FF9800'};
  animation: ${({ urgent }) => urgent ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
    100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
  }
`;

const InternshipInfo = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InternshipTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .company-logo {
    width: 30px;
    height: 30px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    background: ${({ theme }) => theme.colors.gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 0.8rem;
  }
`;

const InternshipDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const DetailItem = styled.div`
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
`;

const SkillsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .skills-header {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
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
  background: ${({ matched, theme }) => 
    matched ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'};
  color: ${({ matched, theme }) => 
    matched ? '#4CAF50' : '#f44336'};
  border: 1px solid ${({ matched }) => 
    matched ? '#4CAF50' : '#f44336'};
  position: relative;

  ${({ matched }) => matched && `
    &::after {
      content: '✓';
      position: absolute;
      top: -4px;
      right: -4px;
      background: #4CAF50;
      color: white;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `}
`;

const AIInsights = styled.div`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .ai-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-weight: 600;
    color: #667eea;
    font-size: 0.9rem;
  }

  .recommendation {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
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

const ApproveButton = styled(motion.button)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
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

const RejectButton = styled(motion.button)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: transparent;
  color: #f44336;
  border: 2px solid #f44336;
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
    background: #f44336;
    color: white;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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

const PendingApprovalCard = ({ application, index, onApprove, onReject }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [internshipData, setInternshipData] = useState(null);
  const [showNotification, setShowNotification] = useState(null);

  useEffect(() => {
    const loadApplicationData = async () => {
      try {
        // Load student data
        if (application.studentId) {
          const studentDoc = await getDoc(doc(db, 'users', application.studentId));
          if (studentDoc.exists()) {
            setStudentData(studentDoc.data());
          }
        }

        // Load internship data
        if (application.internshipId) {
          const internshipDoc = await getDoc(doc(db, 'internships', application.internshipId));
          if (internshipDoc.exists()) {
            setInternshipData(internshipDoc.data());
          }
        }
      } catch (error) {
        console.error('Error loading application data:', error);
      }
    };

    loadApplicationData();
  }, [application]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDaysAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const now = new Date();
    const submissionDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffTime = Math.abs(now - submissionDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const isUrgent = (timestamp) => {
    if (!timestamp) return false;
    const now = new Date();
    const submissionDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffTime = Math.abs(now - submissionDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 3; // Urgent if pending for 3+ days
  };

  const getSkillMatch = () => {
    if (!studentData?.skills || !internshipData?.skills) return [];
    const studentSkills = studentData.skills.map(s => s.toLowerCase());
    return internshipData.skills.map(skill => ({
      skill,
      matched: studentSkills.includes(skill.toLowerCase())
    }));
  };

  const generateAIRecommendation = () => {
    const skillMatches = getSkillMatch();
    const matchedCount = skillMatches.filter(s => s.matched).length;
    const totalSkills = skillMatches.length;
    const matchPercentage = totalSkills > 0 ? Math.round((matchedCount / totalSkills) * 100) : 0;

    if (matchPercentage >= 80) {
      return "🎯 Excellent skill match! This student is well-qualified for the role.";
    } else if (matchPercentage >= 60) {
      return "✅ Good skill alignment. Student shows strong potential for this internship.";
    } else if (matchPercentage >= 40) {
      return "📈 Moderate match. Consider if student's other qualities compensate for skill gaps.";
    } else {
      return "⚠️ Limited skill match. Recommend additional training or consider alternative roles.";
    }
  };

  const handleApprove = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Update application status
      await updateDoc(doc(db, 'applications', application.id), {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: currentUser.uid,
        mentorFeedback: 'Application approved by mentor'
      });

      // Create notification for student
      await addDoc(collection(db, 'notifications'), {
        userId: application.studentId,
        type: 'application_approved',
        title: 'Application Approved! 🎉',
        message: `Your application for ${internshipData?.role || 'the internship'} at ${internshipData?.company || 'the company'} has been approved by your mentor.`,
        read: false,
        createdAt: serverTimestamp(),
        applicationId: application.id
      });

      setShowNotification({ type: 'success', message: 'Application approved successfully!' });
      setTimeout(() => setShowNotification(null), 3000);

      if (onApprove) onApprove();
    } catch (error) {
      console.error('Error approving application:', error);
      setShowNotification({ type: 'error', message: 'Failed to approve application. Please try again.' });
      setTimeout(() => setShowNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (loading) return;
    
    const reason = prompt('Please provide a reason for rejection (optional):');
    
    setLoading(true);
    try {
      // Update application status
      await updateDoc(doc(db, 'applications', application.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: currentUser.uid,
        mentorFeedback: reason || 'Application rejected by mentor'
      });

      // Create notification for student
      await addDoc(collection(db, 'notifications'), {
        userId: application.studentId,
        type: 'application_rejected',
        title: 'Application Update',
        message: `Your application for ${internshipData?.role || 'the internship'} at ${internshipData?.company || 'the company'} requires revision. ${reason ? `Reason: ${reason}` : 'Please contact your mentor for guidance.'}`,
        read: false,
        createdAt: serverTimestamp(),
        applicationId: application.id
      });

      setShowNotification({ type: 'success', message: 'Application rejected and student notified.' });
      setTimeout(() => setShowNotification(null), 3000);

      if (onReject) onReject();
    } catch (error) {
      console.error('Error rejecting application:', error);
      setShowNotification({ type: 'error', message: 'Failed to reject application. Please try again.' });
      setTimeout(() => setShowNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const skillMatches = getSkillMatch();

  return (
    <>
      <CardContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        whileHover={{ scale: 1.01 }}
      >
        <CardHeader>
          <StudentInfo>
            <StudentName>
              <div className="avatar">
                {getInitials(studentData?.name || application.studentName)}
              </div>
              {studentData?.name || application.studentName}
            </StudentName>
            <StudentDetails>
              <div className="detail-item">
                <span className="icon">📧</span>
                {studentData?.email || application.studentEmail}
              </div>
              <div className="detail-item">
                <span className="icon">🎓</span>
                {studentData?.department} - {studentData?.year}
              </div>
              <div className="detail-item">
                <span className="icon">📅</span>
                Submitted {getDaysAgo(application.createdAt)}
              </div>
            </StudentDetails>
          </StudentInfo>

          <UrgencyBadge
            urgent={isUrgent(application.createdAt)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {isUrgent(application.createdAt) ? 'Urgent' : 'Pending'}
          </UrgencyBadge>
        </CardHeader>

        <InternshipInfo>
          <InternshipTitle>
            <div className="company-logo">
              {internshipData?.company?.charAt(0) || '🏢'}
            </div>
            {internshipData?.role || application.internshipTitle} at {internshipData?.company || application.companyName}
          </InternshipTitle>

          <InternshipDetails>
            <DetailItem>
              <div className="label">Duration</div>
              <div className="value">{internshipData?.duration || 'Not specified'}</div>
            </DetailItem>
            <DetailItem>
              <div className="label">Location</div>
              <div className="value">{internshipData?.location || 'Not specified'}</div>
            </DetailItem>
            <DetailItem>
              <div className="label">Stipend</div>
              <div className="value">
                {internshipData?.stipendMin ? 
                  `₹${parseInt(internshipData.stipendMin).toLocaleString()}` : 
                  'Not specified'
                }
              </div>
            </DetailItem>
            <DetailItem>
              <div className="label">Available Seats</div>
              <div className="value">
                {internshipData?.seats ? 
                  `${(internshipData.seats - (internshipData.acceptedApplications || 0))} left` : 
                  'Not specified'
                }
              </div>
            </DetailItem>
          </InternshipDetails>
        </InternshipInfo>

        {skillMatches.length > 0 && (
          <SkillsSection>
            <div className="skills-header">
              Skill Match Analysis ({skillMatches.filter(s => s.matched).length}/{skillMatches.length} matched)
            </div>
            <div className="skills-grid">
              {skillMatches.slice(0, 8).map((skillMatch, idx) => (
                <SkillTag key={idx} matched={skillMatch.matched}>
                  {skillMatch.skill}
                </SkillTag>
              ))}
              {skillMatches.length > 8 && (
                <SkillTag>+{skillMatches.length - 8} more</SkillTag>
              )}
            </div>
          </SkillsSection>
        )}

        <AIInsights>
          <div className="ai-header">
            <span>🤖</span>
            AI Recommendation
          </div>
          <div className="recommendation">
            {generateAIRecommendation()}
          </div>
        </AIInsights>

        <ActionButtons>
          <ApproveButton
            onClick={handleApprove}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="icon">{loading ? '⏳' : '✅'}</span>
            {loading ? 'Approving...' : 'Approve Application'}
          </ApproveButton>

          <RejectButton
            onClick={handleReject}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="icon">❌</span>
            Reject Application
          </RejectButton>
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

export default PendingApprovalCard;
