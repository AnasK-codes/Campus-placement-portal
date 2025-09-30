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
  getDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import FeedbackForm from '../../components/FeedbackForm';
import EnhancedCertificateCard from '../../components/EnhancedCertificateCard';

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

  .count {
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

const StatCard = styled(motion.div)`
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
    background: ${({ color }) => color || 'var(--primary)'};
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: ${({ color }) => color || 'var(--primary)'}20;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .stat-label {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }
`;

const SectionContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .title {
    font-size: 1.8rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};

    .icon {
      font-size: 2rem;
    }
  }
`;

const ApplicationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ApplicationCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  .application-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.spacing.md};

    .student-info {
      .student-name {
        font-size: 1.2rem;
        font-weight: 600;
        color: ${({ theme }) => theme.colors.text};
        margin-bottom: ${({ theme }) => theme.spacing.xs};
      }

      .internship-details {
        color: ${({ theme }) => theme.colors.textSecondary};
        font-size: 0.9rem;
      }
    }

    .completion-date {
      text-align: right;
      color: ${({ theme }) => theme.colors.textSecondary};
      font-size: 0.8rem;
    }
  }

  .application-actions {
    display: flex;
    gap: ${({ theme }) => theme.spacing.md};
    margin-top: ${({ theme }) => theme.spacing.md};
  }
`;

const ActionButton = styled(motion.button)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ variant, theme }) => 
    variant === 'primary' ? theme.colors.gradient : 'transparent'};
  color: ${({ variant, theme }) => 
    variant === 'primary' ? 'white' : theme.colors.primary};
  border: ${({ variant, theme }) => 
    variant === 'primary' ? 'none' : `2px solid ${theme.colors.primary}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ variant, theme }) => 
      variant === 'primary' ? theme.colors.gradient : theme.colors.primary};
    color: white;
  }

  .icon {
    font-size: 1rem;
  }
`;

const CertificatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textSecondary};

  .icon {
    font-size: 4rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text};
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

