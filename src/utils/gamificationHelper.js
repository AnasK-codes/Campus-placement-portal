import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// Skill badge levels and requirements
export const SKILL_LEVELS = {
  BRONZE: {
    level: 1,
    name: 'Bronze',
    color: '#CD7F32',
    gradient: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)',
    requirements: {
      minProjects: 1,
      minExperience: 0, // months
      minCertifications: 0
    },
    icon: '🥉'
  },
  SILVER: {
    level: 2,
    name: 'Silver',
    color: '#C0C0C0',
    gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)',
    requirements: {
      minProjects: 3,
      minExperience: 6,
      minCertifications: 1
    },
    icon: '🥈'
  },
  GOLD: {
    level: 3,
    name: 'Gold',
    color: '#FFD700',
    gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    requirements: {
      minProjects: 5,
      minExperience: 12,
      minCertifications: 2
    },
    icon: '🥇'
  },
  PLATINUM: {
    level: 4,
    name: 'Platinum',
    color: '#E5E4E2',
    gradient: 'linear-gradient(135deg, #E5E4E2 0%, #D3D3D3 100%)',
    requirements: {
      minProjects: 8,
      minExperience: 24,
      minCertifications: 3
    },
    icon: '💎'
  }
};

// Achievement types and requirements
export const ACHIEVEMENTS = {
  FIRST_APPLICATION: {
    id: 'first_application',
    name: 'First Step',
    description: 'Applied to your first internship',
    icon: '🚀',
    color: '#4CAF50',
    requirement: (userData) => userData.applicationsCount >= 1
  },
  PROFILE_COMPLETE: {
    id: 'profile_complete',
    name: 'Profile Master',
    description: 'Completed 100% of your profile',
    icon: '✅',
    color: '#2196F3',
    requirement: (userData) => userData.profileCompletion >= 100
  },
  SKILL_COLLECTOR: {
    id: 'skill_collector',
    name: 'Skill Collector',
    description: 'Added 10 or more skills',
    icon: '🎯',
    color: '#FF9800',
    requirement: (userData) => userData.skillsCount >= 10
  },
  CERTIFICATE_EARNED: {
    id: 'certificate_earned',
    name: 'Certified',
    description: 'Earned your first certificate',
    icon: '🏆',
    color: '#FFD700',
    requirement: (userData) => userData.certificatesCount >= 1
  },
  TOP_MATCH_APPLIED: {
    id: 'top_match_applied',
    name: 'Perfect Match',
    description: 'Applied to an internship with 90%+ skill match',
    icon: '🎪',
    color: '#E91E63',
    requirement: (userData) => userData.topMatchApplication >= 90
  },
  INTERVIEW_SCHEDULED: {
    id: 'interview_scheduled',
    name: 'Interview Ready',
    description: 'Got your first interview scheduled',
    icon: '📅',
    color: '#9C27B0',
    requirement: (userData) => userData.interviewsScheduled >= 1
  },
  SKILL_MASTER: {
    id: 'skill_master',
    name: 'Skill Master',
    description: 'Achieved Gold level in 5 skills',
    icon: '👑',
    color: '#FFD700',
    requirement: (userData) => userData.goldSkillsCount >= 5
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Applied within 24 hours of internship posting',
    icon: '🌅',
    color: '#FF5722',
    requirement: (userData) => userData.earlyApplications >= 1
  }
};

// Profile completion milestones
export const PROFILE_MILESTONES = {
  25: {
    percentage: 25,
    title: 'Getting Started',
    message: 'Great start! Keep building your profile.',
    color: '#FF9800',
    effect: 'glow'
  },
  50: {
    percentage: 50,
    title: 'Halfway There',
    message: 'You unlocked Silver badge for completing 50% of your profile!',
    color: '#2196F3',
    effect: 'confetti'
  },
  75: {
    percentage: 75,
    title: 'Almost Complete',
    message: 'You\'re doing amazing! Just a little more to go.',
    color: '#4CAF50',
    effect: 'sparkles'
  },
  100: {
    percentage: 100,
    title: 'Profile Master',
    message: 'Congratulations! Your profile is now complete!',
    color: '#FFD700',
    effect: 'fireworks'
  }
};

class GamificationHelper {
  constructor() {
    this.skillsCache = new Map();
    this.achievementsCache = new Map();
  }

  // Calculate skill level based on user data
  calculateSkillLevel(skillData) {
    const { projects = 0, experience = 0, certifications = 0 } = skillData;

    // Check from highest to lowest level
    const levels = [SKILL_LEVELS.PLATINUM, SKILL_LEVELS.GOLD, SKILL_LEVELS.SILVER, SKILL_LEVELS.BRONZE];
    
    for (const level of levels) {
      const req = level.requirements;
      if (projects >= req.minProjects && 
          experience >= req.minExperience && 
          certifications >= req.minCertifications) {
        return level;
      }
    }
    
    return SKILL_LEVELS.BRONZE; // Default to Bronze
  }

