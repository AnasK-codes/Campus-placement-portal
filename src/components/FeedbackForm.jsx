import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const FormContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #4CAF50, #66BB6A);
  }
`;

const FormHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  .title {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};

    .icon {
      font-size: 1.8rem;
    }
  }

  .subtitle {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1rem;
  }
`;

const StudentInfo = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};

  .student-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .internship-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
    
    .detail-item {
      .label {
        font-size: 0.8rem;
        color: ${({ theme }) => theme.colors.textSecondary};
        margin-bottom: ${({ theme }) => theme.spacing.xs};
      }
      
      .value {
        font-weight: 600;
        color: ${({ theme }) => theme.colors.text};
      }
    }
  }
`;

const RatingsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }

  .ratings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const RatingItem = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 2px solid ${({ theme, focused }) => focused ? theme.colors.primary : theme.colors.border};
  transition: all ${({ theme }) => theme.transitions.fast};

  .rating-label {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-size: 1rem;
  }

  .stars-container {
    display: flex;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .rating-description {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    text-align: center;
  }
`;

const Star = styled(motion.button)`
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: ${({ filled, theme }) => filled ? '#FFD700' : theme.colors.border};
  transition: all ${({ theme }) => theme.transitions.fast};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: 50%;

  &:hover {
    color: #FFD700;
    transform: scale(1.1);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const TextFeedbackSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const TextArea = styled(motion.textarea)`
  width: 100%;
  min-height: 150px;
  padding: ${({ theme }) => theme.spacing.lg};
  border: 2px solid ${({ theme, focused, hasError }) => 
    hasError ? '#f44336' : 
    focused ? theme.colors.primary : 
    theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const SentimentIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ sentiment }) => {
    switch (sentiment) {
      case 'positive': return 'rgba(76, 175, 80, 0.1)';
      case 'negative': return 'rgba(244, 67, 54, 0.1)';
      case 'neutral': return 'rgba(158, 158, 158, 0.1)';
      default: return 'transparent';
    }
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ sentiment }) => {
    switch (sentiment) {
      case 'positive': return '#4CAF50';
      case 'negative': return '#f44336';
      case 'neutral': return '#9E9E9E';
      default: return 'transparent';
    }
  }};

  .sentiment-icon {
    font-size: 1.2rem;
  }

  .sentiment-text {
    font-size: 0.9rem;
    font-weight: 500;
    color: ${({ sentiment }) => {
      switch (sentiment) {
        case 'positive': return '#4CAF50';
        case 'negative': return '#f44336';
        case 'neutral': return '#9E9E9E';
        default: return 'inherit';
      }
    }};
  }
`;

const CharacterCount = styled.div`
  text-align: right;
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: 0.8rem;
  color: ${({ theme, isNearLimit }) => isNearLimit ? '#FF9800' : theme.colors.textSecondary};
`;

const SubmitButton = styled(motion.button)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme, disabled }) => disabled ? theme.colors.border : theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 600;
  font-size: 1.1rem;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled)::before {
    left: 100%;
  }

  .icon {
    font-size: 1.2rem;
  }
`;

const NotificationToast = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${({ type }) => 
    type === 'success' ? 'linear-gradient(135deg, #4CAF50, #66BB6A)' : 
    'linear-gradient(135deg, #f44336, #ef5350)'};
  color: white;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.xl};
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: 600;

  .icon {
    font-size: 1.2rem;
  }
`;

const AIMascot = styled(motion.div)`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 999;

  &:hover {
    transform: scale(1.1);
  }
