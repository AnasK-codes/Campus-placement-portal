import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../../firebase';
import analyticsHelper from '../../utils/analyticsHelper';

// Import components
import StatCard from '../../components/StatCard';
import ChartCard from '../../components/ChartCard';
import StudentTable from '../../components/StudentTable';
import InternshipTable from '../../components/InternshipTable';
import ApplicationsTable from '../../components/ApplicationsTable';

const DashboardContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 70px);
  background: ${({ theme }) => theme.colors.surface};
`;

const Sidebar = styled(motion.aside)`
  width: ${({ collapsed }) => collapsed ? '80px' : '280px'};
  background: ${({ theme }) => theme.colors.background};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  transition: width ${({ theme }) => theme.transitions.normal};
  position: relative;
  z-index: 100;

  @media (max-width: 768px) {
    position: fixed;
    left: ${({ collapsed }) => collapsed ? '-280px' : '0'};
    width: 280px;
    height: 100vh;
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: 700;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};

  .icon {
    font-size: 1.5rem;
  }
`;

const CollapseButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: ${({ theme }) => theme.spacing.lg} 0;
  margin: 0;
`;

const NavItem = styled(motion.li)`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const NavLink = styled(motion.button)`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  border-radius: 0;

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
    color: ${({ active, theme }) => active ? 'white' : theme.colors.primary};
  }

  .icon {
    font-size: 1.2rem;
    min-width: 20px;
  }

  .label {
    font-weight: 500;
    opacity: ${({ collapsed }) => collapsed ? 0 : 1};
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }

  .badge {
    background: ${({ active }) => active ? 'rgba(255,255,255,0.2)' : '#f44336'};
    color: white;
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 0.7rem;
    font-weight: 600;
    margin-left: auto;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Greeting = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  .greeting-text {
    .welcome {
      font-size: 1.5rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.text};
      margin: 0;
    }

    .subtitle {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      margin: 0;
    }
  }
`;

const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Avatar = styled(motion.div)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover {
    transform: scale(1.05);
  }
`;

const ThemeToggle = styled(motion.button)`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.2rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ContentArea = styled(motion.div)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const InsightsContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const InsightsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .title {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
  }

  .icon {
    font-size: 1.8rem;
  }
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const InsightCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ severity }) => {
      switch (severity) {
        case 'high': return 'linear-gradient(90deg, #f44336, #ef5350)';
        case 'medium': return 'linear-gradient(90deg, #FF9800, #FFB74D)';
        case 'low': return 'linear-gradient(90deg, #4CAF50, #66BB6A)';
        default: return 'linear-gradient(90deg, #2196F3, #64B5F6)';
      }
    }};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  .insight-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.md};

    .icon {
      font-size: 1.5rem;
    }

    .title {
      font-size: 1.1rem;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
    }
  }

  .insight-message {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    line-height: 1.5;
  }

  .insight-details {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .insight-recommendation {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 500;
    padding: ${({ theme }) => theme.spacing.sm};
    background: ${({ theme }) => theme.colors.surface};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border-left: 3px solid ${({ theme }) => theme.colors.primary};
  }
`;

const MobileOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenuButton = styled(motion.button)`
  display: none;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
  }

  span {
    width: 20px;
    height: 2px;
    background: ${({ theme }) => theme.colors.text};
    transition: all ${({ theme }) => theme.transitions.fast};
    transform-origin: center;

    &:nth-child(1) {
      transform: ${({ isOpen }) => isOpen ? 'rotate(45deg) translateY(6px)' : 'none'};
    }

    &:nth-child(2) {
      opacity: ${({ isOpen }) => isOpen ? '0' : '1'};
    }

    &:nth-child(3) {
      transform: ${({ isOpen }) => isOpen ? 'rotate(-45deg) translateY(-6px)' : 'none'};
    }
  }
`;

const ExportButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark || theme.colors.primary};
    transform: translateY(-1px);
  }

  .icon {
    font-size: 1rem;
  }
