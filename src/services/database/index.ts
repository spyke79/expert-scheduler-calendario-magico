
import { DatabaseConnection } from './connection';
import { SchoolsService } from './schools';
import { ExpertsService } from './experts';
import { CoursesService } from './courses';
import { School, Course, CourseSession } from '@/types/schools';

// Main Database Service class that manages all specific services
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

  // Method to set DB configuration
  public setConfig(config: any): void {
    this.connection.setConfig(config);
  }

  // Initialize the database
  public async init(): Promise<void> {
    try {
      // Try to load existing database from localStorage first
      const loaded = await this.connection.loadFromLocalStorage();
      if (!loaded) {
        // If no existing database, initialize a new one
        await this.connection.init();
      }
    } catch (error) {
      console.error("Error initializing database:", error);
      // If there's an error loading from localStorage, try a fresh init
      await this.connection.init();
    }
  }

  // --- School related methods
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

  // --- Expert related methods
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

  // --- Course related methods
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
