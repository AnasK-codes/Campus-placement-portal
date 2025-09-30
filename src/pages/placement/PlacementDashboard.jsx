import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserDocument } from '../../firebase';
import InternshipForm from '../../components/InternshipForm';
import ApprovalList from '../../components/ApprovalList';
import ApplicationsOverview from '../../components/ApplicationsOverview';
import SeatTracker from '../../components/SeatTracker';

const DashboardContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 70px);
  background: ${({ theme }) => theme.colors.surface};
`;

const Sidebar = styled(motion.aside)`
  width: ${({ collapsed }) => collapsed ? '80px' : '300px'};
  background: ${({ theme }) => theme.colors.background};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  transition: width ${({ theme }) => theme.transitions.normal};
  position: relative;
  z-index: 100;

  @media (max-width: 768px) {
    position: fixed;
    left: ${({ collapsed }) => collapsed ? '-300px' : '0'};
    width: 300px;
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

const SidebarTitle = styled(motion.h2)`
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

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
  font-size: 1.2rem;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const SidebarNav = styled.nav`
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;

const NavItem = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  background: none;
  border: none;
  text-align: left;
  color: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.text};
  font-size: 1rem;
  font-weight: ${({ active }) => active ? '600' : '500'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  position: relative;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.primary};
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ theme }) => theme.colors.primary};
    transform: scaleY(${({ active }) => active ? '1' : '0'});
    transition: transform ${({ theme }) => theme.transitions.fast};
  }

  .icon {
    font-size: 1.3rem;
    min-width: 28px;
  }

  .label {
    opacity: ${({ collapsed }) => collapsed ? '0' : '1'};
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }

  .badge {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: auto;
    opacity: ${({ collapsed }) => collapsed ? '0' : '1'};
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Greeting = styled(motion.div)`
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
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
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
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
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ContentArea = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  min-height: 600px;
  overflow: hidden;
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

const AIAssistant = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 1000;

  .ai-icon {
    font-size: 1.5rem;
    color: white;
  }

  &:hover {
    transform: scale(1.1);
  }
`;

const AITooltip = styled(motion.div)`
  position: absolute;
  bottom: 70px;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  white-space: nowrap;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 20px;
    border: 8px solid transparent;
    border-top-color: ${({ theme }) => theme.colors.background};
  }
`;

const LoadingSpinner = styled(motion.div)`
  width: 50px;
  height: 50px;
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

const PlacementDashboard = () => {
  const { currentUser, userProfile, hasRole } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAITooltip, setShowAITooltip] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'post-internship', label: 'Post Internship', icon: '📝' },
    { id: 'approvals', label: 'Pending Approvals', icon: '👥', badge: pendingApprovals },
    { id: 'applications', label: 'Applications', icon: '📋' },
    { id: 'reports', label: 'Reports', icon: '📈' },
  ];

  useEffect(() => {
    const loadProfileData = async () => {
      if (currentUser) {
        try {
          const data = await getUserDocument(currentUser.uid);
          setProfileData(data);
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfileData();
  }, [currentUser]);

  useEffect(() => {
    // Load pending approvals count
    // This would be replaced with real Firestore query
    setPendingApprovals(5);
  }, []);

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
          <div style={{ padding: '2rem' }}>
            <ApplicationsOverview />
            <SeatTracker />
          </div>
        );
      case 'post-internship':
        return <InternshipForm />;
      case 'approvals':
        return <ApprovalList onApprovalUpdate={(count) => setPendingApprovals(count)} />;
      case 'applications':
        return <ApplicationsOverview detailed={true} />;
      case 'reports':
        return (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Reports & Analytics</h2>
            <p>Comprehensive reports and analytics coming soon</p>
          </div>
        );
      default:
        return null;
    }
  };

  // Check if user has placement role
  if (!hasRole(['placement', 'admin'])) {
    return (
      <DashboardContainer>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%', 
          height: '400px',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access the Placement Dashboard.</p>
        </div>
      </DashboardContainer>
    );
  }

  if (loading && !profileData) {
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
              <SidebarTitle
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <span className="icon">🏢</span>
                Placement Cell
              </SidebarTitle>
            )}
          </AnimatePresence>
          <CollapseButton
            onClick={toggleSidebar}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </CollapseButton>
        </SidebarHeader>

        <SidebarNav>
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              active={activeSection === item.id}
              collapsed={sidebarCollapsed}
              onClick={() => handleNavClick(item.id)}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="badge">{item.badge}</span>
              )}
            </NavItem>
          ))}
        </SidebarNav>
      </Sidebar>

      <MainContent>
        <Header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <MobileMenuButton
              onClick={toggleMobileMenu}
              isOpen={mobileMenuOpen}
              whileTap={{ scale: 0.9 }}
            >
              <span />
              <span />
              <span />
            </MobileMenuButton>

            <Greeting
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1>{getGreeting()}, {profileData?.name || 'Placement Officer'}!</h1>
              <p>Manage internships and student placements</p>
            </Greeting>
          </div>

          <HeaderActions>
            <ThemeToggle
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              <motion.span
                key={isDarkMode ? 'moon' : 'sun'}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </motion.span>
            </ThemeToggle>

            <Avatar
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {profileData?.avatarUrl ? (
                <img src={profileData.avatarUrl} alt="Avatar" />
              ) : (
                getInitials(profileData?.name || currentUser?.displayName)
              )}
            </Avatar>
          </HeaderActions>
        </Header>

        <ContentArea
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </ContentArea>
      </MainContent>

      <AIAssistant
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onHoverStart={() => setShowAITooltip(true)}
        onHoverEnd={() => setShowAITooltip(false)}
      >
        <span className="ai-icon">🤖</span>
        <AnimatePresence>
          {showAITooltip && (
            <AITooltip
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              AI Assistant: Auto-tag skills & get insights
            </AITooltip>
          )}
        </AnimatePresence>
      </AIAssistant>
    </DashboardContainer>
  );
};

export default PlacementDashboard;
