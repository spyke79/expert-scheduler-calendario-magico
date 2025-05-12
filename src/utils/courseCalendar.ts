import { Course, CourseSession } from "@/types/schools";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

/**
 * Checks if two time ranges overlap
 */
export function doTimesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return (start1 < end2 && start2 < end1);
}

/**
 * Checks if a session conflicts with any existing sessions for an expert
 */
export function hasExpertConflict(
  session: {
    date: string;
    startTime: string;
    endTime: string;
  },
  expertId: string,
  allCourses: Course[],
  currentCourseId?: string
): boolean {
  for (const course of allCourses) {
    // Skip the current course if we're editing a session
    if (currentCourseId && course.id === currentCourseId) continue;
    
    // Only check courses with the same expert
    if (course.experts.some(expert => expert.id === expertId)) {
      for (const existingSession of course.sessions) {
        // Check if the session is on the same date
        if (existingSession.date === session.date) {
          // Check if the time ranges overlap
          if (doTimesOverlap(
            session.startTime,
            session.endTime,
            existingSession.startTime,
            existingSession.endTime
          )) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Calculate hours between two time strings (HH:MM)
 * Returns the difference in hours, rounded to the nearest 0.5
 */
export function calculateHoursFromTimes(startTime: string, endTime: string): number {
  // Convert time strings to Date objects for easy calculation
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  // Calculate total minutes
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  // Calculate difference in hours
  let diffHours = (endTotalMinutes - startTotalMinutes) / 60;
  
  // Handle cases where end time is earlier than start time (next day)
  if (diffHours < 0) {
    diffHours += 24;
  }
  
  // Round to nearest 0.5
  return Math.round(diffHours * 2) / 2;
}

/**
 * Calculate total hours assigned from sessions
 */
export function getAssignedHours(sessions: CourseSession[]): number {
  return sessions.reduce((sum, session) => sum + session.hours, 0);
}

/**
 * Calculate remaining hours for a course
 */
export function getRemainingHours(course: Course): number {
  const assignedHours = getAssignedHours(course.sessions);
  return Math.max(0, course.totalHours - assignedHours);
}

/**
 * Format a date for display
 */
export function formatSessionDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "EEEE d MMMM yyyy", { locale: it });
  } catch (error) {
    return dateString;
  }
}
