import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing.xxl} 0 ${({ theme }) => theme.spacing.lg};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
    text-align: center;
  }
`;

const FooterSection = styled.div`
  h3 {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`;

const FooterLinks = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const FooterLink = styled(motion.li)`
  a {
    color: ${({ theme }) => theme.colors.textSecondary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};
    font-size: 0.9rem;

    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialLink = styled(motion.a)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  font-size: 1.2rem;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: translateY(-2px);
  }
`;

const CompanyInfo = styled.div`
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
    line-height: 1.6;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`;

const ContactInfo = styled.div`
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.9rem;
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};

    @media (max-width: 768px) {
      justify-content: center;
    }
  }

  span {
    font-weight: 500;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85rem;
  margin: 0;
`;

const LegalLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};

  a {
    color: ${({ theme }) => theme.colors.textSecondary};
    text-decoration: none;
    font-size: 0.85rem;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const Footer = () => {
  const { userRole } = useAuth();
  const currentYear = new Date().getFullYear();

  const getDashboardPath = () => {
    if (!userRole) return '/dashboard';
    
    switch (userRole) {
      case 'admin':
        return '/admin';
      case 'faculty':
        return '/faculty';
      case 'placement':
        return '/placement';
      case 'recruiter':
        return '/recruiter';
      case 'student':
        return '/student';
      default:
        return '/dashboard';
    }
  };

  const linkVariants = {
    hover: {
      x: 5,
      transition: { duration: 0.2 }
    }
  };

  const socialVariants = {
    hover: {
      scale: 1.1,
      y: -2,
      transition: { duration: 0.2 }
    }
  };

  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <h3>About Campus Portal</h3>
            <CompanyInfo>
              <p>
                Streamlining the campus placement process with smart technology. 
                From internship searches to final placements, we make career 
                journeys seamless for students, faculty, and recruiters.
              </p>
            </CompanyInfo>
            <SocialLinks>
              <SocialLink
                href="#"
                variants={socialVariants}
                whileHover="hover"
                aria-label="Follow us on LinkedIn"
              >
                💼
              </SocialLink>
              <SocialLink
                href="#"
                variants={socialVariants}
                whileHover="hover"
                aria-label="Follow us on Twitter"
              >
                🐦
              </SocialLink>
              <SocialLink
                href="#"
                variants={socialVariants}
                whileHover="hover"
                aria-label="Follow us on Instagram"
              >
                📷
              </SocialLink>
              <SocialLink
                href="#"
                variants={socialVariants}
                whileHover="hover"
                aria-label="Subscribe to our YouTube channel"
              >
                📺
              </SocialLink>
            </SocialLinks>
          </FooterSection>

          <FooterSection>
            <h3>Quick Links</h3>
            <FooterLinks>
              <FooterLink variants={linkVariants} whileHover="hover">
                <Link to="/">Home</Link>
              </FooterLink>
              <FooterLink variants={linkVariants} whileHover="hover">
                <Link to="/about">About Us</Link>
              </FooterLink>
              <FooterLink variants={linkVariants} whileHover="hover">
                <Link to={getDashboardPath()}>Dashboard</Link>
              </FooterLink>
              <FooterLink variants={linkVariants} whileHover="hover">
                <a href="#features">Features</a>
              </FooterLink>
              <FooterLink variants={linkVariants} whileHover="hover">
                <a href="#testimonials">Testimonials</a>
              </FooterLink>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h3>For Students</h3>
            <FooterLinks>
              <FooterLink variants={linkVariants} whileHover="hover">
                <Link to="/signup">Create Profile</Link>
              </FooterLink>
              <FooterLink variants={linkVariants} whileHover="hover">
                <a href="#internships">Find Internships</a>
              </FooterLink>
              <FooterLink variants={linkVariants} whileHover="hover">
                <a href="#placements">Job Placements</a>
              </FooterLink>
              <FooterLink variants={linkVariants} whileHover="hover">
                <a href="#resources">Career Resources</a>
              </FooterLink>
              <FooterLink variants={linkVariants} whileHover="hover">
                <a href="#support">Student Support</a>
              </FooterLink>
            </FooterLinks>
          </FooterSection>

          <FooterSection>
            <h3>Contact Info</h3>
            <ContactInfo>
              <p>
                <span>📧</span>
                support@campusportal.edu
              </p>
              <p>
                <span>📞</span>
                +1 (555) 123-4567
              </p>
              <p>
                <span>📍</span>
                123 University Ave, Campus City
              </p>
              <p>
                <span>🕒</span>
                Mon-Fri: 9AM-6PM
              </p>
            </ContactInfo>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <Copyright>
            © {currentYear} Campus Placement Portal. All rights reserved.
          </Copyright>
          <LegalLinks>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookies">Cookie Policy</a>
          </LegalLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;
