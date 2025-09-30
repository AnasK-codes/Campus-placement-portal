import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const AboutContainer = styled.div`
  min-height: calc(100vh - 70px);
  padding: ${({ theme }) => theme.spacing.xxl} 0;
`;

const Section = styled.section`
  padding: ${({ theme }) => theme.spacing.xxl} 0;

  &:nth-child(even) {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const SectionContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const Title = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  span {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.xxl};
  align-items: center;
  margin: ${({ theme }) => theme.spacing.xxl} 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
    text-align: center;
  }
`;

const TextContent = styled(motion.div)`
  h2 {
    font-size: 2.2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.lg};

    span {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  p {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.7;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  ul {
    list-style: none;
    padding: 0;
    margin: ${({ theme }) => theme.spacing.lg} 0;

    li {
      display: flex;
      align-items: center;
      gap: ${({ theme }) => theme.spacing.md};
      margin-bottom: ${({ theme }) => theme.spacing.md};
      font-size: 1.05rem;
      color: ${({ theme }) => theme.colors.text};

      &::before {
        content: '✓';
        background: ${({ theme }) => theme.colors.gradient};
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.8rem;
        flex-shrink: 0;
      }
    }
  }
`;

const IllustrationContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.xxl};
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
      circle at center,
      rgba(211, 47, 47, 0.05) 0%,
      transparent 70%
    );
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};
  position: relative;
  z-index: 1;
`;

const IconItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};

  .icon {
    font-size: 2.5rem;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .label {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    text-align: center;
  }
`;

const ProcessSection = styled.div`
  margin: ${({ theme }) => theme.spacing.xxl} 0;
`;

const ProcessTitle = styled(motion.h2)`
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ProcessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const ProcessStep = styled(motion.div)`
  text-align: center;
  position: relative;

  &:not(:last-child)::after {
    content: '→';
    position: absolute;
    top: 40px;
    right: -${({ theme }) => theme.spacing.xl};
    font-size: 2rem;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: bold;

    @media (max-width: 768px) {
      content: '↓';
      top: auto;
      bottom: -${({ theme }) => theme.spacing.xl};
      right: 50%;
      transform: translateX(50%);
    }
  }
`;

const StepIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.gradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  position: relative;

  &::before {
    content: '${props => props.step}';
    position: absolute;
    top: -10px;
    right: -10px;
    width: 30px;
    height: 30px;
    background: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.background};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: bold;
  }
`;

const StepTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StepDescription = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
`;

const CTASection = styled.div`
  text-align: center;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.xxl};
  margin: ${({ theme }) => theme.spacing.xxl} 0;
`;

const CTATitle = styled(motion.h2)`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CTADescription = styled(motion.p)`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const CTAButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xxl};
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(211, 47, 47, 0.3);
  }
`;

const About = () => {
  const processSteps = [
    {
      icon: '👤',
      title: 'Create Profile',
      description: 'Build your comprehensive profile with skills, achievements, and career preferences.',
    },
    {
      icon: '🎯',
      title: 'Get Matched',
      description: 'Our AI analyzes your profile and matches you with relevant opportunities.',
    },
    {
      icon: '📝',
      title: 'Apply & Interview',
      description: 'Apply with one click and track your interview schedules seamlessly.',
    },
    {
      icon: '🎉',
      title: 'Get Placed',
      description: 'Receive offers, complete formalities, and start your career journey.',
    },
  ];

  const benefits = [
    'No more scattered WhatsApp groups',
    'Eliminate repetitive form filling',
    'Automated faculty approvals',
    'Real-time application tracking',
    'AI-powered job matching',
    'Centralized communication hub',
  ];

  return (
    <AboutContainer>
      <Section>
        <SectionContent>
          <HeroSection>
            <Title
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              About <span>Campus Portal</span>
            </Title>
            <Subtitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Revolutionizing campus placements with intelligent technology and 
              streamlined processes for students, faculty, and recruiters.
            </Subtitle>
          </HeroSection>

          <TwoColumnLayout>
            <TextContent
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2>Why This <span>Portal</span>?</h2>
              <p>
                Traditional campus placement processes are fragmented, time-consuming, 
                and frustrating for everyone involved. Students struggle with multiple 
                platforms, faculty deal with endless paperwork, and recruiters face 
                inefficient coordination.
              </p>
              <p>
                Our platform transforms this chaos into a seamless, intelligent system 
                that benefits all stakeholders:
              </p>
              <ul>
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {benefit}
                  </motion.li>
                ))}
              </ul>
            </TextContent>

            <IllustrationContainer
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <IconGrid>
                <IconItem
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="icon">👨‍🎓</div>
                  <div className="label">Students</div>
                </IconItem>
                <IconItem
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="icon">🤝</div>
                  <div className="label">Connect</div>
                </IconItem>
                <IconItem
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="icon">🏢</div>
                  <div className="label">Recruiters</div>
                </IconItem>
                <IconItem
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="icon">👩‍🏫</div>
                  <div className="label">Faculty</div>
                </IconItem>
                <IconItem
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="icon">🎯</div>
                  <div className="label">AI Match</div>
                </IconItem>
                <IconItem
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="icon">📊</div>
                  <div className="label">Analytics</div>
                </IconItem>
              </IconGrid>
            </IllustrationContainer>
          </TwoColumnLayout>
        </SectionContent>
      </Section>

      <Section>
        <SectionContent>
          <ProcessSection>
            <ProcessTitle
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              How It <span>Works</span>
            </ProcessTitle>

            <ProcessGrid>
              {processSteps.map((step, index) => (
                <ProcessStep
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <StepIcon step={index + 1}>
                    {step.icon}
                  </StepIcon>
                  <StepTitle>{step.title}</StepTitle>
                  <StepDescription>{step.description}</StepDescription>
                </ProcessStep>
              ))}
            </ProcessGrid>
          </ProcessSection>

          <CTASection>
            <CTATitle
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Ready to <span>Transform</span> Your Career Journey?
            </CTATitle>
            <CTADescription
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Join thousands of students who have already simplified their placement 
              process. Create your profile today and experience the future of campus placements.
            </CTADescription>
            <CTAButton
              as={Link}
              to="/signup"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Sign Up Now 🚀
            </CTAButton>
          </CTASection>
        </SectionContent>
      </Section>
    </AboutContainer>
  );
};

export default About;
