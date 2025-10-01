import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const DashboardContainer = styled.div`
  min-height: calc(100vh - 70px);
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
`;

const DashboardHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const WelcomeSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ color }) => color || '#8B5CF6'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  text-align: left;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const ActionIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ActionTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ActionDescription = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const RecruiterDashboard = () => {
  const { userProfile } = useAuth();

  const stats = [
    { icon: '💼', value: '8', label: 'Active Job Posts', color: '#8B5CF6' },
    { icon: '📝', value: '142', label: 'Applications Received', color: '#3B82F6' },
    { icon: '👤', value: '23', label: 'Shortlisted Candidates', color: '#10B981' },
    { icon: '✅', value: '5', label: 'Hired This Month', color: '#F59E0B' }
  ];

  const quickActions = [
    { icon: '💼', title: 'Post New Job', description: 'Create new job opportunities for students' },
    { icon: '📋', title: 'View Applications', description: 'Review student applications and resumes' },
    { icon: '⭐', title: 'Shortlist Candidates', description: 'Select candidates for interviews' },
    { icon: '📅', title: 'Schedule Interviews', description: 'Arrange interview sessions with candidates' },
    { icon: '📊', title: 'Recruitment Analytics', description: 'Track hiring metrics and performance' },
    { icon: '🏢', title: 'Company Profile', description: 'Update company information and branding' }
  ];

  const handleActionClick = () => {
    alert('🚧 Coming Soon!\n\nThis feature is currently under development and will be available in the next update.\n\nIn the meantime, you can contact the placement office for assistance with recruitment activities.');
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <WelcomeTitle>Recruiter Dashboard</WelcomeTitle>
        <WelcomeSubtitle>
          Welcome back, {userProfile?.name || 'Recruiter'}! Find the best talent for your company.
        </WelcomeSubtitle>
      </DashboardHeader>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatIcon color={stat.color}>{stat.icon}</StatIcon>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <h2 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>Quick Actions</h2>
      <QuickActions>
        {quickActions.map((action, index) => (
          <ActionButton
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleActionClick}
          >
            <ActionIcon>{action.icon}</ActionIcon>
            <ActionTitle>{action.title}</ActionTitle>
            <ActionDescription>{action.description}</ActionDescription>
          </ActionButton>
        ))}
      </QuickActions>
    </DashboardContainer>
  );
};

export default RecruiterDashboard;
