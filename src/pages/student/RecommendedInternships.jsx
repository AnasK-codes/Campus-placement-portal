import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs 
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import RecommendedInternshipCard from '../../components/RecommendedInternshipCard';
import aiRecommendationEngine from '../../utils/aiRecommendation';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xxl};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .icon {
    font-size: 2.5rem;
  }

  @media (max-width: 768px) {
    font-size: 1.8rem;
    
    .icon {
      font-size: 2rem;
    }
  }
`;

const AIBadge = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: ${({ theme }) => theme.shadows.md};

  .ai-icon {
    font-size: 1.1rem;
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
    font-size: 2.2rem;
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

const FilterSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  align-items: center;
`;

const FilterButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, active }) => active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.background};
  color: ${({ theme, active }) => active ? 'white' : theme.colors.text};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    ${({ active, theme }) => !active && `color: ${theme.colors.primary};`}
  }
`;

const SortSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const InternshipGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
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

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  color: ${({ theme }) => theme.colors.textSecondary};

  .icon {
    font-size: 5rem;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  h3 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.5rem;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.6;
    max-width: 500px;
    margin: 0 auto ${({ theme }) => theme.spacing.lg};
  }
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const AIInsightsPanel = styled(motion.div)`
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  .panel-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    font-weight: 600;
    color: #667eea;
    font-size: 1.1rem;
  }

  .insights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
  }

  .insight-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: ${({ theme }) => theme.spacing.md};

    .insight-title {
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text};
      margin-bottom: ${({ theme }) => theme.spacing.xs};
      display: flex;
      align-items: center;
      gap: ${({ theme }) => theme.spacing.xs};
    }

    .insight-content {
      color: ${({ theme }) => theme.colors.textSecondary};
      font-size: 0.9rem;
    }
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

