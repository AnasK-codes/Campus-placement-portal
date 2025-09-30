import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(5deg); }
  50% { transform: translateY(-5px) rotate(0deg); }
  75% { transform: translateY(-15px) rotate(-5deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
`;

const LoadingContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 25%, #FFFFFF 50%, #F8F9FA 75%, #FFFFFF 100%);
  background-size: 400% 400%;
  animation: ${gradientShift} 4s ease infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  
  ${({ theme }) => theme.colors.background === '#121212' && `
    background: linear-gradient(135deg, #121212 0%, #1E1E1E 25%, #121212 50%, #1E1E1E 75%, #121212 100%);
    background-size: 400% 400%;
  `}
`;

const LogoContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
`;

const Logo = styled(motion.div)`
  width: 120px;
  height: 120px;
  background: ${({ theme }) => theme.colors.gradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: white;
  box-shadow: ${({ theme }) => theme.shadows.xl};
  animation: ${float} 3s ease-in-out infinite;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: ${({ theme }) => theme.colors.gradient};
    border-radius: 50%;
    z-index: -1;
    opacity: 0.3;
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -20px;
    left: -20px;
    right: -20px;
    bottom: -20px;
    background: ${({ theme }) => theme.colors.gradient};
    border-radius: 50%;
    z-index: -2;
    opacity: 0.1;
    animation: ${pulse} 2s ease-in-out infinite 0.5s;
  }
`;

const BrandText = styled(motion.div)`
  margin-top: 1.5rem;
  text-align: center;
  
  .title {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 0.5rem;
    background: ${({ theme }) => theme.colors.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .subtitle {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 500;
  }
`;

const LoadingBar = styled.div`
  width: 300px;
  height: 4px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    width: 250px;
  }
`;

const LoadingProgress = styled(motion.div)`
  height: 100%;
  background: ${({ theme }) => theme.colors.gradient};
  border-radius: 2px;
  transform-origin: left;
`;

const LoadingText = styled(motion.div)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 2rem;
`;

const ParticleContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
`;

const Particle = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  opacity: 0.6;
`;

const LoadingScreen = ({ 
  progress = 0, 
  message = "Loading...", 
  showProgress = true,
  showParticles = true 
}) => {
  // Generate particles for background animation
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      scale: 1.1,
      transition: { duration: 0.3 }
    }
  };

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20,
        delay: 0.2 
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.5, duration: 0.5 }
    }
  };

  const progressVariants = {
    hidden: { scaleX: 0 },
    visible: { 
      scaleX: progress / 100,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (custom) => ({
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
      y: [0, -50, -100],
      transition: {
        duration: custom.duration,
        delay: custom.delay,
        repeat: Infinity,
        ease: "easeOut"
      }
    })
  };

  return (
    <LoadingContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {showParticles && (
        <ParticleContainer>
          {particles.map((particle) => (
            <Particle
              key={particle.id}
              custom={particle}
              variants={particleVariants}
              initial="hidden"
              animate="visible"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
            />
          ))}
        </ParticleContainer>
      )}

      <LogoContainer>
        <Logo
          variants={logoVariants}
          initial="hidden"
          animate="visible"
        >
          🎓
        </Logo>
        
        <BrandText
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="title">Campus Portal</div>
          <div className="subtitle">Your Gateway to Success</div>
        </BrandText>
      </LogoContainer>

      {showProgress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <LoadingBar>
            <LoadingProgress
              variants={progressVariants}
              initial="hidden"
              animate="visible"
            />
          </LoadingBar>
          
          <LoadingText
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {message} {progress > 0 && `${Math.round(progress)}%`}
          </LoadingText>
        </motion.div>
      )}

      {!showProgress && (
        <LoadingText
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          {message}
        </LoadingText>
      )}
    </LoadingContainer>
  );
};

// Hook for managing loading states
export const useLoadingScreen = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [message, setMessage] = React.useState("Loading...");

  const startLoading = (initialMessage = "Loading...") => {
    setIsLoading(true);
    setProgress(0);
    setMessage(initialMessage);
  };

  const updateProgress = (newProgress, newMessage) => {
    setProgress(newProgress);
    if (newMessage) setMessage(newMessage);
  };

  const finishLoading = () => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 500);
  };

  return {
    isLoading,
    progress,
    message,
    startLoading,
    updateProgress,
    finishLoading,
  };
};

export default LoadingScreen;
