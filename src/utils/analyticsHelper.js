// Analytics Helper for Admin Dashboard
// Computes statistics, trends, and AI-powered predictive insights

class AnalyticsHelper {
  constructor() {
    this.skillsDatabase = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB',
      'Machine Learning', 'Data Science', 'AWS', 'Docker', 'Kubernetes',
      'TypeScript', 'Angular', 'Vue.js', 'Express.js', 'Django', 'Flask',
      'Spring Boot', 'PostgreSQL', 'Redis', 'GraphQL', 'REST API',
      'Git', 'Linux', 'DevOps', 'CI/CD', 'Microservices', 'Cloud Computing'
    ];

    this.departmentMapping = {
      'CSE': 'Computer Science',
      'IT': 'Information Technology',
      'ECE': 'Electronics',
      'EEE': 'Electrical',
      'MECH': 'Mechanical',
      'CIVIL': 'Civil',
      'CHEM': 'Chemical'
    };
  }

  // Calculate comprehensive dashboard statistics
  calculateDashboardStats(users, internships, applications) {
    const students = users.filter(user => user.role === 'student');
    const activeInternships = internships.filter(internship => internship.status === 'active');
    const totalApplications = applications.length;
    
    // Calculate offers made
    const offersCount = applications.filter(app => 
      app.status === 'offered' || app.status === 'accepted'
    ).length;

    // Calculate students with offers
    const studentsWithOffers = new Set(
      applications
        .filter(app => app.status === 'offered' || app.status === 'accepted')
        .map(app => app.studentId)
    ).size;

    // Calculate unplaced students
    const unplacedStudents = students.length - studentsWithOffers;

    // Calculate profile completion stats
    const profileCompletionStats = this.calculateProfileCompletionStats(students);

    // Calculate application trends
    const applicationTrends = this.calculateApplicationTrends(applications);

    // Calculate conversion rates
    const conversionRate = totalApplications > 0 ? (offersCount / totalApplications) * 100 : 0;

    return {
      totalStudents: students.length,
      totalInternships: activeInternships.length,
      totalApplications,
      offersCount,
      unplacedStudents,
      placementRate: students.length > 0 ? ((studentsWithOffers / students.length) * 100).toFixed(1) : 0,
      conversionRate: conversionRate.toFixed(1),
      profileCompletionStats,
      applicationTrends,
      studentsWithOffers
    };
  }

  // Calculate profile completion statistics
  calculateProfileCompletionStats(students) {
    const completionData = students.map(student => {
      let completionScore = 0;
      const totalFields = 10;

      // Check required fields
      if (student.name) completionScore++;
      if (student.email) completionScore++;
      if (student.department) completionScore++;
      if (student.year) completionScore++;
      if (student.phone) completionScore++;
      if (student.skills && student.skills.length > 0) completionScore++;
      if (student.resume) completionScore++;
      if (student.projects && student.projects.length > 0) completionScore++;
      if (student.experience) completionScore++;
      if (student.bio) completionScore++;

      return {
        studentId: student.id,
        name: student.name,
        completion: Math.round((completionScore / totalFields) * 100)
      };
    });

    const averageCompletion = completionData.reduce((sum, student) => sum + student.completion, 0) / completionData.length;
    const lowCompletionStudents = completionData.filter(student => student.completion < 70);

    return {
      average: Math.round(averageCompletion),
      lowCompletionCount: lowCompletionStudents.length,
      lowCompletionStudents,
      distribution: this.calculateCompletionDistribution(completionData)
    };
  }

  // Calculate completion distribution for charts
  calculateCompletionDistribution(completionData) {
    const ranges = [
      { label: '0-25%', min: 0, max: 25, count: 0 },
      { label: '26-50%', min: 26, max: 50, count: 0 },
      { label: '51-75%', min: 51, max: 75, count: 0 },
      { label: '76-100%', min: 76, max: 100, count: 0 }
    ];

    completionData.forEach(student => {
      const range = ranges.find(r => student.completion >= r.min && student.completion <= r.max);
      if (range) range.count++;
    });

    return ranges.map(range => ({
      label: range.label,
      value: range.count,
      color: this.getCompletionColor(range.min)
    }));
  }

  // Get color based on completion percentage
  getCompletionColor(percentage) {
    if (percentage >= 76) return '#4CAF50';
    if (percentage >= 51) return '#FF9800';
    if (percentage >= 26) return '#f44336';
    return '#9E9E9E';
  }

  // Calculate application trends over time
  calculateApplicationTrends(applications) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const recentApplications = applications.filter(app => {
      const appDate = app.createdAt?.toDate ? app.createdAt.toDate() : new Date(app.createdAt);
      return appDate >= thirtyDaysAgo;
    });

    // Group by day
    const dailyData = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + (i * 24 * 60 * 60 * 1000));
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = 0;
    }

    recentApplications.forEach(app => {
      const appDate = app.createdAt?.toDate ? app.createdAt.toDate() : new Date(app.createdAt);
      const dateKey = appDate.toISOString().split('T')[0];
      if (dailyData[dateKey] !== undefined) {
        dailyData[dateKey]++;
      }
    });

    return Object.entries(dailyData).map(([date, count]) => ({
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: count,
      date
    }));
  }

  // Calculate internship statistics
  calculateInternshipStats(internships, applications) {
    const internshipData = internships.map(internship => {
      const internshipApplications = applications.filter(app => app.internshipId === internship.id);
      const offers = internshipApplications.filter(app => app.status === 'offered' || app.status === 'accepted');
      
      return {
        ...internship,
        applicationsCount: internshipApplications.length,
        offersCount: offers.length,
        conversionRate: internshipApplications.length > 0 ? 
          ((offers.length / internshipApplications.length) * 100).toFixed(1) : 0,
        seatsFilled: offers.length,
        seatsRemaining: Math.max(0, (internship.seats || 0) - offers.length)
      };
    });

    // Sort by various metrics
    const topByApplications = [...internshipData]
      .sort((a, b) => b.applicationsCount - a.applicationsCount)
      .slice(0, 10);

    const lowSeatAvailability = internshipData.filter(internship => 
      internship.seatsRemaining <= 2 && internship.seatsRemaining > 0
    );

    const highConversionRate = internshipData.filter(internship => 
      parseFloat(internship.conversionRate) > 50 && internship.applicationsCount > 5
    );

    return {
      internshipData,
      topByApplications,
      lowSeatAvailability,
      highConversionRate,
      totalSeats: internships.reduce((sum, internship) => sum + (internship.seats || 0), 0),
      filledSeats: internshipData.reduce((sum, internship) => sum + internship.seatsFilled, 0)
    };
  }

  // Generate AI-powered predictive insights
  generatePredictiveInsights(users, internships, applications) {
    const students = users.filter(user => user.role === 'student');
    const insights = [];

    // Analyze skill gaps
    const skillGapInsight = this.analyzeSkillGaps(students, internships);
    if (skillGapInsight) insights.push(skillGapInsight);

    // Analyze placement risk
    const placementRiskInsight = this.analyzePlacementRisk(students, applications);
    if (placementRiskInsight) insights.push(placementRiskInsight);

    // Analyze application patterns
    const applicationPatternInsight = this.analyzeApplicationPatterns(applications);
    if (applicationPatternInsight) insights.push(applicationPatternInsight);

    // Analyze internship demand
    const demandInsight = this.analyzeInternshipDemand(internships, applications);
    if (demandInsight) insights.push(demandInsight);

    return insights;
  }

  // Analyze skill gaps between students and internship requirements
  analyzeSkillGaps(students, internships) {
    const requiredSkills = {};
    const studentSkills = {};

    // Collect required skills from internships
    internships.forEach(internship => {
      if (internship.skills) {
        internship.skills.forEach(skill => {
          requiredSkills[skill] = (requiredSkills[skill] || 0) + 1;
        });
      }
    });

    // Collect student skills
    students.forEach(student => {
      if (student.skills) {
        student.skills.forEach(skill => {
          studentSkills[skill] = (studentSkills[skill] || 0) + 1;
        });
      }
    });

    // Find top missing skills
    const missingSkills = Object.entries(requiredSkills)
      .filter(([skill]) => !studentSkills[skill] || studentSkills[skill] < requiredSkills[skill] * 0.3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);

    if (missingSkills.length > 0) {
      return {
        type: 'skill_gap',
        title: 'Critical Skill Gaps Detected',
        message: `${missingSkills.length} high-demand skills are underrepresented in student profiles`,
        details: `Missing skills: ${missingSkills.join(', ')}`,
        severity: 'high',
        actionable: true,
        recommendation: `Organize workshops for ${missingSkills.slice(0, 3).join(', ')} to improve placement chances`,
        icon: '🎯'
      };
    }

    return null;
  }

  // Analyze students at risk of remaining unplaced
  analyzePlacementRisk(students, applications) {
    const studentsWithApplications = new Set(applications.map(app => app.studentId));
    const studentsWithoutApplications = students.filter(student => 
      !studentsWithApplications.has(student.id)
    );

    const lowActivityStudents = students.filter(student => {
      const studentApplications = applications.filter(app => app.studentId === student.id);
      return studentApplications.length < 3 && studentApplications.length > 0;
    });

    const riskCount = studentsWithoutApplications.length + lowActivityStudents.length;
    const riskPercentage = ((riskCount / students.length) * 100).toFixed(1);

    if (riskCount > 0) {
      return {
        type: 'placement_risk',
        title: 'Students at Placement Risk',
        message: `${riskPercentage}% of students (${riskCount}) are at risk of remaining unplaced`,
        details: `${studentsWithoutApplications.length} haven't applied, ${lowActivityStudents.length} have low activity`,
        severity: riskPercentage > 30 ? 'high' : riskPercentage > 15 ? 'medium' : 'low',
        actionable: true,
        recommendation: 'Schedule counseling sessions and provide application guidance',
        icon: '⚠️'
      };
    }

    return null;
  }

  // Analyze application patterns and trends
  analyzeApplicationPatterns(applications) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const previousWeek = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));

    const recentApplications = applications.filter(app => {
      const appDate = app.createdAt?.toDate ? app.createdAt.toDate() : new Date(app.createdAt);
      return appDate >= lastWeek;
    }).length;

    const previousApplications = applications.filter(app => {
      const appDate = app.createdAt?.toDate ? app.createdAt.toDate() : new Date(app.createdAt);
      return appDate >= previousWeek && appDate < lastWeek;
    }).length;

    const trend = recentApplications - previousApplications;
    const trendPercentage = previousApplications > 0 ? 
      ((trend / previousApplications) * 100).toFixed(1) : 0;

    if (Math.abs(trend) > 5) {
      return {
        type: 'application_trend',
        title: 'Application Activity Trend',
        message: `Applications ${trend > 0 ? 'increased' : 'decreased'} by ${Math.abs(trendPercentage)}% this week`,
        details: `${recentApplications} applications this week vs ${previousApplications} last week`,
        severity: trend < -10 ? 'medium' : 'low',
        actionable: trend < 0,
        recommendation: trend < 0 ? 'Consider promotional campaigns to boost applications' : 'Maintain current momentum',
        icon: trend > 0 ? '📈' : '📉'
      };
    }

    return null;
  }

  // Analyze internship demand and supply
  analyzeInternshipDemand(internships, applications) {
    const internshipDemand = {};
    
    applications.forEach(app => {
      internshipDemand[app.internshipId] = (internshipDemand[app.internshipId] || 0) + 1;
    });

    const highDemandInternships = internships.filter(internship => {
      const demand = internshipDemand[internship.id] || 0;
      const seats = internship.seats || 1;
      return demand > seats * 3; // More than 3x applications per seat
    });

    const lowDemandInternships = internships.filter(internship => {
      const demand = internshipDemand[internship.id] || 0;
      const seats = internship.seats || 1;
      return demand < seats * 0.5; // Less than 0.5x applications per seat
    });

    if (highDemandInternships.length > 0 || lowDemandInternships.length > 0) {
      return {
        type: 'demand_analysis',
        title: 'Internship Demand Imbalance',
        message: `${highDemandInternships.length} high-demand, ${lowDemandInternships.length} low-demand internships`,
        details: `Consider promoting low-demand opportunities and adding similar high-demand roles`,
        severity: 'medium',
        actionable: true,
        recommendation: 'Balance internship portfolio based on demand patterns',
        icon: '⚖️'
      };
    }

    return null;
  }

  // Calculate department-wise statistics
  calculateDepartmentStats(students, applications) {
    const departmentData = {};

    students.forEach(student => {
      const dept = student.department || 'Unknown';
      if (!departmentData[dept]) {
        departmentData[dept] = {
          totalStudents: 0,
          applications: 0,
          offers: 0,
          avgProfileCompletion: 0
        };
      }
      departmentData[dept].totalStudents++;
    });

    applications.forEach(app => {
      const student = students.find(s => s.id === app.studentId);
      const dept = student?.department || 'Unknown';
      if (departmentData[dept]) {
        departmentData[dept].applications++;
        if (app.status === 'offered' || app.status === 'accepted') {
          departmentData[dept].offers++;
        }
      }
    });

    return Object.entries(departmentData).map(([dept, data]) => ({
      department: this.departmentMapping[dept] || dept,
      ...data,
      placementRate: data.totalStudents > 0 ? 
        ((data.offers / data.totalStudents) * 100).toFixed(1) : 0,
      applicationRate: data.totalStudents > 0 ? 
        ((data.applications / data.totalStudents) * 100).toFixed(1) : 0
    }));
  }

  // Export data to CSV format
  exportToCSV(data, filename) {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Generate comprehensive report data
  generateReportData(users, internships, applications) {
    const dashboardStats = this.calculateDashboardStats(users, internships, applications);
    const internshipStats = this.calculateInternshipStats(internships, applications);
    const departmentStats = this.calculateDepartmentStats(
      users.filter(u => u.role === 'student'), 
      applications
    );
    const predictiveInsights = this.generatePredictiveInsights(users, internships, applications);

    return {
      summary: dashboardStats,
      internships: internshipStats,
      departments: departmentStats,
      insights: predictiveInsights,
      generatedAt: new Date().toISOString(),
      totalRecords: {
        users: users.length,
        internships: internships.length,
        applications: applications.length
      }
    };
  }
}

// Export singleton instance
export default new AnalyticsHelper();
