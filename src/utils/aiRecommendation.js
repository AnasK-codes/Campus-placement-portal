// AI Recommendation Engine for Campus Placement Portal
// Intelligent internship matching based on skills, profile, and requirements

class AIRecommendationEngine {
  constructor() {
    // Skill similarity weights for better matching
    this.skillWeights = {
      exact: 1.0,        // Exact skill match
      similar: 0.8,      // Similar/related skills
      category: 0.6,     // Same category skills
      complementary: 0.4 // Complementary skills
    };

    // Profile completion bonus weights
    this.profileWeights = {
      skills: 0.3,
      experience: 0.2,
      projects: 0.2,
      education: 0.15,
      resume: 0.15
    };

    // Skill categories for better matching
    this.skillCategories = {
      'Programming Languages': ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Go', 'Rust', 'TypeScript', 'Swift', 'Kotlin', 'Ruby', 'Scala', 'R'],
      'Web Technologies': ['HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 'Svelte'],
      'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Cassandra', 'DynamoDB', 'Firebase'],
      'Cloud & DevOps': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions', 'Terraform', 'Ansible'],
      'Mobile Development': ['Android', 'iOS', 'React Native', 'Flutter', 'Xamarin'],
      'Data Science & AI': ['Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn', 'Jupyter', 'Tableau', 'Power BI'],
      'Tools & Frameworks': ['Git', 'Webpack', 'Babel', 'ESLint', 'Jest', 'Cypress', 'Selenium', 'Postman', 'Figma', 'Adobe XD'],
      'Soft Skills': ['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Project Management', 'Time Management', 'Adaptability', 'Creativity']
    };

    // Skill similarity mapping
    this.skillSimilarity = {
      'JavaScript': ['TypeScript', 'Node.js', 'React', 'Vue.js', 'Angular'],
      'Python': ['Django', 'Flask', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch'],
      'React': ['JavaScript', 'TypeScript', 'Next.js', 'Redux', 'HTML', 'CSS'],
      'Java': ['Spring', 'Kotlin', 'Android', 'Maven', 'Gradle'],
      'AWS': ['Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform'],
      'Machine Learning': ['Python', 'TensorFlow', 'PyTorch', 'Data Science', 'Pandas'],
      'Node.js': ['JavaScript', 'Express.js', 'MongoDB', 'npm', 'TypeScript']
    };
  }

  // Main recommendation function
  async generateRecommendations(studentProfile, internships, options = {}) {
    const {
      maxRecommendations = 10,
      minMatchScore = 20,
      includeSkillGaps = true,
      prioritizeConversion = true
    } = options;

    try {
      // Calculate match scores for all internships
      const scoredInternships = internships.map(internship => {
        const matchData = this.calculateMatchScore(studentProfile, internship);
        return {
          ...internship,
          ...matchData,
          aiRecommendation: this.generateAIInsight(matchData, studentProfile, internship)
        };
      });

      // Filter and sort recommendations
      let recommendations = scoredInternships
        .filter(internship => 
          internship.matchScore >= minMatchScore && 
          this.isEligible(studentProfile, internship)
        )
        .sort((a, b) => {
          // Primary sort: match score
          if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
          }
          // Secondary sort: conversion potential
          if (prioritizeConversion && a.conversionPotential !== b.conversionPotential) {
            return b.conversionPotential ? 1 : -1;
          }
          // Tertiary sort: seats available
          return (b.availableSeats || 0) - (a.availableSeats || 0);
        })
        .slice(0, maxRecommendations);

      // Add skill gap analysis if requested
      if (includeSkillGaps) {
        recommendations = recommendations.map(internship => ({
          ...internship,
          skillGaps: this.analyzeSkillGaps(studentProfile.skills || [], internship.skills || []),
          improvementSuggestions: this.generateImprovementSuggestions(studentProfile, internship)
        }));
      }

      return {
        recommendations,
        totalAnalyzed: internships.length,
        averageMatch: this.calculateAverageMatch(scoredInternships),
        topCategories: this.identifyTopCategories(recommendations),
        aiInsights: this.generateOverallInsights(studentProfile, recommendations)
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return {
        recommendations: [],
        error: 'Failed to generate recommendations',
        totalAnalyzed: 0
      };
    }
  }

  // Calculate match score between student and internship
  calculateMatchScore(studentProfile, internship) {
    let totalScore = 0;
    let maxPossibleScore = 0;
    const matchDetails = {
      skillMatches: [],
      departmentMatch: false,
      yearMatch: false,
      profileCompletionBonus: 0
    };

    // Skills matching (60% weight)
    const skillScore = this.calculateSkillMatch(
      studentProfile.skills || [], 
      internship.skills || []
    );
    totalScore += skillScore.score * 0.6;
    maxPossibleScore += 100 * 0.6;
    matchDetails.skillMatches = skillScore.matches;
    matchDetails.skillScore = skillScore.score;

    // Department matching (20% weight)
    if (this.isDepartmentMatch(studentProfile.department, internship.departments)) {
      totalScore += 100 * 0.2;
      matchDetails.departmentMatch = true;
    }
    maxPossibleScore += 100 * 0.2;

    // Year matching (10% weight)
    if (this.isYearMatch(studentProfile.year, internship.years)) {
      totalScore += 100 * 0.1;
      matchDetails.yearMatch = true;
    }
    maxPossibleScore += 100 * 0.1;

    // Profile completion bonus (10% weight)
    const completionBonus = this.calculateProfileCompletionBonus(studentProfile);
    totalScore += completionBonus * 0.1;
    maxPossibleScore += 100 * 0.1;
    matchDetails.profileCompletionBonus = completionBonus;

    // Calculate final match percentage
    const matchScore = Math.round((totalScore / maxPossibleScore) * 100);

    return {
      matchScore: Math.max(0, Math.min(100, matchScore)),
      matchDetails,
      rawScore: totalScore,
      maxScore: maxPossibleScore
    };
  }

  // Calculate skill matching score
  calculateSkillMatch(studentSkills, requiredSkills) {
    if (!studentSkills.length || !requiredSkills.length) {
      return { score: 0, matches: [] };
    }

    const matches = [];
    let totalScore = 0;

    requiredSkills.forEach(requiredSkill => {
      const match = this.findBestSkillMatch(requiredSkill, studentSkills);
      if (match) {
        matches.push(match);
        totalScore += match.weight * 100;
      }
    });

    // Calculate percentage based on required skills
    const maxPossibleScore = requiredSkills.length * 100;
    const score = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

    return {
      score: Math.round(score),
      matches,
      totalMatched: matches.length,
      totalRequired: requiredSkills.length
    };
  }

  // Find best matching skill from student's skills
  findBestSkillMatch(requiredSkill, studentSkills) {
    const requiredLower = requiredSkill.toLowerCase();
    
    // Exact match
    for (const studentSkill of studentSkills) {
      if (studentSkill.toLowerCase() === requiredLower) {
        return {
          studentSkill,
          requiredSkill,
          matchType: 'exact',
          weight: this.skillWeights.exact,
          confidence: 1.0
        };
      }
    }

    // Similar skill match
    const similarSkills = this.skillSimilarity[requiredSkill] || [];
    for (const studentSkill of studentSkills) {
      const studentLower = studentSkill.toLowerCase();
      if (similarSkills.some(similar => similar.toLowerCase() === studentLower)) {
        return {
          studentSkill,
          requiredSkill,
          matchType: 'similar',
          weight: this.skillWeights.similar,
          confidence: 0.8
        };
      }
    }

    // Category match
    const requiredCategory = this.getSkillCategory(requiredSkill);
    if (requiredCategory) {
      for (const studentSkill of studentSkills) {
        const studentCategory = this.getSkillCategory(studentSkill);
        if (studentCategory === requiredCategory) {
          return {
            studentSkill,
            requiredSkill,
            matchType: 'category',
            weight: this.skillWeights.category,
            confidence: 0.6
          };
        }
      }
    }

    return null;
  }

  // Get skill category
  getSkillCategory(skill) {
    for (const [category, skills] of Object.entries(this.skillCategories)) {
      if (skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        return category;
      }
    }
    return null;
  }

  // Check department eligibility
  isDepartmentMatch(studentDepartment, internshipDepartments) {
    if (!studentDepartment || !internshipDepartments || !internshipDepartments.length) {
      return false;
    }

    return internshipDepartments.includes('All Departments') ||
           internshipDepartments.some(dept => 
             dept.toLowerCase() === studentDepartment.toLowerCase()
           );
  }

  // Check year eligibility
  isYearMatch(studentYear, internshipYears) {
    if (!studentYear || !internshipYears || !internshipYears.length) {
      return false;
    }

    return internshipYears.includes('All Years') ||
           internshipYears.some(year => 
             year.toLowerCase() === studentYear.toLowerCase()
           );
  }

  // Check overall eligibility
  isEligible(studentProfile, internship) {
    // Check if seats are available
    const availableSeats = (internship.seats || 0) - (internship.acceptedApplications || 0);
    if (availableSeats <= 0) {
      return false;
    }

    // Check if already applied
    if (internship.appliedStudents && internship.appliedStudents.includes(studentProfile.uid)) {
      return false;
    }

    // Check basic eligibility criteria
    const departmentEligible = this.isDepartmentMatch(studentProfile.department, internship.departments);
    const yearEligible = this.isYearMatch(studentProfile.year, internship.years);

    return departmentEligible && yearEligible;
  }

  // Calculate profile completion bonus
  calculateProfileCompletionBonus(profile) {
    let completionScore = 0;
    let totalChecks = 0;

    // Skills completion
    if (profile.skills && profile.skills.length > 0) {
      completionScore += Math.min(profile.skills.length * 10, 100);
    }
    totalChecks += 100;

    // Experience/Projects
    if (profile.projects && profile.projects.length > 0) {
      completionScore += Math.min(profile.projects.length * 20, 100);
    }
    totalChecks += 100;

    // Education details
    if (profile.education && profile.education.degree) {
      completionScore += 100;
    }
    totalChecks += 100;

    // Resume uploaded
    if (profile.resumeUrl) {
      completionScore += 100;
    }
    totalChecks += 100;

    // Profile picture
    if (profile.avatarUrl) {
      completionScore += 50;
    }
    totalChecks += 50;

    return totalChecks > 0 ? Math.round((completionScore / totalChecks) * 100) : 0;
  }

  // Analyze skill gaps
  analyzeSkillGaps(studentSkills, requiredSkills) {
    const gaps = [];
    const studentSkillsLower = studentSkills.map(s => s.toLowerCase());

    requiredSkills.forEach(requiredSkill => {
      const hasSkill = studentSkillsLower.includes(requiredSkill.toLowerCase());
      const hasSimilar = this.skillSimilarity[requiredSkill]?.some(similar =>
        studentSkillsLower.includes(similar.toLowerCase())
      );

      if (!hasSkill && !hasSimilar) {
        gaps.push({
          skill: requiredSkill,
          category: this.getSkillCategory(requiredSkill),
          priority: this.getSkillPriority(requiredSkill),
          learningTime: this.getEstimatedLearningTime(requiredSkill),
          resources: this.getSkillResources(requiredSkill)
        });
      }
    });

    return gaps.sort((a, b) => b.priority - a.priority);
  }

  // Get skill priority for learning
  getSkillPriority(skill) {
    const highPrioritySkills = ['JavaScript', 'Python', 'React', 'Java', 'SQL', 'Git'];
    const mediumPrioritySkills = ['Node.js', 'HTML', 'CSS', 'MongoDB', 'AWS'];
    
    if (highPrioritySkills.includes(skill)) return 3;
    if (mediumPrioritySkills.includes(skill)) return 2;
    return 1;
  }

  // Get estimated learning time
  getEstimatedLearningTime(skill) {
    const timeMap = {
      'JavaScript': '2-3 months',
      'Python': '2-3 months',
      'React': '1-2 months',
      'Java': '3-4 months',
      'HTML': '2-4 weeks',
      'CSS': '1-2 months',
      'Git': '1-2 weeks',
      'SQL': '1-2 months',
      'Node.js': '1-2 months',
      'AWS': '3-6 months'
    };
    return timeMap[skill] || '1-3 months';
  }

  // Get learning resources
  getSkillResources(skill) {
    const resourceMap = {
      'JavaScript': ['MDN Web Docs', 'freeCodeCamp', 'JavaScript.info'],
      'Python': ['Python.org', 'Codecademy', 'Automate the Boring Stuff'],
      'React': ['React Docs', 'React Tutorial', 'Scrimba'],
      'Java': ['Oracle Java Tutorials', 'Codecademy Java', 'Java Code Geeks'],
      'AWS': ['AWS Training', 'A Cloud Guru', 'AWS Documentation']
    };
    return resourceMap[skill] || ['Online tutorials', 'Documentation', 'Practice projects'];
  }

  // Generate AI insights for individual internship
  generateAIInsight(matchData, studentProfile, internship) {
    const { matchScore, matchDetails } = matchData;
    const insights = [];

    // Match score insight
    if (matchScore >= 80) {
      insights.push({
        type: 'excellent',
        message: `Excellent match! Your skills align perfectly with this role.`,
        icon: '🎯'
      });
    } else if (matchScore >= 60) {
      insights.push({
        type: 'good',
        message: `Good match! You have most of the required skills.`,
        icon: '✅'
      });
    } else if (matchScore >= 40) {
      insights.push({
        type: 'moderate',
        message: `Moderate match. Consider developing missing skills.`,
        icon: '📈'
      });
    } else {
      insights.push({
        type: 'low',
        message: `Lower match. This could be a growth opportunity.`,
        icon: '🌱'
      });
    }

    // Skill-specific insights
    if (matchDetails.skillMatches.length > 0) {
      const exactMatches = matchDetails.skillMatches.filter(m => m.matchType === 'exact');
      if (exactMatches.length > 0) {
        insights.push({
          type: 'skills',
          message: `Perfect match for: ${exactMatches.map(m => m.studentSkill).join(', ')}`,
          icon: '💪'
        });
      }
    }

    // Department/Year insights
    if (matchDetails.departmentMatch && matchDetails.yearMatch) {
      insights.push({
        type: 'eligibility',
        message: `Perfect eligibility match for your department and year!`,
        icon: '🎓'
      });
    }

    return insights;
  }

  // Generate overall insights
  generateOverallInsights(studentProfile, recommendations) {
    const insights = [];

    if (recommendations.length === 0) {
      insights.push({
        type: 'no_matches',
        message: 'No strong matches found. Consider expanding your skills or updating your profile.',
        priority: 'high'
      });
      return insights;
    }

    const topMatch = recommendations[0];
    if (topMatch.matchScore >= 90) {
      insights.push({
        type: 'excellent_opportunity',
        message: `🎉 Amazing! You have a ${topMatch.matchScore}% match with ${topMatch.company}!`,
        priority: 'high'
      });
    }

    // Skill development suggestions
    const commonGaps = this.findCommonSkillGaps(recommendations);
    if (commonGaps.length > 0) {
      insights.push({
        type: 'skill_development',
        message: `Learning ${commonGaps[0]} could improve your match for ${commonGaps.length} more internships.`,
        priority: 'medium'
      });
    }

    return insights;
  }

  // Find common skill gaps across recommendations
  findCommonSkillGaps(recommendations) {
    const gapCounts = {};
    
    recommendations.forEach(rec => {
      if (rec.skillGaps) {
        rec.skillGaps.forEach(gap => {
          gapCounts[gap.skill] = (gapCounts[gap.skill] || 0) + 1;
        });
      }
    });

    return Object.entries(gapCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([skill]) => skill);
  }

  // Calculate average match score
  calculateAverageMatch(scoredInternships) {
    if (scoredInternships.length === 0) return 0;
    const total = scoredInternships.reduce((sum, internship) => sum + internship.matchScore, 0);
    return Math.round(total / scoredInternships.length);
  }

  // Identify top categories
  identifyTopCategories(recommendations) {
    const categories = {};
    
    recommendations.forEach(rec => {
      if (rec.skills) {
        rec.skills.forEach(skill => {
          const category = this.getSkillCategory(skill);
          if (category) {
            categories[category] = (categories[category] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
  }

  // Generate improvement suggestions
  generateImprovementSuggestions(studentProfile, internship) {
    const suggestions = [];

    // Profile completion suggestions
    const completionScore = this.calculateProfileCompletionBonus(studentProfile);
    if (completionScore < 80) {
      suggestions.push({
        type: 'profile',
        message: 'Complete your profile to improve match accuracy',
        action: 'Add missing information to your profile',
        impact: 'medium'
      });
    }

    // Skill gap suggestions
    if (internship.skillGaps && internship.skillGaps.length > 0) {
      const topGap = internship.skillGaps[0];
      suggestions.push({
        type: 'skill',
        message: `Learn ${topGap.skill} to significantly improve your match`,
        action: `Start learning ${topGap.skill}`,
        impact: 'high',
        timeEstimate: topGap.learningTime
      });
    }

    return suggestions;
  }
}

// Export singleton instance
export default new AIRecommendationEngine();
