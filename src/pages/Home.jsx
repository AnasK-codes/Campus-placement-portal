import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import FeatureCard from '../components/FeatureCard';

const HomeContainer = styled.div`
  min-height: calc(100vh - 70px);
  overflow-x: hidden;
`;

const HeroSection = styled.section`
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      ellipse at center,
      rgba(211, 47, 47, 0.1) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  text-align: center;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.1;

  span {
    background: ${({ theme }) => theme.colors.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CTAButtons = styled(motion.div)`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const CTAButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xxl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  border: 2px solid transparent;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.normal};

  &.primary {
    background: ${({ theme }) => theme.colors.gradient};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(211, 47, 47, 0.3);
    }
  }

  &.secondary {
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.border};

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primary};
      transform: translateY(-3px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 280px;
  }
`;

const FloatingElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
`;

const FloatingIcon = styled(motion.div)`
  position: absolute;
  font-size: 2rem;
  opacity: 0.1;
  color: ${({ theme }) => theme.colors.primary};
`;

const Section = styled.section`
  padding: ${({ theme }) => theme.spacing.xxl} 0;
  background: ${({ theme }) => theme.colors.surface};
`;

const SectionContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

const SectionTitle = styled(motion.h2)`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  span {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled(motion.p)`
  text-align: center;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const TestimonialsSection = styled.section`
  padding: ${({ theme }) => theme.spacing.xxl} 0;
  background: ${({ theme }) => theme.colors.background};
  text-align: center;
`;

const TestimonialContent = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;

  &::before {
    content: '"';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.primary};
    font-family: serif;
  }
`;

const TestimonialText = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
  font-style: italic;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.6;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  
  h4 {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
    margin: 0;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 0;
    font-size: 0.9rem;
  }
`;

const Home = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Smart Recommendations',
      description: 'AI-powered matching system that connects you with the best-fit internships and job opportunities based on your skills and preferences.',
    },
    {
      icon: '⚡',
      title: 'One-Click Apply',
      description: 'Apply to multiple opportunities instantly with your unified profile. No more repetitive form filling or document uploads.',
    },
    {
      icon: '✅',
      title: 'Automated Approvals',
      description: 'Streamlined faculty sign-offs and administrative approvals without the paperwork hassle. Get faster responses and decisions.',
    },
    {
      icon: '📊',
      title: 'Real-Time Tracking',
      description: 'Comprehensive dashboards for students, faculty, and placement cells to track applications, interviews, and placement statistics.',
    },
  ];

  const floatingIcons = ['🎓', '💼', '🚀', '⭐', '🎯', '💡'];

  return (
    <HomeContainer>
      <HeroSection>
        <FloatingElements>
          {floatingIcons.map((icon, index) => (
            <FloatingIcon
              key={index}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                rotate: 0,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 360],
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                ],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
                delay: index * 2,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              {icon}
            </FloatingIcon>
          ))}
        </FloatingElements>

        <HeroContent>
          <HeroTitle
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            One Platform for <span>Internships & Placements</span>
          </HeroTitle>

          <HeroSubtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            From searching to signing, streamline your career journey with smart 
            recommendations, automated processes, and real-time tracking.
          </HeroSubtitle>

          <CTAButtons
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            <CTAButton
              as={Link}
              to="/signup"
              className="primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started 🚀
            </CTAButton>
            <CTAButton
              as={Link}
              to="/about"
              className="secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More 📖
            </CTAButton>
          </CTAButtons>
        </HeroContent>
      </HeroSection>

      <Section id="features">
        <SectionContent>
          <SectionTitle
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why Choose <span>Campus Portal</span>?
          </SectionTitle>

          <SectionSubtitle
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Experience the future of campus placements with our comprehensive 
            platform designed to simplify every step of your career journey.
          </SectionSubtitle>

          <FeaturesGrid>
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </FeaturesGrid>
        </SectionContent>
      </Section>

      <TestimonialsSection id="testimonials">
        <SectionContent>
          <SectionTitle
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Trusted by <span>Students, Faculty & Recruiters</span>
          </SectionTitle>

          <TestimonialContent
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <TestimonialText>
              "Campus Portal transformed our placement process completely. What used to 
              take weeks of paperwork and coordination now happens seamlessly in days. 
              The AI recommendations are incredibly accurate, and students love the 
              one-click application feature."
            </TestimonialText>
            <TestimonialAuthor>
              <div>
                <h4>Dr. Sarah Johnson</h4>
                <p>Placement Cell Coordinator, Tech University</p>
              </div>
            </TestimonialAuthor>
          </TestimonialContent>
        </SectionContent>
      </TestimonialsSection>
    </HomeContainer>
  );
};

export default Home;
