import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 70px);
  background: ${({ theme }) => theme.colors.surface};
  padding: 2rem;
`;

const MainContent = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.colors.background};
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const WelcomeMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  margin-bottom: 2rem;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const FeatureCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(211, 47, 47, 0.1);
  }

  h3 {
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
  }

  .icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
`;

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const features = [
    {
      icon: '📋',
      title: 'My Applications',
      description: 'Track your internship applications and their status'
    },
    {
      icon: '🏆',
      title: 'Certificates',
      description: 'View and download your completion certificates'
    },
    {
      icon: '🔍',
      title: 'Search Internships',
      description: 'Find and apply for new internship opportunities'
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'View your application statistics and progress'
    },
    {
      icon: '👥',
      title: 'Peer Support',
      description: 'Get help from peers and mentors'
    },
    {
      icon: '⚙️',
      title: 'Settings',
      description: 'Manage your profile and preferences'
    }
  ];

  return (
    <DashboardContainer>
      <MainContent>
        <Title>Welcome to Your Dashboard</Title>
        <WelcomeMessage>
          Hello {currentUser?.displayName || 'Student'}! Here's your personalized dashboard to manage your internship journey.
        </WelcomeMessage>
        
        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </MainContent>
    </DashboardContainer>
  );
};

export default StudentDashboard;
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

const SidebarTitle = styled(motion.h2)`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const SidebarNav = styled.nav`
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;

