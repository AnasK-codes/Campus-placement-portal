import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const SkillsContainer = styled.div`
  width: 100%;
`;

const SkillsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  min-height: 60px;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
`;

const SkillBadge = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'matched': return 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)';
      case 'missing': return 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)';
      case 'partial': return 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)';
      default: return theme.colors.gradient;
    }
  }};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: ${({ editable }) => editable ? 'pointer' : 'default'};
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: ${({ editable }) => editable ? 'translateY(-2px)' : 'none'};
    box-shadow: ${({ editable }) => editable ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  .skill-text {
    position: relative;
    z-index: 1;
  }

  .remove-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 0.7rem;
    color: white;
    transition: all ${({ theme }) => theme.transitions.fast};

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
  }

  .match-indicator {
    font-size: 0.7rem;
    margin-left: ${({ theme }) => theme.spacing.xs};
    opacity: 0.9;
  }
`;

const AddSkillSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-end;
  flex-wrap: wrap;
`;

const SkillInput = styled.input`
  flex: 1;
  min-width: 200px;
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

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const AddButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuggestionsContainer = styled(motion.div)`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const SuggestionsTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SuggestionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SuggestionBadge = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;

  .icon {
    font-size: 2rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const SkillsBadge = ({ 
  skills = [], 
  onSkillsUpdate, 
  editable = false, 
  showSuggestions = true,
  matchedSkills = null, // For showing skill matching results
  maxSkills = 20 
}) => {
  const [newSkill, setNewSkill] = useState('');
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const inputRef = useRef(null);

  // Common skill suggestions for students
  const skillSuggestions = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'HTML/CSS',
    'SQL', 'Git', 'MongoDB', 'Express.js', 'TypeScript', 'Angular',
    'Vue.js', 'PHP', 'C++', 'C#', '.NET', 'Spring Boot', 'Django',
    'Flask', 'AWS', 'Docker', 'Kubernetes', 'Machine Learning',
    'Data Analysis', 'Figma', 'Adobe Photoshop', 'UI/UX Design',
    'Project Management', 'Communication', 'Leadership', 'Problem Solving'
  ];

  const getSkillVariant = (skill) => {
    if (!matchedSkills) return 'default';
    
    const match = matchedSkills.find(m => m.name.toLowerCase() === skill.toLowerCase());
    if (!match) return 'default';
    
    if (match.matched) return 'matched';
    if (match.partial) return 'partial';
    return 'missing';
  };

  const getSkillMatchInfo = (skill) => {
    if (!matchedSkills) return null;
    
    const match = matchedSkills.find(m => m.name.toLowerCase() === skill.toLowerCase());
    return match;
  };

  const handleAddSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (!trimmedSkill || skills.length >= maxSkills) return;
    
    // Check if skill already exists (case insensitive)
    const exists = skills.some(skill => 
      skill.toLowerCase() === trimmedSkill.toLowerCase()
    );
    
    if (!exists) {
      const updatedSkills = [...skills, trimmedSkill];
      onSkillsUpdate(updatedSkills);
      setNewSkill('');
      inputRef.current?.focus();
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    onSkillsUpdate(updatedSkills);
  };

  const handleSuggestionClick = (suggestion) => {
    if (skills.length >= maxSkills) return;
    
    const exists = skills.some(skill => 
      skill.toLowerCase() === suggestion.toLowerCase()
    );
    
    if (!exists) {
      const updatedSkills = [...skills, suggestion];
      onSkillsUpdate(updatedSkills);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const getFilteredSuggestions = () => {
    return skillSuggestions.filter(suggestion => 
      !skills.some(skill => skill.toLowerCase() === suggestion.toLowerCase())
    ).slice(0, 12);
  };

  return (
    <SkillsContainer>
      <SkillsGrid>
        <AnimatePresence>
          {skills.length === 0 ? (
            <EmptyState>
              <div className="icon">🛠️</div>
              <div>No skills added yet. {editable ? 'Add your first skill below!' : ''}</div>
            </EmptyState>
          ) : (
            skills.map((skill, index) => {
              const matchInfo = getSkillMatchInfo(skill);
              return (
                <SkillBadge
                  key={skill}
                  variant={getSkillVariant(skill)}
                  editable={editable}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ scale: editable ? 1.05 : 1 }}
                >
                  <span className="skill-text">{skill}</span>
                  {matchInfo && (
                    <span className="match-indicator">
                      {matchInfo.matched ? '✓' : matchInfo.partial ? '~' : '✗'}
                    </span>
                  )}
                  {editable && (
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveSkill(skill)}
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  )}
                </SkillBadge>
              );
            })
          )}
        </AnimatePresence>
      </SkillsGrid>

      {editable && (
        <>
          <AddSkillSection>
            <SkillInput
              ref={inputRef}
              type="text"
              placeholder="Add a new skill (e.g., JavaScript, Python, React)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={50}
            />
            <AddButton
              onClick={handleAddSkill}
              disabled={!newSkill.trim() || skills.length >= maxSkills}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Skill
            </AddButton>
          </AddSkillSection>

          {skills.length >= maxSkills && (
            <p style={{ 
              color: '#f44336', 
              fontSize: '0.9rem', 
              marginTop: '0.5rem' 
            }}>
              Maximum {maxSkills} skills allowed
            </p>
          )}

          {showSuggestions && getFilteredSuggestions().length > 0 && (
            <SuggestionsContainer
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <SuggestionsTitle>
                💡 Suggested Skills
              </SuggestionsTitle>
              <SuggestionsList>
                {getFilteredSuggestions().map((suggestion, index) => (
                  <SuggestionBadge
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    + {suggestion}
                  </SuggestionBadge>
                ))}
              </SuggestionsList>
            </SuggestionsContainer>
          )}
        </>
      )}
    </SkillsContainer>
  );
};

export default SkillsBadge;
