import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  limit,
  startAfter,
  and,
  or
} from 'firebase/firestore';
import { db } from '../firebase';

// Search configuration for different roles
export const SEARCH_CONFIGS = {
  student: {
    collections: ['internships', 'applications'],
    searchFields: {
      internships: ['role', 'company', 'description', 'requiredSkills', 'department'],
      applications: ['internshipTitle', 'company', 'status']
    },
    filters: {
      internships: {
        department: { type: 'multiselect', options: ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE'] },
        requiredSkills: { type: 'multiselect', options: [] }, // Dynamic from data
        seats: { type: 'range', min: 1, max: 100 },
        stipend: { type: 'range', min: 0, max: 50000 },
        duration: { type: 'multiselect', options: ['1 month', '2 months', '3 months', '6 months'] },
        mode: { type: 'multiselect', options: ['Remote', 'On-site', 'Hybrid'] },
        status: { type: 'multiselect', options: ['Active', 'Closed', 'Coming Soon'] }
      },
      applications: {
        status: { type: 'multiselect', options: ['Pending', 'Approved', 'Rejected', 'Interview Scheduled', 'Offered'] },
        appliedDate: { type: 'daterange' }
      }
    },
    placeholder: 'Search internships by role, company, skills...'
  },
  mentor: {
    collections: ['students', 'applications'],
    searchFields: {
      students: ['name', 'email', 'department', 'skills', 'year'],
      applications: ['studentName', 'internshipTitle', 'status']
    },
    filters: {
      students: {
        department: { type: 'multiselect', options: ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE'] },
        year: { type: 'multiselect', options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
        profileCompletion: { type: 'range', min: 0, max: 100 },
        skills: { type: 'multiselect', options: [] }, // Dynamic from data
        cgpa: { type: 'range', min: 0, max: 10 },
        status: { type: 'multiselect', options: ['Active', 'Inactive', 'Graduated'] }
      },
      applications: {
        status: { type: 'multiselect', options: ['Pending', 'Approved', 'Rejected', 'Interview Scheduled', 'Offered'] },
        mentorApproval: { type: 'multiselect', options: ['Pending', 'Approved', 'Rejected'] }
      }
    },
    placeholder: 'Search students by name, department, skills...'
  },
  placement: {
    collections: ['students', 'internships', 'applications'],
    searchFields: {
      students: ['name', 'email', 'department', 'skills', 'year'],
      internships: ['role', 'company', 'description', 'requiredSkills'],
      applications: ['studentName', 'internshipTitle', 'status', 'company']
    },
    filters: {
      students: {
        department: { type: 'multiselect', options: ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE'] },
        year: { type: 'multiselect', options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
        profileCompletion: { type: 'range', min: 0, max: 100 },
        placementStatus: { type: 'multiselect', options: ['Placed', 'Not Placed', 'In Process'] }
      },
      internships: {
        department: { type: 'multiselect', options: ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE'] },
        seats: { type: 'range', min: 1, max: 100 },
        applicationsCount: { type: 'range', min: 0, max: 500 },
        status: { type: 'multiselect', options: ['Active', 'Closed', 'Draft'] }
      },
      applications: {
        status: { type: 'multiselect', options: ['Pending', 'Approved', 'Rejected', 'Interview Scheduled', 'Offered'] },
        department: { type: 'multiselect', options: ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE'] }
      }
    },
    placeholder: 'Search students, internships, applications...'
  },
  admin: {
    collections: ['students', 'internships', 'applications', 'users'],
    searchFields: {
      students: ['name', 'email', 'department', 'skills', 'year'],
      internships: ['role', 'company', 'description', 'requiredSkills'],
      applications: ['studentName', 'internshipTitle', 'status'],
      users: ['name', 'email', 'role', 'department']
    },
    filters: {
      students: {
        department: { type: 'multiselect', options: ['CSE', 'ECE', 'ME', 'CE', 'IT', 'EEE'] },
        year: { type: 'multiselect', options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
        status: { type: 'multiselect', options: ['Active', 'Inactive', 'Suspended'] }
      },
      users: {
        role: { type: 'multiselect', options: ['student', 'mentor', 'placement', 'admin'] },
        status: { type: 'multiselect', options: ['Active', 'Pending', 'Suspended'] },
        lastLogin: { type: 'daterange' }
      },
      applications: {
        status: { type: 'multiselect', options: ['Pending', 'Approved', 'Rejected', 'Interview Scheduled', 'Offered'] }
      }
    },
    placeholder: 'Search users, students, internships, applications...'
  }
};

class SearchHelper {
  constructor() {
    this.listeners = new Map();
    this.cache = new Map();
  }

  // Build Firestore query based on search term and filters
  buildQuery(collection, searchTerm, filters = {}, role = 'student') {
    let q = collection;
    const constraints = [];

    // Add search constraints
    if (searchTerm && searchTerm.trim()) {
      const searchFields = SEARCH_CONFIGS[role]?.searchFields[collection] || [];
      
      // For text search, we'll use array-contains for skills and simple equality for other fields
      // Note: Firestore doesn't support full-text search, so we'll implement client-side filtering
      // In production, consider using Algolia or Elasticsearch for better search
    }

    // Add filter constraints
    Object.entries(filters).forEach(([field, value]) => {
      if (value && value.length > 0) {
        if (Array.isArray(value)) {
          // Multi-select filter
          constraints.push(where(field, 'in', value));
        } else if (typeof value === 'object' && value.min !== undefined) {
          // Range filter
          if (value.min > 0) constraints.push(where(field, '>=', value.min));
          if (value.max < Infinity) constraints.push(where(field, '<=', value.max));
        } else {
          // Single value filter
          constraints.push(where(field, '==', value));
        }
      }
    });

    // Apply constraints
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }

    // Add ordering
    q = query(q, orderBy('createdAt', 'desc'));

    return q;
  }

  // Perform search with real-time updates
  async searchWithFilters(collectionName, searchTerm, filters, role, callback) {
    try {
      const collectionRef = collection(db, collectionName);
      const q = this.buildQuery(collectionRef, searchTerm, filters, role);

      // Set up real-time listener
      const listenerId = `${collectionName}_${Date.now()}`;
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let results = [];
        
        snapshot.forEach((doc) => {
          results.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Client-side text search filtering (since Firestore doesn't support full-text search)
        if (searchTerm && searchTerm.trim()) {
          results = this.filterBySearchTerm(results, searchTerm, role, collectionName);
        }

        // Add search highlighting and AI matching
        results = this.enhanceResults(results, searchTerm, role, collectionName);

        callback(results);
      }, (error) => {
        console.error('Search error:', error);
        callback([]);
      });

      // Store listener for cleanup
      this.listeners.set(listenerId, unsubscribe);
      
      return listenerId;
    } catch (error) {
      console.error('Search setup error:', error);
      callback([]);
      return null;
    }
  }

  // Client-side text search filtering
  filterBySearchTerm(results, searchTerm, role, collectionName) {
    const searchFields = SEARCH_CONFIGS[role]?.searchFields[collectionName] || [];
    const searchLower = searchTerm.toLowerCase();

    return results.filter(item => {
      return searchFields.some(field => {
        const fieldValue = item[field];
        if (!fieldValue) return false;

        if (Array.isArray(fieldValue)) {
          // For arrays (like skills), check if any item contains the search term
          return fieldValue.some(val => 
            val.toString().toLowerCase().includes(searchLower)
          );
        } else {
          // For strings, check if the field contains the search term
          return fieldValue.toString().toLowerCase().includes(searchLower);
        }
      });
    });
  }

  // Enhance results with highlighting and AI matching
  enhanceResults(results, searchTerm, role, collectionName) {
    return results.map(item => {
      const enhanced = { ...item };

      // Add search highlighting
      if (searchTerm && searchTerm.trim()) {
        enhanced._searchHighlights = this.generateHighlights(item, searchTerm, role, collectionName);
      }

      // Add AI skill matching for internships
      if (collectionName === 'internships' && role === 'student') {
        enhanced._aiMatch = this.calculateSkillMatch(item);
      }

      // Add relevance score
      enhanced._relevanceScore = this.calculateRelevance(item, searchTerm, role, collectionName);

      return enhanced;
    }).sort((a, b) => (b._relevanceScore || 0) - (a._relevanceScore || 0));
  }

  // Generate search highlights
  generateHighlights(item, searchTerm, role, collectionName) {
    const highlights = {};
    const searchFields = SEARCH_CONFIGS[role]?.searchFields[collectionName] || [];
    const searchLower = searchTerm.toLowerCase();

    searchFields.forEach(field => {
      const fieldValue = item[field];
      if (fieldValue && fieldValue.toString().toLowerCase().includes(searchLower)) {
        if (Array.isArray(fieldValue)) {
          highlights[field] = fieldValue.map(val => {
            const valStr = val.toString();
            const index = valStr.toLowerCase().indexOf(searchLower);
            if (index !== -1) {
              return {
                text: valStr,
                highlighted: true,
                matchStart: index,
                matchEnd: index + searchTerm.length
              };
            }
            return { text: valStr, highlighted: false };
          });
        } else {
          const valStr = fieldValue.toString();
          const index = valStr.toLowerCase().indexOf(searchLower);
          highlights[field] = {
            text: valStr,
            highlighted: true,
            matchStart: index,
            matchEnd: index + searchTerm.length
          };
        }
      }
    });

    return highlights;
  }

  // Calculate AI skill matching for internships
  calculateSkillMatch(internship) {
    // This would integrate with your existing AI system
    // For now, return a mock calculation
    const requiredSkills = internship.requiredSkills || [];
    const userSkills = this.getCurrentUserSkills(); // You'd implement this
    
    if (requiredSkills.length === 0) return null;

    const matchingSkills = requiredSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );

    const matchPercentage = Math.round((matchingSkills.length / requiredSkills.length) * 100);

    return {
      percentage: matchPercentage,
      matchingSkills,
      missingSkills: requiredSkills.filter(skill => !matchingSkills.includes(skill)),
      recommendation: matchPercentage >= 80 ? 'Excellent match!' : 
                    matchPercentage >= 60 ? 'Good match' : 
                    'Consider improving skills'
    };
  }

  // Calculate relevance score for sorting
  calculateRelevance(item, searchTerm, role, collectionName) {
    if (!searchTerm || !searchTerm.trim()) return 0;

    let score = 0;
    const searchFields = SEARCH_CONFIGS[role]?.searchFields[collectionName] || [];
    const searchLower = searchTerm.toLowerCase();

    searchFields.forEach((field, index) => {
      const fieldValue = item[field];
      if (!fieldValue) return;

      const fieldWeight = searchFields.length - index; // Earlier fields have higher weight

      if (Array.isArray(fieldValue)) {
        fieldValue.forEach(val => {
          const valLower = val.toString().toLowerCase();
          if (valLower === searchLower) score += fieldWeight * 10; // Exact match
          else if (valLower.includes(searchLower)) score += fieldWeight * 5; // Partial match
        });
      } else {
        const valLower = fieldValue.toString().toLowerCase();
        if (valLower === searchLower) score += fieldWeight * 10; // Exact match
        else if (valLower.includes(searchLower)) score += fieldWeight * 5; // Partial match
        else if (valLower.startsWith(searchLower)) score += fieldWeight * 7; // Starts with
      }
    });

    return score;
  }

  // Get current user skills (mock implementation)
  getCurrentUserSkills() {
    // This would get skills from user profile
    // For now, return mock data
    return ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'];
  }

  // Get dynamic filter options from data
  async getDynamicFilterOptions(collectionName, field) {
    try {
      const cacheKey = `${collectionName}_${field}`;
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const options = new Set();
      snapshot.forEach(doc => {
        const data = doc.data();
        const fieldValue = data[field];
        
        if (Array.isArray(fieldValue)) {
          fieldValue.forEach(val => options.add(val));
        } else if (fieldValue) {
          options.add(fieldValue);
        }
      });

      const optionsArray = Array.from(options).sort();
      this.cache.set(cacheKey, optionsArray);
      
      return optionsArray;
    } catch (error) {
      console.error('Error getting dynamic filter options:', error);
      return [];
    }
  }

  // AI-powered filter suggestions
  generateFilterSuggestions(role, currentFilters, searchResults) {
    const suggestions = [];

    // Analyze search results to suggest filters
    if (searchResults.length > 50) {
      suggestions.push({
        type: 'reduce_results',
        message: 'Too many results! Try adding filters to narrow down.',
        suggestedFilters: this.getSuggestedFiltersForRole(role)
      });
    }

    // Role-specific suggestions
    if (role === 'student') {
      // Suggest skill-based filters for better matches
      const skillMatches = searchResults.filter(item => item._aiMatch?.percentage >= 80);
      if (skillMatches.length > 0) {
        suggestions.push({
          type: 'skill_match',
          message: `${skillMatches.length} internships are excellent matches for your skills!`,
          action: 'Filter by high skill match'
        });
      }
    }

    return suggestions;
  }

  // Get suggested filters for role
  getSuggestedFiltersForRole(role) {
    const config = SEARCH_CONFIGS[role];
    if (!config) return [];

    // Return most commonly used filters for the role
    switch (role) {
      case 'student':
        return ['department', 'requiredSkills', 'stipend'];
      case 'mentor':
        return ['department', 'year', 'profileCompletion'];
      case 'placement':
        return ['department', 'status', 'year'];
      case 'admin':
        return ['role', 'department', 'status'];
      default:
        return [];
    }
  }

  // Cleanup listeners
  cleanup(listenerId) {
    if (this.listeners.has(listenerId)) {
      this.listeners.get(listenerId)();
      this.listeners.delete(listenerId);
    }
  }

  // Cleanup all listeners
  cleanupAll() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
    this.cache.clear();
  }
}

// Create singleton instance
const searchHelper = new SearchHelper();

export default searchHelper;
