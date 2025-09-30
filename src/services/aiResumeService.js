import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// Mock AI service for resume analysis
// In production, this would integrate with Claude AI or similar service
class AIResumeService {
  constructor() {
    this.skillsDatabase = {
      // Programming Languages
      'javascript': ['js', 'node.js', 'nodejs', 'react', 'vue', 'angular'],
      'python': ['django', 'flask', 'pandas', 'numpy', 'tensorflow', 'pytorch'],
      'java': ['spring', 'spring boot', 'hibernate', 'maven', 'gradle'],
      'c++': ['cpp', 'c plus plus', 'stl', 'boost'],
      'c#': ['csharp', 'dotnet', '.net', 'asp.net'],
      'php': ['laravel', 'symfony', 'codeigniter', 'wordpress'],
      'go': ['golang', 'gin', 'gorilla'],
      'rust': ['cargo', 'tokio'],
      'typescript': ['ts', 'angular', 'nest.js'],

      // Web Technologies
      'html': ['html5', 'markup', 'semantic html'],
      'css': ['css3', 'sass', 'scss', 'less', 'stylus'],
      'react': ['reactjs', 'jsx', 'hooks', 'redux', 'context api'],
      'angular': ['angularjs', 'typescript', 'rxjs'],
      'vue': ['vuejs', 'nuxt', 'vuex'],
      'node.js': ['nodejs', 'express', 'koa', 'fastify'],

      // Databases
      'mysql': ['sql', 'mariadb'],
      'postgresql': ['postgres', 'psql'],
      'mongodb': ['mongo', 'mongoose', 'nosql'],
      'redis': ['cache', 'in-memory'],
      'sqlite': ['sql lite'],

      // Cloud & DevOps
      'aws': ['amazon web services', 'ec2', 's3', 'lambda', 'rds'],
      'azure': ['microsoft azure', 'azure functions'],
      'gcp': ['google cloud', 'google cloud platform'],
      'docker': ['containerization', 'containers'],
      'kubernetes': ['k8s', 'orchestration'],
      'jenkins': ['ci/cd', 'continuous integration'],

      // Tools & Frameworks
      'git': ['github', 'gitlab', 'bitbucket', 'version control'],
      'figma': ['design', 'ui/ux', 'prototyping'],
      'photoshop': ['adobe photoshop', 'image editing'],
      'illustrator': ['adobe illustrator', 'vector graphics'],

      // Soft Skills
      'communication': ['verbal communication', 'written communication'],
      'leadership': ['team leadership', 'project management'],
      'problem solving': ['analytical thinking', 'critical thinking'],
      'teamwork': ['collaboration', 'team player']
    };

    this.commonProjects = [
      'e-commerce website', 'portfolio website', 'blog application',
      'todo application', 'weather app', 'chat application',
      'social media platform', 'booking system', 'inventory management',
      'student management system', 'library management', 'hospital management'
    ];
  }

