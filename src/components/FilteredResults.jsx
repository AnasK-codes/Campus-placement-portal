import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const countUp = keyframes`
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const ResultsContainer = styled(motion.div)`
  width: 100%;
`;

const ResultsHeader = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ResultsCount = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text};

  .count-number {
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.primary};
    animation: ${countUp} 0.5s ease-out;
  }

  .search-time {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ViewButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primaryDark : theme.colors.hover};
  }
`;

const SortControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  .sort-label {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SortSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ResultsGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${({ cardMinWidth }) => cardMinWidth || '300px'}, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const ResultsTable = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: ${({ columns }) => columns};
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};

  @media (max-width: 768px) {
    display: none;
  }
`;

const TableRow = styled(motion.div)`
  display: grid;
  grid-template-columns: ${({ columns }) => columns};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.divider};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    display: block;
    padding: ${({ theme }) => theme.spacing.lg};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const TableCell = styled.div`
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text};

  &.primary {
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.primary};
  }

  &.secondary {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  @media (max-width: 768px) {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    
    &:before {
      content: attr(data-label);
      font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
      margin-right: ${({ theme }) => theme.spacing.sm};
      min-width: 100px;
    }
  }
`;

const HighlightedText = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 2px 4px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const SkeletonLoader = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surface} 0%,
    ${({ theme }) => theme.colors.border} 50%,
    ${({ theme }) => theme.colors.surface} 100%
  );
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  height: ${({ height }) => height || '20px'};
  width: ${({ width }) => width || '100%'};
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxxl};
  color: ${({ theme }) => theme.colors.textSecondary};

  .empty-icon {
    font-size: 4rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    opacity: 0.5;
  }

  .empty-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .empty-description {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
    max-width: 400px;
    margin: 0 auto;
  }
`;

const AIInsight = styled(motion.div)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  .ai-icon {
    font-size: 1.5rem;
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
`;

