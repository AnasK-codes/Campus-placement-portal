import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

const TestContainer = styled.div`
  min-height: calc(100vh - 70px);
  padding: ${({ theme }) => theme.spacing.xl} 0;
  background: ${({ theme }) => theme.colors.surface};
`;

const TestContent = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const TestHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto;
`;

const TestCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Question = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const QuestionText = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.5;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Option = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme, selected }) => 
    selected ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, selected }) => 
    selected ? 'white' : theme.colors.text};
  border: 2px solid ${({ theme, selected }) => 
    selected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  text-align: left;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  font-size: 1rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const TestControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const TestInfo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.gradient : theme.colors.surface};
  color: ${({ theme, variant }) => 
    variant === 'primary' ? 'white' : theme.colors.text};
  border: 2px solid ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResultsCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xxl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
`;

const ScoreDisplay = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme, score }) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  }};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ScoreLabel = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

// Mock questions for different categories
const mockQuestions = {
  technical: [
    {
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correct: 1
    },
    {
      question: "Which data structure uses LIFO principle?",
      options: ["Queue", "Stack", "Array", "Linked List"],
      correct: 1
    },
    {
      question: "What does SQL stand for?",
      options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "System Query Language"],
      correct: 0
    },
    {
      question: "Which of the following is not a programming paradigm?",
      options: ["Object-Oriented", "Functional", "Procedural", "Algorithmic"],
      correct: 3
    },
    {
      question: "What is the purpose of a constructor in OOP?",
      options: ["To destroy objects", "To initialize objects", "To copy objects", "To compare objects"],
      correct: 1
    }
  ],
  aptitude: [
    {
      question: "If a train travels 60 km in 45 minutes, what is its speed in km/hr?",
      options: ["75 km/hr", "80 km/hr", "85 km/hr", "90 km/hr"],
      correct: 1
    },
    {
      question: "What is 15% of 240?",
      options: ["32", "36", "38", "42"],
      correct: 1
    },
    {
      question: "If the ratio of boys to girls in a class is 3:2 and there are 25 students total, how many boys are there?",
      options: ["12", "13", "15", "18"],
      correct: 2
    },
    {
      question: "A shopkeeper sells an item for ₹120 after giving a 20% discount. What was the original price?",
      options: ["₹140", "₹144", "₹150", "₹160"],
      correct: 2
    },
    {
      question: "Complete the series: 2, 6, 12, 20, 30, ?",
      options: ["40", "42", "44", "46"],
      correct: 1
    }
  ],
  reasoning: [
    {
      question: "All roses are flowers. Some flowers are red. Therefore:",
      options: ["All roses are red", "Some roses are red", "No roses are red", "Cannot be determined"],
      correct: 3
    },
    {
      question: "If CODING is written as DPEJOH, how is FLOWER written?",
      options: ["GMPXFS", "GMPWER", "GKPVDS", "GMPXFR"],
      correct: 0
    },
    {
      question: "Find the odd one out: Dog, Cat, Lion, Car",
      options: ["Dog", "Cat", "Lion", "Car"],
      correct: 3
    },
    {
      question: "If today is Monday, what day will it be after 100 days?",
      options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      correct: 1
    },
    {
      question: "A is taller than B. C is shorter than B. Who is the shortest?",
      options: ["A", "B", "C", "Cannot be determined"],
      correct: 2
    }
  ]
};