const NavItem = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
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
    font-size: 1.2rem;
    min-width: 24px;
  }

  .label {
    opacity: ${({ collapsed }) => collapsed ? '0' : '1'};
    transition: opacity ${({ theme }) => theme.transitions.fast};
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

const CertificatesContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const CertificatesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

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

    .count {
      background: ${({ theme }) => theme.colors.primary};
      color: white;
      padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
      border-radius: ${({ theme }) => theme.borderRadius.md};
      font-size: 0.9rem;
      margin-left: ${({ theme }) => theme.spacing.sm};
    }
  }

  .subtitle {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1rem;
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;

const CertificatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
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
    font-size: 1.3rem;
  }

  p {
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xxl};

  .spinner {
    width: 50px;
    height: 50px;
    border: 3px solid ${({ theme }) => theme.colors.border};
    border-top: 3px solid ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const GamificationContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
`;

const ParticleEffect = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
`;

const AIMascotCelebration = styled(motion.div)`
  position: fixed;
  top: 20%;
  right: 5%;
  font-size: 4rem;
  z-index: 1000;
  cursor: pointer;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: 999;

  &::after {
    content: '🎉 Certificate Ready!';
    position: absolute;
    bottom: 100%;
    right: 0;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    font-size: 0.8rem;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: ${({ theme }) => theme.shadows.md};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const CertificatesSection = ({ certificates, loading }) => {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (certificates.length > 0 && !loading) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [certificates.length, loading]);

  if (loading) {
    return (
      <CertificatesContainer>
        <LoadingContainer>
          <div className="spinner" />
        </LoadingContainer>
      </CertificatesContainer>
    );
  }

  return (
    <CertificatesContainer>
      <CertificatesHeader>
        <div>
          <div className="title">
            <span className="icon">🏆</span>
            My Certificates
            {certificates.length > 0 && (
              <span className="count">{certificates.length}</span>
            )}
          </div>
          <div className="subtitle">
            Download and share your internship completion certificates
          </div>
        </div>
      </CertificatesHeader>

      {certificates.length === 0 ? (
        <EmptyState>
          <div className="icon">🏆</div>
          <h3>No Certificates Yet</h3>
          <p>
            Complete your internships and receive feedback from mentors to earn certificates.
            <br />
            Your certificates will appear here automatically once generated.
          </p>
        </EmptyState>
      ) : (
        <CertificatesGrid>
          <AnimatePresence>
            {certificates.map((certificate, index) => (
              <EnhancedCertificateCard
                key={certificate.id}
                certificate={certificate}
                index={index}
                showAITooltip={index === 0 && certificates.length === 1}
              />
            ))}
          </AnimatePresence>
        </CertificatesGrid>
      )}

      {/* AI Mascot Celebration */}
      <AnimatePresence>
        {showCelebration && certificates.length > 0 && (
          <AIMascotCelebration
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.5, type: "spring" }}
            onClick={() => setShowCelebration(false)}
          >
            🎉 New Certificate Available!
          </AIMascotCelebration>
        )}
      </AnimatePresence>
    </CertificatesContainer>
  );
};

const GamificationSection = ({
  userSkills,
  achievements,
  skillSuggestions,
  profileData,
  profileCompletion,
  loading,
  onSkillAdd,
  onAchievementUnlock
}) => {
  const [showParticles, setShowParticles] = useState(false);

  if (loading) {
    return (
      <GamificationContainer>
        <LoadingContainer>
          <div className="spinner" />
          <p>Loading your skills and achievements...</p>
        </LoadingContainer>
      </GamificationContainer>
    );
  }

  return (
    <GamificationContainer>
      {/* Profile Completion Progress */}
      <GamifiedProgressBar
        percentage={profileCompletion}
        title="Profile Completion Progress"
        profileData={profileData}
        showDetails={true}
        showMilestones={true}
        onMilestoneReached={(milestone) => {
          console.log('Milestone reached:', milestone);
          setShowParticles(true);
          setTimeout(() => setShowParticles(false), 3000);
        }}
      />

      {/* Skills Badges Section */}
      <SkillsSection>
        <SectionHeader>
          <div className="header-content">
            <span className="icon">🏅</span>
            <div>
              <h2>Skill Badges</h2>
              <p>Your skill levels and achievements</p>
            </div>
          </div>
          <div className="stats">
            <div className="stat">
              <span className="number">{userSkills.length}</span>
              <span className="label">Skills</span>
            </div>
            <div className="stat">
              <span className="number">{userSkills.filter(s => s.level >= 3).length}</span>
              <span className="label">Gold+</span>
            </div>
          </div>
        </SectionHeader>

        <SkillBadgesGrid
          skills={userSkills}
          suggestions={skillSuggestions.slice(0, 3)}
          onSkillClick={onSkillAdd}
          onSuggestionClick={onSkillAdd}
          showAnimations={true}
          maxDisplay={12}
        />
      </SkillsSection>

      {/* AI Skill Suggestions */}
      <AISkillSuggestions
        userSkills={userSkills}
        userProfile={profileData}
        onSkillAdd={onSkillAdd}
        onRefresh={() => window.location.reload()}
      />

      {/* Achievements Section */}
      <AchievementsSection>
        <SectionHeader>
          <div className="header-content">
            <span className="icon">🏆</span>
            <div>
              <h2>Achievements</h2>
              <p>Your milestones and accomplishments</p>
            </div>
          </div>
          <div className="stats">
            <div className="stat">
              <span className="number">{achievements.length}</span>
              <span className="label">Unlocked</span>
            </div>
          </div>
        </SectionHeader>

        <AchievementsGrid
          achievements={achievements}
          unlockedAchievements={achievements}
          onAchievementClick={onAchievementUnlock}
          showProgress={true}
        />
      </AchievementsSection>

      {/* Particle Effect */}
      <AnimatePresence>
        {showParticles && (
          <ParticleEffect
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <Particle
                key={i}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight,
                  scale: 0
                }}
                animate={{
                  y: -100,
                  scale: [0, 1, 0],
                  rotate: 360
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.1
                }}
              />
            ))}
          </ParticleEffect>
        )}
      </AnimatePresence>
    </GamificationContainer>
  );
};

const StudentDashboard = () => {
  const { currentUser, userProfile, refreshUserData } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(true);
  const [userSkills, setUserSkills] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [gamificationLoading, setGamificationLoading] = useState(true);

  const navItems = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'resume', label: 'Resume Builder', icon: '📄' },
    { id: 'gamification', label: 'Skills & Badges', icon: '🎮' },
    { id: 'search', label: 'Search & Filter', icon: '🔍' },
    { id: 'applications', label: 'Applications', icon: '📋' },
    { id: 'internships', label: 'Recommended', icon: '🎯' },
    { id: 'certificates', label: 'Certificates', icon: '🏆' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
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
    if (currentUser?.uid) {
      loadCertificates();
    }
  }, [currentUser]);

  const loadCertificates = () => {
    try {
      const certificatesQuery = query(
        collection(db, 'certificates'),
        where('studentId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(certificatesQuery, (snapshot) => {
        const certificatesList = [];
        snapshot.forEach((doc) => {
          certificatesList.push({ id: doc.id, ...doc.data() });
        });
        setCertificates(certificatesList);
        setCertificatesLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading certificates:', error);
      setCertificatesLoading(false);
    }
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
      case 'profile':
        return (
          <ProfileCard 
            profileData={profileData} 
            onUpdate={setProfileData}
            loading={loading}
          />
        );
      case 'gamification':
        return (
          <GamificationSection
            userSkills={userSkills}
            achievements={achievements}
            skillSuggestions={skillSuggestions}
            profileData={profileData}
            profileCompletion={profileCompletion}
            loading={gamificationLoading}
            onSkillAdd={handleSkillAdd}
            onAchievementUnlock={handleAchievementUnlock}
          />
        );
      case 'search':
        return (
          <SearchProvider>
            <SearchPage defaultCollection="internships" />
          </SearchProvider>
        );
      case 'applications':
        return (
          <ApplicationCard 
            studentId={currentUser?.uid}
            loading={loading}
          />
        );
      case 'internships':
        return (
          <RecommendedInternshipCard 
            studentProfile={profileData}
            loading={loading}
          />
        );
      case 'certificates':
        return (
          <CertificatesSection 
            certificates={certificates}
            loading={certificatesLoading}
          />
        );
      case 'analytics':
        return (
          <AnalyticsDashboard 
            studentProfile={profileData}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  if (loading && !profileData) {
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
                Dashboard
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
              <h1>{getGreeting()}, {profileData?.name || 'Student'}!</h1>
              <p>Welcome to your placement dashboard</p>
            </Greeting>
          </div>

          <HeaderActions>
            <NotificationSystem />
            
            <ThemeToggle
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </ThemeToggle>

            <Avatar
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveSection('profile')}
            >
              {profileData?.avatar ? (
                <img 
                  src={profileData.avatar} 
                  alt={profileData?.name || 'User'} 
                />
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
    </DashboardContainer>
  );
};

export default StudentDashboard;
