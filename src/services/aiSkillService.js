// AI Skill Extraction and Auto-tagging Service
// Mock implementation with intelligent keyword extraction and skill matching

class AISkillService {
  constructor() {
    // Comprehensive skills database with synonyms and related terms
    this.skillsDatabase = {
      // Programming Languages
      'JavaScript': ['js', 'javascript', 'node.js', 'nodejs', 'react', 'vue', 'angular', 'express', 'jquery'],
      'Python': ['python', 'django', 'flask', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn'],
      'Java': ['java', 'spring', 'spring boot', 'hibernate', 'maven', 'gradle', 'jsp', 'servlet'],
      'C++': ['cpp', 'c plus plus', 'c++', 'stl', 'boost', 'qt'],
      'C#': ['csharp', 'c sharp', 'dotnet', '.net', 'asp.net', 'xamarin'],
      'PHP': ['php', 'laravel', 'symfony', 'codeigniter', 'wordpress', 'drupal'],
      'Go': ['golang', 'go lang', 'gin', 'gorilla', 'beego'],
      'Rust': ['rust', 'cargo', 'tokio', 'actix'],
      'TypeScript': ['typescript', 'ts', 'angular', 'nest.js', 'deno'],
      'Swift': ['swift', 'ios', 'xcode', 'cocoa'],
      'Kotlin': ['kotlin', 'android', 'jetpack'],
      'Ruby': ['ruby', 'rails', 'ruby on rails', 'sinatra'],
      'Scala': ['scala', 'akka', 'play framework'],
      'R': ['r programming', 'rstudio', 'shiny', 'ggplot'],

      // Web Technologies
      'HTML': ['html', 'html5', 'markup', 'semantic html', 'web standards'],
      'CSS': ['css', 'css3', 'sass', 'scss', 'less', 'stylus', 'bootstrap', 'tailwind'],
      'React': ['react', 'reactjs', 'jsx', 'hooks', 'redux', 'context api', 'next.js'],
      'Angular': ['angular', 'angularjs', 'typescript', 'rxjs', 'ionic'],
      'Vue.js': ['vue', 'vuejs', 'nuxt', 'vuex', 'quasar'],
      'Node.js': ['nodejs', 'node', 'express', 'koa', 'fastify', 'nest.js'],
      'Express.js': ['express', 'expressjs', 'middleware', 'routing'],
      'Next.js': ['nextjs', 'next', 'server-side rendering', 'ssr', 'static generation'],
      'Svelte': ['svelte', 'sveltekit', 'rollup'],

      // Databases
      'MySQL': ['mysql', 'sql', 'mariadb', 'relational database'],
      'PostgreSQL': ['postgresql', 'postgres', 'psql', 'postgis'],
      'MongoDB': ['mongodb', 'mongo', 'mongoose', 'nosql', 'document database'],
      'Redis': ['redis', 'cache', 'in-memory', 'session store'],
      'SQLite': ['sqlite', 'sql lite', 'embedded database'],
      'Oracle': ['oracle', 'oracle db', 'pl/sql'],
      'SQL Server': ['sql server', 'mssql', 'microsoft sql'],
      'Cassandra': ['cassandra', 'distributed database'],
      'DynamoDB': ['dynamodb', 'aws database'],
      'Firebase': ['firebase', 'firestore', 'realtime database'],

      // Cloud & DevOps
      'AWS': ['amazon web services', 'aws', 'ec2', 's3', 'lambda', 'rds', 'cloudformation'],
      'Azure': ['microsoft azure', 'azure', 'azure functions', 'azure devops'],
      'Google Cloud': ['gcp', 'google cloud platform', 'compute engine', 'app engine'],
      'Docker': ['docker', 'containerization', 'containers', 'dockerfile'],
      'Kubernetes': ['kubernetes', 'k8s', 'orchestration', 'pods', 'helm'],
      'Jenkins': ['jenkins', 'ci/cd', 'continuous integration', 'build automation'],
      'GitLab CI': ['gitlab', 'gitlab ci', 'pipelines'],
      'GitHub Actions': ['github actions', 'workflows', 'automation'],
      'Terraform': ['terraform', 'infrastructure as code', 'iac'],
      'Ansible': ['ansible', 'configuration management', 'playbooks'],

      // Mobile Development
      'Android': ['android', 'kotlin', 'java', 'android studio', 'gradle'],
      'iOS': ['ios', 'swift', 'objective-c', 'xcode', 'cocoa touch'],
      'React Native': ['react native', 'mobile development', 'cross-platform'],
      'Flutter': ['flutter', 'dart', 'cross-platform mobile'],
      'Xamarin': ['xamarin', 'cross-platform', 'c#'],

      // Data Science & AI
      'Machine Learning': ['machine learning', 'ml', 'artificial intelligence', 'ai', 'deep learning'],
      'Data Science': ['data science', 'data analysis', 'statistics', 'analytics'],
      'TensorFlow': ['tensorflow', 'tf', 'keras', 'neural networks'],
      'PyTorch': ['pytorch', 'torch', 'deep learning framework'],
      'Pandas': ['pandas', 'data manipulation', 'dataframes'],
      'NumPy': ['numpy', 'numerical computing', 'arrays'],
      'Scikit-learn': ['scikit-learn', 'sklearn', 'machine learning library'],
      'Jupyter': ['jupyter', 'notebooks', 'ipython'],
      'Tableau': ['tableau', 'data visualization', 'business intelligence'],
      'Power BI': ['power bi', 'microsoft bi', 'data visualization'],

      // Tools & Frameworks
      'Git': ['git', 'github', 'gitlab', 'bitbucket', 'version control', 'source control'],
      'Webpack': ['webpack', 'bundler', 'module bundler'],
      'Babel': ['babel', 'transpiler', 'es6'],
      'ESLint': ['eslint', 'linting', 'code quality'],
      'Jest': ['jest', 'testing', 'unit testing'],
      'Cypress': ['cypress', 'e2e testing', 'integration testing'],
      'Selenium': ['selenium', 'web automation', 'testing'],
      'Postman': ['postman', 'api testing', 'rest client'],
      'Figma': ['figma', 'design', 'ui/ux', 'prototyping'],
      'Adobe XD': ['adobe xd', 'xd', 'design', 'prototyping'],

      // Soft Skills
      'Communication': ['communication', 'verbal communication', 'written communication', 'presentation'],
      'Leadership': ['leadership', 'team leadership', 'project management', 'mentoring'],
      'Problem Solving': ['problem solving', 'analytical thinking', 'critical thinking', 'debugging'],
      'Teamwork': ['teamwork', 'collaboration', 'team player', 'cross-functional'],
      'Project Management': ['project management', 'agile', 'scrum', 'kanban', 'waterfall'],
      'Time Management': ['time management', 'prioritization', 'deadline management'],
      'Adaptability': ['adaptability', 'flexibility', 'learning agility'],
      'Creativity': ['creativity', 'innovation', 'creative thinking', 'design thinking']
    };

    // Job role patterns and their typical skill requirements
    this.rolePatterns = {
      'Frontend Developer': ['JavaScript', 'HTML', 'CSS', 'React', 'Vue.js', 'Angular'],
      'Backend Developer': ['Node.js', 'Python', 'Java', 'Express.js', 'MySQL', 'MongoDB'],
      'Full Stack Developer': ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express.js', 'HTML', 'CSS'],
      'Data Scientist': ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'TensorFlow', 'Data Science'],
      'DevOps Engineer': ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform', 'Git'],
      'Mobile Developer': ['React Native', 'Flutter', 'Android', 'iOS', 'Kotlin', 'Swift'],
      'UI/UX Designer': ['Figma', 'Adobe XD', 'HTML', 'CSS', 'JavaScript', 'Design Thinking'],
      'Software Engineer': ['Java', 'Python', 'JavaScript', 'Git', 'Problem Solving', 'Teamwork'],
      'Machine Learning Engineer': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Science'],
      'Cloud Engineer': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform']
    };

    // Industry-specific skill weights
    this.industryWeights = {
      'Technology': { 'JavaScript': 0.9, 'Python': 0.8, 'React': 0.85, 'AWS': 0.7 },
      'Finance': { 'Java': 0.9, 'SQL': 0.8, 'Python': 0.7, 'Excel': 0.6 },
      'Healthcare': { 'Python': 0.8, 'R': 0.7, 'Data Science': 0.9, 'SQL': 0.6 },
      'E-commerce': { 'JavaScript': 0.9, 'React': 0.8, 'Node.js': 0.7, 'MongoDB': 0.6 }
    };
  }

