import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CardContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const CompanyInfo = styled.div`
  flex: 1;
`;

const CompanyName = styled.h3`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const RoleName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const StipendBadge = styled.div`
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SkillsContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SkillsLabel = styled.h5`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SkillsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SkillTag = styled.span`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InfoItem = styled.div`
  text-align: center;
  
  .label {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
  
  .value {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
  }
`;

const PreviewBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 0.7rem;
  font-weight: 600;
  transform: rotate(15deg);
`;

const EligibilitySection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const EligibilityGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const EligibilityItem = styled.div`
  .label {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
  
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const InternshipCard = ({ internship, preview = false }) => {
  const formatStipend = (min, max) => {
    if (!min) return 'Not specified';
    if (!max || min === max) return `₹${parseInt(min).toLocaleString()}`;
    return `₹${parseInt(min).toLocaleString()} - ₹${parseInt(max).toLocaleString()}`;
  };

  const formatArray = (arr) => {
    if (!arr || arr.length === 0) return 'Not specified';
    if (arr.length <= 2) return arr.join(', ');
    return `${arr.slice(0, 2).join(', ')} +${arr.length - 2} more`;
  };

  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ position: 'relative' }}
    >
      {preview && <PreviewBadge>PREVIEW</PreviewBadge>}
      
      <CardHeader>
        <CompanyInfo>
          <CompanyName>{internship.company || 'Company Name'}</CompanyName>
          <RoleName>{internship.role || 'Role Title'}</RoleName>
        </CompanyInfo>
        <StipendBadge>
          {formatStipend(internship.stipendMin, internship.stipendMax)}
        </StipendBadge>
      </CardHeader>

      {internship.description && (
        <Description>{internship.description}</Description>
      )}

      <InfoGrid>
        <InfoItem>
          <div className="label">Duration</div>
          <div className="value">{internship.duration || 'Not specified'}</div>
        </InfoItem>
        <InfoItem>
          <div className="label">Seats</div>
          <div className="value">{internship.seats || 'Not specified'}</div>
        </InfoItem>
        <InfoItem>
          <div className="label">Location</div>
          <div className="value">{internship.location || 'Not specified'}</div>
        </InfoItem>
        <InfoItem>
          <div className="label">Type</div>
          <div className="value">{internship.type || 'Full-time'}</div>
        </InfoItem>
      </InfoGrid>

      {internship.skills && internship.skills.length > 0 && (
        <SkillsContainer>
          <SkillsLabel>Required Skills</SkillsLabel>
          <SkillsList>
            {internship.skills.slice(0, 8).map((skill, index) => (
              <SkillTag key={index}>{skill}</SkillTag>
            ))}
            {internship.skills.length > 8 && (
              <SkillTag>+{internship.skills.length - 8} more</SkillTag>
            )}
          </SkillsList>
        </SkillsContainer>
      )}

      <EligibilitySection>
        <SkillsLabel>Eligibility</SkillsLabel>
        <EligibilityGrid>
          <EligibilityItem>
            <div className="label">Departments</div>
            <div className="tags">
              {internship.departments && internship.departments.length > 0 ? (
                internship.departments.slice(0, 3).map((dept, index) => (
                  <SkillTag key={index}>{dept}</SkillTag>
                ))
              ) : (
                <SkillTag>All Departments</SkillTag>
              )}
              {internship.departments && internship.departments.length > 3 && (
                <SkillTag>+{internship.departments.length - 3}</SkillTag>
              )}
            </div>
          </EligibilityItem>
          <EligibilityItem>
            <div className="label">Years</div>
            <div className="tags">
              {internship.years && internship.years.length > 0 ? (
                internship.years.slice(0, 3).map((year, index) => (
                  <SkillTag key={index}>{year}</SkillTag>
                ))
              ) : (
                <SkillTag>All Years</SkillTag>
              )}
              {internship.years && internship.years.length > 3 && (
                <SkillTag>+{internship.years.length - 3}</SkillTag>
              )}
            </div>
          </EligibilityItem>
        </EligibilityGrid>
      </EligibilitySection>

      <CardFooter>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {internship.conversionPotential && (
            <span>🎯 Conversion Possible</span>
          )}
          {preview && (
            <span>👁️ Preview Mode</span>
          )}
        </div>
        {!preview && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {internship.applicationsCount || 0} applications
          </div>
        )}
      </CardFooter>
    </CardContainer>
  );
};

export default InternshipCard;
