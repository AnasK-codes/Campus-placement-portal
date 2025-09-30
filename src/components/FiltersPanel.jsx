import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { SEARCH_CONFIGS } from '../utils/searchHelper';
import searchHelper from '../utils/searchHelper';

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const FiltersPanelContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
  width: 100%;
  max-width: ${({ maxWidth }) => maxWidth || '400px'};
`;

const FiltersHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.colors.surface};

  .title {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  .filter-count {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    min-width: 20px;
    text-align: center;
  }
`;

const ClearAllButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FiltersContent = styled(motion.div)`
  max-height: ${({ collapsed }) => collapsed ? '0' : '600px'};
  overflow-y: auto;
  transition: max-height ${({ theme }) => theme.transitions.normal};

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const FilterSection = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};

  &:last-child {
    border-bottom: none;
  }
`;

const FilterTitle = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .filter-icon {
    font-size: 1rem;
  }
`;

const FilterOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CheckboxOption = styled(motion.label)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: ${({ theme }) => theme.colors.primary};
    cursor: pointer;
  }

  .option-label {
    flex: 1;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text};
  }

  .option-count {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
    background: ${({ theme }) => theme.colors.surface};
    padding: 2px 6px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
  }
`;

const RangeSlider = styled.div`
  .range-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  .range-inputs {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .range-input {
    flex: 1;
    padding: ${({ theme }) => theme.spacing.xs};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    text-align: center;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }

  .range-slider {
    width: 100%;
    height: 6px;
    background: ${({ theme }) => theme.colors.surface};
    border-radius: 3px;
    position: relative;
    cursor: pointer;

    .range-track {
      height: 100%;
      background: ${({ theme }) => theme.colors.primary};
      border-radius: 3px;
      position: absolute;
    }

    .range-thumb {
      width: 16px;
      height: 16px;
      background: ${({ theme }) => theme.colors.primary};
      border: 2px solid white;
      border-radius: 50%;
      position: absolute;
      top: -5px;
      cursor: grab;
      box-shadow: ${({ theme }) => theme.shadows.sm};

      &:active {
        cursor: grabbing;
        transform: scale(1.2);
      }
    }
  }
`;

const AIFilterSuggestion = styled(motion.div)`
  margin: ${({ theme }) => theme.spacing.lg};
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

  .ai-content {
    flex: 1;

    .ai-title {
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
    }

    .ai-description {
      font-size: ${({ theme }) => theme.typography.fontSize.xs};
      color: ${({ theme }) => theme.colors.textSecondary};
    }
  }

  .ai-action {
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    cursor: pointer;
    transition: all ${({ theme }) => theme.transitions.fast};

    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
      transform: scale(1.05);
    }
  }
`;

