
import { DatabaseConnection } from './connection';
import { SchoolsService } from './schools';
import { ExpertsService } from './experts';
import { CoursesService } from './courses';
import { School, Course, CourseSession } from '@/types/schools';

// Classe DatabaseService che utilizzerà i servizi specifici
class DatabaseService {
  private static instance: DatabaseService;
  private connection = DatabaseConnection.getInstance();
  private schoolsService = new SchoolsService();
  private expertsService = new ExpertsService();
  private coursesService = new CoursesService();

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Metodo per impostare la configurazione del database
  public setConfig(config: any): void {
    this.connection.setConfig(config);
  }

  // Inizializzazione del database
  public async init(): Promise<void> {
    await this.connection.init();
  }

  // --- Metodi relativi alle scuole
  public async getSchools(): Promise<School[]> {
    return this.schoolsService.getSchools();
  }

  public async addSchool(school: Omit<School, "id" | "projects">): Promise<School> {
    return this.schoolsService.addSchool(school);
  }

  public async updateSchool(school: School): Promise<School> {
    return this.schoolsService.updateSchool(school);
  }

  public async deleteSchool(schoolId: string): Promise<void> {
    return this.schoolsService.deleteSchool(schoolId);
  }

  // --- Metodi relativi agli esperti
  public async getExperts(): Promise<any[]> {
    return this.expertsService.getExperts();
  }

  public async addExpert(expert: any): Promise<any> {
    return this.expertsService.addExpert(expert);
  }

  public async updateExpert(expert: any): Promise<any> {
    return this.expertsService.updateExpert(expert);
  }

  public async deleteExpert(expertId: string): Promise<void> {
    return this.expertsService.deleteExpert(expertId);
  }

  // --- Metodi relativi ai corsi
  public async getCourses(): Promise<any[]> {
    return this.coursesService.getCourses();
  }

  public async addCourse(course: any): Promise<any> {
    return this.coursesService.addCourse(course);
  }

  public async updateCourse(course: any): Promise<any> {
    return this.coursesService.updateCourse(course);
  }

  public async deleteCourse(courseId: string): Promise<void> {
    return this.coursesService.deleteCourse(courseId);
  }

  public async addCourseSession(courseId: string, session: CourseSession): Promise<CourseSession> {
    return this.coursesService.addCourseSession(courseId, session);
  }

  public async updateCourseSession(session: CourseSession, courseId: string): Promise<CourseSession> {
    return this.coursesService.updateCourseSession(session, courseId);
  }

  public async deleteCourseSession(sessionId: string, courseId: string): Promise<void> {
    return this.coursesService.deleteCourseSession(sessionId, courseId);
  }
}

export default DatabaseService;