  // Extract text from resume (mock implementation)
  async extractTextFromResume(resumeUrl) {
    // In production, this would use OCR or PDF parsing libraries
    // For now, return mock extracted text
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResumeText = `
          John Doe
          Software Developer
          Email: john.doe@email.com
          Phone: +91-9876543210
          
          EDUCATION
          Bachelor of Technology in Computer Science
          XYZ University (2020-2024)
          CGPA: 8.5/10
          
          SKILLS
          Programming Languages: JavaScript, Python, Java
          Web Technologies: React, Node.js, HTML, CSS
          Databases: MySQL, MongoDB
          Tools: Git, Docker, VS Code
          
          PROJECTS
          1. E-commerce Website
          - Built using React and Node.js
          - Implemented user authentication and payment gateway
          - Technologies: React, Express.js, MongoDB, Stripe API
          
          2. Task Management Application
          - Full-stack web application for task tracking
          - Features: Real-time updates, user collaboration
          - Technologies: Vue.js, Python Flask, PostgreSQL
          
          EXPERIENCE
          Software Development Intern
          ABC Tech Solutions (Jun 2023 - Aug 2023)
          - Developed REST APIs using Node.js and Express
          - Worked on frontend components using React
          - Collaborated with team of 5 developers
          
          CERTIFICATIONS
          - AWS Cloud Practitioner
          - Google Analytics Certified
          - MongoDB Developer Certification
        `;
        resolve(mockResumeText);
      }, 1500);
    });
  }

  // Extract skills from resume text
  extractSkills(resumeText) {
    const extractedSkills = [];
    const text = resumeText.toLowerCase();

    // Check for each skill in our database
    Object.keys(this.skillsDatabase).forEach(skill => {
      const variations = [skill, ...this.skillsDatabase[skill]];
      
      for (const variation of variations) {
        if (text.includes(variation.toLowerCase())) {
          if (!extractedSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
            extractedSkills.push(skill);
          }
          break;
        }
      }
    });

    return extractedSkills;
  }

  // Extract projects from resume text
  extractProjects(resumeText) {
    const projects = [];
    const lines = resumeText.split('\n');
    let currentProject = null;
    let inProjectsSection = false;

    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('project')) {
        inProjectsSection = true;
        return;
      }

      if (inProjectsSection && trimmedLine.length > 0) {
        // Check if this looks like a project title
        if (trimmedLine.match(/^\d+\./) || 
            this.commonProjects.some(p => trimmedLine.toLowerCase().includes(p))) {
          if (currentProject) {
            projects.push(currentProject);
          }
          currentProject = {
            title: trimmedLine.replace(/^\d+\.\s*/, ''),
            description: '',
            technologies: []
          };
        } else if (currentProject && trimmedLine.startsWith('-')) {
          currentProject.description += trimmedLine.substring(1).trim() + ' ';
        } else if (currentProject && trimmedLine.toLowerCase().includes('technolog')) {
          const techMatch = trimmedLine.match(/technologies?:\s*(.+)/i);
          if (techMatch) {
            currentProject.technologies = techMatch[1]
              .split(',')
              .map(tech => tech.trim())
              .filter(tech => tech.length > 0);
          }
        }
      }

      // Stop if we hit another section
      if (trimmedLine.toLowerCase().includes('experience') || 
          trimmedLine.toLowerCase().includes('education') ||
          trimmedLine.toLowerCase().includes('certification')) {
        if (currentProject) {
          projects.push(currentProject);
          currentProject = null;
        }
        inProjectsSection = false;
      }
    });

    if (currentProject) {
      projects.push(currentProject);
    }

    return projects.slice(0, 5); // Return max 5 projects
  }

  // Get internship requirements from Firestore
  async getInternshipRequirements() {
    try {
      const internshipsRef = collection(db, 'internships');
      const q = query(internshipsRef, where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      
      const internships = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return internships;
    } catch (error) {
      console.error('Error fetching internships:', error);
      // Return mock data if Firestore fails
      return [
        {
          id: '1',
          title: 'Frontend Developer Intern',
          company: 'TechCorp',
          requiredSkills: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'],
          preferredSkills: ['TypeScript', 'Redux', 'Sass'],
          stipend: 15000,
          location: 'Bangalore'
        },
        {
          id: '2',
          title: 'Full Stack Developer Intern',
          company: 'StartupXYZ',
          requiredSkills: ['JavaScript', 'Node.js', 'React', 'MongoDB', 'Express.js'],
          preferredSkills: ['AWS', 'Docker', 'TypeScript'],
          stipend: 20000,
          location: 'Mumbai'
        },
        {
          id: '3',
          title: 'Data Science Intern',
          company: 'DataTech',
          requiredSkills: ['Python', 'Machine Learning', 'Pandas', 'NumPy'],
          preferredSkills: ['TensorFlow', 'PyTorch', 'SQL', 'R'],
          stipend: 18000,
          location: 'Hyderabad'
        }
      ];
    }
  }

  // Calculate skill match percentage
  calculateSkillMatch(userSkills, requiredSkills, preferredSkills = []) {
    const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
    const requiredSkillsLower = requiredSkills.map(skill => skill.toLowerCase());
    const preferredSkillsLower = preferredSkills.map(skill => skill.toLowerCase());

    // Calculate required skills match
    const matchedRequired = requiredSkillsLower.filter(skill => 
      userSkillsLower.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );

    // Calculate preferred skills match
    const matchedPreferred = preferredSkillsLower.filter(skill => 
      userSkillsLower.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );

    // Weight: Required skills 70%, Preferred skills 30%
    const requiredMatch = (matchedRequired.length / requiredSkillsLower.length) * 0.7;
    const preferredMatch = preferredSkillsLower.length > 0 
      ? (matchedPreferred.length / preferredSkillsLower.length) * 0.3 
      : 0.3; // Give full preferred score if no preferred skills

    return Math.round((requiredMatch + preferredMatch) * 100);
  }

  // Analyze resume and provide recommendations
  async analyzeResume(resumeUrl, userSkills = []) {
    try {
      // Extract text from resume
      const resumeText = await this.extractTextFromResume(resumeUrl);
      
      // Extract skills and projects
      const extractedSkills = this.extractSkills(resumeText);
      const extractedProjects = this.extractProjects(resumeText);
      
      // Combine user-provided skills with extracted skills
      const allSkills = [...new Set([...userSkills, ...extractedSkills])];
      
      // Get internship requirements
      const internships = await this.getInternshipRequirements();
      
      // Calculate matches for each internship
      const internshipMatches = internships.map(internship => {
        const matchPercentage = this.calculateSkillMatch(
          allSkills,
          internship.requiredSkills || [],
          internship.preferredSkills || []
        );

        const missingSkills = (internship.requiredSkills || []).filter(skill =>
          !allSkills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );

        return {
          ...internship,
          matchPercentage,
          missingSkills,
          matchedSkills: (internship.requiredSkills || []).filter(skill =>
            allSkills.some(userSkill => 
              userSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(userSkill.toLowerCase())
            )
          )
        };
      });

      // Sort by match percentage
      internshipMatches.sort((a, b) => b.matchPercentage - a.matchPercentage);

      // Generate skill gap analysis
      const allRequiredSkills = [...new Set(
        internships.flatMap(internship => internship.requiredSkills || [])
      )];

      const skillGaps = allRequiredSkills.map(skill => {
        const hasSkill = allSkills.some(userSkill => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        );

        const demandCount = internships.filter(internship => 
          (internship.requiredSkills || []).includes(skill)
        ).length;

        return {
          skill,
          hasSkill,
          demandCount,
          priority: demandCount > 2 ? 'high' : demandCount > 1 ? 'medium' : 'low'
        };
      });

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        allSkills,
        skillGaps,
        extractedProjects,
        internshipMatches
      );

      return {
        extractedSkills,
        extractedProjects,
        allSkills,
        internshipMatches: internshipMatches.slice(0, 10), // Top 10 matches
        skillGaps: skillGaps.filter(gap => !gap.hasSkill).slice(0, 8), // Top 8 missing skills
        recommendations,
        overallScore: this.calculateOverallScore(allSkills, skillGaps, extractedProjects),
        analysisDate: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw new Error('Failed to analyze resume. Please try again.');
    }
  }

  // Generate personalized recommendations
  generateRecommendations(skills, skillGaps, projects, internshipMatches) {
    const recommendations = [];

    // Skill recommendations
    const highPriorityGaps = skillGaps.filter(gap => 
      !gap.hasSkill && gap.priority === 'high'
    ).slice(0, 3);

    if (highPriorityGaps.length > 0) {
      recommendations.push({
        type: 'skill',
        priority: 'high',
        title: 'High-Demand Skills Missing',
        description: `Add ${highPriorityGaps.map(gap => gap.skill).join(', ')} to match ${highPriorityGaps[0].demandCount}+ internships`,
        action: 'Learn these skills through online courses or projects',
        skills: highPriorityGaps.map(gap => gap.skill)
      });
    }

    // Project recommendations
    if (projects.length < 3) {
      recommendations.push({
        type: 'project',
        priority: 'medium',
        title: 'Add More Projects',
        description: `You have ${projects.length} projects. Add ${3 - projects.length} more to strengthen your profile`,
        action: 'Build projects using your existing skills',
        suggestions: [
          'E-commerce website with payment integration',
          'Real-time chat application',
          'Task management system with collaboration features'
        ]
      });
    }

    // Internship application recommendations
    const goodMatches = internshipMatches.filter(match => match.matchPercentage >= 70);
    if (goodMatches.length > 0) {
      recommendations.push({
        type: 'application',
        priority: 'high',
        title: 'Ready to Apply',
        description: `You're a ${goodMatches[0].matchPercentage}% match for ${goodMatches.length} internships`,
        action: 'Apply to these internships now',
        internships: goodMatches.slice(0, 3).map(match => ({
          title: match.title,
          company: match.company,
          matchPercentage: match.matchPercentage
        }))
      });
    }

    // Certification recommendations
    const techSkills = skills.filter(skill => 
      ['javascript', 'python', 'java', 'react', 'node.js', 'aws'].includes(skill.toLowerCase())
    );

    if (techSkills.length > 0) {
      recommendations.push({
        type: 'certification',
        priority: 'low',
        title: 'Get Certified',
        description: 'Validate your skills with industry certifications',
        action: 'Consider getting certified in your strongest skills',
        suggestions: techSkills.slice(0, 3).map(skill => `${skill} Certification`)
      });
    }

    return recommendations.slice(0, 4); // Return top 4 recommendations
  }

  // Calculate overall profile score
  calculateOverallScore(skills, skillGaps, projects) {
    let score = 0;

    // Skills score (40%)
    const skillsScore = Math.min((skills.length / 10) * 40, 40);
    score += skillsScore;

    // Projects score (30%)
    const projectsScore = Math.min((projects.length / 5) * 30, 30);
    score += projectsScore;

    // Skill relevance score (30%)
    const totalGaps = skillGaps.length;
    const highPriorityGaps = skillGaps.filter(gap => gap.priority === 'high').length;
    const relevanceScore = totalGaps > 0 
      ? ((totalGaps - highPriorityGaps) / totalGaps) * 30 
      : 30;
    score += relevanceScore;

    return Math.round(score);
  }
}

export default new AIResumeService();