const FiltersPanel = ({
  filters = {},
  onFiltersChange,
  collection = 'internships',
  collapsed = false,
  onToggle,
  showAISuggestions = true,
  className,
  maxWidth,
  ...props
}) => {
  const { userProfile } = useAuth();
  const [dynamicOptions, setDynamicOptions] = useState({});
  const [aiSuggestions, setAISuggestions] = useState([]);
  const [optionCounts, setOptionCounts] = useState({});

  const userRole = userProfile?.role || 'student';
  const searchConfig = SEARCH_CONFIGS[userRole] || SEARCH_CONFIGS.student;
  const filterConfig = searchConfig.filters[collection] || {};

  // Load dynamic filter options
  useEffect(() => {
    const loadDynamicOptions = async () => {
      const options = {};
      
      for (const [filterKey, config] of Object.entries(filterConfig)) {
        if (config.type === 'multiselect' && (!config.options || config.options.length === 0)) {
          try {
            const dynamicOpts = await searchHelper.getDynamicFilterOptions(collection, filterKey);
            options[filterKey] = dynamicOpts;
          } catch (error) {
            console.error(`Error loading options for ${filterKey}:`, error);
            options[filterKey] = [];
          }
        } else {
          options[filterKey] = config.options || [];
        }
      }
      
      setDynamicOptions(options);
    };

    loadDynamicOptions();
  }, [collection, filterConfig]);

  // Generate AI suggestions
  useEffect(() => {
    if (showAISuggestions) {
      const suggestions = generateAISuggestions(userRole, collection, filters);
      setAISuggestions(suggestions);
    }
  }, [userRole, collection, filters, showAISuggestions]);

  const generateAISuggestions = (role, coll, currentFilters) => {
    const suggestions = [];

    // Role-specific AI suggestions
    if (role === 'student' && coll === 'internships') {
      if (!currentFilters.requiredSkills || currentFilters.requiredSkills.length === 0) {
        suggestions.push({
          title: 'Filter by Your Skills',
          description: 'Add your skills to find better matching internships',
          action: 'Add Skills Filter',
          filterKey: 'requiredSkills',
          suggestedValues: ['JavaScript', 'Python', 'React', 'Node.js']
        });
      }

      if (!currentFilters.stipend) {
        suggestions.push({
          title: 'Set Stipend Range',
          description: 'Filter internships by stipend to find opportunities within your preference',
          action: 'Set Range',
          filterKey: 'stipend',
          suggestedValues: { min: 10000, max: 30000 }
        });
      }
    }

    if (role === 'mentor' && coll === 'students') {
      if (!currentFilters.profileCompletion) {
        suggestions.push({
          title: 'Focus on Incomplete Profiles',
          description: 'Students with incomplete profiles need guidance',
          action: 'Filter Incomplete',
          filterKey: 'profileCompletion',
          suggestedValues: { min: 0, max: 70 }
        });
      }
    }

    return suggestions.slice(0, 2); // Limit to 2 suggestions
  };

  const handleFilterChange = (filterKey, value, checked = true) => {
    const newFilters = { ...filters };

    if (filterConfig[filterKey]?.type === 'multiselect') {
      if (!newFilters[filterKey]) {
        newFilters[filterKey] = [];
      }

      if (checked) {
        if (!newFilters[filterKey].includes(value)) {
          newFilters[filterKey] = [...newFilters[filterKey], value];
        }
      } else {
        newFilters[filterKey] = newFilters[filterKey].filter(v => v !== value);
        if (newFilters[filterKey].length === 0) {
          delete newFilters[filterKey];
        }
      }
    } else if (filterConfig[filterKey]?.type === 'range') {
      newFilters[filterKey] = value;
    } else {
      if (checked) {
        newFilters[filterKey] = value;
      } else {
        delete newFilters[filterKey];
      }
    }

    onFiltersChange && onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    onFiltersChange && onFiltersChange({});
  };

  const handleAISuggestionApply = (suggestion) => {
    const newFilters = { ...filters };
    newFilters[suggestion.filterKey] = suggestion.suggestedValues;
    onFiltersChange && onFiltersChange(newFilters);
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).length;
  };

  const renderMultiSelectFilter = (filterKey, config) => {
    const options = dynamicOptions[filterKey] || config.options || [];
    const selectedValues = filters[filterKey] || [];

    return (
      <FilterOptions>
        {options.map((option, index) => (
          <CheckboxOption
            key={option}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 4 }}
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={(e) => handleFilterChange(filterKey, option, e.target.checked)}
            />
            <span className="option-label">{option}</span>
            {optionCounts[option] && (
              <span className="option-count">{optionCounts[option]}</span>
            )}
          </CheckboxOption>
        ))}
      </FilterOptions>
    );
  };

  const renderRangeFilter = (filterKey, config) => {
    const value = filters[filterKey] || { min: config.min || 0, max: config.max || 100 };

    return (
      <RangeSlider>
        <div className="range-header">
          <span>Min: {config.min || 0}</span>
          <span>Max: {config.max || 100}</span>
        </div>
        <div className="range-inputs">
          <input
            type="number"
            className="range-input"
            placeholder="Min"
            value={value.min || ''}
            onChange={(e) => handleFilterChange(filterKey, { ...value, min: parseInt(e.target.value) || 0 })}
          />
          <input
            type="number"
            className="range-input"
            placeholder="Max"
            value={value.max || ''}
            onChange={(e) => handleFilterChange(filterKey, { ...value, max: parseInt(e.target.value) || config.max })}
          />
        </div>
      </RangeSlider>
    );
  };

  const getFilterIcon = (filterKey) => {
    const icons = {
      department: '🏫',
      year: '📅',
      skills: '💻',
      requiredSkills: '⚡',
      profileCompletion: '📊',
      status: '📋',
      seats: '🪑',
      stipend: '💰',
      duration: '⏱️',
      mode: '🌐',
      cgpa: '🎯',
      role: '👤',
      lastLogin: '🕒'
    };
    return icons[filterKey] || '🔍';
  };

  const getFilterTitle = (filterKey) => {
    const titles = {
      department: 'Department',
      year: 'Academic Year',
      skills: 'Skills',
      requiredSkills: 'Required Skills',
      profileCompletion: 'Profile Completion %',
      status: 'Status',
      seats: 'Available Seats',
      stipend: 'Stipend Range',
      duration: 'Duration',
      mode: 'Work Mode',
      cgpa: 'CGPA Range',
      role: 'User Role',
      lastLogin: 'Last Login'
    };
    return titles[filterKey] || filterKey.charAt(0).toUpperCase() + filterKey.slice(1);
  };

  const panelVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <FiltersPanelContainer
      className={className}
      maxWidth={maxWidth}
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      <FiltersHeader>
        <div className="title">
          <span>🔍</span>
          Filters
          {getActiveFilterCount() > 0 && (
            <motion.div
              className="filter-count"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {getActiveFilterCount()}
            </motion.div>
          )}
        </div>
        
        <ClearAllButton
          onClick={handleClearAll}
          disabled={getActiveFilterCount() === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Clear All
        </ClearAllButton>
      </FiltersHeader>

      <FiltersContent collapsed={collapsed}>
        <AnimatePresence>
          {showAISuggestions && aiSuggestions.map((suggestion, index) => (
            <AIFilterSuggestion
              key={`ai-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="ai-icon">🤖</span>
              <div className="ai-content">
                <div className="ai-title">{suggestion.title}</div>
                <div className="ai-description">{suggestion.description}</div>
              </div>
              <button
                className="ai-action"
                onClick={() => handleAISuggestionApply(suggestion)}
              >
                {suggestion.action}
              </button>
            </AIFilterSuggestion>
          ))}
        </AnimatePresence>

        {Object.entries(filterConfig).map(([filterKey, config], index) => (
          <FilterSection
            key={filterKey}
            variants={sectionVariants}
            transition={{ delay: index * 0.1 }}
          >
            <FilterTitle>
              <span className="filter-icon">{getFilterIcon(filterKey)}</span>
              {getFilterTitle(filterKey)}
            </FilterTitle>

            {config.type === 'multiselect' && renderMultiSelectFilter(filterKey, config)}
            {config.type === 'range' && renderRangeFilter(filterKey, config)}
          </FilterSection>
        ))}
      </FiltersContent>
    </FiltersPanelContainer>
  );
};

export default FiltersPanel;
