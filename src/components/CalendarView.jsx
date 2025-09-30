import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import InterviewCard from './InterviewCard';

const CalendarContainer = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const CalendarTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  .icon {
    font-size: 2rem;
  }
`;

const CalendarControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const ViewToggle = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.xs};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ViewButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.surface};
  }
`;

const NavigationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const NavButton = styled(motion.button)`
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
  font-size: 1.2rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CurrentPeriod = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  min-width: 200px;
  text-align: center;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const CalendarHeader2 = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0 0;
  overflow: hidden;
  margin-bottom: 1px;
`;

const DayHeader = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.md};
  text-align: center;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
`;

const CalendarDay = styled(motion.div)`
  background: ${({ theme, isToday, isOtherMonth }) => 
    isToday ? theme.colors.primary + '20' : 
    isOtherMonth ? theme.colors.surface + '80' : 
    theme.colors.background};
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.sm};
  position: relative;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  .day-number {
    font-weight: ${({ isToday }) => isToday ? '700' : '500'};
    color: ${({ theme, isToday, isOtherMonth }) => 
      isToday ? theme.colors.primary : 
      isOtherMonth ? theme.colors.textSecondary : 
      theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .interviews-count {
    position: absolute;
    top: ${({ theme }) => theme.spacing.xs};
    right: ${({ theme }) => theme.spacing.xs};
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
  }
`;

const InterviewDot = styled(motion.div)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ status }) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#f44336';
      case 'completed': return '#2196F3';
      default: return '#9E9E9E';
    }
  }};
  margin: 1px;
  display: inline-block;
`;

const WeekView = styled.div`
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  gap: 1px;
  background: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const TimeSlot = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.sm};
  text-align: center;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
`;

const WeekDay = styled.div`
  background: ${({ theme }) => theme.colors.background};
  min-height: 60px;
  padding: ${({ theme }) => theme.spacing.xs};
  position: relative;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const InterviewEvent = styled(motion.div)`
  background: ${({ status }) => {
    switch (status) {
      case 'confirmed': return 'linear-gradient(135deg, #4CAF50, #66BB6A)';
      case 'pending': return 'linear-gradient(135deg, #FF9800, #FFB74D)';
      case 'cancelled': return 'linear-gradient(135deg, #f44336, #ef5350)';
      case 'completed': return 'linear-gradient(135deg, #2196F3, #64B5F6)';
      default: return 'linear-gradient(135deg, #9E9E9E, #BDBDBD)';
    }
  }};
  color: white;
  padding: ${({ theme }) => theme.spacing.xs};
  margin: 1px 0;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    transform: scale(1.02);
  }
`;

const InterviewModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
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
  font-size: 1.2rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${({ color }) => color};
  }
`;

const CalendarView = ({ userRole = 'placement', userId = null }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('month'); // 'month' or 'week'
  const [interviews, setInterviews] = useState([]);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, [currentDate, userRole, userId]);

  const loadInterviews = () => {
    try {
      // Calculate date range based on view
      const startOfPeriod = getStartOfPeriod();
      const endOfPeriod = getEndOfPeriod();

      // Build query based on user role
      let interviewsQuery = collection(db, 'interviews');
      
      if (userRole === 'student' && userId) {
        interviewsQuery = query(
          interviewsQuery,
          where('studentIds', 'array-contains', userId),
          where('startTime', '>=', Timestamp.fromDate(startOfPeriod)),
          where('startTime', '<=', Timestamp.fromDate(endOfPeriod)),
          orderBy('startTime', 'asc')
        );
      } else if (userRole === 'mentor' && userId) {
        interviewsQuery = query(
          interviewsQuery,
          where('mentorId', '==', userId),
          where('startTime', '>=', Timestamp.fromDate(startOfPeriod)),
          where('startTime', '<=', Timestamp.fromDate(endOfPeriod)),
          orderBy('startTime', 'asc')
        );
      } else {
        // Placement cell sees all interviews
        interviewsQuery = query(
          interviewsQuery,
          where('startTime', '>=', Timestamp.fromDate(startOfPeriod)),
          where('startTime', '<=', Timestamp.fromDate(endOfPeriod)),
          orderBy('startTime', 'asc')
        );
      }

      const unsubscribe = onSnapshot(interviewsQuery, (snapshot) => {
        const interviewsList = [];
        snapshot.forEach((doc) => {
          interviewsList.push({ id: doc.id, ...doc.data() });
        });
        setInterviews(interviewsList);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading interviews:', error);
      setLoading(false);
    }
  };

  const getStartOfPeriod = () => {
    if (viewType === 'month') {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      // Include previous month's days that appear in the calendar
      start.setDate(start.getDate() - start.getDay());
      return start;
    } else {
      // Week view
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      return start;
    }
  };

  const getEndOfPeriod = () => {
    if (viewType === 'month') {
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      // Include next month's days that appear in the calendar
      end.setDate(end.getDate() + (6 - end.getDay()));
      end.setHours(23, 59, 59, 999);
      return end;
    } else {
      // Week view
      const end = new Date(currentDate);
      end.setDate(end.getDate() - end.getDay() + 6);
      end.setHours(23, 59, 59, 999);
      return end;
    }
  };

  const navigatePeriod = (direction) => {
    const newDate = new Date(currentDate);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatPeriodTitle = () => {
    if (viewType === 'month') {
      return currentDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    } else {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      
      return `${startOfWeek.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })} - ${endOfWeek.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })}`;
    }
  };

  const getInterviewsForDay = (date) => {
    return interviews.filter(interview => {
      const interviewDate = interview.startTime.toDate();
      return interviewDate.toDateString() === date.toDateString();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isOtherMonth = (date) => {
    return date.getMonth() !== currentDate.getMonth();
  };

  const renderMonthView = () => {
    const startOfPeriod = getStartOfPeriod();
    const days = [];
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startOfPeriod);
      date.setDate(date.getDate() + i);
      
      const dayInterviews = getInterviewsForDay(date);
      
      days.push(
        <CalendarDay
          key={date.toISOString()}
          isToday={isToday(date)}
          isOtherMonth={isOtherMonth(date)}
          onClick={() => {
            if (dayInterviews.length === 1) {
              setSelectedInterview(dayInterviews[0]);
            }
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="day-number">{date.getDate()}</div>
          {dayInterviews.length > 0 && (
            <div className="interviews-count">{dayInterviews.length}</div>
          )}
          <div>
            {dayInterviews.slice(0, 3).map((interview, index) => (
              <InterviewDot
                key={interview.id}
                status={interview.status}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
            {dayInterviews.length > 3 && <span style={{ fontSize: '0.6rem' }}>+{dayInterviews.length - 3}</span>}
          </div>
        </CalendarDay>
      );
    }

    return (
      <>
        <CalendarHeader2>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <DayHeader key={day}>{day}</DayHeader>
          ))}
        </CalendarHeader2>
        <CalendarGrid>{days}</CalendarGrid>
      </>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const timeSlots = [];
    for (let hour = 8; hour <= 18; hour++) {
      timeSlots.push(
        <TimeSlot key={hour}>
          {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
        </TimeSlot>
      );
      
      for (let day = 0; day < 7; day++) {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + day);
        date.setHours(hour, 0, 0, 0);
        
        const dayInterviews = getInterviewsForDay(date).filter(interview => {
          const interviewHour = interview.startTime.toDate().getHours();
          return interviewHour === hour;
        });
        
        timeSlots.push(
          <WeekDay key={`${day}-${hour}`}>
            {dayInterviews.map(interview => (
              <InterviewEvent
                key={interview.id}
                status={interview.status}
                onClick={() => setSelectedInterview(interview)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {interview.startTime.toDate().toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })} - Interview
              </InterviewEvent>
            ))}
          </WeekDay>
        );
      }
    }

    return (
      <>
        <CalendarHeader2>
          <DayHeader>Time</DayHeader>
          {Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            return (
              <DayHeader key={i}>
                {date.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'numeric', 
                  day: 'numeric' 
                })}
              </DayHeader>
            );
          })}
        </CalendarHeader2>
        <WeekView>{timeSlots}</WeekView>
      </>
    );
  };

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          <span className="icon">📅</span>
          Interview Calendar
        </CalendarTitle>
        
        <CalendarControls>
          <ViewToggle>
            <ViewButton
              active={viewType === 'month'}
              onClick={() => setViewType('month')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Month
            </ViewButton>
            <ViewButton
              active={viewType === 'week'}
              onClick={() => setViewType('week')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Week
            </ViewButton>
          </ViewToggle>

          <NavigationControls>
            <NavButton
              onClick={() => navigatePeriod(-1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ←
            </NavButton>
            
            <CurrentPeriod>{formatPeriodTitle()}</CurrentPeriod>
            
            <NavButton
              onClick={() => navigatePeriod(1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              →
            </NavButton>
          </NavigationControls>

          <NavButton
            onClick={goToToday}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            📍
          </NavButton>
        </CalendarControls>
      </CalendarHeader>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📅</div>
          <p>Loading calendar...</p>
        </div>
      ) : (
        <>
          {viewType === 'month' ? renderMonthView() : renderWeekView()}
          
          <LegendContainer>
            <LegendItem color="#4CAF50">
              <div className="dot" />
              <span>Confirmed</span>
            </LegendItem>
            <LegendItem color="#FF9800">
              <div className="dot" />
              <span>Pending</span>
            </LegendItem>
            <LegendItem color="#2196F3">
              <div className="dot" />
              <span>Completed</span>
            </LegendItem>
            <LegendItem color="#f44336">
              <div className="dot" />
              <span>Cancelled</span>
            </LegendItem>
          </LegendContainer>
        </>
      )}

      {/* Interview Details Modal */}
      <AnimatePresence>
        {selectedInterview && (
          <InterviewModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedInterview(null)}
          >
            <ModalContent
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CloseButton
                onClick={() => setSelectedInterview(null)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </CloseButton>
              
              <InterviewCard
                interview={selectedInterview}
                onUpdate={() => {
                  setSelectedInterview(null);
                  // Refresh will happen automatically via real-time listener
                }}
                onDelete={() => {
                  setSelectedInterview(null);
                  // Refresh will happen automatically via real-time listener
                }}
                showActions={userRole === 'placement'}
              />
            </ModalContent>
          </InterviewModal>
        )}
      </AnimatePresence>
    </CalendarContainer>
  );
};

export default CalendarView;
