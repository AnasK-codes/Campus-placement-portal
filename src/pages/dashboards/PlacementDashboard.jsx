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
  background: ${({ color }) => color || '#F59E0B'};
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

const PlacementDashboard = () => {
  const { userProfile } = useAuth();

  const stats = [
    { icon: '🎯', value: '234', label: 'Active Placements', color: '#F59E0B' },
    { icon: '🏢', value: '67', label: 'Partner Companies', color: '#3B82F6' },
    { icon: '📈', value: '89%', label: 'Placement Success', color: '#10B981' },
    { icon: '⏰', value: '15', label: 'Pending Approvals', color: '#EF4444' }
  ];

  const quickActions = [
    { icon: '🏢', title: 'Manage Companies', description: 'Add and manage company partnerships' },
    { icon: '💼', title: 'Job Postings', description: 'Create and manage job opportunities' },
    { icon: '👥', title: 'Student Management', description: 'Oversee student applications and profiles' },
    { icon: '📊', title: 'Placement Reports', description: 'Generate comprehensive placement analytics' },
    { icon: '✅', title: 'Approve Applications', description: 'Review and approve student applications' },
    { icon: '📅', title: 'Schedule Drives', description: 'Organize campus recruitment drives' }
  ];

  const handleActionClick = () => {
    alert('🚧 Coming Soon!\n\nThis feature is currently under development and will be available in the next update.\n\nFor immediate assistance, please contact the system administrator.');
  };

  return (
    <DashboardContainer>
      <DashboardHeader>
        <WelcomeTitle>Placement Dashboard</WelcomeTitle>
        <WelcomeSubtitle>
          Welcome back, {userProfile?.name || 'Placement Officer'}! Manage campus placements efficiently.
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

export default PlacementDashboard;