`;

const FeedbackForm = ({ application, onSubmit, onCancel }) => {
  const [ratings, setRatings] = useState({
    technicalSkills: 0,
    communication: 0,
    punctuality: 0,
    projectCompletion: 0,
    teamwork: 0,
    overall: 0
  });

  const [textFeedback, setTextFeedback] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [showMascot, setShowMascot] = useState(false);

  const ratingCategories = [
    { key: 'technicalSkills', label: 'Technical Skills', description: 'Problem-solving and technical competency' },
    { key: 'communication', label: 'Communication', description: 'Clarity in verbal and written communication' },
    { key: 'punctuality', label: 'Punctuality', description: 'Timeliness and reliability' },
    { key: 'projectCompletion', label: 'Project Completion', description: 'Ability to deliver projects on time' },
    { key: 'teamwork', label: 'Teamwork', description: 'Collaboration and team integration' },
    { key: 'overall', label: 'Overall Performance', description: 'General assessment of internship performance' }
  ];

  const maxCharacters = 1000;

  // Simple sentiment analysis (prototype)
  const analyzeSentiment = (text) => {
    if (!text || text.length < 10) return null;

    const positiveWords = ['excellent', 'outstanding', 'great', 'good', 'impressive', 'dedicated', 'hardworking', 'talented', 'skilled', 'professional', 'reliable', 'creative', 'innovative'];
    const negativeWords = ['poor', 'bad', 'terrible', 'disappointing', 'unprofessional', 'unreliable', 'lazy', 'careless', 'inadequate', 'unsatisfactory'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  const handleRatingChange = (category, rating) => {
    setRatings(prev => ({ ...prev, [category]: rating }));
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxCharacters) {
      setTextFeedback(text);
      setSentiment(analyzeSentiment(text));
    }
  };

  const validateForm = () => {
    const hasAllRatings = Object.values(ratings).every(rating => rating > 0);
    const hasTextFeedback = textFeedback.trim().length >= 20;
    
    return hasAllRatings && hasTextFeedback;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setNotification({ type: 'error', message: 'Please complete all ratings and provide detailed feedback (minimum 20 characters).' });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    setLoading(true);
    try {
      const feedbackData = {
        ratings,
        textFeedback: textFeedback.trim(),
        sentiment: sentiment,
        submittedAt: serverTimestamp(),
        mentorId: application.mentorId
      };

      // Update application with mentor feedback
      await updateDoc(doc(db, 'applications', application.id), {
        mentorFeedback: feedbackData,
        status: 'feedback_submitted',
        updatedAt: serverTimestamp()
      });

      setShowMascot(true);
      setNotification({ type: 'success', message: 'Feedback submitted successfully! Certificate generation initiated.' });
      
      setTimeout(() => {
        setNotification(null);
        setShowMascot(false);
        if (onSubmit) onSubmit(feedbackData);
      }, 3000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setNotification({ type: 'error', message: 'Failed to submit feedback. Please try again.' });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '👍';
      case 'negative': return '👎';
      case 'neutral': return '😐';
      default: return '';
    }
  };

  const getSentimentText = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'Positive feedback detected';
      case 'negative': return 'Consider adding constructive suggestions';
      case 'neutral': return 'Neutral tone detected';
      default: return '';
    }
  };

  return (
    <>
      <FormContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <FormHeader>
          <div className="title">
            <span className="icon">📝</span>
            Mentor Feedback Form
          </div>
          <div className="subtitle">
            Provide comprehensive feedback for the completed internship
          </div>
        </FormHeader>

        <StudentInfo>
          <div className="student-name">{application.studentName}</div>
          <div className="internship-details">
            <div className="detail-item">
              <div className="label">Company</div>
              <div className="value">{application.companyName}</div>
            </div>
            <div className="detail-item">
              <div className="label">Role</div>
              <div className="value">{application.internshipTitle}</div>
            </div>
            <div className="detail-item">
              <div className="label">Duration</div>
              <div className="value">{application.duration || '3 months'}</div>
            </div>
            <div className="detail-item">
              <div className="label">Completion Date</div>
              <div className="value">
                {application.completedAt ? 
                  new Date(application.completedAt.toDate()).toLocaleDateString() : 
                  'Recently completed'
                }
              </div>
            </div>
          </div>
        </StudentInfo>

        <RatingsSection>
          <div className="section-title">
            <span>⭐</span>
            Performance Ratings
          </div>
          <div className="ratings-grid">
            {ratingCategories.map((category) => (
              <RatingItem
                key={category.key}
                focused={focusedField === category.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: ratingCategories.indexOf(category) * 0.1 }}
                onFocus={() => setFocusedField(category.key)}
                onBlur={() => setFocusedField(null)}
              >
                <div className="rating-label">{category.label}</div>
                <div className="stars-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      filled={star <= ratings[category.key]}
                      onClick={() => handleRatingChange(category.key, star)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ⭐
                    </Star>
                  ))}
                </div>
                <div className="rating-description">{category.description}</div>
              </RatingItem>
            ))}
          </div>
        </RatingsSection>

        <TextFeedbackSection>
          <div className="section-title">
            <span>💬</span>
            Detailed Feedback
          </div>
          <TextArea
            value={textFeedback}
            onChange={handleTextChange}
            onFocus={() => setFocusedField('textFeedback')}
            onBlur={() => setFocusedField(null)}
            focused={focusedField === 'textFeedback'}
            placeholder="Provide detailed feedback about the student's performance, strengths, areas for improvement, and overall contribution during the internship..."
            initial={{ height: 150 }}
            animate={{ height: focusedField === 'textFeedback' ? 200 : 150 }}
            transition={{ duration: 0.3 }}
          />
          
          <CharacterCount isNearLimit={textFeedback.length > maxCharacters * 0.8}>
            {textFeedback.length}/{maxCharacters} characters
          </CharacterCount>

          <AnimatePresence>
            {sentiment && (
              <SentimentIndicator
                sentiment={sentiment}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <span className="sentiment-icon">{getSentimentIcon(sentiment)}</span>
                <span className="sentiment-text">{getSentimentText(sentiment)}</span>
              </SentimentIndicator>
            )}
          </AnimatePresence>
        </TextFeedbackSection>

        <SubmitButton
          onClick={handleSubmit}
          disabled={loading || !validateForm()}
          whileHover={{ scale: validateForm() ? 1.02 : 1 }}
          whileTap={{ scale: validateForm() ? 0.98 : 1 }}
        >
          <span className="icon">{loading ? '⏳' : '📤'}</span>
          {loading ? 'Submitting Feedback...' : 'Submit Feedback & Generate Certificate'}
        </SubmitButton>
      </FormContainer>

      {/* AI Mascot */}
      <AnimatePresence>
        {showMascot && (
          <AIMascot
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            🤖
          </AIMascot>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <NotificationToast
            type={notification.type}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <span className="icon">
              {notification.type === 'success' ? '✅' : '❌'}
            </span>
            {notification.message}
          </NotificationToast>
        )}
      </AnimatePresence>
    </>
  );
};

export default FeedbackForm;