const FilteredResults = ({
  results = [],
  loading = false,
  searchTerm = '',
  searchTime = 0,
  viewMode = 'cards', // 'cards' or 'table'
  onViewModeChange,
  sortBy = 'relevance',
  onSortChange,
  cardComponent: CardComponent,
  tableColumns = [],
  cardMinWidth,
  showAIInsights = true,
  emptyStateConfig = {},
  className,
  ...props
}) => {
  const [animatedCount, setAnimatedCount] = useState(0);
  const { userProfile } = useAuth();

  const userRole = userProfile?.role || 'student';

  // Animate count up effect
  useEffect(() => {
    if (results.length > 0) {
      let start = 0;
      const end = results.length;
      const duration = Math.min(1000, end * 10); // Max 1 second
      const increment = end / (duration / 16); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setAnimatedCount(end);
          clearInterval(timer);
        } else {
          setAnimatedCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    } else {
      setAnimatedCount(0);
    }
  }, [results.length]);

  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <HighlightedText key={index}>{part}</HighlightedText>
      ) : (
        part
      )
    );
  };

  const generateAIInsights = () => {
    if (!showAIInsights || results.length === 0) return [];

    const insights = [];

    // Role-specific insights
    if (userRole === 'student') {
      const highMatchResults = results.filter(r => r._aiMatch?.percentage >= 80);
      if (highMatchResults.length > 0) {
        insights.push({
          title: `${highMatchResults.length} Excellent Matches Found!`,
          description: `These internships match 80%+ of your skills. Consider applying soon as they have high competition.`
        });
      }

      const skillGaps = results.flatMap(r => r._aiMatch?.missingSkills || []);
      const commonGaps = [...new Set(skillGaps)].slice(0, 3);
      if (commonGaps.length > 0) {
        insights.push({
          title: 'Skill Development Opportunity',
          description: `Learning ${commonGaps.join(', ')} could unlock ${results.length - highMatchResults.length} more opportunities.`
        });
      }
    }

    if (userRole === 'mentor') {
      const incompleteProfiles = results.filter(r => r.profileCompletion < 70);
      if (incompleteProfiles.length > 0) {
        insights.push({
          title: `${incompleteProfiles.length} Students Need Profile Guidance`,
          description: 'Students with incomplete profiles are less likely to get internship matches.'
        });
      }
    }

    return insights.slice(0, 2); // Limit to 2 insights
  };

  const renderSkeletonLoaders = () => {
    const skeletonCount = 6;
    
    if (viewMode === 'cards') {
      return (
        <ResultsGrid cardMinWidth={cardMinWidth}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <motion.div
              key={`skeleton-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                padding: '20px',
                background: 'var(--surface-color)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}
            >
              <SkeletonLoader height="24px" width="70%" style={{ marginBottom: '12px' }} />
              <SkeletonLoader height="16px" width="50%" style={{ marginBottom: '8px' }} />
              <SkeletonLoader height="16px" width="80%" style={{ marginBottom: '16px' }} />
              <SkeletonLoader height="32px" width="40%" />
            </motion.div>
          ))}
        </ResultsGrid>
      );
    }

    return (
      <ResultsTable>
        <TableHeader columns={tableColumns.map(() => '1fr').join(' ')}>
          {tableColumns.map(col => (
            <div key={col.key}>{col.title}</div>
          ))}
        </TableHeader>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <TableRow
            key={`skeleton-row-${index}`}
            columns={tableColumns.map(() => '1fr').join(' ')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {tableColumns.map(col => (
              <TableCell key={col.key}>
                <SkeletonLoader height="16px" width="80%" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </ResultsTable>
    );
  };

  const renderTableView = () => {
    if (!tableColumns.length) return null;

    return (
      <ResultsTable
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <TableHeader columns={tableColumns.map(col => col.width || '1fr').join(' ')}>
          {tableColumns.map(col => (
            <div key={col.key}>{col.title}</div>
          ))}
        </TableHeader>
        
        <AnimatePresence>
          {results.map((item, index) => (
            <TableRow
              key={item.id || index}
              columns={tableColumns.map(col => col.width || '1fr').join(' ')}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
            >
              {tableColumns.map(col => (
                <TableCell 
                  key={col.key} 
                  className={col.className}
                  data-label={col.title}
                >
                  {col.render ? 
                    col.render(item, searchTerm, highlightText) : 
                    highlightText(item[col.key], searchTerm)
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </AnimatePresence>
      </ResultsTable>
    );
  };

  const renderCardView = () => {
    if (!CardComponent) return null;

    return (
      <ResultsGrid cardMinWidth={cardMinWidth}>
        <AnimatePresence>
          {results.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ 
                delay: index * 0.05,
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              whileHover={{ y: -4 }}
            >
              <CardComponent 
                data={item} 
                searchTerm={searchTerm}
                highlightText={highlightText}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </ResultsGrid>
    );
  };

  const aiInsights = generateAIInsights();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <ResultsContainer
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      <ResultsHeader variants={itemVariants}>
        <ResultsCount>
          <span className="count-number">
            {animatedCount.toLocaleString()}
          </span>
          <span>results</span>
          {searchTime > 0 && (
            <span className="search-time">in {searchTime}ms</span>
          )}
        </ResultsCount>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <SortControls>
            <span className="sort-label">Sort by:</span>
            <SortSelect
              value={sortBy}
              onChange={(e) => onSortChange && onSortChange(e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date</option>
              <option value="name">Name</option>
              {userRole === 'student' && <option value="match">AI Match</option>}
              {userRole === 'placement' && <option value="applications">Applications</option>}
            </SortSelect>
          </SortControls>

          {CardComponent && tableColumns.length > 0 && (
            <ViewToggle>
              <ViewButton
                active={viewMode === 'cards'}
                onClick={() => onViewModeChange && onViewModeChange('cards')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>🔲</span>
                Cards
              </ViewButton>
              <ViewButton
                active={viewMode === 'table'}
                onClick={() => onViewModeChange && onViewModeChange('table')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>📋</span>
                Table
              </ViewButton>
            </ViewToggle>
          )}
        </div>
      </ResultsHeader>

      <AnimatePresence>
        {aiInsights.map((insight, index) => (
          <AIInsight
            key={`insight-${index}`}
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <span className="ai-icon">🤖</span>
            <div className="ai-content">
              <div className="ai-title">{insight.title}</div>
              <div className="ai-description">{insight.description}</div>
            </div>
          </AIInsight>
        ))}
      </AnimatePresence>

      {loading ? (
        renderSkeletonLoaders()
      ) : results.length === 0 ? (
        <EmptyState
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="empty-icon">
            {emptyStateConfig.icon || '🔍'}
          </div>
          <div className="empty-title">
            {emptyStateConfig.title || 'No results found'}
          </div>
          <div className="empty-description">
            {emptyStateConfig.description || 
             'Try adjusting your search terms or filters to find what you\'re looking for.'}
          </div>
        </EmptyState>
      ) : (
        <>
          {viewMode === 'cards' ? renderCardView() : renderTableView()}
        </>
      )}
    </ResultsContainer>
  );
};

export default FilteredResults;
