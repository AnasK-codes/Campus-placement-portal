import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';
import CalendarView from '../../components/CalendarView';
import PendingInterviewsList from '../../components/PendingInterviewsList';
import conflictChecker from '../../utils/conflictChecker';
import notificationManager from '../../utils/notifications';

const DashboardContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 70px);
  background: ${({ theme }) => theme.colors.surface};
`;

const Sidebar = styled(motion.aside)`
  width: ${({ collapsed }) => collapsed ? '80px' : '280px'};
  background: ${({ theme }) => theme.colors.background};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  transition: width ${({ theme }) => theme.transitions.normal};
  position: relative;
  z-index: 100;

  @media (max-width: 768px) {
    position: fixed;
    left: ${({ collapsed }) => collapsed ? '-280px' : '0'};
    width: 280px;
    height: 100vh;
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-weight: 700;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};

  .icon {
    font-size: 1.5rem;
  }
`;

const CollapseButton = styled(motion.button)`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: ${({ theme }) => theme.spacing.lg} 0;
  margin: 0;
`;

const NavItem = styled(motion.li)`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const NavLink = styled(motion.button)`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  border-radius: 0;

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
    color: ${({ active, theme }) => active ? 'white' : theme.colors.primary};
  }

  .icon {
    font-size: 1.2rem;
    min-width: 20px;
  }

  .label {
    font-weight: 500;
    opacity: ${({ collapsed }) => collapsed ? 0 : 1};
    transition: opacity ${({ theme }) => theme.transitions.fast};
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TopBar = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Greeting = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  .greeting-text {
    .welcome {
      font-size: 1.5rem;
      font-weight: 700;
      color: ${({ theme }) => theme.colors.text};
      margin: 0;
    }

    .subtitle {
      font-size: 0.9rem;
      color: ${({ theme }) => theme.colors.textSecondary};
      margin: 0;
    }
  }
`;

const TopBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Avatar = styled(motion.div)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover {
    transform: scale(1.05);
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
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.2rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ContentArea = styled(motion.div)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const SchedulerForm = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FormTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .icon {
    font-size: 2rem;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  .label {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.9rem;
  }

  .required {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, hasError }) => hasError ? '#f44336' : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, hasError }) => hasError ? '#f44336' : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ErrorMessage = styled.div`
  color: #f44336;
  font-size: 0.8rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ConflictAlert = styled(motion.div)`
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1), rgba(229, 57, 53, 0.1));
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  .conflict-header {
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-weight: 600;
    color: #f44336;
  }

  .conflicts-list {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.xs};
  }

  .conflict-item {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
  }
`;

const SubmitButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background: ${({ theme, disabled }) => disabled ? theme.colors.border : theme.colors.gradient};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  font-size: 1rem;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  opacity: ${({ disabled }) => disabled ? 0.6 : 1};

  .icon {
    font-size: 1.1rem;
  }
`;

const MobileOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: none;

  @media (max-width: 768px) {
    display: block;
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

const InterviewScheduler = () => {
  const { currentUser, userProfile } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('scheduler');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    internshipId: '',
    studentIds: [],
    startTime: '',
    endTime: '',
    mode: 'online',
    venue: '',
    mentorId: '',
    interviewerId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);

  const navItems = [
    { id: 'scheduler', label: 'Scheduler', icon: '📅' },
    { id: 'pending', label: 'Pending Interviews', icon: '⏳' },
    { id: 'calendar', label: 'Calendar View', icon: '📊' },
  ];

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      checkConflicts();
    }
  }, [formData]);

  const loadFormData = async () => {
    try {
      // Load internships
      const internshipsSnapshot = await getDocs(
        query(collection(db, 'internships'), where('status', '==', 'active'))
      );
      const internshipsList = [];
      internshipsSnapshot.forEach(doc => {
        internshipsList.push({ id: doc.id, ...doc.data() });
      });
      setInternships(internshipsList);

      // Load students
      const studentsSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'student'))
      );
      const studentsList = [];
      studentsSnapshot.forEach(doc => {
        studentsList.push({ id: doc.id, ...doc.data() });
      });
      setStudents(studentsList);

      // Load mentors
      const mentorsSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'mentor'))
      );
      const mentorsList = [];
      mentorsSnapshot.forEach(doc => {
        mentorsList.push({ id: doc.id, ...doc.data() });
      });
      setMentors(mentorsList);
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const checkConflicts = async () => {
    try {
      const conflictResult = await conflictChecker.checkConflicts(formData);
      setConflicts(conflictResult.conflicts || []);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.internshipId) errors.internshipId = 'Please select an internship';
    if (!formData.studentIds.length) errors.studentIds = 'Please select at least one student';
    if (!formData.startTime) errors.startTime = 'Please select start time';
    if (!formData.endTime) errors.endTime = 'Please select end time';
    if (formData.mode === 'offline' && !formData.venue) errors.venue = 'Please specify venue for offline interviews';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || conflicts.length > 0) return;
    
    setLoading(true);
    try {
      const interviewData = {
        ...formData,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        status: 'pending',
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid
      };

      await addDoc(collection(db, 'interviews'), interviewData);
      
      // Reset form
      setFormData({
        internshipId: '',
        studentIds: [],
        startTime: '',
        endTime: '',
        mode: 'online',
        venue: '',
        mentorId: '',
        interviewerId: ''
      });

      alert('Interview scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Failed to schedule interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'scheduler':
        return (
          <SchedulerForm
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FormTitle>
              <span className="icon">📅</span>
              Schedule New Interview
            </FormTitle>

            {conflicts.length > 0 && (
              <ConflictAlert
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div className="conflict-header">
                  <span>⚠️</span>
                  Scheduling Conflicts Detected
                </div>
                <div className="conflicts-list">
                  {conflicts.map((conflict, index) => (
                    <div key={index} className="conflict-item">
                      • {conflictChecker.formatConflictMessage(conflict)}
                    </div>
                  ))}
                </div>
              </ConflictAlert>
            )}

            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <label className="label">
                    Internship <span className="required">*</span>
                  </label>
                  <Select
                    value={formData.internshipId}
                    onChange={(e) => setFormData(prev => ({ ...prev, internshipId: e.target.value }))}
                    hasError={formErrors.internshipId}
                  >
                    <option value="">Select Internship</option>
                    {internships.map(internship => (
                      <option key={internship.id} value={internship.id}>
                        {internship.role} - {internship.company}
                      </option>
                    ))}
                  </Select>
                  {formErrors.internshipId && <ErrorMessage>{formErrors.internshipId}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <label className="label">
                    Start Time <span className="required">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    hasError={formErrors.startTime}
                  />
                  {formErrors.startTime && <ErrorMessage>{formErrors.startTime}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <label className="label">
                    End Time <span className="required">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    hasError={formErrors.endTime}
                  />
                  {formErrors.endTime && <ErrorMessage>{formErrors.endTime}</ErrorMessage>}
                </FormGroup>

                <FormGroup>
                  <label className="label">Interview Mode</label>
                  <Select
                    value={formData.mode}
                    onChange={(e) => setFormData(prev => ({ ...prev, mode: e.target.value }))}
                  >
                    <option value="online">Online</option>
                    <option value="offline">In-Person</option>
                  </Select>
                </FormGroup>

                {formData.mode === 'offline' && (
                  <FormGroup>
                    <label className="label">
                      Venue <span className="required">*</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter venue address"
                      value={formData.venue}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                      hasError={formErrors.venue}
                    />
                    {formErrors.venue && <ErrorMessage>{formErrors.venue}</ErrorMessage>}
                  </FormGroup>
                )}

                <FormGroup>
                  <label className="label">Mentor</label>
                  <Select
                    value={formData.mentorId}
                    onChange={(e) => setFormData(prev => ({ ...prev, mentorId: e.target.value }))}
                  >
                    <option value="">Select Mentor (Optional)</option>
                    {mentors.map(mentor => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.name}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </FormGrid>

              <SubmitButton
                type="submit"
                disabled={loading || conflicts.length > 0}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="icon">{loading ? '⏳' : '📅'}</span>
                {loading ? 'Scheduling...' : 'Schedule Interview'}
              </SubmitButton>
            </form>
          </SchedulerForm>
        );

      case 'pending':
        return <PendingInterviewsList userRole="placement" userId={currentUser?.uid} />;

      case 'calendar':
        return <CalendarView userRole="placement" userId={currentUser?.uid} />;

      default:
        return null;
    }
  };

  return (
    <DashboardContainer>
      <AnimatePresence>
        {mobileMenuOpen && (
          <MobileOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar collapsed={sidebarCollapsed || !mobileMenuOpen}>
        <SidebarHeader>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <Logo
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="icon">📅</span>
                <span>Interview Scheduler</span>
              </Logo>
            )}
          </AnimatePresence>
          
          <CollapseButton
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </CollapseButton>
        </SidebarHeader>

        <NavList>
          {navItems.map((item) => (
            <NavItem key={item.id}>
              <NavLink
                active={activeSection === item.id}
                collapsed={sidebarCollapsed}
                onClick={() => setActiveSection(item.id)}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
              </NavLink>
            </NavItem>
          ))}
        </NavList>
      </Sidebar>

      <MainContent>
        <TopBar>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <MobileMenuButton
              isOpen={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <span></span>
              <span></span>
              <span></span>
            </MobileMenuButton>

            <Greeting>
              <div className="greeting-text">
                <h1 className="welcome">
                  {getGreeting()}, {userProfile?.name || 'Admin'}!
                </h1>
                <p className="subtitle">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </Greeting>
          </div>

          <TopBarActions>
            <ThemeToggle
              onClick={toggleTheme}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </ThemeToggle>

            <Avatar
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {getInitials(userProfile?.name)}
            </Avatar>
          </TopBarActions>
        </TopBar>

        <ContentArea>
          {renderContent()}
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

export default InterviewScheduler;