  // Extract skills from job description text
  extractSkillsFromText(text, roleTitle = '', company = '') {
    if (!text || typeof text !== 'string') {
      return { skills: [], confidence: 0, suggestions: [] };
    }

    const normalizedText = text.toLowerCase();
    const extractedSkills = new Set();
    const skillConfidence = {};
    const contextualBoosts = {};

    // Extract skills based on exact matches and synonyms
    Object.entries(this.skillsDatabase).forEach(([skill, synonyms]) => {
      let maxConfidence = 0;
      let matchCount = 0;

      // Check for skill name and synonyms
      [skill.toLowerCase(), ...synonyms].forEach(term => {
        const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = normalizedText.match(regex);
        
        if (matches) {
          matchCount += matches.length;
          // Higher confidence for exact skill name matches
          const confidence = term === skill.toLowerCase() ? 0.9 : 0.7;
          maxConfidence = Math.max(maxConfidence, confidence);
        }
      });

      if (maxConfidence > 0) {
        extractedSkills.add(skill);
        skillConfidence[skill] = Math.min(maxConfidence + (matchCount - 1) * 0.1, 1.0);
      }
    });

    // Add role-based skill suggestions
    const roleSuggestions = this.getRoleBasedSkills(roleTitle);
    roleSuggestions.forEach(skill => {
      if (!extractedSkills.has(skill)) {
        contextualBoosts[skill] = 0.6; // Lower confidence for suggestions
      }
    });

    // Calculate overall confidence
    const totalSkills = extractedSkills.size;
    const avgConfidence = totalSkills > 0 
      ? Array.from(extractedSkills).reduce((sum, skill) => sum + skillConfidence[skill], 0) / totalSkills
      : 0;

    // Generate additional suggestions based on extracted skills
    const suggestions = this.generateSkillSuggestions(Array.from(extractedSkills), roleTitle);

    return {
      skills: Array.from(extractedSkills).map(skill => ({
        name: skill,
        confidence: skillConfidence[skill],
        source: 'extracted'
      })),
      suggestions: suggestions.map(skill => ({
        name: skill,
        confidence: contextualBoosts[skill] || 0.5,
        source: 'suggested',
        reason: this.getSkillSuggestionReason(skill, Array.from(extractedSkills), roleTitle)
      })),
      confidence: avgConfidence,
      totalExtracted: totalSkills
    };
  }

