import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase';
import CertificateCard from '../../components/CertificateCard';

const confetti = keyframes`
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const CertificatesContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const CertificatesHeader = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl} auto;
  text-align: center;

  .header-icon {
    font-size: 4rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    animation: ${confetti} 3s ease-out infinite;
  }

  .header-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xxxl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    background: ${({ theme }) => theme.colors.gradient};
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .header-subtitle {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }
`;

const StatsSection = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl} auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ color }) => color || 'linear-gradient(90deg, #FFD700, #FFA500)'};
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }

  .stat-icon {
    font-size: 2.5rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .stat-number {
    font-size: ${({ theme }) => theme.typography.fontSize.xxl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ color }) => color || '#FFD700'};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    display: block;
  }

  .stat-label {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-description {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.textTertiary};
    margin-top: ${({ theme }) => theme.spacing.xs};
    line-height: 1.4;
  }
`;

const FilterSection = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl} auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  .filter-controls {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
    flex-wrap: wrap;
  }

  .view-controls {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FilterButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, active }) => 
    active ? theme.colors.primary : theme.colors.border
  };
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme, active }) => 
    active ? theme.colors.primary : 'transparent'
  };
  color: ${({ theme, active }) => 
    active ? 'white' : theme.colors.text
  };
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  &:hover {
    background: ${({ theme, active }) => 
      active ? theme.colors.primaryDark : theme.colors.surface
    };
    transform: translateY(-2px);
  }

  .filter-icon {
    font-size: 1rem;
  }
`;

const ViewToggle = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, active }) => 
    active ? theme.colors.primary : theme.colors.background
  };
  color: ${({ theme, active }) => 
    active ? 'white' : theme.colors.text
  };
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:first-child {
    border-radius: ${({ theme }) => theme.borderRadius.md} 0 0 ${({ theme }) => theme.borderRadius.md};
  }

  &:last-child {
    border-radius: 0 ${({ theme }) => theme.borderRadius.md} ${({ theme }) => theme.borderRadius.md} 0;
    border-left: none;
  }

  &:hover {
    background: ${({ theme, active }) => 
      active ? theme.colors.primaryDark : theme.colors.surface
    };
  }

  .view-icon {
    font-size: 1.2rem;
  }
`;

const CertificatesGrid = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: ${({ viewMode }) => 
    viewMode === 'grid' ? 'repeat(auto-fill, minmax(400px, 1fr))' : '1fr'
  };
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxxl};
  text-align: center;

  .loading-icon {
    font-size: 4rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    animation: ${shimmer} 2s infinite;
    background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
    background-size: 200% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .loading-text {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.text};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .loading-description {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.textSecondary};
    max-width: 400px;
    line-height: 1.5;
  }
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxxl};
  max-width: 600px;
  margin: 0 auto;

  .empty-icon {
    font-size: 5rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    opacity: 0.5;
  }

  .empty-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .empty-description {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  .empty-action {
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
    background: ${({ theme }) => theme.colors.gradient};
    color: white;
    border: none;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.lg};
    }
  }
`;

const CelebrationOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1000;
`;

const ConfettiPiece = styled(motion.div)`
  position: absolute;
  width: 10px;
  height: 10px;
  background: ${({ color }) => color};
  border-radius: 2px;
