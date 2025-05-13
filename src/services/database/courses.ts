
import { Course, CourseSession } from '@/types/schools';
import { DatabaseConnection } from './connection';

export class CoursesService {
  private db = DatabaseConnection.getInstance();

  async getCourses(): Promise<any[]> {
    const connection = await this.db.getConnection();

    const [courseRows]: any = await connection.execute('SELECT * FROM courses');
    
    if (courseRows.length === 0) {
      return [];
    }

    const courses = [];
    for (const row of courseRows) {
      const courseId = row.id;
      
      // Otteniamo le sessioni del corso
      const [sessionRows]: any = await connection.execute(`
        SELECT * FROM course_sessions WHERE courseId = ?
      `, [courseId]);
      
      const sessions: CourseSession[] = [];
      if (sessionRows.length > 0) {
        for (const sessionRow of sessionRows) {
          sessions.push({
            id: sessionRow.id,
            date: sessionRow.date.toISOString().split('T')[0],
            startTime: sessionRow.startTime.slice(0, 5),
            endTime: sessionRow.endTime.slice(0, 5),
            hours: sessionRow.hours,
          });
        }
      }
      
      // Create course with the new structure
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
        startDate: row.startDate ? row.startDate.toISOString().split('T')[0] : null,
        endDate: row.endDate ? row.endDate.toISOString().split('T')[0] : null,
        remainingHours: row.remainingHours,
        hourlyRate: row.hourlyRate,
        sessions,
      });
    }

    return courses;
  }

  async addCourse(course: any): Promise<any> {
    const connection = await this.db.getConnection();

    const courseId = course.id || `course-${Date.now()}`;
    
    // Get the primary expert and tutor if using the new structure
    const primaryExpert = course.experts && course.experts.length > 0 ? course.experts[0] : null;
    const primaryTutor = course.tutors && course.tutors.length > 0 ? course.tutors[0] : null;
    
    await connection.execute(`
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

    // Aggiungiamo le sessioni
    for (const session of course.sessions || []) {
      await this.addCourseSession(courseId, session);
    }

    return {
      ...course,
      id: courseId,
    };
  }

  async updateCourse(course: any): Promise<any> {
    const connection = await this.db.getConnection();

    // Get the primary expert and tutor if using the new structure
    const primaryExpert = course.experts && course.experts.length > 0 ? course.experts[0] : null;
    const primaryTutor = course.tutors && course.tutors.length > 0 ? course.tutors[0] : null;

    await connection.execute(`
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

    return course;
  }

  async deleteCourse(courseId: string): Promise<void> {
    const connection = await this.db.getConnection();
    // MySQL cascade delete handles child tables
    await connection.execute(`DELETE FROM courses WHERE id = ?`, [courseId]);
  }

  async addCourseSession(courseId: string, session: CourseSession): Promise<CourseSession> {
    const connection = await this.db.getConnection();

    const sessionId = session.id || `session-${Date.now()}`;
    
    await connection.execute(`
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

    // Aggiorniamo le ore rimanenti del corso
    await connection.execute(`
      UPDATE courses 
      SET remainingHours = remainingHours - ?
      WHERE id = ?
    `, [session.hours, courseId]);

    return {
      ...session,
      id: sessionId,
    };
  }

  async updateCourseSession(session: CourseSession, courseId: string): Promise<CourseSession> {
    const connection = await this.db.getConnection();

    // Otteniamo le ore attuali della sessione
    const [rows]: any = await connection.execute(`
      SELECT hours FROM course_sessions WHERE id = ?
    `, [session.id]);
    
    if (rows.length === 0) {
      throw new Error('Sessione non trovata');
    }
    
    const currentHours = rows[0].hours;
    
    await connection.execute(`
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

    // Aggiorniamo le ore rimanenti del corso
    await connection.execute(`
      UPDATE courses 
      SET remainingHours = remainingHours - ? + ?
      WHERE id = ?
    `, [session.hours, currentHours, courseId]);

    return session;
  }

  async deleteCourseSession(sessionId: string, courseId: string): Promise<void> {
    const connection = await this.db.getConnection();

    // Otteniamo le ore della sessione
    const [rows]: any = await connection.execute(`
      SELECT hours FROM course_sessions WHERE id = ?
    `, [sessionId]);
    
    if (rows.length === 0) {
      throw new Error('Sessione non trovata');
    }
    
    const hours = rows[0].hours;
    
    // Eliminiamo la sessione
    await connection.execute(`DELETE FROM course_sessions WHERE id = ?`, [sessionId]);
    
    // Aggiorniamo le ore rimanenti del corso
    await connection.execute(`
      UPDATE courses 
      SET remainingHours = remainingHours + ?
      WHERE id = ?
    `, [hours, courseId]);
  }
}