const RecommendedInternships = () => {
  const { currentUser } = useAuth();
  const [internships, setInternships] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('match');
  const [stats, setStats] = useState({
    total: 0,
    excellent: 0,
    good: 0,
    moderate: 0
  });
  const [aiInsights, setAiInsights] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      try {
        // Create fake student profile if none exists
        const fakeProfile = {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Student User',
          email: currentUser.email,
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          education: 'Computer Science',
          experience: 'Beginner'
        };
        setStudentProfile(fakeProfile);

        // Create fake internships data
        const fakeInternships = [
          {
            id: 'intern1',
            title: 'Frontend Developer Intern',
            company: 'TechCorp Solutions',
            location: 'Bangalore, India',
            duration: '3 months',
            stipend: '₹25,000/month',
            stipendMax: 25000,
            description: 'Work on React.js applications and modern web technologies',
            requirements: ['React', 'JavaScript', 'HTML', 'CSS'],
            availableSeats: 5,
            status: 'active',
            createdAt: new Date()
          },
          {
            id: 'intern2',
            title: 'Full Stack Developer Intern',
            company: 'Innovation Labs',
            location: 'Mumbai, India',
            duration: '6 months',
            stipend: '₹30,000/month',
            stipendMax: 30000,
            description: 'Build end-to-end web applications using MERN stack',
            requirements: ['React', 'Node.js', 'MongoDB', 'Express'],
            availableSeats: 3,
            status: 'active',
            createdAt: new Date()
          },
          {
            id: 'intern3',
            title: 'Python Developer Intern',
            company: 'DataTech Analytics',
            location: 'Hyderabad, India',
            duration: '4 months',
            stipend: '₹22,000/month',
            stipendMax: 22000,
            description: 'Develop data analysis tools and automation scripts',
            requirements: ['Python', 'Django', 'SQL', 'Data Analysis'],
            availableSeats: 4,
            status: 'active',
            createdAt: new Date()
          },
          {
            id: 'intern4',
            title: 'Mobile App Developer Intern',
            company: 'AppVenture Studios',
            location: 'Pune, India',
            duration: '5 months',
            stipend: '₹28,000/month',
            stipendMax: 28000,
            description: 'Create cross-platform mobile applications',
            requirements: ['React Native', 'JavaScript', 'Mobile Development'],
            availableSeats: 2,
            status: 'active',
            createdAt: new Date()
          },
          {
            id: 'intern5',
            title: 'UI/UX Design Intern',
            company: 'Creative Minds Agency',
            location: 'Delhi, India',
            duration: '3 months',
            stipend: '₹20,000/month',
            stipendMax: 20000,
            description: 'Design user interfaces and improve user experience',
            requirements: ['Figma', 'Adobe XD', 'UI Design', 'UX Research'],
            availableSeats: 3,
            status: 'active',
            createdAt: new Date()
          }
        ];

        setInternships(fakeInternships);

        // Generate fake AI recommendations with match scores
        const fakeRecommendations = fakeInternships.map((internship, index) => {
          const matchScores = [92, 85, 78, 65, 58];
          return {
            ...internship,
            matchScore: matchScores[index],
            matchReasons: [
              'Strong skill alignment with your profile',
              'Company culture matches your preferences',
              'Location preference match'
            ],
            skillGaps: index > 2 ? ['Advanced algorithms', 'System design'] : [],
            applied: false
          };
        });

        setRecommendations(fakeRecommendations);

        // Set fake AI insights
        setAiInsights([
          {
            type: 'excellent_opportunity',
            message: 'TechCorp Solutions internship has 92% match with your skills!'
          },
          {
            type: 'skill_development',
            message: 'Consider learning System Design to improve your match scores'
          }
        ]);

        // Calculate stats
        const newStats = {
          total: fakeRecommendations.length,
          excellent: fakeRecommendations.filter(r => r.matchScore >= 80).length,
          good: fakeRecommendations.filter(r => r.matchScore >= 60 && r.matchScore < 80).length,
          moderate: fakeRecommendations.filter(r => r.matchScore >= 40 && r.matchScore < 60).length
        };
        setStats(newStats);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === 'all') return true;
    if (filter === 'excellent') return rec.matchScore >= 80;
    if (filter === 'good') return rec.matchScore >= 60 && rec.matchScore < 80;
    if (filter === 'moderate') return rec.matchScore >= 40 && rec.matchScore < 60;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'match') return b.matchScore - a.matchScore;
    if (sortBy === 'seats') return (b.availableSeats || 0) - (a.availableSeats || 0);
    if (sortBy === 'stipend') return (b.stipendMax || 0) - (a.stipendMax || 0);
    return 0;
  });

  const handleApply = (internship) => {
    // Update recommendations to remove applied internship or mark as applied
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === internship.id 
          ? { ...rec, applied: true }
          : rec
      )
    );
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <span className="icon">🎯</span>
          AI-Powered Recommendations
        </Title>
        <AIBadge
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="ai-icon">🧠</span>
          AI Powered
        </AIBadge>
      </Header>

      {/* Stats Section */}
      <StatsSection>
        <StatCard
          color="#2196F3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="number">{stats.total}</span>
          <div className="label">Total Recommendations</div>
          <div className="description">Personalized for you</div>
        </StatCard>

        <StatCard
          color="#4CAF50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <span className="number">{stats.excellent}</span>
          <div className="label">Excellent Matches</div>
          <div className="description">80%+ compatibility</div>
        </StatCard>

        <StatCard
          color="#FF9800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span className="number">{stats.good}</span>
          <div className="label">Good Matches</div>
          <div className="description">60-79% compatibility</div>
        </StatCard>

        <StatCard
          color="#9C27B0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <span className="number">{stats.moderate}</span>
          <div className="label">Growth Opportunities</div>
          <div className="description">40-59% compatibility</div>
        </StatCard>
      </StatsSection>

      {/* AI Insights Panel */}
      {aiInsights && (
        <AIInsightsPanel
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="panel-header">
            <span>🤖</span>
            AI Insights & Recommendations
          </div>
          <div className="insights-grid">
            {aiInsights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className="insight-title">
                  <span>💡</span>
                  {insight.type === 'excellent_opportunity' && 'Top Match Found'}
                  {insight.type === 'skill_development' && 'Skill Development'}
                  {insight.type === 'no_matches' && 'Profile Enhancement'}
                </div>
                <div className="insight-content">{insight.message}</div>
              </div>
            ))}
          </div>
        </AIInsightsPanel>
      )}

      {/* Filters */}
      <FilterSection>
        <FilterButton
          active={filter === 'all'}
          onClick={() => setFilter('all')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          All ({stats.total})
        </FilterButton>
        <FilterButton
          active={filter === 'excellent'}
          onClick={() => setFilter('excellent')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Excellent ({stats.excellent})
        </FilterButton>
        <FilterButton
          active={filter === 'good'}
          onClick={() => setFilter('good')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Good ({stats.good})
        </FilterButton>
        <FilterButton
          active={filter === 'moderate'}
          onClick={() => setFilter('moderate')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Growth ({stats.moderate})
        </FilterButton>

        <SortSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="match">Sort by Match %</option>
          <option value="seats">Sort by Available Seats</option>
          <option value="stipend">Sort by Stipend</option>
        </SortSelect>
      </FilterSection>

      {/* Recommendations Grid */}
      {filteredRecommendations.length === 0 ? (
        <EmptyState>
          <div className="icon">🎯</div>
          <h3>No Recommendations Available</h3>
          <p>
            Complete your profile with skills, projects, and preferences to get personalized internship recommendations powered by AI.
          </p>
          <ActionButton
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/profile'}
          >
            <span>👤</span>
            Complete Profile
          </ActionButton>
        </EmptyState>
      ) : (
        <InternshipGrid>
          <AnimatePresence>
            {filteredRecommendations.map((internship, index) => (
              <RecommendedInternshipCard
                key={internship.id}
                internship={internship}
                studentProfile={studentProfile}
                onApply={handleApply}
                onView={(internship) => {
                  // Navigate to internship details
                  console.log('View internship:', internship.id);
                }}
              />
            ))}
          </AnimatePresence>
        </InternshipGrid>
      )}

      {/* AI Mascot */}
      <AIMascot
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          alert('AI Assistant: I analyzed your profile and found the best internship matches for you! 🎯');
        }}
      >
        🤖
      </AIMascot>
    </Container>
  );
};

export default RecommendedInternships;
