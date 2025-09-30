import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const TransitionContainer = styled(motion.div)`
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
`;

const PageWrapper = styled(motion.div)`
  width: 100%;
  min-height: 100vh;
  position: relative;
`;

const LoadingOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.background};
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid ${({ theme }) => theme.colors.border};
    border-top: 3px solid ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PageTransition = ({ 
  children, 
  className,
  transitionKey,
  loading = false,
  customVariants,
  ...props 
}) => {
  const location = useLocation();
  const key = transitionKey || location.pathname;

  // Default page transition variants
  const defaultVariants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.98,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Alternative transition variants
  const slideVariants = {
    initial: {
      opacity: 0,
      x: 100,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const fadeVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  const scaleVariants = {
    initial: {
      opacity: 0,
      scale: 0.9,
    },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  // Select variants based on route or custom prop
  const getVariants = () => {
    if (customVariants) return customVariants;
    
    // Route-specific transitions
    if (key.includes('/dashboard')) return slideVariants;
    if (key.includes('/profile')) return scaleVariants;
    if (key.includes('/auth')) return fadeVariants;
    
    return defaultVariants;
  };

  const variants = getVariants();

  return (
    <TransitionContainer className={className} {...props}>
      <AnimatePresence mode="wait">
        {loading && (
          <LoadingOverlay
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="spinner" />
          </LoadingOverlay>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <PageWrapper
          key={key}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </PageWrapper>
      </AnimatePresence>
    </TransitionContainer>
  );
};

// Stagger children animation wrapper
export const StaggerContainer = ({ children, className, delay = 0.1 }) => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: delay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
};

// Individual stagger item
export const StaggerItem = ({ children, className, index = 0 }) => {
  const itemVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={itemVariants}
      custom={index}
    >
      {children}
    </motion.div>
  );
};

// Scroll-triggered animation
export const ScrollReveal = ({ 
  children, 
  className, 
  threshold = 0.1,
  triggerOnce = true 
}) => {
  const revealVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: triggerOnce, amount: threshold }}
    >
      {children}
    </motion.div>
  );
};

// Route-specific transition components
export const DashboardTransition = ({ children, ...props }) => (
  <PageTransition customVariants={slideVariants} {...props}>
    {children}
  </PageTransition>
);

export const AuthTransition = ({ children, ...props }) => (
  <PageTransition customVariants={fadeVariants} {...props}>
    {children}
  </PageTransition>
);

export const ProfileTransition = ({ children, ...props }) => (
  <PageTransition customVariants={scaleVariants} {...props}>
    {children}
  </PageTransition>
);

// Smooth scroll utility
export const smoothScrollTo = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Hook for page transitions
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return { isTransitioning };
};

export default PageTransition;