  // Get skills typically required for a specific role
  getRoleBasedSkills(roleTitle) {
    if (!roleTitle) return [];

    const normalizedRole = roleTitle.toLowerCase();
    
    // Find matching role pattern
    for (const [pattern, skills] of Object.entries(this.rolePatterns)) {
      if (normalizedRole.includes(pattern.toLowerCase()) || 
          pattern.toLowerCase().includes(normalizedRole)) {
        return skills;
      }
    }

    // Fallback: extract role type and suggest generic skills
    if (normalizedRole.includes('developer') || normalizedRole.includes('engineer')) {
      return ['JavaScript', 'Git', 'Problem Solving', 'Teamwork'];
    }
    if (normalizedRole.includes('designer')) {
      return ['Figma', 'HTML', 'CSS', 'Creativity'];
    }
    if (normalizedRole.includes('analyst') || normalizedRole.includes('data')) {
      return ['Python', 'SQL', 'Data Science', 'Excel'];
    }

    return [];
  }

  // Generate skill suggestions based on already extracted skills
  generateSkillSuggestions(extractedSkills, roleTitle = '') {
    const suggestions = new Set();

    // Add complementary skills based on extracted skills
    extractedSkills.forEach(skill => {
      const complementary = this.getComplementarySkills(skill);
      complementary.forEach(comp => {
        if (!extractedSkills.includes(comp)) {
          suggestions.add(comp);
        }
      });
    });

    // Add role-based suggestions
    const roleSkills = this.getRoleBasedSkills(roleTitle);
    roleSkills.forEach(skill => {
      if (!extractedSkills.includes(skill)) {
        suggestions.add(skill);
      }
    });

    return Array.from(suggestions).slice(0, 8); // Limit to 8 suggestions
  }

