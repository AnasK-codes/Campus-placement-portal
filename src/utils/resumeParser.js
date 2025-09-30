import { 
  doc, 
  updateDoc, 
  setDoc, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../firebase';

// Comprehensive skills database for extraction
const SKILLS_DATABASE = {
  // Programming Languages
  programming: [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'Go', 'Rust',
    'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB',
    'C', 'Objective-C', 'Perl', 'Shell', 'Bash', 'PowerShell'
  ],
  
  // Web Technologies
  web: [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Next.js', 'Nuxt.js',
    'HTML', 'CSS', 'SCSS', 'SASS', 'Bootstrap', 'Tailwind CSS', 'Material-UI',
    'jQuery', 'D3.js', 'Three.js', 'WebGL', 'GraphQL', 'REST API',
    'Webpack', 'Vite', 'Parcel', 'Gulp', 'Grunt'
  ],
  
  // Databases
  databases: [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle',
    'SQL Server', 'Cassandra', 'DynamoDB', 'Firebase', 'Firestore',
    'Elasticsearch', 'Neo4j', 'InfluxDB'
  ],
  
  // Cloud & DevOps
  cloud: [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'CI/CD', 'Terraform',
    'Ansible', 'Chef', 'Puppet', 'Nginx', 'Apache', 'Linux', 'Ubuntu'
  ],
  
  // Mobile Development
  mobile: [
    'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic',
    'Cordova', 'PhoneGap', 'Swift UI', 'Jetpack Compose'
  ],
  
  // Data Science & AI
  datascience: [
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras',
    'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Plotly',
    'Jupyter', 'Apache Spark', 'Hadoop', 'Tableau', 'Power BI',
    'Natural Language Processing', 'Computer Vision', 'OpenCV'
  ],
  
  // Soft Skills
  soft: [
    'Leadership', 'Communication', 'Teamwork', 'Problem Solving',
    'Critical Thinking', 'Time Management', 'Project Management',
    'Agile', 'Scrum', 'Public Speaking', 'Presentation Skills',
    'Analytical Skills', 'Creative Thinking', 'Adaptability'
  ],
  
  // Tools & Frameworks
  tools: [
    'VS Code', 'IntelliJ', 'Eclipse', 'Xcode', 'Android Studio',
    'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
    'Jira', 'Confluence', 'Slack', 'Trello', 'Notion', 'Postman'
  ]
};

// Create a flat array of all skills for easier searching
const ALL_SKILLS = Object.values(SKILLS_DATABASE).flat();

// Skill synonyms and variations for better matching
const SKILL_SYNONYMS = {
  'JavaScript': ['JS', 'Javascript', 'ECMAScript'],
  'TypeScript': ['TS', 'Typescript'],
  'React': ['ReactJS', 'React.js'],
  'Vue.js': ['Vue', 'VueJS'],
  'Node.js': ['Node', 'NodeJS'],
  'Express.js': ['Express', 'ExpressJS'],
  'MongoDB': ['Mongo'],
  'PostgreSQL': ['Postgres', 'PostgreSQL'],
  'Machine Learning': ['ML', 'MachineLearning'],
  'Deep Learning': ['DL', 'DeepLearning'],
  'Natural Language Processing': ['NLP'],
  'Computer Vision': ['CV'],
  'Artificial Intelligence': ['AI'],
  'User Interface': ['UI'],
  'User Experience': ['UX'],
  'Application Programming Interface': ['API'],
  'Structured Query Language': ['SQL'],
  'Cascading Style Sheets': ['CSS'],
  'HyperText Markup Language': ['HTML']
};

class ResumeParser {
  constructor() {
    this.skillsCache = new Map();
    this.extractionConfidence = new Map();
  }

  // Extract text from uploaded PDF (simplified - would use PDF.js in real implementation)
  async extractTextFromPDF(file) {
    try {
      // In a real implementation, you would use PDF.js or similar library
      // For now, we'll simulate PDF text extraction
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Simulate PDF text extraction
          const simulatedText = `
            John Doe
            Software Developer
            john.doe@email.com | +1-234-567-8900
            
            EXPERIENCE
            Software Engineer at TechCorp (2022-2023)
            - Developed web applications using React, Node.js, and MongoDB
            - Implemented REST APIs with Express.js and integrated with PostgreSQL
            - Used Docker for containerization and AWS for deployment
            - Collaborated with team using Git, Jira, and Agile methodologies
            
            EDUCATION
            Bachelor of Technology in Computer Science
            XYZ University (2018-2022)
            
            PROJECTS
            E-commerce Platform
            - Built using React, Redux, Node.js, Express.js, and MongoDB
            - Implemented payment integration with Stripe API
            - Used JWT for authentication and bcrypt for password hashing
            
            SKILLS
            Programming: JavaScript, Python, Java, C++
            Web: React, Angular, Node.js, Express.js, HTML, CSS
            Databases: MongoDB, PostgreSQL, MySQL
            Tools: Git, Docker, AWS, Jira, VS Code
          `;
          resolve(simulatedText);
        };
        reader.readAsText(file);
      });
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  // Advanced skill extraction using NLP techniques
  extractSkills(text) {
    if (!text) return { skills: [], confidence: 0 };

    const extractedSkills = new Set();
    const skillConfidence = new Map();
    const normalizedText = text.toLowerCase();

    // Extract skills using multiple techniques
    this.extractByDirectMatch(normalizedText, extractedSkills, skillConfidence);
    this.extractBySynonyms(normalizedText, extractedSkills, skillConfidence);
    this.extractByContext(normalizedText, extractedSkills, skillConfidence);
    this.extractByPatterns(normalizedText, extractedSkills, skillConfidence);

    // Convert to array and sort by confidence
    const skillsArray = Array.from(extractedSkills).map(skill => ({
      name: skill,
      confidence: skillConfidence.get(skill) || 0.5,
      category: this.getSkillCategory(skill),
      suggested: true
    })).sort((a, b) => b.confidence - a.confidence);

    return {
      skills: skillsArray,
      confidence: this.calculateOverallConfidence(skillsArray),
      totalFound: skillsArray.length
    };
  }

  // Direct skill name matching
  extractByDirectMatch(text, extractedSkills, skillConfidence) {
    ALL_SKILLS.forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (text.includes(skillLower)) {
        extractedSkills.add(skill);
        skillConfidence.set(skill, 0.9); // High confidence for direct matches
      }
    });
  }

  // Synonym-based extraction
  extractBySynonyms(text, extractedSkills, skillConfidence) {
    Object.entries(SKILL_SYNONYMS).forEach(([skill, synonyms]) => {
      synonyms.forEach(synonym => {
        if (text.includes(synonym.toLowerCase())) {
          extractedSkills.add(skill);
          skillConfidence.set(skill, Math.max(skillConfidence.get(skill) || 0, 0.8));
        }
      });
    });
  }

  // Context-based extraction (skills mentioned near certain keywords)
  extractByContext(text, extractedSkills, skillConfidence) {
    const contextKeywords = [
      'experience with', 'proficient in', 'skilled in', 'expertise in',
      'knowledge of', 'familiar with', 'worked with', 'used', 'implemented',
      'developed using', 'built with', 'technologies:', 'skills:', 'tools:'
    ];

    contextKeywords.forEach(keyword => {
      const regex = new RegExp(`${keyword}\\s+([^.!?\\n]{1,100})`, 'gi');
      const matches = text.match(regex);
      
      if (matches) {
        matches.forEach(match => {
          ALL_SKILLS.forEach(skill => {
            if (match.toLowerCase().includes(skill.toLowerCase())) {
              extractedSkills.add(skill);
              skillConfidence.set(skill, Math.max(skillConfidence.get(skill) || 0, 0.7));
            }
          });
        });
      }
    });
  }

  // Pattern-based extraction (common resume patterns)
  extractByPatterns(text, extractedSkills, skillConfidence) {
    // Extract from bullet points
    const bulletRegex = /[-•*]\s*([^.\n]+)/g;
    const bulletMatches = text.match(bulletRegex);
    
    if (bulletMatches) {
      bulletMatches.forEach(bullet => {
        ALL_SKILLS.forEach(skill => {
          if (bullet.toLowerCase().includes(skill.toLowerCase())) {
            extractedSkills.add(skill);
            skillConfidence.set(skill, Math.max(skillConfidence.get(skill) || 0, 0.6));
          }
        });
      });
    }

    // Extract from skills section
    const skillsSectionRegex = /skills?:?\s*([^.!?\n]{1,200})/gi;
    const skillsMatches = text.match(skillsSectionRegex);
    
    if (skillsMatches) {
      skillsMatches.forEach(section => {
        ALL_SKILLS.forEach(skill => {
          if (section.toLowerCase().includes(skill.toLowerCase())) {
            extractedSkills.add(skill);
            skillConfidence.set(skill, Math.max(skillConfidence.get(skill) || 0, 0.8));
          }
        });
      });
    }
  }

  // Get skill category
  getSkillCategory(skill) {
    for (const [category, skills] of Object.entries(SKILLS_DATABASE)) {
      if (skills.includes(skill)) {
        return category;
      }
    }
    return 'other';
  }

  // Calculate overall extraction confidence
  calculateOverallConfidence(skills) {
    if (skills.length === 0) return 0;
    
    const totalConfidence = skills.reduce((sum, skill) => sum + skill.confidence, 0);
    return Math.round((totalConfidence / skills.length) * 100) / 100;
  }

  // Extract contact information
  extractContactInfo(text) {
    const contactInfo = {};

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      contactInfo.email = emailMatch[0];
    }

    // Extract phone number
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      contactInfo.phone = phoneMatch[0];
    }

    // Extract LinkedIn
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/gi;
    const linkedinMatch = text.match(linkedinRegex);
    if (linkedinMatch) {
      contactInfo.linkedin = linkedinMatch[0];
    }

    // Extract GitHub
    const githubRegex = /github\.com\/[\w-]+/gi;
    const githubMatch = text.match(githubRegex);
    if (githubMatch) {
      contactInfo.github = githubMatch[0];
    }

    return contactInfo;
  }

  // Extract education information
  extractEducation(text) {
    const education = [];
    
    // Common degree patterns
    const degreePatterns = [
      /bachelor(?:'s)?(?:\s+of)?(?:\s+science)?(?:\s+in)?\s+([^.\n]+)/gi,
      /master(?:'s)?(?:\s+of)?(?:\s+science)?(?:\s+in)?\s+([^.\n]+)/gi,
      /b\.?tech\.?\s+(?:in)?\s*([^.\n]+)/gi,
      /m\.?tech\.?\s+(?:in)?\s*([^.\n]+)/gi,
      /b\.?s\.?\s+(?:in)?\s*([^.\n]+)/gi,
      /m\.?s\.?\s+(?:in)?\s*([^.\n]+)/gi
    ];

    degreePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          education.push({
            degree: match.trim(),
            type: 'degree'
          });
        });
      }
    });

    return education;
  }

  // Extract work experience
  extractExperience(text) {
    const experience = [];
    
    // Look for job titles and companies
    const experiencePatterns = [
      /(?:software\s+engineer|developer|programmer|analyst|intern)(?:\s+at)?\s+([^.\n]+)/gi,
      /(?:worked\s+at|employed\s+at|interned\s+at)\s+([^.\n]+)/gi
    ];

    experiencePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          experience.push({
            title: match.trim(),
            type: 'work'
          });
        });
      }
    });

    return experience;
  }

  // Parse complete resume
  async parseResume(text) {
    try {
      const skillsData = this.extractSkills(text);
      const contactInfo = this.extractContactInfo(text);
      const education = this.extractEducation(text);
      const experience = this.extractExperience(text);

      return {
        skills: skillsData.skills,
        skillsConfidence: skillsData.confidence,
        contactInfo,
        education,
        experience,
        rawText: text,
        parsedAt: new Date(),
        totalSkillsFound: skillsData.totalFound
      };
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw new Error('Failed to parse resume');
    }
  }

  // Generate skill suggestions based on existing skills
  generateSkillSuggestions(extractedSkills, userProfile = {}) {
    const suggestions = [];
    const userSkillNames = (userProfile.skills || []).map(s => s.name?.toLowerCase());
    
    // Suggest complementary skills
    const complementarySkills = {
      'React': ['Redux', 'Next.js', 'TypeScript', 'Material-UI'],
      'Node.js': ['Express.js', 'MongoDB', 'Socket.io', 'JWT'],
      'Python': ['Django', 'Flask', 'Pandas', 'NumPy'],
      'Java': ['Spring', 'Hibernate', 'Maven', 'JUnit'],
      'JavaScript': ['TypeScript', 'React', 'Node.js', 'Vue.js']
    };

    extractedSkills.forEach(skill => {
      const complementary = complementarySkills[skill.name] || [];
      complementary.forEach(compSkill => {
        if (!userSkillNames.includes(compSkill.toLowerCase()) && 
            !extractedSkills.find(s => s.name === compSkill)) {
          suggestions.push({
            name: compSkill,
            reason: `Complements ${skill.name}`,
            confidence: 0.7,
            category: this.getSkillCategory(compSkill),
            type: 'complementary'
          });
        }
      });
    });

    return suggestions.slice(0, 5); // Limit to top 5 suggestions
  }

  // Save parsed resume data to Firebase
  async saveResumeData(userId, resumeData, resumeFile = null) {
    try {
      let resumeURL = null;

      // Upload resume file to Firebase Storage if provided
      if (resumeFile) {
        const resumeRef = ref(storage, `resumes/${userId}/${Date.now()}_${resumeFile.name}`);
        const snapshot = await uploadBytes(resumeRef, resumeFile);
        resumeURL = await getDownloadURL(snapshot.ref);
      }

      // Save to Firestore
      const userDocRef = doc(db, 'users', userId);
      const resumeDocRef = doc(db, 'users', userId, 'resume', 'data');

      await setDoc(resumeDocRef, {
        ...resumeData,
        resumeURL,
        lastUpdated: serverTimestamp(),
        updatedAt: new Date()
      }, { merge: true });

      // Update user profile with resume URL
      await updateDoc(userDocRef, {
        resumeURL,
        lastResumeUpdate: serverTimestamp()
      });

      return {
        success: true,
        resumeURL,
        skillsExtracted: resumeData.skills.length
      };
    } catch (error) {
      console.error('Error saving resume data:', error);
      throw new Error('Failed to save resume data');
    }
  }

  // Get saved resume data
  async getResumeData(userId) {
    try {
      const resumeDocRef = doc(db, 'users', userId, 'resume', 'data');
      const resumeDoc = await getDoc(resumeDocRef);

      if (resumeDoc.exists()) {
        return resumeDoc.data();
      }

      return null;
    } catch (error) {
      console.error('Error getting resume data:', error);
      throw new Error('Failed to get resume data');
    }
  }

  // Calculate resume completion percentage
  calculateResumeCompletion(resumeData) {
    const fields = {
      personalInfo: !!(resumeData.name && resumeData.email),
      education: !!(resumeData.education && resumeData.education.length > 0),
      experience: !!(resumeData.experience && resumeData.experience.length > 0),
      skills: !!(resumeData.skills && resumeData.skills.length >= 3),
      projects: !!(resumeData.projects && resumeData.projects.length > 0),
      summary: !!resumeData.summary
    };

    const completedFields = Object.values(fields).filter(Boolean).length;
    const totalFields = Object.keys(fields).length;

    return Math.round((completedFields / totalFields) * 100);
  }

  // Clear cache
  clearCache() {
    this.skillsCache.clear();
    this.extractionConfidence.clear();
  }
}

// Create singleton instance
const resumeParser = new ResumeParser();

export default resumeParser;
export { SKILLS_DATABASE, ALL_SKILLS };
