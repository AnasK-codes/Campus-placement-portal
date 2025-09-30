import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import searchHelper from '../utils/searchHelper';
import { SEARCH_CONFIGS } from '../utils/searchHelper';

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const { currentUser, userProfile } = useAuth();
  const [searchState, setSearchState] = useState({
    searchTerm: '',
    filters: {},
    results: [],
    loading: false,
    error: null,
    searchTime: 0,
    totalResults: 0,
    currentCollection: 'internships',
    viewMode: 'cards',
    sortBy: 'relevance'
  });

  const [activeListeners, setActiveListeners] = useState(new Map());

  const userRole = userProfile?.role || 'student';
  const searchConfig = SEARCH_CONFIGS[userRole] || SEARCH_CONFIGS.student;

  // Update search term
  const updateSearchTerm = useCallback((term) => {
    setSearchState(prev => ({
      ...prev,
      searchTerm: term
    }));
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setSearchState(prev => ({
      ...prev,
      filters: newFilters
    }));
  }, []);

  // Update collection
  const updateCollection = useCallback((collection) => {
    setSearchState(prev => ({
      ...prev,
      currentCollection: collection,
      results: [],
      filters: {} // Reset filters when changing collection
    }));
  }, []);

  // Update view mode
  const updateViewMode = useCallback((mode) => {
    setSearchState(prev => ({
      ...prev,
      viewMode: mode
    }));
  }, []);

  // Update sort by
  const updateSortBy = useCallback((sortBy) => {
    setSearchState(prev => ({
      ...prev,
      sortBy: sortBy
    }));
  }, []);

  // Perform search with real-time updates
  const performSearch = useCallback(async () => {
    if (!currentUser) return;

    const { searchTerm, filters, currentCollection } = searchState;
    
    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    const startTime = Date.now();

    try {
      // Clean up previous listener
      const existingListener = activeListeners.get(currentCollection);
      if (existingListener) {
        searchHelper.cleanup(existingListener);
        activeListeners.delete(currentCollection);
      }

      // Set up new search with real-time listener
      const listenerId = await searchHelper.searchWithFilters(
        currentCollection,
        searchTerm,
        filters,
        userRole,
        (results) => {
          const searchTime = Date.now() - startTime;
          
          // Apply client-side sorting
          const sortedResults = sortResults(results, searchState.sortBy);
          
          setSearchState(prev => ({
            ...prev,
            results: sortedResults,
            loading: false,
            error: null,
            searchTime,
            totalResults: results.length
          }));
        }
      );

      if (listenerId) {
        setActiveListeners(prev => new Map(prev.set(currentCollection, listenerId)));
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Search failed',
        results: [],
        totalResults: 0
      }));
    }
  }, [currentUser, searchState.searchTerm, searchState.filters, searchState.currentCollection, searchState.sortBy, userRole, activeListeners]);

  // Sort results based on criteria
  const sortResults = useCallback((results, sortBy) => {
    const sorted = [...results];
    
    switch (sortBy) {
      case 'relevance':
        return sorted.sort((a, b) => (b._relevanceScore || 0) - (a._relevanceScore || 0));
      
      case 'date':
        return sorted.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const dateB = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
          return dateB - dateA;
        });
      
      case 'name':
        return sorted.sort((a, b) => {
          const nameA = a.name || a.title || a.role || '';
          const nameB = b.name || b.title || b.role || '';
          return nameA.localeCompare(nameB);
        });
      
      case 'match':
        return sorted.sort((a, b) => (b._aiMatch?.percentage || 0) - (a._aiMatch?.percentage || 0));
      
      case 'applications':
        return sorted.sort((a, b) => (b.applicationsCount || 0) - (a.applicationsCount || 0));
      
      default:
        return sorted;
    }
  }, []);

  // Trigger search when dependencies change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (currentUser) {
        performSearch();
      }
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(debounceTimer);
  }, [currentUser, searchState.searchTerm, searchState.filters, searchState.currentCollection]);

  // Re-sort results when sort criteria changes
  useEffect(() => {
    if (searchState.results.length > 0) {
      const sortedResults = sortResults(searchState.results, searchState.sortBy);
      setSearchState(prev => ({
        ...prev,
        results: sortedResults
      }));
    }
  }, [searchState.sortBy, sortResults]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      searchTerm: '',
      filters: {},
      results: [],
      error: null,
      totalResults: 0
    }));
  }, []);

  // Get search suggestions
  const getSearchSuggestions = useCallback((term) => {
    // This would typically call an API or use cached data
    // For now, return role-based suggestions
    const suggestions = [];
    
    if (userRole === 'student') {
      const commonSearches = [
        'Frontend Developer',
        'Backend Developer', 
        'Data Science',
        'Machine Learning',
        'React.js',
        'Python',
        'JavaScript'
      ];
      
      suggestions.push(...commonSearches
        .filter(s => s.toLowerCase().includes(term.toLowerCase()))
        .slice(0, 5)
      );
    }
    
    return suggestions;
  }, [userRole]);

  // Get filter suggestions based on current results
  const getFilterSuggestions = useCallback(() => {
    return searchHelper.generateFilterSuggestions(
      userRole, 
      searchState.filters, 
      searchState.results
    );
  }, [userRole, searchState.filters, searchState.results]);

  // Get available collections for current role
  const getAvailableCollections = useCallback(() => {
    return searchConfig.collections.map(collection => ({
      key: collection,
      label: collection.charAt(0).toUpperCase() + collection.slice(1),
      count: 0 // This would be populated from actual data
    }));
  }, [searchConfig]);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      activeListeners.forEach((listenerId) => {
        searchHelper.cleanup(listenerId);
      });
      searchHelper.cleanupAll();
    };
  }, [activeListeners]);

  // Enhanced search with AI features
  const searchWithAI = useCallback(async (term, options = {}) => {
    const {
      includeSkillMatching = true,
      includeSuggestions = true,
      autoFilter = true
    } = options;

    // Start basic search
    updateSearchTerm(term);

    // Add AI enhancements if enabled
    if (includeSkillMatching && userRole === 'student') {
      // This would integrate with the existing AI recommendation engine
      // For now, we'll use the existing _aiMatch data from searchHelper
    }

    if (includeSuggestions) {
      const suggestions = getFilterSuggestions();
      // You could show these suggestions in the UI
      console.log('AI Filter Suggestions:', suggestions);
    }

    if (autoFilter && term) {
      // Auto-apply smart filters based on search term
      const smartFilters = generateSmartFilters(term);
      if (Object.keys(smartFilters).length > 0) {
        updateFilters({ ...searchState.filters, ...smartFilters });
      }
    }
  }, [updateSearchTerm, userRole, getFilterSuggestions, searchState.filters, updateFilters]);

  // Generate smart filters based on search term
  const generateSmartFilters = useCallback((term) => {
    const filters = {};
    const termLower = term.toLowerCase();

    // Auto-detect department from search term
    const departments = ['cse', 'ece', 'me', 'ce', 'it', 'eee'];
    const detectedDept = departments.find(dept => 
      termLower.includes(dept) || 
      termLower.includes(dept.replace(/[aeiou]/g, ''))
    );
    
    if (detectedDept) {
      filters.department = [detectedDept.toUpperCase()];
    }

    // Auto-detect skills from search term
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node', 'angular', 
      'vue', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes'
    ];
    
    const detectedSkills = commonSkills.filter(skill => 
      termLower.includes(skill)
    );
    
    if (detectedSkills.length > 0) {
      filters.requiredSkills = detectedSkills.map(skill => 
        skill.charAt(0).toUpperCase() + skill.slice(1)
      );
    }

    return filters;
  }, []);

  const value = {
    // State
    ...searchState,
    userRole,
    searchConfig,

    // Actions
    updateSearchTerm,
    updateFilters,
    updateCollection,
    updateViewMode,
    updateSortBy,
    performSearch,
    clearSearch,
    searchWithAI,

    // Utilities
    getSearchSuggestions,
    getFilterSuggestions,
    getAvailableCollections,
    sortResults,

    // AI Features
    generateSmartFilters
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;
