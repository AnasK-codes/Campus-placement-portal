import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase';
import Charts from './Charts';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
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

  .change {
    font-size: 0.8rem;
    color: ${({ changeType }) => 
      changeType === 'positive' ? '#4CAF50' : 
      changeType === 'negative' ? '#f44336' : 
      'var(--text-secondary)'};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  align-items: center;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  label {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: ${({ theme }) => theme.spacing.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
  }
`;

const ApplicationsList = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const ListHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ApplicationItem = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ApplicationInfo = styled.div`
  flex: 1;

  .student-name {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .internship-title {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 0.9rem;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .company-name {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.8rem;
  }
`;

const StatusBadge = styled.div`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ status }) => {
    switch (status) {
      case 'pending': return 'rgba(255, 152, 0, 0.1)';
      case 'reviewed': return 'rgba(33, 150, 243, 0.1)';
      case 'interviewed': return 'rgba(156, 39, 176, 0.1)';
      case 'offered': return 'rgba(76, 175, 80, 0.1)';
      case 'rejected': return 'rgba(244, 67, 54, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'reviewed': return '#2196F3';
      case 'interviewed': return '#9C27B0';
      case 'offered': return '#4CAF50';
      case 'rejected': return '#f44336';
      default: return '#9E9E9E';
    }
  }};
  border: 1px solid ${({ status }) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'reviewed': return '#2196F3';
      case 'interviewed': return '#9C27B0';
      case 'offered': return '#4CAF50';
      case 'rejected': return '#f44336';
      default: return '#9E9E9E';
    }
  }};
`;

const ChartsSection = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
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

const ApplicationsOverview = ({ detailed = false }) => {
  const [applications, setApplications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    internship: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    interviewed: 0,
    offered: 0,
    rejected: 0
  });

  useEffect(() => {
    // Load applications
    const applicationsQuery = query(
      collection(db, 'applications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeApplications = onSnapshot(applicationsQuery, (snapshot) => {
      const apps = [];
      snapshot.forEach((doc) => {
        apps.push({ id: doc.id, ...doc.data() });
      });
      setApplications(apps);
      
      // Calculate stats
      const newStats = {
        total: apps.length,
        pending: apps.filter(app => app.status === 'pending').length,
        reviewed: apps.filter(app => app.status === 'reviewed').length,
        interviewed: apps.filter(app => app.status === 'interviewed').length,
        offered: apps.filter(app => app.status === 'offered').length,
        rejected: apps.filter(app => app.status === 'rejected').length
      };
      setStats(newStats);
    });

    // Load internships for filter dropdown
    const loadInternships = async () => {
      try {
        const internshipsQuery = query(collection(db, 'internships'));
        const snapshot = await getDocs(internshipsQuery);
        const internshipsList = [];
        snapshot.forEach((doc) => {
          internshipsList.push({ id: doc.id, ...doc.data() });
        });
        setInternships(internshipsList);
      } catch (error) {
        console.error('Error loading internships:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInternships();

    return () => {
      unsubscribeApplications();
    };
  }, []);

  const filteredApplications = applications.filter(app => {
    if (filters.status !== 'all' && app.status !== filters.status) return false;
    if (filters.internship !== 'all' && app.internshipId !== filters.internship) return false;
    if (filters.search && !app.studentName?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInternshipTitle = (internshipId) => {
    const internship = internships.find(i => i.id === internshipId);
    return internship ? `${internship.role} at ${internship.company}` : 'Unknown Internship';
  };

  const getCompanyName = (internshipId) => {
    const internship = internships.find(i => i.id === internshipId);
    return internship ? internship.company : 'Unknown Company';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Header>
        <Title>
          <span className="icon">📋</span>
          Applications Overview
        </Title>
      </Header>

      <StatsGrid>
        <StatCard
          color="#2196F3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="number">{stats.total}</span>
          <div className="label">Total Applications</div>
          <div className="change">📈 All time</div>
        </StatCard>

        <StatCard
          color="#FF9800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <span className="number">{stats.pending}</span>
          <div className="label">Pending Review</div>
          <div className="change">⏳ Needs attention</div>
        </StatCard>

        <StatCard
          color="#9C27B0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span className="number">{stats.interviewed}</span>
          <div className="label">Interviewed</div>
          <div className="change">🎯 In progress</div>
        </StatCard>

        <StatCard
          color="#4CAF50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <span className="number">{stats.offered}</span>
          <div className="label">Offers Made</div>
          <div className="change">✅ Success rate: {stats.total > 0 ? Math.round((stats.offered / stats.total) * 100) : 0}%</div>
        </StatCard>
      </StatsGrid>

      {detailed && (
        <>
          <FilterSection>
            <FilterGroup>
              <label>Status:</label>
              <Select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="interviewed">Interviewed</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </Select>
            </FilterGroup>

            <FilterGroup>
              <label>Internship:</label>
              <Select
                value={filters.internship}
                onChange={(e) => setFilters(prev => ({ ...prev, internship: e.target.value }))}
              >
                <option value="all">All Internships</option>
                {internships.map(internship => (
                  <option key={internship.id} value={internship.id}>
                    {internship.role} at {internship.company}
                  </option>
                ))}
              </Select>
            </FilterGroup>

            <SearchInput
              type="text"
              placeholder="Search by student name..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </FilterSection>

          <ContentGrid>
            <ApplicationsList>
              <ListHeader>
                📋 Recent Applications ({filteredApplications.length})
              </ListHeader>
              
              {filteredApplications.length === 0 ? (
                <EmptyState>
                  <div className="icon">📭</div>
                  <h3>No Applications Found</h3>
                  <p>No applications match your current filters.</p>
                </EmptyState>
              ) : (
                <AnimatePresence>
                  {filteredApplications.slice(0, detailed ? 50 : 10).map((application, index) => (
                    <ApplicationItem
                      key={application.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ApplicationInfo>
                        <div className="student-name">{application.studentName || 'Unknown Student'}</div>
                        <div className="internship-title">{getInternshipTitle(application.internshipId)}</div>
                        <div className="company-name">{getCompanyName(application.internshipId)} • Applied {formatDate(application.createdAt)}</div>
                      </ApplicationInfo>
                      <StatusBadge status={application.status}>
                        {application.status || 'pending'}
                      </StatusBadge>
                    </ApplicationItem>
                  ))}
                </AnimatePresence>
              )}
            </ApplicationsList>

            <ChartsSection>
              <Charts 
                applications={applications}
                internships={internships}
                stats={stats}
              />
            </ChartsSection>
          </ContentGrid>
        </>
      )}
    </Container>
  );
};

export default ApplicationsOverview;
