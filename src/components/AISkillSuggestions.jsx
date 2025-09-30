import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { SkillBadgesGrid } from './SkillBadge';
import gamificationHelper from '../utils/gamificationHelper';

const pulse = keyframes`
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px rgba(211, 47, 47, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(211, 47, 47, 0.6);
  }
`;

const SuggestionsContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => theme.spacing.lg} 0;
  position: relative;
  overflow: hidden;

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
    animation: ${pulse} 3s infinite;
  }
`;

const SuggestionsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .header-content {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};

    .ai-icon {
      font-size: 2rem;
      animation: ${glow} 2s infinite;
    }

    .header-text {
      .title {
        font-size: ${({ theme }) => theme.typography.fontSize.xl};
        font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
        color: ${({ theme }) => theme.colors.text};
        margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
      }

      .subtitle {
        font-size: ${({ theme }) => theme.typography.fontSize.sm};
        color: ${({ theme }) => theme.colors.textSecondary};
        margin: 0;
      }
    }
  }

  .refresh-button {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};

    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }
`;

const SuggestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const SuggestionCategory = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  position: relative;

  .category-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};

    .category-icon {
      font-size: 1.5rem;
    }

    .category-title {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
      color: ${({ theme }) => theme.colors.text};
      margin: 0;
    }

    .category-count {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      padding: 2px 6px;
      border-radius: ${({ theme }) => theme.borderRadius.sm};
      margin-left: auto;
    }
  }

  .category-description {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const ImpactMeter = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 4px solid ${({ priority, theme }) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.primary;
    }
  }};

  .impact-title {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .impact-description {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .impact-stats {
    display: flex;
    gap: ${({ theme }) => theme.spacing.md};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};

    .stat {
      display: flex;
      align-items: center;
      gap: ${({ theme }) => theme.spacing.xs};
      color: ${({ theme }) => theme.colors.textTertiary};

      .stat-icon {
        font-size: 1rem;
      }
    }
  }
`;

const AIMascot = styled(motion.div)`
  position: absolute;
  top: -20px;
  right: 20px;
  font-size: 3rem;
  z-index: 5;
  cursor: pointer;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xl};
  gap: ${({ theme }) => theme.spacing.md};

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${({ theme }) => theme.colors.border};
    border-top: 3px solid ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    text-align: center;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AISkillSuggestions = ({
  userSkills = [],
  userProfile = {},
  internshipRequirements = [],
  onSkillAdd,
  onRefresh,
  className,
  ...props
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const generateSuggestions = async () => {
    try {
      setLoading(true);
      
      // Generate AI-powered suggestions
      const aiSuggestions = gamificationHelper.generateSkillSuggestions(
        userSkills,
        internshipRequirements
      );

      // Categorize suggestions
      const categorized = {
        missing: aiSuggestions.filter(s => s.category === 'missing'),
        upgrade: aiSuggestions.filter(s => s.category === 'upgrade'),
        required: aiSuggestions.filter(s => s.category === 'required')
      };

      setSuggestions(categorized);
    } catch (error) {
      console.error('Error generating skill suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateSuggestions();
  }, [userSkills, internshipRequirements]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await generateSuggestions();
    if (onRefresh) onRefresh();
    setRefreshing(false);
  };

  const handleSkillClick = (skill) => {
    if (onSkillAdd) {
      onSkillAdd(skill);
    }
  };

  const getTotalSuggestions = () => {
    return Object.values(suggestions).reduce((total, category) => total + category.length, 0);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const categoryVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  if (loading) {
    return (
      <SuggestionsContainer className={className} {...props}>
        <LoadingState>
          <div className="loading-spinner" />
          <div className="loading-text">
            🤖 AI is analyzing your profile and generating personalized skill suggestions...
          </div>
        </LoadingState>
      </SuggestionsContainer>
    );
  }

  if (getTotalSuggestions() === 0) {
    return (
      <SuggestionsContainer className={className} {...props}>
        <SuggestionsHeader>
          <div className="header-content">
            <span className="ai-icon">🤖</span>
            <div className="header-text">
              <h3 className="title">Great Job!</h3>
              <p className="subtitle">Your skill profile looks comprehensive. Keep learning!</p>
            </div>
          </div>
        </SuggestionsHeader>
      </SuggestionsContainer>
    );
  }

  return (
    <SuggestionsContainer
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      <AIMascot
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        🤖
      </AIMascot>

      <SuggestionsHeader>
        <div className="header-content">
          <span className="ai-icon">💡</span>
          <div className="header-text">
            <h3 className="title">AI Skill Recommendations</h3>
            <p className="subtitle">
              Personalized suggestions to boost your internship matches
            </p>
          </div>
        </div>
        <motion.button
          className="refresh-button"
          onClick={handleRefresh}
          disabled={refreshing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span>{refreshing ? '🔄' : '🔄'}</span>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </motion.button>
      </SuggestionsHeader>

      <SuggestionsGrid>
        {suggestions.missing && suggestions.missing.length > 0 && (
          <SuggestionCategory variants={categoryVariants}>
            <div className="category-header">
              <span className="category-icon">🚀</span>
              <h4 className="category-title">High-Demand Skills</h4>
              <span className="category-count">{suggestions.missing.length}</span>
            </div>
            <p className="category-description">
              Popular skills that could significantly improve your internship matches
            </p>
            <SkillBadgesGrid
              skills={[]}
              suggestions={suggestions.missing}
              onSuggestionClick={handleSkillClick}
              maxDisplay={6}
            />
            <ImpactMeter priority="high">
              <div className="impact-title">🎯 High Impact</div>
              <div className="impact-description">
                Adding these skills could increase your match rate by 15-25%
              </div>
              <div className="impact-stats">
                <div className="stat">
                  <span className="stat-icon">📈</span>
                  <span>High demand</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">⚡</span>
                  <span>Quick to learn</span>
                </div>
              </div>
            </ImpactMeter>
          </SuggestionCategory>
        )}

        {suggestions.required && suggestions.required.length > 0 && (
          <SuggestionCategory variants={categoryVariants}>
            <div className="category-header">
              <span className="category-icon">🎯</span>
              <h4 className="category-title">Target Internship Skills</h4>
              <span className="category-count">{suggestions.required.length}</span>
            </div>
            <p className="category-description">
              Skills required for specific internships you're interested in
            </p>
            <SkillBadgesGrid
              skills={[]}
              suggestions={suggestions.required}
              onSuggestionClick={handleSkillClick}
              maxDisplay={6}
            />
            <ImpactMeter priority="high">
              <div className="impact-title">🎯 Essential</div>
              <div className="impact-description">
                Required for specific internship applications
              </div>
              <div className="impact-stats">
                <div className="stat">
                  <span className="stat-icon">🎯</span>
                  <span>Target specific</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">🔥</span>
                  <span>High priority</span>
                </div>
              </div>
            </ImpactMeter>
          </SuggestionCategory>
        )}

        {suggestions.upgrade && suggestions.upgrade.length > 0 && (
          <SuggestionCategory variants={categoryVariants}>
            <div className="category-header">
              <span className="category-icon">⬆️</span>
              <h4 className="category-title">Skill Upgrades</h4>
              <span className="category-count">{suggestions.upgrade.length}</span>
            </div>
            <p className="category-description">
              Existing skills that could benefit from improvement
            </p>
            <SkillBadgesGrid
              skills={[]}
              suggestions={suggestions.upgrade}
              onSuggestionClick={handleSkillClick}
              maxDisplay={6}
            />
            <ImpactMeter priority="medium">
              <div className="impact-title">📈 Improvement</div>
              <div className="impact-description">
                Enhance existing skills to boost credibility
              </div>
              <div className="impact-stats">
                <div className="stat">
                  <span className="stat-icon">⭐</span>
                  <span>Quality boost</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">🏆</span>
                  <span>Credibility</span>
                </div>
              </div>
            </ImpactMeter>
          </SuggestionCategory>
        )}
      </SuggestionsGrid>
    </SuggestionsContainer>
  );
};

export default AISkillSuggestions;
