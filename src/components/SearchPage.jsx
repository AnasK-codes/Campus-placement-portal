import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../contexts/SearchContext';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from './SearchBar';
import FiltersPanel from './FiltersPanel';
import FilteredResults from './FilteredResults';

const SearchPageContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xl};
  min-height: calc(100vh - 140px);
  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.lg};
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const SearchMainContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const SearchSidebar = styled(motion.div)`
  width: 350px;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    width: 100%;
  }
`;

const CollectionTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  overflow-x: auto;
  padding-bottom: ${({ theme }) => theme.spacing.xs};

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 2px;
  }
`;

const CollectionTab = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  white-space: nowrap;
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primaryDark : theme.colors.hover};
    transform: translateY(-1px);
  }

  .tab-count {
    background: ${({ active }) => active ? 'rgba(255,255,255,0.2)' : 'rgba(211,47,47,0.1)'};
    color: ${({ active, theme }) => active ? 'white' : theme.colors.primary};
    padding: 2px 6px;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  }
`;

const MobileFiltersToggle = styled(motion.button)`
  display: none;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  align-items: center;
  justify-content: space-between;

  @media (max-width: 1024px) {
    display: flex;
  }

  .toggle-icon {
    transform: ${({ expanded }) => expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
    transition: transform ${({ theme }) => theme.transitions.fast};
  }
`;

const AISearchSuggestions = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};

  .suggestions-title {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.xs};
  }

  .suggestions-list {
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const SuggestionChip = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: scale(1.05);
  }