  // Calculate profile completion percentage
  calculateProfileCompletion(userProfile) {
    const fields = {
      basicInfo: {
        weight: 20,
        completed: !!(userProfile.name && userProfile.email && userProfile.department && userProfile.year)
      },
      skills: {
        weight: 25,
        completed: userProfile.skills && userProfile.skills.length >= 5
      },
      projects: {
        weight: 20,
        completed: userProfile.projects && userProfile.projects.length >= 2
      },
      resume: {
        weight: 15,
        completed: !!userProfile.resumeUrl
      },
      certificates: {
        weight: 10,
        completed: userProfile.certificates && userProfile.certificates.length >= 1
      },
      applications: {
        weight: 10,
        completed: userProfile.applicationsCount >= 1
      }
    };

    let totalWeight = 0;
    let completedWeight = 0;

    Object.values(fields).forEach(field => {
      totalWeight += field.weight;
      if (field.completed) {
        completedWeight += field.weight;
      }
    });

    return Math.round((completedWeight / totalWeight) * 100);
  }

  // Get next milestone for profile completion
  getNextMilestone(currentPercentage) {
    const milestones = Object.keys(PROFILE_MILESTONES).map(Number).sort((a, b) => a - b);
    return milestones.find(milestone => milestone > currentPercentage) || 100;
  }

  // Check if user has reached a new milestone
  checkMilestoneReached(oldPercentage, newPercentage) {
    const milestones = Object.keys(PROFILE_MILESTONES).map(Number);
    return milestones.find(milestone => 
      oldPercentage < milestone && newPercentage >= milestone
    );
  }

  // Update user skills in Firestore
  async updateUserSkill(userId, skillName, skillData) {
    try {
      const skillRef = doc(db, 'users', userId, 'skills', skillName);
      const newLevel = this.calculateSkillLevel(skillData);
      
      // Get current skill data to check for level upgrade
      const currentSkillDoc = await getDoc(skillRef);
      const currentLevel = currentSkillDoc.exists() ? 
        currentSkillDoc.data().level : SKILL_LEVELS.BRONZE.level;

      const updatedSkill = {
        ...skillData,
        skillName,
        level: newLevel.level,
        levelName: newLevel.name,
        levelColor: newLevel.color,
        levelGradient: newLevel.gradient,
        levelIcon: newLevel.icon,
        lastUpdated: serverTimestamp(),
        updatedAt: new Date()
      };

      await setDoc(skillRef, updatedSkill, { merge: true });

      // Check for level upgrade
      const levelUpgraded = newLevel.level > currentLevel;
      
      if (levelUpgraded) {
        // Trigger achievement check
        await this.checkAndUnlockAchievements(userId);
      }

      return {
        skill: updatedSkill,
        levelUpgraded,
        newLevel,
        oldLevel: currentLevel
      };
    } catch (error) {
      console.error('Error updating user skill:', error);
      throw error;
    }
  }

