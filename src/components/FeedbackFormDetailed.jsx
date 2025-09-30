import React, { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const FormContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const FormHeader = styled.div`
  background: ${({ theme }) => theme.colors.gradient};
  color: white;
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;

  .header-icon {
    font-size: 3rem;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    animation: ${pulse} 2s infinite;
  }

  .header-title {
    font-size: ${({ theme }) => theme.typography.fontSize.xxl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const FormBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const StudentInfo = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  .student-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};

    .student-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${({ theme }) => theme.colors.primary};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .student-name {
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text};
    }
  }
`;

const RatingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const RatingItem = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};

  .rating-label {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

const StarRating = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};

  .star {
    font-size: 1.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    color: ${({ theme }) => theme.colors.border};

    &.filled {
      color: ${({ theme }) => theme.colors.warning};
    }

    &:hover {
      transform: scale(1.1);
    }
  }
`;

const TextAreaField = styled.div`
  .textarea {
    width: 100%;
    min-height: 120px;
    padding: ${({ theme }) => theme.spacing.md};
    border: 2px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-family: inherit;
    resize: vertical;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &.primary {
    background: ${({ theme }) => theme.colors.gradient};
    color: white;

    &:hover {
      transform: translateY(-2px);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FeedbackFormDetailed = ({ 
  studentData, 
  internshipData, 
  onSubmit, 
  onSaveDraft 
}) => {
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    ratings: {
      technicalSkills: 0,
      initiative: 0,
      communication: 0,
      punctuality: 0,
      teamwork: 0,
      overallPerformance: 0
    },
    comments: '',
    status: 'draft'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingCategories = [
    { key: 'technicalSkills', label: 'Technical Skills' },
    { key: 'initiative', label: 'Initiative & Proactiveness' },
    { key: 'communication', label: 'Communication' },
    { key: 'punctuality', label: 'Punctuality & Reliability' },
    { key: 'teamwork', label: 'Teamwork & Collaboration' },
    { key: 'overallPerformance', label: 'Overall Performance' }
  ];

  const handleRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: rating
      }
    }));
  };

  const handleCommentsChange = (e) => {
    setFormData(prev => ({
      ...prev,
      comments: e.target.value
    }));
  };

  const validateForm = () => {
    const allRatingsProvided = Object.values(formData.ratings).every(rating => rating > 0);
    if (!allRatingsProvided) {
      addNotification({
        type: 'error',
        title: 'Incomplete Ratings',
        message: 'Please provide ratings for all categories.'
      });
      return false;
    }

    if (formData.comments.length < 20) {
      addNotification({
        type: 'error',
        title: 'Comments Too Short',
        message: 'Please provide at least 20 characters in your comments.'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, status: 'finalized' });
      addNotification({
        type: 'success',
        title: 'Feedback Submitted',
        message: 'Feedback finalized and certificate generation initiated.'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: 'Failed to submit feedback. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <FormHeader>
        <div className="header-icon">📋</div>
        <h1 className="header-title">Mentor Feedback & Evaluation</h1>
      </FormHeader>

      <FormBody>
        <StudentInfo>
          <div className="student-header">
            <div className="student-avatar">
              {studentData?.name?.charAt(0) || 'S'}
            </div>
            <div>
              <h3 className="student-name">{studentData?.name || 'Student Name'}</h3>
              <p>{internshipData?.role} at {internshipData?.company}</p>
            </div>
          </div>
        </StudentInfo>

        <div style={{ marginBottom: '2rem' }}>
          <h2>Performance Ratings</h2>
          <RatingGrid>
            {ratingCategories.map(category => (
              <RatingItem key={category.key}>
                <div className="rating-label">{category.label}</div>
                <StarRating>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`star ${star <= formData.ratings[category.key] ? 'filled' : ''}`}
                      onClick={() => handleRatingChange(category.key, star)}
                    >
                      ★
                    </span>
                  ))}
                </StarRating>
              </RatingItem>
            ))}
          </RatingGrid>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h2>Detailed Comments</h2>
          <TextAreaField>
            <textarea
              className="textarea"
              value={formData.comments}
              onChange={handleCommentsChange}
              placeholder="Provide detailed feedback about the student's performance..."
              rows={6}
            />
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
              {formData.comments.length}/20 characters minimum
            </div>
          </TextAreaField>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <ActionButton
            className="secondary"
            onClick={() => onSaveDraft(formData)}
          >
            Save Draft
          </ActionButton>
          <ActionButton
            className="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Finalize & Generate Certificate'}
          </ActionButton>
        </div>
      </FormBody>
    </FormContainer>
  );
};

export default FeedbackFormDetailed;
