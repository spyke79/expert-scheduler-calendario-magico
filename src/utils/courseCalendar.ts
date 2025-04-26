
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
    if (course.expertId === expertId) {
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