  // Get all user skills
  async getUserSkills(userId) {
    try {
      if (this.skillsCache.has(userId)) {
        return this.skillsCache.get(userId);
      }

      const skillsRef = collection(db, 'users', userId, 'skills');
      const skillsSnapshot = await getDocs(skillsRef);
      
      const skills = [];
      skillsSnapshot.forEach(doc => {
        skills.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort by level (highest first) then by name
      skills.sort((a, b) => {
        if (a.level !== b.level) {
          return b.level - a.level;
        }
        return a.skillName.localeCompare(b.skillName);
      });

      this.skillsCache.set(userId, skills);
      return skills;
    } catch (error) {
      console.error('Error getting user skills:', error);
      return [];
    }
  }

  // Check and unlock achievements
  async checkAndUnlockAchievements(userId) {
    try {
      // Get user data for achievement checking
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return [];

      const userData = userDoc.data();
      const userSkills = await this.getUserSkills(userId);
      
      // Enhance userData with calculated values
      const enhancedUserData = {
        ...userData,
        skillsCount: userSkills.length,
        goldSkillsCount: userSkills.filter(skill => skill.level >= SKILL_LEVELS.GOLD.level).length,
        profileCompletion: this.calculateProfileCompletion(userData)
      };

      // Get current achievements
      const achievementsRef = collection(db, 'users', userId, 'achievements');
      const achievementsSnapshot = await getDocs(achievementsRef);
      const currentAchievements = new Set();
      
      achievementsSnapshot.forEach(doc => {
        currentAchievements.add(doc.id);
      });

      // Check each achievement
      const newAchievements = [];
      const batch = writeBatch(db);

      Object.values(ACHIEVEMENTS).forEach(achievement => {
        if (!currentAchievements.has(achievement.id) && 
            achievement.requirement(enhancedUserData)) {
          
          const achievementData = {
            ...achievement,
            dateUnlocked: serverTimestamp(),
            unlockedAt: new Date()
          };

          const achievementRef = doc(db, 'users', userId, 'achievements', achievement.id);
          batch.set(achievementRef, achievementData);
          newAchievements.push(achievementData);
        }
      });

      if (newAchievements.length > 0) {
        await batch.commit();
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  // Get user achievements
  async getUserAchievements(userId) {
    try {
      if (this.achievementsCache.has(userId)) {
        return this.achievementsCache.get(userId);
      }

      const achievementsRef = collection(db, 'users', userId, 'achievements');
      const q = query(achievementsRef, orderBy('dateUnlocked', 'desc'));
      const achievementsSnapshot = await getDocs(q);
      
      const achievements = [];
      achievementsSnapshot.forEach(doc => {
        achievements.push({
          id: doc.id,
          ...doc.data()
        });
      });

      this.achievementsCache.set(userId, achievements);
      return achievements;
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  // Generate AI skill suggestions
  generateSkillSuggestions(userSkills, internshipRequirements = []) {
    const suggestions = [];
    const userSkillNames = userSkills.map(skill => skill.skillName.toLowerCase());

    // High-demand skills that user doesn't have
    const highDemandSkills = [
      'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'MongoDB',
      'AWS', 'Docker', 'Git', 'TypeScript', 'Vue.js', 'Angular',
      'Express.js', 'PostgreSQL', 'Redis', 'Kubernetes'
    ];

    highDemandSkills.forEach(skill => {
      if (!userSkillNames.includes(skill.toLowerCase())) {
        suggestions.push({
          skillName: skill,
          reason: 'High demand skill',
          impact: `Could increase internship matches by ${Math.floor(Math.random() * 20) + 10}%`,
          priority: 'high',
          category: 'missing'
        });
      }
    });

    // Skills that need level improvement
    userSkills.forEach(skill => {
      if (skill.level < SKILL_LEVELS.GOLD.level) {
        const nextLevel = Object.values(SKILL_LEVELS).find(level => level.level > skill.level);
        if (nextLevel) {
          suggestions.push({
            skillName: skill.skillName,
            reason: `Upgrade to ${nextLevel.name} level`,
            impact: `Improve skill credibility and match quality`,
            priority: skill.level === SKILL_LEVELS.BRONZE.level ? 'medium' : 'low',
            category: 'upgrade',
            currentLevel: skill.level,
            targetLevel: nextLevel.level
          });
        }
      }
    });

    // Skills from internship requirements
    internshipRequirements.forEach(requiredSkill => {
      if (!userSkillNames.includes(requiredSkill.toLowerCase())) {
        suggestions.push({
          skillName: requiredSkill,
          reason: 'Required for target internships',
          impact: 'Essential for specific internship applications',
          priority: 'high',
          category: 'required'
        });
      }
    });

    // Sort by priority and limit results
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return suggestions
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 6);
  }

  // Calculate skill match percentage for internship
  calculateSkillMatch(userSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) return 0;

    const userSkillNames = userSkills.map(skill => skill.skillName.toLowerCase());
    const matchingSkills = requiredSkills.filter(skill => 
      userSkillNames.includes(skill.toLowerCase())
    );

    const baseMatch = (matchingSkills.length / requiredSkills.length) * 100;
    
    // Bonus for skill levels
    const levelBonus = matchingSkills.reduce((bonus, skill) => {
      const userSkill = userSkills.find(us => 
        us.skillName.toLowerCase() === skill.toLowerCase()
      );
      if (userSkill) {
        return bonus + (userSkill.level - 1) * 2; // 2% bonus per level above Bronze
      }
      return bonus;
    }, 0);

    return Math.min(100, Math.round(baseMatch + levelBonus));
  }

  // Clear cache
  clearCache() {
    this.skillsCache.clear();
    this.achievementsCache.clear();
  }

  // Get skill statistics
  getSkillStatistics(userSkills) {
    const stats = {
      total: userSkills.length,
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      averageLevel: 0
    };

    userSkills.forEach(skill => {
      switch (skill.level) {
        case SKILL_LEVELS.BRONZE.level:
          stats.bronze++;
          break;
        case SKILL_LEVELS.SILVER.level:
          stats.silver++;
          break;
        case SKILL_LEVELS.GOLD.level:
          stats.gold++;
          break;
        case SKILL_LEVELS.PLATINUM.level:
          stats.platinum++;
          break;
      }
    });

    if (stats.total > 0) {
      const totalLevels = userSkills.reduce((sum, skill) => sum + skill.level, 0);
      stats.averageLevel = (totalLevels / stats.total).toFixed(1);
    }

    return stats;
  }
}

// Create singleton instance
const gamificationHelper = new GamificationHelper();

export default gamificationHelper;
