import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const SettingsContainer = styled.div`
  min-height: calc(100vh - 70px);
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.surface};
`;

const SettingsHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
`;

const SettingsCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SettingsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const SettingDescription = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ active }) => active ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all ${({ theme }) => theme.transitions.fast};
  }
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ variant, theme }) => 
    variant === 'danger' ? '#EF4444' : theme.colors.primary
  };
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

const Settings = () => {
  const { currentUser, logOut } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SettingsContainer>
      <SettingsHeader>
        <Title>Settings</Title>
        <Subtitle>Manage your account preferences and security settings</Subtitle>
      </SettingsHeader>

      <SettingsCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SettingsSection>
          <SectionTitle>Appearance</SectionTitle>
          <SettingItem>
            <SettingInfo>
              <SettingLabel>Dark Mode</SettingLabel>
              <SettingDescription>
                Switch between light and dark themes
              </SettingDescription>
            </SettingInfo>
            <ToggleSwitch 
              active={isDarkMode} 
              onClick={toggleTheme}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>Notifications</SectionTitle>
          <SettingItem>
            <SettingInfo>
              <SettingLabel>Push Notifications</SettingLabel>
              <SettingDescription>
                Receive notifications about important updates
              </SettingDescription>
            </SettingInfo>
            <ToggleSwitch 
              active={notifications} 
              onClick={() => setNotifications(!notifications)}
            />
          </SettingItem>
          <SettingItem>
            <SettingInfo>
              <SettingLabel>Email Updates</SettingLabel>
              <SettingDescription>
                Get email notifications for placement opportunities
              </SettingDescription>
            </SettingInfo>
            <ToggleSwitch 
              active={emailUpdates} 
              onClick={() => setEmailUpdates(!emailUpdates)}
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>Account</SectionTitle>
          <SettingItem>
            <SettingInfo>
              <SettingLabel>Email Address</SettingLabel>
              <SettingDescription>
                {currentUser?.email || 'Not available'}
              </SettingDescription>
            </SettingInfo>
            <ActionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Change Email
            </ActionButton>
          </SettingItem>
          <SettingItem>
            <SettingInfo>
              <SettingLabel>Password</SettingLabel>
              <SettingDescription>
                Last updated: Never
              </SettingDescription>
            </SettingInfo>
            <ActionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Change Password
            </ActionButton>
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <SectionTitle>Security</SectionTitle>
          <SettingItem>
            <SettingInfo>
              <SettingLabel>Sign Out</SettingLabel>
              <SettingDescription>
                Sign out of your account on this device
              </SettingDescription>
            </SettingInfo>
            <ActionButton
              variant="danger"
              onClick={handleSignOut}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign Out
            </ActionButton>
          </SettingItem>
        </SettingsSection>
      </SettingsCard>
    </SettingsContainer>
  );
};

export default Settings;
