import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ParticleCanvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  opacity: 0.6;
`;

const ParticleBackground = ({ 
  particleCount = 50,
  particleColor,
  particleSize = 2,
  connectionDistance = 150,
  animationSpeed = 0.5,
  showConnections = true,
  interactive = true
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * animationSpeed;
        this.vy = (Math.random() - 0.5) * animationSpeed;
        this.size = Math.random() * particleSize + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

        // Keep particles within bounds
        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));

        // Interactive effect with mouse
        if (interactive) {
          const dx = mouseRef.current.x - this.x;
          const dy = mouseRef.current.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const force = (100 - distance) / 100;
            this.vx += (dx / distance) * force * 0.01;
            this.vy += (dy / distance) * force * 0.01;
          }
        }
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = particleColor || '#D32F2F';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize particles
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
      particlesRef.current = particles;
    };

    // Draw connections between nearby particles
    const drawConnections = () => {
      if (!showConnections) return;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (connectionDistance - distance) / connectionDistance * 0.3;
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = particleColor || '#D32F2F';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      drawConnections();

      animationRef.current = requestAnimationFrame(animate);
    };

    // Mouse move handler
    const handleMouseMove = (event) => {
      mouseRef.current.x = event.clientX;
      mouseRef.current.y = event.clientY;
    };

    // Initialize
    resizeCanvas();
    initParticles();
    animate();

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [particleCount, particleColor, particleSize, connectionDistance, animationSpeed, showConnections, interactive]);

  return <ParticleCanvas ref={canvasRef} />;
};

// Preset configurations
export const HomeParticles = () => (
  <ParticleBackground
    particleCount={60}
    particleSize={3}
    connectionDistance={120}
    animationSpeed={0.3}
    showConnections={true}
    interactive={true}
  />
);

export const DashboardParticles = () => (
  <ParticleBackground
    particleCount={30}
    particleSize={2}
    connectionDistance={100}
    animationSpeed={0.2}
    showConnections={false}
    interactive={false}
  />
);

export const AuthParticles = () => (
  <ParticleBackground
    particleCount={40}
    particleSize={2.5}
    connectionDistance={80}
    animationSpeed={0.4}
    showConnections={true}
    interactive={true}
  />
);

// React component version using CSS animations (lighter alternative)
const CSSParticleContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
`;

const CSSParticle = styled(motion.div)`
  position: absolute;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  background: ${({ color, theme }) => color || theme.colors.primary};
  border-radius: 50%;
  opacity: 0.4;
`;

export const CSSParticleBackground = ({ 
  particleCount = 20,
  particleColor,
  minSize = 2,
  maxSize = 6
}) => {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    size: Math.random() * (maxSize - minSize) + minSize,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  const floatVariants = {
    animate: (custom) => ({
      x: [0, Math.random() * 100 - 50, 0],
      y: [0, Math.random() * 100 - 50, 0],
      opacity: [0.2, 0.6, 0.2],
      transition: {
        duration: custom.duration,
        delay: custom.delay,
        repeat: Infinity,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <CSSParticleContainer>
      {particles.map((particle) => (
        <CSSParticle
          key={particle.id}
          size={particle.size}
          color={particleColor}
          custom={particle}
          variants={floatVariants}
          initial={{ opacity: 0 }}
          animate="animate"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
        />
      ))}
    </CSSParticleContainer>
  );
};

export default ParticleBackground;
