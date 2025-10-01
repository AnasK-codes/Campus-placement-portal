import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { SEARCH_CONFIGS } from '../utils/searchHelper';

const glow = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(211, 47, 47, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(211, 47, 47, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(211, 47, 47, 0.3);
  }
`;

const SearchContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: ${({ maxWidth }) => maxWidth || '600px'};
  margin: 0 auto;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme, $focused }) => $focused ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  transition: all ${({ theme }) => theme.transitions.fast};
  overflow: hidden;

  ${({ $focused }) => $focused && `
    animation: ${glow} 2s infinite;
  `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const SearchIcon = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  color: ${({ theme, $focused }) => $focused ? theme.colors.primary : theme.colors.textSecondary};
  font-size: 1.2rem;
  transition: color ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: color ${({ theme }) => theme.transitions.fast};
  }

  &:focus::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const ClearButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm};
  margin-right: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: none;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    color: ${({ theme }) => theme.colors.text};
    transform: scale(1.1);
  }
`;

const SearchSuggestions = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const SuggestionItem = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }

  .suggestion-icon {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1rem;
  }

  .suggestion-text {
    flex: 1;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text};
  }

  .suggestion-category {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const SearchStats = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};

  .results-count {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }

  .search-time {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
`;

const AIInsight = styled(motion.div)`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  .ai-icon {
    font-size: 1.2rem;
  }

  .ai-text {
    flex: 1;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SearchBar = ({
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder: customPlaceholder,
  showSuggestions = true,
  showStats = true,
  showAIInsights = true,
  resultsCount = 0,
  searchTime = 0,
  aiInsights = [],
  className,
  maxWidth,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const inputRef = useRef(null);
  const { userProfile } = useAuth();

  const userRole = userProfile?.role || 'student';
  const searchConfig = SEARCH_CONFIGS[userRole] || SEARCH_CONFIGS.student;
  const placeholder = customPlaceholder || searchConfig.placeholder;

  // Generate search suggestions based on role and input
  useEffect(() => {
    if (value && value.length > 1) {
      const newSuggestions = generateSuggestions(value, userRole);
      setSuggestions(newSuggestions);
      setShowSuggestionsList(true);
    } else {
      setSuggestions([]);
      setShowSuggestionsList(false);
    }
  }, [value, userRole]);

  const generateSuggestions = (searchTerm, role) => {
    const suggestions = [];
    const config = SEARCH_CONFIGS[role];
    
    // Common search suggestions based on role
    const commonSuggestions = {
      student: [
        { text: 'Frontend Developer', category: 'Role', icon: '💻' },
        { text: 'Backend Developer', category: 'Role', icon: '⚙️' },
        { text: 'Data Science', category: 'Role', icon: '📊' },
        { text: 'Machine Learning', category: 'Skill', icon: '🤖' },
        { text: 'React.js', category: 'Skill', icon: '⚛️' },
        { text: 'Python', category: 'Skill', icon: '🐍' },
        { text: 'Google', category: 'Company', icon: '🏢' },
        { text: 'Microsoft', category: 'Company', icon: '🏢' },
      ],
      mentor: [
        { text: 'Computer Science', category: 'Department', icon: '🖥️' },
        { text: 'Electronics', category: 'Department', icon: '🔌' },
        { text: '4th Year', category: 'Year', icon: '🎓' },
        { text: 'JavaScript', category: 'Skill', icon: '💻' },
        { text: 'Profile Incomplete', category: 'Status', icon: '⚠️' },
      ],
      placement: [
        { text: 'Pending Applications', category: 'Status', icon: '⏳' },
        { text: 'High Demand Skills', category: 'Analysis', icon: '📈' },
        { text: 'Low Seat Availability', category: 'Alert', icon: '🚨' },
      ],
      admin: [
        { text: 'New Registrations', category: 'Users', icon: '👥' },
        { text: 'System Alerts', category: 'Monitoring', icon: '🔔' },
        { text: 'Performance Issues', category: 'System', icon: '⚡' },
      ]
    };

    const roleSuggestions = commonSuggestions[role] || [];
    
    // Filter suggestions based on search term
    return roleSuggestions
      .filter(suggestion => 
        suggestion.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        suggestion.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 6);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange && onChange(newValue);
  };

  const handleInputFocus = () => {
    setFocused(true);
  };

  const handleInputBlur = () => {
    // Delay blur to allow suggestion clicks
    setTimeout(() => {
      setFocused(false);
      setShowSuggestionsList(false);
    }, 200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch && onSearch(value);
      setShowSuggestionsList(false);
    } else if (e.key === 'Escape') {
      setShowSuggestionsList(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange && onChange(suggestion.text);
    onSearch && onSearch(suggestion.text);
    setShowSuggestionsList(false);
  };

  const handleClear = () => {
    onChange && onChange('');
    onClear && onClear();
    setShowSuggestionsList(false);
    inputRef.current?.focus();
  };

  const searchIconVariants = {
    idle: { scale: 1, rotate: 0 },
    searching: { scale: 1.1, rotate: 360 },
  };

  const suggestionVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  return (
    <SearchContainer
      className={className}
      maxWidth={maxWidth}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      <SearchInputWrapper $focused={focused}>
        <SearchIcon
          $focused={focused}
          variants={searchIconVariants}
          animate={value ? 'searching' : 'idle'}
          transition={{ duration: 0.3 }}
        >
          🔍
        </SearchIcon>

        <SearchInput
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
        />

        <AnimatePresence>
          {value && (
            <ClearButton
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </ClearButton>
          )}
        </AnimatePresence>
      </SearchInputWrapper>

      <AnimatePresence>
        {showSuggestions && showSuggestionsList && suggestions.length > 0 && (
          <SearchSuggestions
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={`${suggestion.text}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                variants={suggestionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(211, 47, 47, 0.05)' }}
              >
                <span className="suggestion-icon">{suggestion.icon}</span>
                <span className="suggestion-text">{suggestion.text}</span>
                <span className="suggestion-category">{suggestion.category}</span>
              </SuggestionItem>
            ))}
          </SearchSuggestions>
        )}
      </AnimatePresence>

      {showStats && (value || resultsCount > 0) && (
        <SearchStats
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="results-count">
            {resultsCount.toLocaleString()} results
          </span>
          {searchTime > 0 && (
            <span className="search-time">
              in {searchTime}ms
            </span>
          )}
        </SearchStats>
      )}

      <AnimatePresence>
        {showAIInsights && aiInsights.length > 0 && (
          <AIInsight
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ delay: 0.3 }}
          >
            <span className="ai-icon">🤖</span>
            <span className="ai-text">{aiInsights[0]}</span>
          </AIInsight>
        )}
      </AnimatePresence>
    </SearchContainer>
  );
};

// Higher-order component for role-specific search bars
export const StudentSearchBar = (props) => (
  <SearchBar {...props} />
);

export const MentorSearchBar = (props) => (
  <SearchBar {...props} />
);

export const PlacementSearchBar = (props) => (
  <SearchBar {...props} />
);

export const AdminSearchBar = (props) => (
  <SearchBar {...props} />
);

export default SearchBar;
