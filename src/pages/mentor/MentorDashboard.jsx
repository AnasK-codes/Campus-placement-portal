import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../../firebase';
import PendingApprovalCard from '../../components/PendingApprovalCard';
import StudentProgressCard from '../../components/StudentProgressCard';
import CertificateCard from '../../components/CertificateCard';

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

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .icon {
    font-size: 2rem;
  }
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
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ color }) => color || 'var(--primary)'};
  }

  .number {
    font-size: 2.5rem;
    font-weight: 700;
    color: ${({ color }) => color || 'var(--primary)'};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    display: block;
  }

  .label {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .description {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
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

const LoadingSpinner = styled(motion.div)`
  width: 60px;
  height: 60px;
  border: 4px solid ${({ theme }) => theme.colors.border};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  margin: ${({ theme }) => theme.spacing.xxl} auto;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AIMascot = styled(motion.div)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 1000;
  box-shadow: ${({ theme }) => theme.shadows.xl};

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
    bottom: 20px;
    right: 20px;
  }
`;

const MentorDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalStudents: 0,
    approvedApplications: 0,
    certificatesGenerated: 0
  });
  const [pendingApplications, setPendingApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const navItems = [
    { id: 'dashboard', label: 'Mentor Dashboard', icon: '📊' },
    { id: 'approvals', label: 'Pending Approvals', icon: '⏳' },
    { id: 'progress', label: 'Student Progress', icon: '📈' },
    { id: 'certificates', label: 'Certificates', icon: '🏆' },
  ];

  useEffect(() => {
    if (!currentUser) return;

    const loadDashboardData = async () => {
      try {
        // Load pending applications for this mentor
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('mentorId', '==', currentUser.uid),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        );

        const unsubscribeApplications = onSnapshot(applicationsQuery, (snapshot) => {
          const applications = [];
          snapshot.forEach((doc) => {
            applications.push({ id: doc.id, ...doc.data() });
          });
          setPendingApplications(applications);
        });

        // Load students assigned to this mentor
        const studentsQuery = query(
          collection(db, 'users'),
          where('role', '==', 'student'),
          where('mentorId', '==', currentUser.uid)
        );

        const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
          const studentsList = [];
          snapshot.forEach((doc) => {
            studentsList.push({ id: doc.id, ...doc.data() });
          });
          setStudents(studentsList);
        });

        // Load certificates
        const certificatesQuery = query(
          collection(db, 'certificates'),
          where('mentorId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        const unsubscribeCertificates = onSnapshot(certificatesQuery, (snapshot) => {
          const certificatesList = [];
          snapshot.forEach((doc) => {
            certificatesList.push({ id: doc.id, ...doc.data() });
          });
          setCertificates(certificatesList);
        });

        // Calculate stats
        const allApplicationsQuery = query(
          collection(db, 'applications'),
          where('mentorId', '==', currentUser.uid)
        );

        const allApplicationsSnapshot = await getDocs(allApplicationsQuery);
        const allApplications = [];
        allApplicationsSnapshot.forEach((doc) => {
          allApplications.push({ id: doc.id, ...doc.data() });
        });

        setStats({
          pendingApprovals: allApplications.filter(app => app.status === 'pending').length,
          totalStudents: studentsList.length,
          approvedApplications: allApplications.filter(app => app.status === 'approved').length,
          certificatesGenerated: certificatesList.length
        });

        setLoading(false);

        return () => {
          unsubscribeApplications();
          unsubscribeStudents();
          unsubscribeCertificates();
        };
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [currentUser]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionTitle>
              <span className="icon">📊</span>
              Mentor Dashboard
            </SectionTitle>
            
            <StatsGrid>
              <StatCard
                color="#FF9800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="number">{stats.pendingApprovals}</span>
                <div className="label">Pending Approvals</div>
                <div className="description">Applications awaiting review</div>
              </StatCard>

              <StatCard
                color="#2196F3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="number">{stats.totalStudents}</span>
                <div className="label">Total Students</div>
                <div className="description">Students under mentorship</div>
              </StatCard>

              <StatCard
                color="#4CAF50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="number">{stats.approvedApplications}</span>
                <div className="label">Approved Applications</div>
                <div className="description">Successfully approved</div>
              </StatCard>

              <StatCard
                color="#9C27B0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="number">{stats.certificatesGenerated}</span>
                <div className="label">Certificates Generated</div>
                <div className="description">Completion certificates issued</div>
              </StatCard>
            </StatsGrid>
          </motion.div>
        );

      case 'approvals':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionTitle>
              <span className="icon">⏳</span>
              Pending Approvals ({pendingApplications.length})
            </SectionTitle>
            
            {pendingApplications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
                <h3>No Pending Approvals</h3>
                <p>All applications have been reviewed!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {pendingApplications.map((application, index) => (
                  <PendingApprovalCard
                    key={application.id}
                    application={application}
                    index={index}
                    onApprove={() => {
                      // Handle approval logic will be in the component
                    }}
                    onReject={() => {
                      // Handle rejection logic will be in the component
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        );

      case 'progress':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionTitle>
              <span className="icon">📈</span>
              Student Progress ({students.length})
            </SectionTitle>
            
            {students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>👥</div>
                <h3>No Students Assigned</h3>
                <p>Students will appear here once assigned to your mentorship.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {students.map((student, index) => (
                  <StudentProgressCard
                    key={student.id}
                    student={student}
                    index={index}
                  />
                ))}
              </div>
            )}
          </motion.div>
        );

      case 'certificates':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionTitle>
              <span className="icon">🏆</span>
              Certificates ({certificates.length})
            </SectionTitle>
            
            {certificates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏆</div>
                <h3>No Certificates Generated</h3>
                <p>Certificates will appear here after student internship completion.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {certificates.map((certificate, index) => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    index={index}
                  />
                ))}
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingSpinner />
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
            onClick={toggleMobileMenu}
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
                <span className="icon">🎓</span>
                <span>Mentor Portal</span>
              </Logo>
            )}
          </AnimatePresence>
          
          <CollapseButton
            onClick={toggleSidebar}
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
                onClick={() => handleNavClick(item.id)}
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
              onClick={toggleMobileMenu}
              whileTap={{ scale: 0.95 }}
            >
              <span></span>
              <span></span>
              <span></span>
            </MobileMenuButton>

            <Greeting>
              <div className="greeting-text">
                <h1 className="welcome">
                  {getGreeting()}, {userProfile?.name || 'Mentor'}!
                </h1>
                <p className="subtitle">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
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

        <ContentArea>
          {renderContent()}
        </ContentArea>
      </MainContent>

      {/* AI Mascot */}
      <AIMascot
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          const tips = [
            "💡 Students with low profile completion need attention!",
            "🎯 Check for students missing key skills for their target roles.",
            "📊 Review application success rates to identify improvement areas.",
            "🏆 Generate certificates for completed internships to boost student morale!"
          ];
          alert(tips[Math.floor(Math.random() * tips.length)]);
        }}
      >
        🤖
      </AIMascot>
    </DashboardContainer>
  );
};

export default MentorDashboard;
