// Conflict Checker Utility for Interview Scheduler
// Detects scheduling conflicts for students, mentors, and interviewers

import { 
  collection, 
  query, 
  where, 
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

class ConflictChecker {
  constructor() {
    this.conflictTypes = {
      STUDENT_OVERLAP: 'student_overlap',
      MENTOR_OVERLAP: 'mentor_overlap',
      INTERVIEWER_OVERLAP: 'interviewer_overlap',
      VENUE_OVERLAP: 'venue_overlap',
      INVALID_TIME: 'invalid_time',
      WEEKEND_CONFLICT: 'weekend_conflict',
      OUTSIDE_HOURS: 'outside_hours'
    };

    // Business hours configuration
    this.businessHours = {
      start: 9, // 9 AM
      end: 18,  // 6 PM
      weekends: false // No interviews on weekends
    };
  }

  // Main conflict detection function
  async checkConflicts(interviewData, excludeInterviewId = null) {
    try {
      const conflicts = [];
      
      // Basic time validation
      const timeConflicts = this.validateTimeSlot(interviewData);
      conflicts.push(...timeConflicts);

      // Check for overlapping interviews
      const overlapConflicts = await this.checkOverlappingInterviews(interviewData, excludeInterviewId);
      conflicts.push(...overlapConflicts);

      // Check venue conflicts (for offline interviews)
      if (interviewData.mode === 'offline' && interviewData.venue) {
        const venueConflicts = await this.checkVenueConflicts(interviewData, excludeInterviewId);
        conflicts.push(...venueConflicts);
      }

      return {
        hasConflicts: conflicts.length > 0,
        conflicts: conflicts,
        severity: this.calculateSeverity(conflicts)
      };
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return {
        hasConflicts: false,
        conflicts: [],
        error: error.message
      };
    }
  }

  // Validate basic time slot requirements
  validateTimeSlot(interviewData) {
    const conflicts = [];
    const startTime = new Date(interviewData.startTime);
    const endTime = new Date(interviewData.endTime);
    const now = new Date();

    // Check if start time is before end time
    if (startTime >= endTime) {
      conflicts.push({
        type: this.conflictTypes.INVALID_TIME,
        message: 'Start time must be before end time',
        severity: 'high',
        field: 'time'
      });
    }

    // Check if interview is in the past
    if (startTime <= now) {
      conflicts.push({
        type: this.conflictTypes.INVALID_TIME,
        message: 'Cannot schedule interviews in the past',
        severity: 'high',
        field: 'startTime'
      });
    }

    // Check business hours
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();
    
    if (startHour < this.businessHours.start || endHour > this.businessHours.end) {
      conflicts.push({
        type: this.conflictTypes.OUTSIDE_HOURS,
        message: `Interviews must be scheduled between ${this.businessHours.start}:00 AM and ${this.businessHours.end}:00 PM`,
        severity: 'medium',
        field: 'time'
      });
    }

    // Check weekends
    if (!this.businessHours.weekends) {
      const dayOfWeek = startTime.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        conflicts.push({
          type: this.conflictTypes.WEEKEND_CONFLICT,
          message: 'Interviews cannot be scheduled on weekends',
          severity: 'medium',
          field: 'startTime'
        });
      }
    }

    // Check minimum interview duration (15 minutes)
    const duration = (endTime - startTime) / (1000 * 60); // minutes
    if (duration < 15) {
      conflicts.push({
        type: this.conflictTypes.INVALID_TIME,
        message: 'Interview duration must be at least 15 minutes',
        severity: 'medium',
        field: 'time'
      });
    }

    // Check maximum interview duration (4 hours)
    if (duration > 240) {
      conflicts.push({
        type: this.conflictTypes.INVALID_TIME,
        message: 'Interview duration cannot exceed 4 hours',
        severity: 'medium',
        field: 'time'
      });
    }

    return conflicts;
  }

  // Check for overlapping interviews with students, mentors, and interviewers
  async checkOverlappingInterviews(interviewData, excludeInterviewId) {
    const conflicts = [];
    const startTime = Timestamp.fromDate(new Date(interviewData.startTime));
    const endTime = Timestamp.fromDate(new Date(interviewData.endTime));

    try {
      // Get all interviews that might overlap
      const interviewsQuery = query(
        collection(db, 'interviews'),
        where('status', 'in', ['scheduled', 'confirmed', 'pending'])
      );

      const snapshot = await getDocs(interviewsQuery);
      const existingInterviews = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (doc.id !== excludeInterviewId) {
          existingInterviews.push({ id: doc.id, ...data });
        }
      });

      // Check each existing interview for conflicts
      for (const existingInterview of existingInterviews) {
        const existingStart = existingInterview.startTime;
        const existingEnd = existingInterview.endTime;

        // Check if time slots overlap
        if (this.doTimeSlotsOverlap(startTime, endTime, existingStart, existingEnd)) {
          // Check student conflicts
          const studentConflicts = this.checkParticipantConflicts(
            interviewData.studentIds || [],
            existingInterview.studentIds || [],
            'student',
            existingInterview
          );
          conflicts.push(...studentConflicts);

          // Check mentor conflicts
          if (interviewData.mentorId && existingInterview.mentorId === interviewData.mentorId) {
            conflicts.push({
              type: this.conflictTypes.MENTOR_OVERLAP,
              message: `Mentor already has an interview scheduled at this time`,
              severity: 'high',
              field: 'mentorId',
              conflictingInterview: existingInterview,
              participants: [interviewData.mentorId]
            });
          }

          // Check interviewer conflicts
          if (interviewData.interviewerId && existingInterview.interviewerId === interviewData.interviewerId) {
            conflicts.push({
              type: this.conflictTypes.INTERVIEWER_OVERLAP,
              message: `Interviewer already has an interview scheduled at this time`,
              severity: 'high',
              field: 'interviewerId',
              conflictingInterview: existingInterview,
              participants: [interviewData.interviewerId]
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking overlapping interviews:', error);
    }

    return conflicts;
  }

  // Check venue conflicts for offline interviews
  async checkVenueConflicts(interviewData, excludeInterviewId) {
    const conflicts = [];
    const startTime = Timestamp.fromDate(new Date(interviewData.startTime));
    const endTime = Timestamp.fromDate(new Date(interviewData.endTime));

    try {
      const venueQuery = query(
        collection(db, 'interviews'),
        where('mode', '==', 'offline'),
        where('venue', '==', interviewData.venue),
        where('status', 'in', ['scheduled', 'confirmed', 'pending'])
      );

      const snapshot = await getDocs(venueQuery);
      
      snapshot.forEach(doc => {
        if (doc.id !== excludeInterviewId) {
          const existingInterview = doc.data();
          const existingStart = existingInterview.startTime;
          const existingEnd = existingInterview.endTime;

          if (this.doTimeSlotsOverlap(startTime, endTime, existingStart, existingEnd)) {
            conflicts.push({
              type: this.conflictTypes.VENUE_OVERLAP,
              message: `Venue "${interviewData.venue}" is already booked at this time`,
              severity: 'high',
              field: 'venue',
              conflictingInterview: existingInterview
            });
          }
        }
      });
    } catch (error) {
      console.error('Error checking venue conflicts:', error);
    }

    return conflicts;
  }

  // Check conflicts for specific participants (students, mentors, interviewers)
  checkParticipantConflicts(newParticipants, existingParticipants, participantType, existingInterview) {
    const conflicts = [];
    const overlappingParticipants = newParticipants.filter(id => 
      existingParticipants.includes(id)
    );

    if (overlappingParticipants.length > 0) {
      conflicts.push({
        type: this.conflictTypes.STUDENT_OVERLAP,
        message: `${participantType === 'student' ? 'Student(s)' : 'Participant(s)'} already have an interview scheduled at this time`,
        severity: 'high',
        field: 'studentIds',
        conflictingInterview: existingInterview,
        participants: overlappingParticipants
      });
    }

    return conflicts;
  }

  // Check if two time slots overlap
  doTimeSlotsOverlap(start1, end1, start2, end2) {
    // Convert Firestore Timestamps to comparable values
    const s1 = start1.toDate ? start1.toDate().getTime() : start1.getTime();
    const e1 = end1.toDate ? end1.toDate().getTime() : end1.getTime();
    const s2 = start2.toDate ? start2.toDate().getTime() : start2.getTime();
    const e2 = end2.toDate ? end2.toDate().getTime() : end2.getTime();

    // Check for overlap: start1 < end2 && start2 < end1
    return s1 < e2 && s2 < e1;
  }

  // Calculate overall conflict severity
  calculateSeverity(conflicts) {
    if (conflicts.length === 0) return 'none';
    
    const highSeverityCount = conflicts.filter(c => c.severity === 'high').length;
    const mediumSeverityCount = conflicts.filter(c => c.severity === 'medium').length;
    
    if (highSeverityCount > 0) return 'high';
    if (mediumSeverityCount > 0) return 'medium';
    return 'low';
  }

  // Get suggested alternative time slots
  async getSuggestedTimeSlots(interviewData, duration = 60) {
    try {
      const suggestions = [];
      const baseDate = new Date(interviewData.startTime);
      
      // Generate suggestions for the next 7 days
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date(baseDate);
        currentDate.setDate(currentDate.getDate() + dayOffset);
        
        // Skip weekends if not allowed
        if (!this.businessHours.weekends && (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
          continue;
        }

        // Check each hour within business hours
        for (let hour = this.businessHours.start; hour < this.businessHours.end; hour++) {
          const startTime = new Date(currentDate);
          startTime.setHours(hour, 0, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + duration);

          // Check if this slot has conflicts
          const testData = {
            ...interviewData,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
          };

          const conflictResult = await this.checkConflicts(testData);
          
          if (!conflictResult.hasConflicts) {
            suggestions.push({
              startTime: startTime,
              endTime: endTime,
              score: this.calculateSlotScore(startTime, interviewData)
            });
          }

          // Limit suggestions to prevent too many API calls
          if (suggestions.length >= 10) break;
        }
        
        if (suggestions.length >= 10) break;
      }

      // Sort by score (higher is better)
      return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
    } catch (error) {
      console.error('Error generating suggested time slots:', error);
      return [];
    }
  }

  // Calculate score for a time slot (higher is better)
  calculateSlotScore(startTime, originalData) {
    let score = 100;
    
    // Prefer morning slots (9-12)
    const hour = startTime.getHours();
    if (hour >= 9 && hour <= 12) {
      score += 20;
    } else if (hour >= 13 && hour <= 15) {
      score += 10;
    }

    // Prefer weekdays
    const dayOfWeek = startTime.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      score += 15;
    }

    // Prefer slots closer to original time
    const originalTime = new Date(originalData.startTime);
    const timeDiff = Math.abs(startTime - originalTime) / (1000 * 60 * 60); // hours
    score -= Math.min(timeDiff * 2, 50); // Reduce score based on time difference

    return Math.max(score, 0);
  }

  // Quick conflict check for real-time validation
  async quickConflictCheck(participantIds, startTime, endTime, excludeInterviewId = null) {
    try {
      const start = Timestamp.fromDate(new Date(startTime));
      const end = Timestamp.fromDate(new Date(endTime));

      // Quick query for overlapping interviews
      const quickQuery = query(
        collection(db, 'interviews'),
        where('status', 'in', ['scheduled', 'confirmed', 'pending'])
      );

      const snapshot = await getDocs(quickQuery);
      let hasConflict = false;

      snapshot.forEach(doc => {
        if (doc.id !== excludeInterviewId) {
          const interview = doc.data();
          
          if (this.doTimeSlotsOverlap(start, end, interview.startTime, interview.endTime)) {
            // Check if any participants overlap
            const interviewParticipants = [
              ...(interview.studentIds || []),
              interview.mentorId,
              interview.interviewerId
            ].filter(Boolean);

            const hasParticipantOverlap = participantIds.some(id => 
              interviewParticipants.includes(id)
            );

            if (hasParticipantOverlap) {
              hasConflict = true;
            }
          }
        }
      });

      return hasConflict;
    } catch (error) {
      console.error('Error in quick conflict check:', error);
      return false;
    }
  }

  // Format conflict messages for UI display
  formatConflictMessage(conflict) {
    const messages = {
      [this.conflictTypes.STUDENT_OVERLAP]: '👥 Student scheduling conflict detected',
      [this.conflictTypes.MENTOR_OVERLAP]: '👨‍🏫 Mentor scheduling conflict detected',
      [this.conflictTypes.INTERVIEWER_OVERLAP]: '👔 Interviewer scheduling conflict detected',
      [this.conflictTypes.VENUE_OVERLAP]: '🏢 Venue booking conflict detected',
      [this.conflictTypes.INVALID_TIME]: '⏰ Invalid time slot selected',
      [this.conflictTypes.WEEKEND_CONFLICT]: '📅 Weekend scheduling not allowed',
      [this.conflictTypes.OUTSIDE_HOURS]: '🕐 Outside business hours'
    };

    return messages[conflict.type] || conflict.message;
  }

  // Get conflict resolution suggestions
  getResolutionSuggestions(conflicts) {
    const suggestions = [];

    conflicts.forEach(conflict => {
      switch (conflict.type) {
        case this.conflictTypes.STUDENT_OVERLAP:
          suggestions.push({
            type: 'reschedule',
            message: 'Consider rescheduling to a different time slot',
            action: 'suggest_times'
          });
          break;
        
        case this.conflictTypes.VENUE_OVERLAP:
          suggestions.push({
            type: 'change_venue',
            message: 'Select a different venue or switch to online mode',
            action: 'change_mode'
          });
          break;
        
        case this.conflictTypes.OUTSIDE_HOURS:
          suggestions.push({
            type: 'adjust_time',
            message: 'Adjust time to fall within business hours (9 AM - 6 PM)',
            action: 'suggest_business_hours'
          });
          break;
        
        default:
          suggestions.push({
            type: 'general',
            message: 'Please review and adjust the interview details',
            action: 'manual_review'
          });
      }
    });

    return suggestions;
  }
}

// Export singleton instance
export default new ConflictChecker();

// Export individual functions for specific use cases
export const {
  checkConflicts,
  validateTimeSlot,
  checkOverlappingInterviews,
  getSuggestedTimeSlots,
  quickConflictCheck,
  formatConflictMessage,
  getResolutionSuggestions
} = new ConflictChecker();