const FeedbackDashboard = () => {
  const { currentUser, userProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('feedback');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  
  // Data state
  const [completedApplications, setCompletedApplications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    pendingFeedback: 0,
    certificatesGenerated: 0,
    averageRating: 0
  });

  const navItems = [
    { 
      id: 'feedback', 
      label: 'Feedback Forms', 
      icon: '📝',
      count: stats.pendingFeedback
    },
    { 
      id: 'certificates', 
      label: 'Certificates', 
      icon: '🏆',
      count: stats.certificatesGenerated
    },
  ];

  useEffect(() => {
    if (currentUser?.uid) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = () => {
    try {
      // Load completed applications for this mentor
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('mentorId', '==', currentUser.uid),
        where('status', 'in', ['completed', 'feedback_submitted']),
        orderBy('completedAt', 'desc')
      );

      const unsubscribeApplications = onSnapshot(applicationsQuery, async (snapshot) => {
        const applicationsList = [];
        const applicationPromises = [];

        snapshot.forEach((doc) => {
          const appData = { id: doc.id, ...doc.data() };
          applicationsList.push(appData);
          
          // Load additional details for each application
          applicationPromises.push(loadApplicationDetails(appData));
        });

        const detailedApplications = await Promise.all(applicationPromises);
        setCompletedApplications(detailedApplications);
        
        // Calculate stats
        const pendingFeedback = detailedApplications.filter(app => !app.mentorFeedback).length;
        const withFeedback = detailedApplications.filter(app => app.mentorFeedback);
        const avgRating = withFeedback.length > 0 ? 
          withFeedback.reduce((sum, app) => sum + (app.mentorFeedback?.ratings?.overall || 0), 0) / withFeedback.length : 0;

        setStats({
          totalCompleted: detailedApplications.length,
          pendingFeedback,
          certificatesGenerated: detailedApplications.filter(app => app.certificateURL).length,
          averageRating: avgRating
        });

        setLoading(false);
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

      return () => {
        unsubscribeApplications();
        unsubscribeCertificates();
      };
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const loadApplicationDetails = async (application) => {
    try {
      // Load student details
      const studentDoc = await getDoc(doc(db, 'users', application.studentId));
      const studentData = studentDoc.exists() ? studentDoc.data() : {};

      // Load internship details
      const internshipDoc = await getDoc(doc(db, 'internships', application.internshipId));
      const internshipData = internshipDoc.exists() ? internshipDoc.data() : {};

      return {
        ...application,
        studentName: studentData.name || 'Unknown Student',
        studentEmail: studentData.email || '',
        internshipTitle: internshipData.role || 'Unknown Role',
        companyName: internshipData.company || 'Unknown Company',
        duration: internshipData.duration || '3 months'
      };
    } catch (error) {
      console.error('Error loading application details:', error);
      return application;
    }
  };

  const handleFeedbackSubmit = (feedbackData) => {
    setSelectedApplication(null);
    // Data will be updated automatically via real-time listeners
  };

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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderContent = () => {
    if (selectedApplication) {
      return (
        <FeedbackForm
          application={selectedApplication}
          onSubmit={handleFeedbackSubmit}
          onCancel={() => setSelectedApplication(null)}
        />
      );
    }

    switch (activeSection) {
      case 'feedback':
        return (
          <SectionContainer>
            <SectionHeader>
              <div className="title">
                <span className="icon">📝</span>
                Feedback Forms
              </div>
            </SectionHeader>

            {completedApplications.filter(app => !app.mentorFeedback).length === 0 ? (
              <EmptyState>
                <div className="icon">✅</div>
                <h3>All Feedback Completed</h3>
                <p>You have provided feedback for all completed internships!</p>
              </EmptyState>
            ) : (
              <ApplicationsList>
                {completedApplications
                  .filter(app => !app.mentorFeedback)
                  .map((application, index) => (
                    <ApplicationCard
                      key={application.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => setSelectedApplication(application)}
                    >
                      <div className="application-header">
                        <div className="student-info">
                          <div className="student-name">{application.studentName}</div>
                          <div className="internship-details">
                            {application.internshipTitle} at {application.companyName}
                          </div>
                        </div>
                        <div className="completion-date">
                          Completed: {formatDate(application.completedAt)}
                        </div>
                      </div>
                      <div className="application-actions">
                        <ActionButton
                          variant="primary"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="icon">📝</span>
                          Provide Feedback
                        </ActionButton>
                      </div>
                    </ApplicationCard>
                  ))}
              </ApplicationsList>
            )}
          </SectionContainer>
        );

      case 'certificates':
        return (
          <SectionContainer>
            <SectionHeader>
              <div className="title">
                <span className="icon">🏆</span>
                Generated Certificates
              </div>
            </SectionHeader>

            {certificates.length === 0 ? (
              <EmptyState>
                <div className="icon">🏆</div>
                <h3>No Certificates Yet</h3>
                <p>Certificates will appear here after you submit feedback for completed internships.</p>
              </EmptyState>
            ) : (
              <CertificatesGrid>
                {certificates.map((certificate, index) => (
                  <EnhancedCertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    index={index}
                    showAITooltip={index === 0} // Show tooltip on first certificate
                  />
                ))}
              </CertificatesGrid>
            )}
          </SectionContainer>
        );

      default:
        return null;
    }
  };

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
                <span className="icon">📝</span>
                <span>Feedback & Certificates</span>
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
                {item.count > 0 && <span className="count">{item.count}</span>}
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
                  {getGreeting()}, {userProfile?.name || 'Mentor'}!
                </h1>
                <p className="subtitle">
                  Manage feedback and certificates for your students
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
          {!selectedApplication && (
            <StatsGrid>
              <StatCard
                color="#4CAF50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="stat-header">
                  <div className="stat-icon">✅</div>
                </div>
                <div className="stat-value">{stats.totalCompleted}</div>
                <div className="stat-label">Completed Internships</div>
              </StatCard>

              <StatCard
                color="#FF9800"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="stat-header">
                  <div className="stat-icon">📝</div>
                </div>
                <div className="stat-value">{stats.pendingFeedback}</div>
                <div className="stat-label">Pending Feedback</div>
              </StatCard>

              <StatCard
                color="#2196F3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="stat-header">
                  <div className="stat-icon">🏆</div>
                </div>
                <div className="stat-value">{stats.certificatesGenerated}</div>
                <div className="stat-label">Certificates Generated</div>
              </StatCard>

              <StatCard
                color="#9C27B0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="stat-header">
                  <div className="stat-icon">⭐</div>
                </div>
                <div className="stat-value">{stats.averageRating.toFixed(1)}</div>
                <div className="stat-label">Average Rating</div>
              </StatCard>
            </StatsGrid>
          )}

          {renderContent()}
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

export default FeedbackDashboard;
