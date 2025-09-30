import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const DashboardContainer = styled.div`
  min-height: calc(100vh - 70px);
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
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
  margin-bottom: ${({ theme }) => theme.spacing.xl};
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

const StudentDashboard = () => {
  const { userProfile } = useAuth();

  const stats = [
    { icon: '📝', value: '5', label: 'Applications Sent', color: '#EF4444' },
    { icon: '👀', value: '12', label: 'Profile Views', color: '#3B82F6' },
    { icon: '💼', value: '23', label: 'Available Jobs', color: '#10B981' },
    { icon: '⭐', value: '2', label: 'Interview Calls', color: '#F59E0B' }
  ];

  return (
    <DashboardContainer>
      <WelcomeTitle>Student Dashboard</WelcomeTitle>
      <WelcomeSubtitle>
        Welcome back, {userProfile?.name || 'Student'}! Track your placement journey.
      </WelcomeSubtitle>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {stat.value}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
          </StatCard>
        ))}
      </StatsGrid>
    </DashboardContainer>
  );
};

export default StudentDashboard;