`;

// Sample card components for different data types
const InternshipCard = ({ data, searchTerm, highlightText }) => (
  <motion.div
    style={{
      padding: '20px',
      background: 'var(--background-color)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      cursor: 'pointer'
    }}
    whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(211,47,47,0.15)' }}
  >
    <h3 style={{ marginBottom: '8px', color: 'var(--primary-color)' }}>
      {highlightText(data.role || data.title, searchTerm)}
    </h3>
    <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
      {highlightText(data.company, searchTerm)}
    </p>
    {data._aiMatch && (
      <div style={{ 
        background: `linear-gradient(90deg, var(--primary-color) ${data._aiMatch.percentage}%, var(--surface-color) ${data._aiMatch.percentage}%)`,
        height: '4px',
        borderRadius: '2px',
        marginBottom: '8px'
      }} />
    )}
    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
      {data._aiMatch ? `${data._aiMatch.percentage}% match` : 'New opportunity'}
    </div>
  </motion.div>
);

const StudentCard = ({ data, searchTerm, highlightText }) => (
  <motion.div
    style={{
      padding: '20px',
      background: 'var(--background-color)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      cursor: 'pointer'
    }}
    whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(211,47,47,0.15)' }}
  >
    <h3 style={{ marginBottom: '8px', color: 'var(--primary-color)' }}>
      {highlightText(data.name, searchTerm)}
    </h3>
    <p style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>
      {data.department} • {data.year}
    </p>
    <div style={{ marginBottom: '12px' }}>
      <div style={{ 
        background: 'var(--surface-color)',
        height: '6px',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'var(--primary-color)',
          height: '100%',
          width: `${data.profileCompletion || 0}%`,
          borderRadius: '3px'
        }} />
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
        Profile {data.profileCompletion || 0}% complete
      </div>
    </div>
  </motion.div>
);

const ApplicationCard = ({ data, searchTerm, highlightText }) => (
  <motion.div
    style={{
      padding: '20px',
      background: 'var(--background-color)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      cursor: 'pointer'
    }}
    whileHover={{ y: -4, boxShadow: '0 8px 25px rgba(211,47,47,0.15)' }}
  >
    <h3 style={{ marginBottom: '8px', color: 'var(--primary-color)' }}>
      {highlightText(data.studentName || data.internshipTitle, searchTerm)}
    </h3>
    <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
      {highlightText(data.company || data.studentName, searchTerm)}
    </p>
    <div style={{
      padding: '4px 8px',
      background: data.status === 'Approved' ? 'rgba(76,175,80,0.1)' : 
                 data.status === 'Rejected' ? 'rgba(244,67,54,0.1)' : 'rgba(255,152,0,0.1)',
      color: data.status === 'Approved' ? '#4CAF50' : 
             data.status === 'Rejected' ? '#f44336' : '#FF9800',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'inline-block'
    }}>
      {data.status}
    </div>
  </motion.div>
);

const SearchPage = ({ defaultCollection = 'internships' }) => {
  const { userProfile } = useAuth();
  const {
    searchTerm,
    filters,
    results,
    loading,
    error,
    searchTime,
    totalResults,
    currentCollection,
    viewMode,
    sortBy,
    searchConfig,
    updateSearchTerm,
    updateFilters,
    updateCollection,
    updateViewMode,
    updateSortBy,
    clearSearch,
    getAvailableCollections,
    getFilterSuggestions,
    searchWithAI
  } = useSearch();

  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const userRole = userProfile?.role || 'student';
  const availableCollections = getAvailableCollections();

  // Set default collection on mount
  useEffect(() => {
    if (currentCollection !== defaultCollection) {
      updateCollection(defaultCollection);
    }
  }, [defaultCollection, currentCollection, updateCollection]);

  // Generate AI suggestions
  useEffect(() => {
    const suggestions = getFilterSuggestions();
    setAiSuggestions(suggestions.slice(0, 3)); // Limit to 3 suggestions
  }, [getFilterSuggestions, results]);

  // Get card component based on collection
  const getCardComponent = (collection) => {
    switch (collection) {
      case 'internships': return InternshipCard;
      case 'students': return StudentCard;
      case 'applications': return ApplicationCard;
      default: return InternshipCard;
    }
  };

  // Get table columns based on collection
  const getTableColumns = (collection) => {
    switch (collection) {
      case 'internships':
        return [
          { key: 'role', title: 'Role', width: '2fr', className: 'primary' },
          { key: 'company', title: 'Company', width: '1.5fr' },
          { key: 'department', title: 'Department', width: '1fr' },
          { key: 'seats', title: 'Seats', width: '80px' },
          { 
            key: 'match', 
            title: 'AI Match', 
            width: '100px',
            render: (item) => item._aiMatch ? `${item._aiMatch.percentage}%` : 'N/A'
          }
        ];
      case 'students':
        return [
          { key: 'name', title: 'Name', width: '2fr', className: 'primary' },
          { key: 'department', title: 'Department', width: '1fr' },
          { key: 'year', title: 'Year', width: '1fr' },
          { 
            key: 'profileCompletion', 
            title: 'Profile', 
            width: '100px',
            render: (item) => `${item.profileCompletion || 0}%`
          }
        ];
      case 'applications':
        return [
          { key: 'studentName', title: 'Student', width: '1.5fr', className: 'primary' },
          { key: 'internshipTitle', title: 'Internship', width: '1.5fr' },
          { key: 'company', title: 'Company', width: '1fr' },
          { 
            key: 'status', 
            title: 'Status', 
            width: '100px',
            render: (item) => (
              <span style={{
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                background: item.status === 'Approved' ? 'rgba(76,175,80,0.1)' : 
                           item.status === 'Rejected' ? 'rgba(244,67,54,0.1)' : 'rgba(255,152,0,0.1)',
                color: item.status === 'Approved' ? '#4CAF50' : 
                       item.status === 'Rejected' ? '#f44336' : '#FF9800'
              }}>
                {item.status}
              </span>
            )
          }
        ];
      default:
        return [];
    }
  };

  const handleAISuggestionClick = (suggestion) => {
    searchWithAI(suggestion, {
      includeSkillMatching: true,
      includeSuggestions: true,
      autoFilter: true
    });
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <SearchPageContainer>
        <SearchSidebar
          variants={itemVariants}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <MobileFiltersToggle
            expanded={mobileFiltersExpanded}
            onClick={() => setMobileFiltersExpanded(!mobileFiltersExpanded)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Filters & Options</span>
            <span className="toggle-icon">▼</span>
          </MobileFiltersToggle>

          <AnimatePresence>
            {(mobileFiltersExpanded || window.innerWidth > 1024) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {aiSuggestions.length > 0 && (
                  <AISearchSuggestions
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="suggestions-title">
                      <span>🤖</span>
                      AI Suggestions
                    </div>
                    <div className="suggestions-list">
                      {aiSuggestions.map((suggestion, index) => (
                        <SuggestionChip
                          key={index}
                          onClick={() => handleAISuggestionClick(suggestion.message)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {suggestion.message}
                        </SuggestionChip>
                      ))}
                    </div>
                  </AISearchSuggestions>
                )}

                <FiltersPanel
                  filters={filters}
                  onFiltersChange={updateFilters}
                  collection={currentCollection}
                  showAISuggestions={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </SearchSidebar>

        <SearchMainContent>
          <motion.div variants={itemVariants}>
            <SearchBar
              value={searchTerm}
              onChange={updateSearchTerm}
              onClear={clearSearch}
              resultsCount={totalResults}
              searchTime={searchTime}
              aiInsights={aiSuggestions.map(s => s.message)}
              maxWidth="100%"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CollectionTabs>
              {availableCollections.map((collection) => (
                <CollectionTab
                  key={collection.key}
                  active={currentCollection === collection.key}
                  onClick={() => updateCollection(collection.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{collection.label}</span>
                  {collection.count > 0 && (
                    <span className="tab-count">{collection.count}</span>
                  )}
                </CollectionTab>
              ))}
            </CollectionTabs>
          </motion.div>

          <motion.div variants={itemVariants}>
            <FilteredResults
              results={results}
              loading={loading}
              searchTerm={searchTerm}
              searchTime={searchTime}
              viewMode={viewMode}
              onViewModeChange={updateViewMode}
              sortBy={sortBy}
              onSortChange={updateSortBy}
              cardComponent={getCardComponent(currentCollection)}
              tableColumns={getTableColumns(currentCollection)}
              showAIInsights={true}
              emptyStateConfig={{
                icon: currentCollection === 'internships' ? '💼' : 
                      currentCollection === 'students' ? '👥' : '📋',
                title: `No ${currentCollection} found`,
                description: `Try adjusting your search terms or filters to find ${currentCollection}.`
              }}
            />
          </motion.div>
        </SearchMainContent>
      </SearchPageContainer>
    </motion.div>
  );
};

export default SearchPage;
