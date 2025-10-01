import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";

const DashboardContainer = styled.div`
  min-height: calc(100vh - 70px);
  padding: ${({ theme }) => theme.spacing.xxl} 0;
  background: ${({ theme }) => theme.colors.surface};
`;

const DashboardContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

const WelcomeCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.gradient};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
  color: white;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.1"/><circle cx="10" cy="90" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    pointer-events: none;
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;
  z-index: 1;
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.gradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
`;

const StatValue = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatLabel = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  margin: 0;
`;

const FeaturesSection = styled.section`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.xxl};
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  text-align: center;

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FeaturesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FeatureItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateX(5px);
  }
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.gradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
`;

const FeatureContent = styled.div`
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.4;
  }
`;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stats, setStats] = useState([
    { icon: "📊", value: "12", label: "Applications Submitted" },
    { icon: "🎯", value: "3", label: "Interviews Scheduled" },
    { icon: "✅", value: "1", label: "Offers Received" },
    { icon: "📈", value: "85%", label: "Profile Completion" },
  ]);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    // Keep the fake data - no Firebase queries to avoid overriding
    setProfileCompletion(85);
    
    // Stats are already set in useState with fake data, no need to override
  }, [currentUser]);

  const features = [
    {
      icon: "🎓",
      title: "Smart Job Matching",
      description:
        "AI-powered recommendations based on your skills and preferences",
    },
    {
      icon: "📝",
      title: "One-Click Applications",
      description: "Apply to multiple opportunities with your unified profile",
    },
    {
      icon: "🤖",
      title: "Mock Test Generator",
      description: "Practice with AI-generated tests for placement preparation",
    },
    {
      icon: "💬",
      title: "Peer Doubt Solver",
      description: "Get help from peers and mentors for your academic queries",
    },
    {
      icon: "📊",
      title: "Progress Analytics",
      description: "Track your application status and interview performance",
    },
    {
      icon: "🔔",
      title: "Real-time Notifications",
      description: "Stay updated with application status and new opportunities",
    },
  ];

  return (
    <DashboardContainer>
      <DashboardContent>
        <WelcomeCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <WelcomeTitle>Welcome to Your Dashboard! 🎉</WelcomeTitle>
          <WelcomeSubtitle>
            You're successfully logged in to the Campus Placement Portal. Start
            exploring the features to accelerate your career journey.
          </WelcomeSubtitle>
          <QuickActions>
            <ActionButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/profile")}
            >
              Complete Profile
            </ActionButton>
            <ActionButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/jobs")}
            >
              Browse Jobs
            </ActionButton>
            <ActionButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/student/mock-test")}
            >
              Take Mock Test
            </ActionButton>
          </QuickActions>
        </WelcomeCard>

        <StatsGrid>
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <StatIcon>{stat.icon}</StatIcon>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatCard>
          ))}
        </StatsGrid>

        <FeaturesSection>
          <SectionTitle>
            Available <span>Features</span>
          </SectionTitle>
          <FeaturesList>
            {features.map((feature, index) => (
              <FeatureItem
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureContent>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </FeatureContent>
              </FeatureItem>
            ))}
          </FeaturesList>
        </FeaturesSection>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default StudentDashboard;