const MockTest = () => {
  const { currentUser } = useAuth();
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [testCategory, setTestCategory] = useState('technical');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (testStarted && !testCompleted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTestCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, testCompleted]);

  const startTest = (category) => {
    setTestCategory(category);
    setQuestions(mockQuestions[category]);
    setTestStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setTimeLeft(600);
  };

  const selectAnswer = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: optionIndex
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitTest = () => {
    setTestCompleted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setTimeLeft(600);
  };

  if (testCompleted) {
    const score = calculateScore();
    return (
      <TestContainer>
        <TestContent>
          <TestHeader>
            <Title>
              🎯 Test Results
            </Title>
          </TestHeader>
          
          <ResultsCard
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ScoreDisplay score={score}>
              {score}%
            </ScoreDisplay>
            <ScoreLabel>
              You scored {calculateScore()} out of {questions.length} questions correctly!
            </ScoreLabel>
            
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                <strong>Performance Analysis:</strong>
              </p>
              <p style={{ color: score >= 80 ? '#4caf50' : score >= 60 ? '#ff9800' : '#f44336' }}>
                {score >= 80 ? '🎉 Excellent! You have a strong understanding of the concepts.' :
                 score >= 60 ? '👍 Good job! Keep practicing to improve further.' :
                 '📚 Keep studying! Focus on the areas you missed.'}
              </p>
            </div>

            <ActionButton
              variant="primary"
              onClick={resetTest}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Take Another Test
            </ActionButton>
          </ResultsCard>
        </TestContent>
      </TestContainer>
    );
  }

  if (!testStarted) {
    return (
      <TestContainer>
        <TestContent>
          <TestHeader>
            <Title>
              🧠 Mock Test Generator
            </Title>
            <Subtitle>
              Practice with AI-generated tests to prepare for your placement interviews.
              Choose a category and test your knowledge!
            </Subtitle>
          </TestHeader>

          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {Object.keys(mockQuestions).map((category) => (
              <TestCard
                key={category}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.02 }}
              >
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  marginBottom: '1rem',
                  textTransform: 'capitalize',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {category === 'technical' ? '💻' : category === 'aptitude' ? '🔢' : '🧩'} 
                  {category} Test
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  marginBottom: '2rem',
                  lineHeight: '1.6'
                }}>
                  {category === 'technical' ? 'Test your programming and technical knowledge' :
                   category === 'aptitude' ? 'Practice numerical and quantitative problems' :
                   'Improve your logical reasoning skills'}
                </p>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-secondary)', 
                  marginBottom: '1.5rem' 
                }}>
                  📝 {mockQuestions[category].length} Questions • ⏱️ 10 Minutes
                </p>
                <ActionButton
                  variant="primary"
                  onClick={() => startTest(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ width: '100%' }}
                >
                  Start {category.charAt(0).toUpperCase() + category.slice(1)} Test
                </ActionButton>
              </TestCard>
            ))}
          </div>
        </TestContent>
      </TestContainer>
    );
  }

  return (
    <TestContainer>
      <TestContent>
        <TestHeader>
          <Title>
            {testCategory === 'technical' ? '💻' : testCategory === 'aptitude' ? '🔢' : '🧩'} 
            {testCategory.charAt(0).toUpperCase() + testCategory.slice(1)} Test
          </Title>
        </TestHeader>

        <TestCard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Question>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <span style={{ 
                fontSize: '1rem', 
                color: 'var(--text-secondary)',
                fontWeight: '600'
              }}>
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span style={{ 
                fontSize: '1rem', 
                color: timeLeft < 60 ? '#f44336' : 'var(--primary)',
                fontWeight: '600'
              }}>
                ⏱️ {formatTime(timeLeft)}
              </span>
            </div>
            
            <QuestionText>
              {questions[currentQuestion]?.question}
            </QuestionText>

            <OptionsContainer>
              {questions[currentQuestion]?.options.map((option, index) => (
                <Option
                  key={index}
                  selected={selectedAnswers[currentQuestion] === index}
                  onClick={() => selectAnswer(index)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                </Option>
              ))}
            </OptionsContainer>
          </Question>

          <TestControls>
            <TestInfo>
              <span>📊 Progress: {Object.keys(selectedAnswers).length}/{questions.length} answered</span>
            </TestInfo>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <ActionButton
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ← Previous
              </ActionButton>

              {currentQuestion === questions.length - 1 ? (
                <ActionButton
                  variant="primary"
                  onClick={submitTest}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Submit Test 🎯
                </ActionButton>
              ) : (
                <ActionButton
                  variant="primary"
                  onClick={nextQuestion}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next →
                </ActionButton>
              )}
            </div>
          </TestControls>
        </TestCard>
      </TestContent>
    </TestContainer>
  );
};

export default MockTest;
