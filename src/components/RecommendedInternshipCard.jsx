import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import ProgressBar from './ProgressBar';

const CardContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 2px solid ${({ matchScore }) => {
    if (matchScore >= 80) return '#4CAF50';
    if (matchScore >= 60) return '#FF9800';
    if (matchScore >= 40) return '#2196F3';
    return '#9E9E9E';
  }};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ matchScore }) => {
      if (matchScore >= 80) return 'linear-gradient(90deg, #4CAF50, #66BB6A)';
      if (matchScore >= 60) return 'linear-gradient(90deg, #FF9800, #FFB74D)';
      if (matchScore >= 40) return 'linear-gradient(90deg, #2196F3, #64B5F6)';
      return 'linear-gradient(90deg, #9E9E9E, #BDBDBD)';
    }};
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CompanyInfo = styled.div`
  flex: 1;
`;

const CompanyLogo = styled.div`
  width: 60px;
  height: 60px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CompanyName = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const RoleName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const MatchBadge = styled(motion.div)`
  background: ${({ matchScore }) => {
    if (matchScore >= 80) return 'linear-gradient(135deg, #4CAF50, #66BB6A)';
    if (matchScore >= 60) return 'linear-gradient(135deg, #FF9800, #FFB74D)';
    if (matchScore >= 40) return 'linear-gradient(135deg, #2196F3, #64B5F6)';
    return 'linear-gradient(135deg, #9E9E9E, #BDBDBD)';
  }};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  box-shadow: ${({ theme }) => theme.shadows.sm};

  .icon {
    font-size: 1rem;
  }
`;

const MatchProgress = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.sm};

    .label {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      font-size: 0.9rem;
    }

    .percentage {
      font-weight: 700;
      color: ${({ matchScore }) => {
        if (matchScore >= 80) return '#4CAF50';
        if (matchScore >= 60) return '#FF9800';
        if (matchScore >= 40) return '#2196F3';
        return '#9E9E9E';
      }};
    }
  }
`;

const InternshipDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const DetailItem = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};

  .icon {
    font-size: 1.2rem;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .value {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .label {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SkillsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .skills-header {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: 0.9rem;
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
    matched ? 'rgba(76, 175, 80, 0.1)' : theme.colors.surface};
  color: ${({ matched, theme }) => 
    matched ? '#4CAF50' : theme.colors.text};
  border: 1px solid ${({ matched }) => 
    matched ? '#4CAF50' : 'transparent'};
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

  .insights-list {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
  }

  .insight-item {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text};

    .insight-icon {
      font-size: 1rem;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const ApplyButton = styled(motion.button)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.gradient};
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

const AIMascot = styled(motion.div)`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;

  &:hover {
    transform: scale(1.1);
  }
`;

const ConfettiOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.borderRadius.xl};

  .confetti-piece {
    position: absolute;
    width: 8px;
    height: 8px;
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const RecommendedInternshipCard = ({ internship, studentProfile, onApply, onView }) => {
  const { currentUser } = useAuth();
  const [applying, setApplying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate available seats
  const availableSeats = (internship.seats || 0) - (internship.acceptedApplications || 0);
  
  // Format stipend display
  const formatStipend = () => {
    if (!internship.stipendMin) return 'Not specified';
    if (!internship.stipendMax || internship.stipendMin === internship.stipendMax) {
      return `₹${parseInt(internship.stipendMin).toLocaleString()}`;
    }
    return `₹${parseInt(internship.stipendMin).toLocaleString()} - ₹${parseInt(internship.stipendMax).toLocaleString()}`;
  };

  // Handle 1-click apply
  const handleApply = async () => {
    if (!currentUser || applying) return;
    
    setApplying(true);
    try {
      const applicationData = {
        studentId: currentUser.uid,
        studentName: studentProfile?.name || currentUser.displayName,
        studentEmail: currentUser.email,
        internshipId: internship.id,
        internshipTitle: internship.role,
        companyName: internship.company,
        status: 'pending',
        appliedAt: serverTimestamp(),
        matchScore: internship.matchScore,
        aiRecommended: true
      };

      await addDoc(collection(db, 'applications'), applicationData);
      
      // Show confetti for high match scores
      if (internship.matchScore >= 90) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      if (onApply) {
        onApply(internship);
      }
    } catch (error) {
      console.error('Error applying to internship:', error);
      alert('Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  // Get match score color and icon
  const getMatchInfo = () => {
    const score = internship.matchScore || 0;
    if (score >= 80) return { color: '#4CAF50', icon: '🎯', label: 'Excellent Match' };
    if (score >= 60) return { color: '#FF9800', icon: '✅', label: 'Good Match' };
    if (score >= 40) return { color: '#2196F3', icon: '📈', label: 'Moderate Match' };
    return { color: '#9E9E9E', icon: '🌱', label: 'Growth Opportunity' };
  };

  const matchInfo = getMatchInfo();

  // Check if student has matching skills
  const getSkillMatches = () => {
    if (!studentProfile?.skills || !internship.skills) return [];
    const studentSkills = studentProfile.skills.map(s => s.toLowerCase());
    return internship.skills.map(skill => ({
      skill,
      matched: studentSkills.includes(skill.toLowerCase())
    }));
  };

  const skillMatches = getSkillMatches();

  return (
    <CardContainer
      matchScore={internship.matchScore}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* AI Mascot */}
      <AIMascot
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
      >
        🤖
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: -50 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              style={{
                position: 'absolute',
                background: '#333',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              AI recommends this because of your {internship.matchDetails?.skillMatches?.length || 0} skill matches!
            </motion.div>
          )}
        </AnimatePresence>
      </AIMascot>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <ConfettiOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="confetti-piece"
                initial={{
                  x: Math.random() * 400,
                  y: -10,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  y: 500,
                  rotate: Math.random() * 360,
                  transition: {
                    duration: Math.random() * 2 + 1,
                    ease: 'easeOut'
                  }
                }}
                style={{
                  backgroundColor: ['#4CAF50', '#FF9800', '#2196F3', '#9C27B0'][Math.floor(Math.random() * 4)]
                }}
              />
            ))}
          </ConfettiOverlay>
        )}
      </AnimatePresence>

      {/* Card Header */}
      <CardHeader>
        <CompanyInfo>
          <CompanyLogo>
            {internship.company?.charAt(0) || '🏢'}
          </CompanyLogo>
          <CompanyName>{internship.company}</CompanyName>
          <RoleName>{internship.role}</RoleName>
        </CompanyInfo>
        <MatchBadge
          matchScore={internship.matchScore}
          whileHover={{ scale: 1.05 }}
        >
          <span className="icon">{matchInfo.icon}</span>
          {internship.matchScore}% Match
        </MatchBadge>
      </CardHeader>

      {/* Match Progress */}
      <MatchProgress matchScore={internship.matchScore}>
        <div className="progress-header">
          <span className="label">{matchInfo.label}</span>
          <span className="percentage">{internship.matchScore}%</span>
        </div>
        <ProgressBar
          percentage={internship.matchScore}
          color={matchInfo.color}
          animated={true}
        />
      </MatchProgress>

      {/* Internship Details */}
      <InternshipDetails>
        <DetailItem>
          <div className="icon">💰</div>
          <div className="value">{formatStipend()}</div>
          <div className="label">Stipend</div>
        </DetailItem>
        <DetailItem>
          <div className="icon">⏱️</div>
          <div className="value">{internship.duration || 'Not specified'}</div>
          <div className="label">Duration</div>
        </DetailItem>
        <DetailItem>
          <div className="icon">🪑</div>
          <div className="value">{availableSeats}</div>
          <div className="label">Seats Left</div>
        </DetailItem>
        <DetailItem>
          <div className="icon">📍</div>
          <div className="value">{internship.location || 'Remote'}</div>
          <div className="label">Location</div>
        </DetailItem>
      </InternshipDetails>

      {/* Skills Section */}
      {skillMatches.length > 0 && (
        <SkillsSection>
          <div className="skills-header">Required Skills</div>
          <div className="skills-grid">
            {skillMatches.slice(0, 8).map((skillMatch, index) => (
              <SkillTag key={index} matched={skillMatch.matched}>
                {skillMatch.skill}
              </SkillTag>
            ))}
            {skillMatches.length > 8 && (
              <SkillTag>+{skillMatches.length - 8} more</SkillTag>
            )}
          </div>
        </SkillsSection>
      )}

      {/* AI Insights */}
      {internship.aiRecommendation && internship.aiRecommendation.length > 0 && (
        <AIInsights>
          <div className="ai-header">
            <span>🤖</span>
            AI Insights
          </div>
          <div className="insights-list">
            {internship.aiRecommendation.slice(0, 3).map((insight, index) => (
              <div key={index} className="insight-item">
                <span className="insight-icon">{insight.icon}</span>
                <span>{insight.message}</span>
              </div>
            ))}
          </div>
        </AIInsights>
      )}

      {/* Action Buttons */}
      <ActionButtons>
        <ApplyButton
          onClick={handleApply}
          disabled={applying || availableSeats <= 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="icon">{applying ? '⏳' : '🚀'}</span>
          {applying ? 'Applying...' : availableSeats <= 0 ? 'No Seats Available' : 'Apply with 1 Click'}
        </ApplyButton>
      </ActionButtons>

      {/* Conversion Potential Badge */}
      {internship.conversionPotential && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'linear-gradient(135deg, #4CAF50, #66BB6A)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.7rem',
            fontWeight: '600'
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          🎯 Conversion Possible
        </motion.div>
      )}
    </CardContainer>
  );
};

export default RecommendedInternshipCard;
