
import { Course, CourseSession } from '@/types/schools';
import { DatabaseConnection } from './connection';

export class CoursesService {
  private db = DatabaseConnection.getInstance();

  async getCourses(): Promise<any[]> {
    const courseRows = await this.db.execute('SELECT * FROM courses');
    
    if (courseRows.length === 0) {
      return [];
    }

    const courses = [];
    for (const row of courseRows) {
      const courseId = row.id;
      
      // Get sessions for this course
      const sessionRows = await this.db.execute(`
        SELECT * FROM course_sessions WHERE courseId = ?
      `, [courseId]);
      
      const sessions: CourseSession[] = [];
      for (const sessionRow of sessionRows) {
        sessions.push({
          id: sessionRow.id,
          date: sessionRow.date,
          startTime: sessionRow.startTime,
          endTime: sessionRow.endTime,
          hours: sessionRow.hours,
        });
      }
      
      courses.push({
        id: courseId,
        title: row.title,
        description: row.description,
        projectId: row.projectId,
        projectName: row.projectName,
        schoolId: row.schoolId,
        schoolName: row.schoolName,
        location: row.location,
        totalHours: row.totalHours,
        experts: [{ 
          id: row.expertId, 
          name: row.expertName,
          hourlyRate: row.hourlyRate
        }],
        tutors: [{ 
          name: row.tutorName, 
          phone: row.tutorPhone 
        }],
        startDate: row.startDate,
        endDate: row.endDate,
        remainingHours: row.remainingHours,
        hourlyRate: row.hourlyRate,
        sessions,
      });
    }

    return courses;
  }

  async addCourse(course: any): Promise<any> {
    const courseId = course.id || `course-${Date.now()}`;
    
    // Get primary expert and tutor
    const primaryExpert = course.experts && course.experts.length > 0 ? course.experts[0] : null;
    const primaryTutor = course.tutors && course.tutors.length > 0 ? course.tutors[0] : null;
    
    await this.db.execute(`
      INSERT INTO courses (
        id, title, description, projectId, projectName, schoolId, schoolName, 
        location, totalHours, expertId, expertName, tutorName, tutorPhone,
        startDate, endDate, remainingHours, hourlyRate
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      courseId,
      course.title,
      course.description, 
      course.projectId || "",
      course.projectName, 
      course.schoolId || "",
      course.schoolName, 
      course.location,
      course.totalHours, 
      primaryExpert ? primaryExpert.id : "",
      primaryExpert ? primaryExpert.name : "",
      primaryTutor ? primaryTutor.name : "",
      primaryTutor ? primaryTutor.phone : "",
      course.startDate || null,
      course.endDate || null,
      course.totalHours,
      course.hourlyRate || 60
    ]);

    // Add sessions
    for (const session of course.sessions || []) {
      await this.addCourseSession(courseId, session);
    }

    // Save to localStorage
    DatabaseConnection.getInstance().saveToLocalStorage();

    return {
      ...course,
      id: courseId,
    };
  }

  async updateCourse(course: any): Promise<any> {
    // Get primary expert and tutor
    const primaryExpert = course.experts && course.experts.length > 0 ? course.experts[0] : null;
    const primaryTutor = course.tutors && course.tutors.length > 0 ? course.tutors[0] : null;

    await this.db.execute(`
      UPDATE courses 
      SET title = ?, 
          description = ?, 
          projectId = ?, 
          projectName = ?, 
          schoolId = ?, 
          schoolName = ?, 
          location = ?, 
          totalHours = ?, 
          expertId = ?, 
          expertName = ?, 
          tutorName = ?, 
          tutorPhone = ?,
          startDate = ?, 
          endDate = ?, 
          remainingHours = ?, 
          hourlyRate = ?
      WHERE id = ?
    `, [
      course.title,
      course.description,
      course.projectId || "",
      course.projectName,
      course.schoolId || "",
      course.schoolName,
      course.location,
      course.totalHours,
      primaryExpert ? primaryExpert.id : "",
      primaryExpert ? primaryExpert.name : "",
      primaryTutor ? primaryTutor.name : "",
      primaryTutor ? primaryTutor.phone : "",
      course.startDate || null,
      course.endDate || null,
      course.remainingHours || course.totalHours,
      course.hourlyRate || 60,
      course.id
    ]);

    // Save to localStorage
    DatabaseConnection.getInstance().saveToLocalStorage();

    return course;
  }

  async deleteCourse(courseId: string): Promise<void> {
    await this.db.execute(`DELETE FROM course_sessions WHERE courseId = ?`, [courseId]);
    await this.db.execute(`DELETE FROM courses WHERE id = ?`, [courseId]);
    
    // Save to localStorage
    DatabaseConnection.getInstance().saveToLocalStorage();
  }

  async addCourseSession(courseId: string, session: CourseSession): Promise<CourseSession> {
    const sessionId = session.id || `session-${Date.now()}`;
    
    await this.db.execute(`
      INSERT INTO course_sessions (id, courseId, date, startTime, endTime, hours)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      sessionId,
      courseId,
      session.date,
      session.startTime,
      session.endTime,
      session.hours
    ]);

    // Update remaining hours
    await this.db.execute(`
      UPDATE courses 
      SET remainingHours = remainingHours - ?
      WHERE id = ?
    `, [session.hours, courseId]);

    // Save to localStorage
    DatabaseConnection.getInstance().saveToLocalStorage();

    return {
      ...session,
      id: sessionId,
    };
  }

  async updateCourseSession(session: CourseSession, courseId: string): Promise<CourseSession> {
    // Get current session hours
    const currentSession = await this.db.execute(`
      SELECT hours FROM course_sessions WHERE id = ?
    `, [session.id]);
    
    if (currentSession.length === 0) {
      throw new Error('Session not found');
    }
    
    const currentHours = currentSession[0].hours;
    
    await this.db.execute(`
      UPDATE course_sessions 
      SET date = ?, 
          startTime = ?, 
          endTime = ?, 
          hours = ?
      WHERE id = ?
    `, [
      session.date,
      session.startTime,
      session.endTime,
      session.hours,
      session.id
    ]);

    // Update remaining hours
    await this.db.execute(`
      UPDATE courses 
      SET remainingHours = remainingHours - ? + ?
      WHERE id = ?
    `, [session.hours, currentHours, courseId]);

    // Save to localStorage
    DatabaseConnection.getInstance().saveToLocalStorage();

    return session;
  }

  async deleteCourseSession(sessionId: string, courseId: string): Promise<void> {
    // Get session hours
    const session = await this.db.execute(`
      SELECT hours FROM course_sessions WHERE id = ?
    `, [sessionId]);
    
    if (session.length === 0) {
      throw new Error('Session not found');
    }
    
    const hours = session[0].hours;
    
    // Delete session
    await this.db.execute(`DELETE FROM course_sessions WHERE id = ?`, [sessionId]);
    
    // Update remaining hours
    await this.db.execute(`
      UPDATE courses 
      SET remainingHours = remainingHours + ?
      WHERE id = ?
    `, [hours, courseId]);

    // Save to localStorage
    DatabaseConnection.getInstance().saveToLocalStorage();
  }
}