`;

const Certificates = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showCelebration, setShowCelebration] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    excellence: 0,
    completion: 0,
    recent: 0
  });

  useEffect(() => {
    if (!currentUser) return;

    // Create fake certificates data
    const fakeCertificatesData = [
      {
        id: 'cert1',
        studentName: currentUser.displayName || 'Student User',
        companyName: 'TechCorp Solutions',
        internshipTitle: 'Frontend Developer Intern',
        completedAt: new Date('2024-08-15'),
        generatedAt: new Date('2024-08-16'),
        performance: { 
          category: 'Excellence',
          score: 95,
          feedback: 'Outstanding performance throughout the internship'
        },
        duration: '3 months',
        department: 'Engineering',
        mentorName: 'Dr. Sarah Johnson',
        location: 'Bangalore, India',
        certificateUrl: '#',
        skills: ['React', 'JavaScript', 'HTML', 'CSS'],
        projects: ['E-commerce Platform', 'Dashboard Analytics']
      },
      {
        id: 'cert2',
        studentName: currentUser.displayName || 'Student User',
        companyName: 'Innovation Labs',
        internshipTitle: 'Full Stack Developer Intern',
        completedAt: new Date('2024-07-20'),
        generatedAt: new Date('2024-07-21'),
        performance: { 
          category: 'Completion',
          score: 88,
          feedback: 'Good technical skills and team collaboration'
        },
        duration: '6 months',
        department: 'Product Development',
        mentorName: 'Mr. Raj Patel',
        location: 'Mumbai, India',
        certificateUrl: '#',
        skills: ['Node.js', 'MongoDB', 'Express', 'React'],
        projects: ['Social Media App', 'API Development']
      },
      {
        id: 'cert3',
        studentName: currentUser.displayName || 'Student User',
        companyName: 'DataTech Analytics',
        internshipTitle: 'Python Developer Intern',
        completedAt: new Date('2024-06-10'),
        generatedAt: new Date('2024-06-11'),
        performance: { 
          category: 'Excellence',
          score: 92,
          feedback: 'Exceptional problem-solving abilities'
        },
        duration: '4 months',
        department: 'Data Science',
        mentorName: 'Dr. Priya Sharma',
        location: 'Hyderabad, India',
        certificateUrl: '#',
        skills: ['Python', 'Django', 'SQL', 'Data Analysis'],
        projects: ['Data Pipeline', 'ML Model Deployment']
      }
    ];

    // Simulate loading delay
    setTimeout(() => {
      setCertificates(fakeCertificatesData);
      calculateStats(fakeCertificatesData);
      setLoading(false);
    }, 1000);

  }, [currentUser]);

  const calculateStats = (certificatesData) => {
    const total = certificatesData.length;
    const excellence = certificatesData.filter(cert => 
      cert.performance?.category === 'Excellence'
    ).length;
    const completion = certificatesData.filter(cert => 
      cert.performance?.category === 'Completion'
    ).length;
    
    // Recent certificates (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recent = certificatesData.filter(cert => {
      const generatedDate = cert.generatedAt?.toDate ? 
        cert.generatedAt.toDate() : new Date(cert.generatedAt);
      return generatedDate > thirtyDaysAgo;
    }).length;

    setStats({ total, excellence, completion, recent });
  };

  const getFilteredCertificates = () => {
    switch (filter) {
      case 'excellence':
        return certificates.filter(cert => cert.performance?.category === 'Excellence');
      case 'completion':
        return certificates.filter(cert => cert.performance?.category === 'Completion');
      case 'recent':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return certificates.filter(cert => {
          const generatedDate = cert.generatedAt?.toDate ? 
            cert.generatedAt.toDate() : new Date(cert.generatedAt);
          return generatedDate > thirtyDaysAgo;
        });
      default:
        return certificates;
    }
  };

  const filteredCertificates = getFilteredCertificates();

  if (loading) {
    return (
      <CertificatesContainer>
        <LoadingState>
          <div className="loading-icon">🏆</div>
          <div className="loading-text">Loading Your Certificates</div>
          <div className="loading-description">
            Please wait while we fetch your achievement certificates...
          </div>
        </LoadingState>
      </CertificatesContainer>
    );
  }

  return (
    <CertificatesContainer>
      <CertificatesHeader
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="header-icon">🏆</div>
        <h1 className="header-title">My Certificates</h1>
        <p className="header-subtitle">
          Your collection of internship completion certificates and achievements. 
          Download, share, and showcase your professional accomplishments.
        </p>
      </CertificatesHeader>

      {certificates.length > 0 && (
        <>
          <StatsSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <StatCard color="#FFD700">
              <div className="stat-icon">🏆</div>
              <span className="stat-number">{stats.total}</span>
              <div className="stat-label">Total Certificates</div>
              <div className="stat-description">
                Complete collection of your achievements
              </div>
            </StatCard>

            <StatCard color="#4CAF50">
              <div className="stat-icon">⭐</div>
              <span className="stat-number">{stats.excellence}</span>
              <div className="stat-label">Excellence Awards</div>
              <div className="stat-description">
                Outstanding performance recognition
              </div>
            </StatCard>

            <StatCard color="#2196F3">
              <div className="stat-icon">✅</div>
              <span className="stat-number">{stats.completion}</span>
              <div className="stat-label">Completion Certificates</div>
              <div className="stat-description">
                Successfully completed internships
              </div>
            </StatCard>

            <StatCard color="#FF9800">
              <div className="stat-icon">🆕</div>
              <span className="stat-number">{stats.recent}</span>
              <div className="stat-label">Recent (30 days)</div>
              <div className="stat-description">
                Newly generated certificates
              </div>
            </StatCard>
          </StatsSection>

          <FilterSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="filter-controls">
              {[
                { key: 'all', label: 'All Certificates', icon: '📜' },
                { key: 'excellence', label: 'Excellence', icon: '⭐' },
                { key: 'completion', label: 'Completion', icon: '✅' },
                { key: 'recent', label: 'Recent', icon: '🆕' }
              ].map((filterOption) => (
                <FilterButton
                  key={filterOption.key}
                  active={filter === filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="filter-icon">{filterOption.icon}</span>
                  {filterOption.label}
                </FilterButton>
              ))}
            </div>

            <div className="view-controls">
              <ViewToggle
                active={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="view-icon">⊞</span>
              </ViewToggle>
              <ViewToggle
                active={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="view-icon">☰</span>
              </ViewToggle>
            </div>
          </FilterSection>
        </>
      )}

      <AnimatePresence mode="wait">
        {filteredCertificates.length === 0 ? (
          <EmptyState
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <div className="empty-icon">
              {certificates.length === 0 ? '📭' : '🔍'}
            </div>
            <h2 className="empty-title">
              {certificates.length === 0 ? 'No Certificates Yet' : 'No Matching Certificates'}
            </h2>
            <p className="empty-description">
              {certificates.length === 0 
                ? 'Complete your internships and receive mentor feedback to earn certificates. Your achievements will appear here once they\'re ready.'
                : 'No certificates match your current filter. Try selecting a different filter to view more certificates.'
              }
            </p>
            {certificates.length === 0 && (
              <button 
                className="empty-action"
                onClick={() => window.location.href = '/student/dashboard'}
              >
                View Available Internships
              </button>
            )}
          </EmptyState>
        ) : (
          <CertificatesGrid
            key="certificates"
            viewMode={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {filteredCertificates.map((certificate, index) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                index={index}
              />
            ))}
          </CertificatesGrid>
        )}
      </AnimatePresence>

      {/* Celebration Confetti */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationOverlay>
            {[...Array(30)].map((_, i) => (
              <ConfettiPiece
                key={i}
                color={['#FFD700', '#FFA500', '#4CAF50', '#2196F3', '#FF9800'][i % 5]}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                  scale: 1
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                  scale: [1, 1.2, 0.8, 1]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </CelebrationOverlay>
        )}
      </AnimatePresence>
    </CertificatesContainer>
  );
};

export default Certificates;
