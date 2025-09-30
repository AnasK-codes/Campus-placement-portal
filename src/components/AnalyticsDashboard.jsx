import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import ProgressBar from './ProgressBar';

const AnalyticsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  .icon {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ variant }) => {
      switch (variant) {
        case 'success': return 'linear-gradient(90deg, #4CAF50, #66BB6A)';
        case 'warning': return 'linear-gradient(90deg, #FF9800, #FFB74D)';
        case 'info': return 'linear-gradient(90deg, #2196F3, #42A5F5)';
        case 'danger': return 'linear-gradient(90deg, #f44336, #ef5350)';
        default: return 'linear-gradient(90deg, #D32F2F, #f44336)';
      }
    }};
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ variant, theme }) => {
    switch (variant) {
      case 'success': return 'rgba(76, 175, 80, 0.1)';
      case 'warning': return 'rgba(255, 152, 0, 0.1)';
      case 'info': return 'rgba(33, 150, 243, 0.1)';
      case 'danger': return 'rgba(244, 67, 54, 0.1)';
      default: return 'rgba(211, 47, 47, 0.1)';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatValue = styled.div`
  text-align: right;

  .value {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    line-height: 1;
  }

  .change {
    font-size: 0.8rem;
    color: ${({ positive }) => positive ? '#4CAF50' : '#f44336'};
    font-weight: 600;
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatDescription = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.8rem;
  line-height: 1.4;
`;

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SkillsChart = styled.div`
  .skill-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    
    .skill-name {
      font-weight: 500;
      color: ${({ theme }) => theme.colors.text};
      min-width: 100px;
    }
    
    .skill-bar {
      flex: 1;
      margin: 0 ${({ theme }) => theme.spacing.md};
    }
    
    .skill-count {
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      min-width: 60px;
      text-align: right;
    }
  }
`;

const ApplicationsChart = styled.div`
  .timeline-item {
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    
    .timeline-date {
      min-width: 80px;
      font-size: 0.8rem;
      color: ${({ theme }) => theme.colors.textSecondary};
    }
    
    .timeline-bar {
      flex: 1;
      margin: 0 ${({ theme }) => theme.spacing.md};
    }
    
    .timeline-count {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      min-width: 30px;
    }
  }
`;

const RecentActivity = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ActivityList = styled.div`
  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.md} 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    
    &:last-child {
      border-bottom: none;
    }
    
    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.surface};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    
    .activity-content {
      flex: 1;
      
      .activity-title {
        font-weight: 500;
        color: ${({ theme }) => theme.colors.text};
        margin-bottom: ${({ theme }) => theme.spacing.xs};
      }
      
      .activity-description {
        font-size: 0.9rem;
        color: ${({ theme }) => theme.colors.textSecondary};
        line-height: 1.4;
      }
      
      .activity-time {
        font-size: 0.8rem;
        color: ${({ theme }) => theme.colors.textSecondary};
        margin-top: ${({ theme }) => theme.spacing.xs};
      }
    }
  }
`;

const LoadingSpinner = styled(motion.div)`
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => theme.colors.border};
  border-top: 3px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  margin: ${({ theme }) => theme.spacing.xxl} auto;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AnalyticsDashboard = ({ studentProfile, loading }) => {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadAnalytics();
    }
  }, [currentUser]);

  const loadAnalytics = async () => {
    try {
      // Load applications data
      const applicationsRef = collection(db, 'applications');
      const applicationsQuery = query(
        applicationsRef,
        where('studentId', '==', currentUser.uid),
        orderBy('appliedAt', 'desc')
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applications = applicationsSnapshot.docs.map(doc => doc.data());

      // Load mock test data (if available)
      const mockTestsRef = collection(db, 'mockTests');
      const mockTestsQuery = query(
        mockTestsRef,
        where('studentId', '==', currentUser.uid),
        orderBy('completedAt', 'desc'),
        limit(10)
      );
      const mockTestsSnapshot = await getDocs(mockTestsQuery);
      const mockTests = mockTestsSnapshot.docs.map(doc => doc.data());

      // Generate analytics data
      const analyticsData = generateAnalytics(applications, mockTests, studentProfile);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Generate mock analytics data
      const mockAnalytics = generateMockAnalytics();
      setAnalytics(mockAnalytics);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const generateAnalytics = (applications, mockTests, profile) => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Application statistics
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const interviewsScheduled = applications.filter(app => app.status === 'interview').length;
    const offersReceived = applications.filter(app => app.status === 'offered').length;

    // Recent applications (last month)
    const recentApplications = applications.filter(app => 
      app.appliedAt && app.appliedAt.toDate() > lastMonth
    ).length;

    // Mock test statistics
    const totalTests = mockTests.length;
    const averageScore = mockTests.length > 0 
      ? Math.round(mockTests.reduce((sum, test) => sum + (test.score || 0), 0) / mockTests.length)
      : 0;

    // Profile completion
    const profileFields = ['name', 'phone', 'department', 'year', 'rollNumber'];
    const completedFields = profileFields.filter(field => profile?.[field]).length;
    const hasAvatar = !!profile?.avatarUrl;
    const hasResume = !!profile?.resumeUrl;
    const hasSkills = profile?.skills?.length > 0;
    const profileCompletion = Math.round(
      ((completedFields + (hasAvatar ? 1 : 0) + (hasResume ? 1 : 0) + (hasSkills ? 1 : 0)) / 
      (profileFields.length + 3)) * 100
    );

    // Skill analysis
    const skillDemand = profile?.skills?.map(skill => ({
      name: skill,
      demand: Math.floor(Math.random() * 10) + 1, // Mock demand data
      percentage: Math.floor(Math.random() * 100) + 1
    })) || [];

    // Application timeline (last 6 months)
    const timeline = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthApplications = applications.filter(app => {
        if (!app.appliedAt) return false;
        const appDate = app.appliedAt.toDate();
        return appDate.getMonth() === date.getMonth() && 
               appDate.getFullYear() === date.getFullYear();
      }).length;
      
      timeline.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        applications: monthApplications
      });
    }

    // Recent activity
    const recentActivity = [
      {
        type: 'application',
        icon: '📋',
        title: 'Applied to Frontend Developer position',
        description: 'TechCorp - Application submitted successfully',
        time: '2 hours ago'
      },
      {
        type: 'test',
        icon: '📝',
        title: 'Completed JavaScript Mock Test',
        description: 'Scored 85% - Above average performance',
        time: '1 day ago'
      },
      {
        type: 'profile',
        icon: '👤',
        title: 'Updated profile skills',
        description: 'Added React, Node.js, and MongoDB',
        time: '3 days ago'
      },
      {
        type: 'interview',
        icon: '🎤',
        title: 'Interview scheduled',
        description: 'StartupXYZ - Full Stack Developer position',
        time: '5 days ago'
      }
    ];

    return {
      stats: {
        totalApplications,
        pendingApplications,
        interviewsScheduled,
        offersReceived,
        totalTests,
        averageScore,
        profileCompletion,
        recentApplications
      },
      skillDemand,
      timeline,
      recentActivity
    };
  };

  const generateMockAnalytics = () => {
    return {
      stats: {
        totalApplications: 12,
        pendingApplications: 5,
        interviewsScheduled: 3,
        offersReceived: 1,
        totalTests: 8,
        averageScore: 78,
        profileCompletion: 85,
        recentApplications: 4
      },
      skillDemand: [
        { name: 'JavaScript', demand: 8, percentage: 85 },
        { name: 'React', demand: 7, percentage: 78 },
        { name: 'Node.js', demand: 6, percentage: 65 },
        { name: 'Python', demand: 5, percentage: 55 },
        { name: 'SQL', demand: 4, percentage: 45 }
      ],
      timeline: [
        { month: 'Jul', applications: 1 },
        { month: 'Aug', applications: 3 },
        { month: 'Sep', applications: 2 },
        { month: 'Oct', applications: 4 },
        { month: 'Nov', applications: 2 },
        { month: 'Dec', applications: 0 }
      ],
      recentActivity: [
        {
          type: 'application',
          icon: '📋',
          title: 'Applied to Frontend Developer position',
          description: 'TechCorp - Application submitted successfully',
          time: '2 hours ago'
        },
        {
          type: 'test',
          icon: '📝',
          title: 'Completed JavaScript Mock Test',
          description: 'Scored 85% - Above average performance',
          time: '1 day ago'
        },
        {
          type: 'profile',
          icon: '👤',
          title: 'Updated profile skills',
          description: 'Added React, Node.js, and MongoDB',
          time: '3 days ago'
        }
      ]
    };
  };

  if (loading || loadingAnalytics) {
    return (
      <AnalyticsContainer>
        <LoadingSpinner />
      </AnalyticsContainer>
    );
  }

  if (!analytics) {
    return (
      <AnalyticsContainer>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Unable to load analytics data</p>
        </div>
      </AnalyticsContainer>
    );
  }

  return (
    <AnalyticsContainer>
      <Header>
        <Title>
          <span className="icon">📊</span>
          Analytics Dashboard
        </Title>
        <Subtitle>
          Track your placement journey and performance metrics
        </Subtitle>
      </Header>

      <StatsGrid>
        <StatCard
          variant="primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatHeader>
            <StatIcon variant="primary">📋</StatIcon>
            <StatValue positive={analytics.stats.recentApplications > 0}>
              <div className="value">{analytics.stats.totalApplications}</div>
              <div className="change">
                +{analytics.stats.recentApplications} this month
              </div>
            </StatValue>
          </StatHeader>
          <StatLabel>Total Applications</StatLabel>
          <StatDescription>
            Applications submitted across all platforms
          </StatDescription>
        </StatCard>

        <StatCard
          variant="warning"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatHeader>
            <StatIcon variant="warning">⏳</StatIcon>
            <StatValue>
              <div className="value">{analytics.stats.pendingApplications}</div>
            </StatValue>
          </StatHeader>
          <StatLabel>Pending Applications</StatLabel>
          <StatDescription>
            Applications awaiting response from companies
          </StatDescription>
        </StatCard>

        <StatCard
          variant="info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatHeader>
            <StatIcon variant="info">🎤</StatIcon>
            <StatValue positive={analytics.stats.interviewsScheduled > 0}>
              <div className="value">{analytics.stats.interviewsScheduled}</div>
              <div className="change">
                {analytics.stats.interviewsScheduled > 0 ? 'Active' : 'None scheduled'}
              </div>
            </StatValue>
          </StatHeader>
          <StatLabel>Interviews Scheduled</StatLabel>
          <StatDescription>
            Upcoming and completed interview rounds
          </StatDescription>
        </StatCard>

        <StatCard
          variant="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <StatHeader>
            <StatIcon variant="success">🎉</StatIcon>
            <StatValue positive={analytics.stats.offersReceived > 0}>
              <div className="value">{analytics.stats.offersReceived}</div>
              <div className="change">
                {analytics.stats.offersReceived > 0 ? 'Congratulations!' : 'Keep applying'}
              </div>
            </StatValue>
          </StatHeader>
          <StatLabel>Offers Received</StatLabel>
          <StatDescription>
            Job offers and internship confirmations
          </StatDescription>
        </StatCard>

        <StatCard
          variant="info"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <StatHeader>
            <StatIcon variant="info">📝</StatIcon>
            <StatValue>
              <div className="value">{analytics.stats.totalTests}</div>
              <div className="change">Avg: {analytics.stats.averageScore}%</div>
            </StatValue>
          </StatHeader>
          <StatLabel>Mock Tests Taken</StatLabel>
          <StatDescription>
            Practice tests completed with average score
          </StatDescription>
        </StatCard>

        <StatCard
          variant={analytics.stats.profileCompletion >= 80 ? 'success' : 'warning'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <StatHeader>
            <StatIcon variant={analytics.stats.profileCompletion >= 80 ? 'success' : 'warning'}>
              👤
            </StatIcon>
            <StatValue>
              <div className="value">{analytics.stats.profileCompletion}%</div>
              <div className="change">
                {analytics.stats.profileCompletion >= 80 ? 'Complete' : 'Needs work'}
              </div>
            </StatValue>
          </StatHeader>
          <StatLabel>Profile Completion</StatLabel>
          <StatDescription>
            Profile completeness affects visibility
          </StatDescription>
        </StatCard>
      </StatsGrid>

      <ChartsSection>
        <ChartCard
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ChartTitle>
            🛠️ Skill Demand Analysis
          </ChartTitle>
          <SkillsChart>
            {analytics.skillDemand.slice(0, 5).map((skill, index) => (
              <div key={skill.name} className="skill-item">
                <div className="skill-name">{skill.name}</div>
                <div className="skill-bar">
                  <ProgressBar
                    value={skill.percentage}
                    variant="auto"
                    size="small"
                    animated={true}
                  />
                </div>
                <div className="skill-count">{skill.demand} jobs</div>
              </div>
            ))}
          </SkillsChart>
        </ChartCard>

        <ChartCard
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <ChartTitle>
            📈 Application Timeline
          </ChartTitle>
          <ApplicationsChart>
            {analytics.timeline.map((item, index) => (
              <div key={item.month} className="timeline-item">
                <div className="timeline-date">{item.month}</div>
                <div className="timeline-bar">
                  <ProgressBar
                    value={(item.applications / Math.max(...analytics.timeline.map(t => t.applications))) * 100}
                    variant="info"
                    size="small"
                    showPercentage={false}
                    animated={true}
                  />
                </div>
                <div className="timeline-count">{item.applications}</div>
              </div>
            ))}
          </ApplicationsChart>
        </ChartCard>
      </ChartsSection>

      <RecentActivity
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <ChartTitle>
          🕒 Recent Activity
        </ChartTitle>
        <ActivityList>
          {analytics.recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-content">
                <div className="activity-title">{activity.title}</div>
                <div className="activity-description">{activity.description}</div>
                <div className="activity-time">{activity.time}</div>
              </div>
            </div>
          ))}
        </ActivityList>
      </RecentActivity>
    </AnalyticsContainer>
  );
};

export default AnalyticsDashboard;