`;

const AdminDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Data state
  const [users, setUsers] = useState([]);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({});
  const [chartData, setChartData] = useState({});
  const [insights, setInsights] = useState([]);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'internships', label: 'Internships', icon: '💼' },
    { id: 'applications', label: 'Applications', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📈' },
  ];

  useEffect(() => {
    if (currentUser?.uid) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = () => {
    try {
      // Load users
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const usersList = [];
        snapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersList);
      });

      // Load internships
      const internshipsQuery = query(collection(db, 'internships'), orderBy('createdAt', 'desc'));
      const unsubscribeInternships = onSnapshot(internshipsQuery, (snapshot) => {
        const internshipsList = [];
        snapshot.forEach((doc) => {
          internshipsList.push({ id: doc.id, ...doc.data() });
        });
        setInternships(internshipsList);
      });

      // Load applications
      const applicationsQuery = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
      const unsubscribeApplications = onSnapshot(applicationsQuery, (snapshot) => {
        const applicationsList = [];
        snapshot.forEach((doc) => {
          applicationsList.push({ id: doc.id, ...doc.data() });
        });
        setApplications(applicationsList);
        setLoading(false);
      });

      return () => {
        unsubscribeUsers();
        unsubscribeInternships();
        unsubscribeApplications();
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  // Calculate analytics when data changes
  useEffect(() => {
    if (users.length > 0 || internships.length > 0 || applications.length > 0) {
      const stats = analyticsHelper.calculateDashboardStats(users, internships, applications);
      const internshipStats = analyticsHelper.calculateInternshipStats(internships, applications);
      const departmentStats = analyticsHelper.calculateDepartmentStats(
        users.filter(u => u.role === 'student'), 
        applications
      );
      const predictiveInsights = analyticsHelper.generatePredictiveInsights(users, internships, applications);

      setDashboardStats(stats);
      setInsights(predictiveInsights);

      // Prepare chart data
      setChartData({
        applicationTrends: stats.applicationTrends || [],
        departmentStats: departmentStats.map(dept => ({
          label: dept.department,
          value: dept.totalStudents,
          color: getRandomColor()
        })),
        conversionRates: internshipStats.topByApplications.slice(0, 8).map(internship => ({
          label: internship.role?.substring(0, 15) + '...',
          value: parseFloat(internship.conversionRate)
        })),
        profileCompletion: stats.profileCompletionStats?.distribution || []
      });
    }
  }, [users, internships, applications]);

  const getRandomColor = () => {
    const colors = ['#D32F2F', '#f44336', '#FF5722', '#FF9800', '#FFC107', '#FFEB3B'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleExport = (type) => {
    try {
      switch (type) {
        case 'students':
          analyticsHelper.exportToCSV(
            users.filter(u => u.role === 'student'),
            'students_report'
          );
          break;
        case 'internships':
          analyticsHelper.exportToCSV(internships, 'internships_report');
          break;
        case 'applications':
          analyticsHelper.exportToCSV(applications, 'applications_report');
          break;
        default:
          const reportData = analyticsHelper.generateReportData(users, internships, applications);
          analyticsHelper.exportToCSV([reportData.summary], 'dashboard_summary');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <>
            <StatsGrid>
              <StatCard
                title="Total Students"
                value={dashboardStats.totalStudents || 0}
                icon="👥"
                status="good"
                trend="up"
                trendValue="+12%"
                description="Registered students in the system"
                aiInsight="Strong student engagement this semester"
                animationDelay={0}
              />
              <StatCard
                title="Active Internships"
                value={dashboardStats.totalInternships || 0}
                icon="💼"
                status="good"
                trend="up"
                trendValue="+8%"
                description="Currently available positions"
                aiInsight="Good variety of opportunities available"
                animationDelay={0.1}
              />
              <StatCard
                title="Applications"
                value={dashboardStats.totalApplications || 0}
                icon="📋"
                status="good"
                trend="up"
                trendValue="+15%"
                description="Total applications submitted"
                aiInsight="Application activity is healthy"
                animationDelay={0.2}
              />
              <StatCard
                title="Offers Made"
                value={dashboardStats.offersCount || 0}
                icon="🎯"
                status="good"
                trend="up"
                trendValue="+22%"
                description="Successful placements"
                progress={dashboardStats.conversionRate || 0}
                aiInsight="Conversion rate is above average"
                animationDelay={0.3}
              />
              <StatCard
                title="Students Unplaced"
                value={dashboardStats.unplacedStudents || 0}
                icon="⚠️"
                status={dashboardStats.unplacedStudents > 50 ? "danger" : "warning"}
                trend="down"
                trendValue="-5%"
                description="Students without offers"
                aiInsight="Focus on skill development programs"
                trending={dashboardStats.unplacedStudents > 50}
                animationDelay={0.4}
              />
            </StatsGrid>

            <ChartsGrid>
              <ChartCard
                title="Application Trends"
                subtitle="Applications over the last 30 days"
                icon="📈"
                type="line"
                data={chartData.applicationTrends}
                animationDelay={0.5}
              />
              <ChartCard
                title="Department Distribution"
                subtitle="Students by department"
                icon="🏫"
                type="pie"
                data={chartData.departmentStats}
                animationDelay={0.6}
              />
              <ChartCard
                title="Conversion Rates"
                subtitle="Success rate by internship"
                icon="📊"
                type="bar"
                data={chartData.conversionRates}
                animationDelay={0.7}
              />
              <ChartCard
                title="Profile Completion"
                subtitle="Student profile completion rates"
                icon="👤"
                type="pie"
                data={chartData.profileCompletion}
                animationDelay={0.8}
              />
            </ChartsGrid>

            {insights.length > 0 && (
              <InsightsContainer>
                <InsightsHeader>
                  <span className="icon">🤖</span>
                  <span className="title">AI Insights & Recommendations</span>
                </InsightsHeader>
                <InsightsGrid>
                  {insights.map((insight, index) => (
                    <InsightCard
                      key={insight.type}
                      severity={insight.severity}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="insight-header">
                        <span className="icon">{insight.icon}</span>
                        <span className="title">{insight.title}</span>
                      </div>
                      <div className="insight-message">{insight.message}</div>
                      <div className="insight-details">{insight.details}</div>
                      {insight.recommendation && (
                        <div className="insight-recommendation">
                          💡 {insight.recommendation}
                        </div>
                      )}
                    </InsightCard>
                  ))}
                </InsightsGrid>
              </InsightsContainer>
            )}
          </>
        );

      case 'students':
        return (
          <StudentTable
            students={users.filter(u => u.role === 'student')}
            applications={applications}
            onStudentClick={(student) => console.log('Student clicked:', student)}
            animationDelay={0}
          />
        );

      case 'internships':
        return (
          <InternshipTable
            internships={internships}
            applications={applications}
            onInternshipClick={(internship) => console.log('Internship clicked:', internship)}
            animationDelay={0}
          />
        );

      case 'applications':
        return (
          <ApplicationsTable
            applications={applications}
            students={users.filter(u => u.role === 'student')}
            internships={internships}
            onApplicationClick={(application) => console.log('Application clicked:', application)}
            animationDelay={0}
          />
        );

      case 'reports':
        return (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h2>Export Reports</h2>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <ExportButton onClick={() => handleExport('students')}>
                <span className="icon">📥</span>
                Export Students
              </ExportButton>
              <ExportButton onClick={() => handleExport('internships')}>
                <span className="icon">📥</span>
                Export Internships
              </ExportButton>
              <ExportButton onClick={() => handleExport('applications')}>
                <span className="icon">📥</span>
                Export Applications
              </ExportButton>
              <ExportButton onClick={() => handleExport('summary')}>
                <span className="icon">📥</span>
                Export Summary
              </ExportButton>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          height: '400px' 
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: '50px',
              height: '50px',
              border: '3px solid #ddd',
              borderTop: '3px solid #D32F2F',
              borderRadius: '50%'
            }}
          />
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar collapsed={sidebarCollapsed || !mobileMenuOpen}>
        <SidebarHeader>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <Logo
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="icon">🏛️</span>
                <span>Admin Dashboard</span>
              </Logo>
            )}
          </AnimatePresence>
          
          <CollapseButton
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </CollapseButton>
        </SidebarHeader>

        <NavList>
          {navItems.map((item) => (
            <NavItem key={item.id}>
              <NavLink
                active={activeSection === item.id}
                collapsed={sidebarCollapsed}
                onClick={() => setActiveSection(item.id)}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </NavLink>
            </NavItem>
          ))}
        </NavList>
      </Sidebar>

      <MainContent>
        <TopBar>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <MobileMenuButton
              isOpen={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <span></span>
              <span></span>
              <span></span>
            </MobileMenuButton>

            <Greeting>
              <div className="greeting-text">
                <h1 className="welcome">
                  {getGreeting()}, {userProfile?.name || 'Admin'}!
                </h1>
                <p className="subtitle">
                  Monitor and manage the placement portal
                </p>
              </div>
            </Greeting>
          </div>

          <TopBarActions>
            <ThemeToggle
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </ThemeToggle>

            <Avatar
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {getInitials(userProfile?.name)}
            </Avatar>
          </TopBarActions>
        </TopBar>

        <ContentArea
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

export default AdminDashboard;