  // Get complementary skills for a given skill
  getComplementarySkills(skill) {
    const complementaryMap = {
      'JavaScript': ['HTML', 'CSS', 'React', 'Node.js', 'Git'],
      'React': ['JavaScript', 'HTML', 'CSS', 'Redux', 'Next.js'],
      'Python': ['Django', 'Flask', 'Pandas', 'NumPy', 'Git'],
      'Java': ['Spring', 'MySQL', 'Maven', 'Git', 'JUnit'],
      'Node.js': ['JavaScript', 'Express.js', 'MongoDB', 'npm', 'Git'],
      'AWS': ['Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Linux'],
      'Docker': ['Kubernetes', 'AWS', 'Jenkins', 'Linux', 'Git'],
      'Machine Learning': ['Python', 'TensorFlow', 'Pandas', 'NumPy', 'Jupyter'],
      'React Native': ['JavaScript', 'React', 'Mobile Development', 'Git'],
      'Angular': ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'RxJS']
    };

    return complementaryMap[skill] || [];
  }

  // Get reason for skill suggestion
  getSkillSuggestionReason(skill, extractedSkills, roleTitle) {
    // Check if it's a complementary skill
    for (const extractedSkill of extractedSkills) {
      const complementary = this.getComplementarySkills(extractedSkill);
      if (complementary.includes(skill)) {
        return `Commonly used with ${extractedSkill}`;
      }
    }

    // Check if it's role-based
    const roleSkills = this.getRoleBasedSkills(roleTitle);
    if (roleSkills.includes(skill)) {
      return `Typically required for ${roleTitle} roles`;
    }

    return 'Recommended based on job requirements';
  }

  // Analyze skill gaps compared to similar roles
  analyzeSkillGaps(extractedSkills, roleTitle, targetIndustry = 'Technology') {
    const roleSkills = this.getRoleBasedSkills(roleTitle);
    const industryWeights = this.industryWeights[targetIndustry] || {};

    const gaps = roleSkills.filter(skill => !extractedSkills.includes(skill));
    const strengths = extractedSkills.filter(skill => roleSkills.includes(skill));

    // Calculate match percentage
    const matchPercentage = roleSkills.length > 0 
      ? Math.round((strengths.length / roleSkills.length) * 100)
      : 0;

    return {
      gaps: gaps.map(skill => ({
        name: skill,
        importance: industryWeights[skill] || 0.5,
        reason: `Required for most ${roleTitle} positions`
      })),
      strengths: strengths.map(skill => ({
        name: skill,
        weight: industryWeights[skill] || 0.5
      })),
      matchPercentage,
      recommendations: this.generateImprovementRecommendations(gaps, strengths)
    };
  }

  // Generate improvement recommendations
  generateImprovementRecommendations(gaps, strengths) {
    const recommendations = [];

    if (gaps.length > 0) {
      const priorityGaps = gaps.slice(0, 3);
      recommendations.push({
        type: 'skill_gap',
        priority: 'high',
        message: `Consider learning ${priorityGaps.join(', ')} to improve your profile match`,
        skills: priorityGaps
      });
    }

    if (strengths.length > 0) {
      recommendations.push({
        type: 'strength',
        priority: 'medium',
        message: `Great! You have strong skills in ${strengths.slice(0, 2).join(', ')}`,
        skills: strengths.slice(0, 2)
      });
    }

    return recommendations;
  }

  // Mock API call for advanced AI analysis (placeholder for real AI service)
  async analyzeWithAI(text, options = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = this.extractSkillsFromText(text, options.roleTitle, options.company);
    
    // Add AI-specific enhancements
    return {
      ...result,
      aiEnhanced: true,
      processingTime: '1.2s',
      model: 'skill-extractor-v2',
      additionalInsights: {
        experienceLevel: this.estimateExperienceLevel(text),
        industryFit: this.calculateIndustryFit(result.skills, options.industry),
        improvementAreas: this.identifyImprovementAreas(result.skills, options.roleTitle)
      }
    };
  }

  // Estimate experience level based on text complexity and skills
  estimateExperienceLevel(text) {
    const indicators = {
      'senior': ['lead', 'architect', 'senior', 'principal', 'staff', 'expert', 'advanced'],
      'mid': ['experience', 'proficient', 'skilled', 'intermediate', 'solid'],
      'junior': ['entry', 'junior', 'beginner', 'learning', 'basic', 'fundamental']
    };

    const normalizedText = text.toLowerCase();
    let scores = { senior: 0, mid: 0, junior: 0 };

    Object.entries(indicators).forEach(([level, keywords]) => {
      keywords.forEach(keyword => {
        if (normalizedText.includes(keyword)) {
          scores[level]++;
        }
      });
    });

    const maxScore = Math.max(...Object.values(scores));
    const estimatedLevel = Object.keys(scores).find(key => scores[key] === maxScore);
    
    return {
      level: estimatedLevel || 'mid',
      confidence: maxScore > 0 ? Math.min(maxScore / 3, 1) : 0.5,
      indicators: scores
    };
  }

  // Calculate how well skills fit a specific industry
  calculateIndustryFit(skills, industry = 'Technology') {
    const industryWeights = this.industryWeights[industry] || {};
    let totalWeight = 0;
    let matchedWeight = 0;

    skills.forEach(skillObj => {
      const skill = typeof skillObj === 'string' ? skillObj : skillObj.name;
      const weight = industryWeights[skill] || 0.3;
      totalWeight += 1;
      matchedWeight += weight;
    });

    return {
      industry,
      fitScore: totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0,
      topSkills: skills
        .filter(skillObj => {
          const skill = typeof skillObj === 'string' ? skillObj : skillObj.name;
          return industryWeights[skill] > 0.6;
        })
        .slice(0, 5)
    };
  }

  // Identify areas for improvement
  identifyImprovementAreas(skills, roleTitle) {
    const skillNames = skills.map(s => typeof s === 'string' ? s : s.name);
    const analysis = this.analyzeSkillGaps(skillNames, roleTitle);
    
    return {
      criticalGaps: analysis.gaps.filter(gap => gap.importance > 0.7),
      recommendations: analysis.recommendations,
      nextSteps: this.generateNextSteps(analysis.gaps.slice(0, 3))
    };
  }

  // Generate actionable next steps
  generateNextSteps(priorityGaps) {
    return priorityGaps.map(gap => ({
      skill: gap.name,
      action: `Learn ${gap.name}`,
      resources: this.getSkillResources(gap.name),
      timeEstimate: this.getSkillLearningTime(gap.name)
    }));
  }

  // Get learning resources for a skill (mock data)
  getSkillResources(skill) {
    const resourceMap = {
      'JavaScript': ['MDN Web Docs', 'freeCodeCamp', 'JavaScript.info'],
      'React': ['React Official Docs', 'React Tutorial', 'Scrimba React Course'],
      'Python': ['Python.org Tutorial', 'Codecademy Python', 'Automate the Boring Stuff'],
      'AWS': ['AWS Training', 'A Cloud Guru', 'AWS Documentation'],
      'Docker': ['Docker Official Tutorial', 'Docker for Beginners', 'Play with Docker']
    };

    return resourceMap[skill] || ['Online tutorials', 'Documentation', 'Practice projects'];
  }

  // Estimate learning time for a skill
  getSkillLearningTime(skill) {
    const timeMap = {
      'JavaScript': '2-3 months',
      'React': '1-2 months',
      'Python': '2-3 months',
      'AWS': '3-4 months',
      'Docker': '2-4 weeks',
      'Git': '1-2 weeks',
      'HTML': '2-4 weeks',
      'CSS': '1-2 months'
    };

    return timeMap[skill] || '1-3 months';
  }
}

export default new AISkillService();
