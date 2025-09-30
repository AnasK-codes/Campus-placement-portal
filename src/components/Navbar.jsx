import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { logOut } from '../firebase';

const NavbarContainer = styled(motion.nav)`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: ${({ theme }) => theme.colors.background};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: all ${({ theme }) => theme.transitions.normal};
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;

  @media (max-width: 768px) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transitions.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LogoIcon = styled(motion.div)`
  width: 40px;
  height: 40px;
  background: ${({ theme }) => theme.colors.gradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-weight: 500;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surface};
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 20px;
      height: 2px;
      background: ${({ theme }) => theme.colors.primary};
      border-radius: 1px;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Button = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 0.9rem;
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  border: 2px solid transparent;

  &.primary {
    background: ${({ theme }) => theme.colors.gradient};
    color: white;
    border-color: ${({ theme }) => theme.colors.primary};

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${({ theme }) => theme.shadows.md};
    }
  }

  &.secondary {
    background: transparent;
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.border};

    &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  @media (max-width: 480px) {
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
    font-size: 0.8rem;
  }
`;

const ThemeToggle = styled(motion.button)`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

const MobileMenuButton = styled(motion.button)`
  display: none;
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
  }

  span {
    width: 20px;
    height: 2px;
    background: ${({ theme }) => theme.colors.text};
    transition: all ${({ theme }) => theme.transitions.fast};
    transform-origin: center;

    &:nth-child(1) {
      transform: ${({ isOpen }) => isOpen ? 'rotate(45deg) translateY(6px)' : 'none'};
    }

    &:nth-child(2) {
      opacity: ${({ isOpen }) => isOpen ? '0' : '1'};
    }

    &:nth-child(3) {
      transform: ${({ isOpen }) => isOpen ? 'rotate(-45deg) translateY(-6px)' : 'none'};
    }
  }
`;

const MobileMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileNavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-weight: 500;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  text-align: center;

  &:hover, &.active {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const UserMenu = styled(motion.div)`
  position: relative;
  display: inline-block;
`;

const UserButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 0.9rem;
  }

  .info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    
    .name {
      font-size: 0.9rem;
      font-weight: 600;
    }
    
    .role {
      font-size: 0.7rem;
      color: ${({ theme }) => theme.colors.primary};
      text-transform: uppercase;
    }
  }

  @media (max-width: 768px) {
    .info {
      display: none;
    }
  }
`;

const UserDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  min-width: 200px;
  overflow: hidden;
  z-index: 1000;
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  .icon {
    font-size: 1.1rem;
  }
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  width: 100%;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  .icon {
    font-size: 1.1rem;
  }
`;

const RoleBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background: rgba(211, 47, 47, 0.1);
  color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

const Navbar = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { currentUser, userProfile, userRole, hasRole, getUserStatus, isEmailVerified } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
  ];

  // Add role-specific nav items
  if (currentUser && isEmailVerified()) {
    if (hasRole(['placement', 'admin'])) {
      navItems.push({ path: '/admin/role-approvals', label: 'Role Approvals' });
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student': return '🎓';
      case 'faculty': return '👨‍🏫';
      case 'placement': return '📋';
      case 'recruiter': return '🏢';
      case 'admin': return '👑';
      default: return '👤';
    }
  };

  const userStatus = getUserStatus();

  return (
    <NavbarContainer
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <NavContent>
        <Logo to="/">
          <LogoIcon
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            🎓
          </LogoIcon>
          <span>Campus Portal</span>
        </Logo>

        <NavLinks>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.label}
            </NavLink>
          ))}
        </NavLinks>

        <ActionButtons>
          <ThemeToggle
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            <motion.span
              key={isDarkMode ? 'moon' : 'sun'}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </motion.span>
          </ThemeToggle>

          {currentUser ? (
            <UserMenu>
              <UserButton
                onClick={toggleUserMenu}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="avatar">
                  {getInitials(userProfile?.name || currentUser.displayName)}
                </div>
                <div className="info">
                  <div className="name">
                    {userProfile?.name || currentUser.displayName || 'User'}
                  </div>
                  <div className="role">
                    {getRoleIcon(userRole)} {userRole || 'pending'}
                  </div>
                </div>
                <span>▼</span>
              </UserButton>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <UserDropdown
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DropdownItem to={getDashboardPath()} onClick={() => setIsUserMenuOpen(false)}>
                      <span className="icon">🏠</span>
                      Dashboard
                    </DropdownItem>
                    
                    {hasRole(['placement', 'admin']) && (
                      <DropdownItem to="/admin/role-approvals" onClick={() => setIsUserMenuOpen(false)}>
                        <span className="icon">👥</span>
                        Role Approvals
                      </DropdownItem>
                    )}
                    
                    <DropdownItem to="/profile" onClick={() => setIsUserMenuOpen(false)}>
                      <span className="icon">👤</span>
                      Profile
                    </DropdownItem>
                    
                    <DropdownItem to="/settings" onClick={() => setIsUserMenuOpen(false)}>
                      <span className="icon">⚙️</span>
                      Settings
                    </DropdownItem>
                    
                    <DropdownButton onClick={handleSignOut}>
                      <span className="icon">🚪</span>
                      Sign Out
                    </DropdownButton>
                  </UserDropdown>
                )}
              </AnimatePresence>
            </UserMenu>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  as={Link}
                  to="/auth/login"
                  className="secondary"
                >
                  Login
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  as={Link}
                  to="/auth/signup"
                  className="primary"
                >
                  Sign Up
                </Button>
              </motion.div>
            </>
          )}

          <MobileMenuButton
            onClick={toggleMobileMenu}
            isOpen={isMobileMenuOpen}
            whileTap={{ scale: 0.9 }}
          >
            <span />
            <span />
            <span />
          </MobileMenuButton>
        </ActionButtons>
      </NavContent>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navItems.map((item) => (
              <MobileNavLink
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </MobileNavLink>
            ))}
          </MobileMenu>
        )}
      </AnimatePresence>
    </NavbarContainer>
  );
};

export default Navbar;
