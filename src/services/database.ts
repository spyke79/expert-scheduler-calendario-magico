
import { Course, School, Project, SchoolLocation, CourseSession } from '@/types/schools';
import mysql from 'mysql2/promise';

// Database configuration interface
interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

// Singleton class to manage database access
class DatabaseService {
  private static instance: DatabaseService;
  private connection: mysql.Connection | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private config: DbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'school_management',
    port: 3306
  };

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public setConfig(config: Partial<DbConfig>): void {
    this.config = { ...this.config, ...config };
    // Reset connection if already initialized
    if (this.connection) {
      this.connection.end();
      this.connection = null;
      this.initPromise = null;
    }
  }

  public async init(): Promise<void> {
    if (this.connection) return;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = new Promise<void>(async (resolve, reject) => {
      try {
        console.log('Inizializzazione del database...');
        
        this.connection = await mysql.createConnection({
          host: this.config.host,
          user: this.config.user,
          password: this.config.password,
          database: this.config.database,
          port: this.config.port
        });

        await this.createTables();
        await this.loadInitialData();
        console.log('Database inizializzato con successo');
        this.isInitializing = false;
        resolve();
      } catch (error) {
        console.error('Errore durante l\'inizializzazione del database:', error);
        this.isInitializing = false;
        reject(error);
      }
    });

    return this.initPromise;
  }

  private async createTables(): Promise<void> {
    if (!this.connection) throw new Error('Database non inizializzato');

    // Tabella per le scuole
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS schools (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        principalName VARCHAR(255) NOT NULL,
        principalPhone VARCHAR(20) NOT NULL,
        managerName VARCHAR(255) NOT NULL,
        managerPhone VARCHAR(20) NOT NULL,
        mapLink VARCHAR(255)
      );
    `);

    // Tabella per le sedi secondarie
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS school_locations (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        managerName VARCHAR(255) NOT NULL,
        managerPhone VARCHAR(20) NOT NULL,
        mapLink VARCHAR(255),
        FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE
      );
    `);

    // Tabella per i progetti
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(36) PRIMARY KEY,
        schoolId VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        year INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE
      );
    `);

    // Tabella per gli esperti
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS experts (
        id VARCHAR(36) PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        fiscalCode VARCHAR(16) NOT NULL,
        vatNumber VARCHAR(20) NOT NULL
      );
    `);

    // Tabella per le materie degli esperti
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS expert_subjects (
        expertId VARCHAR(36) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        PRIMARY KEY (expertId, subject),
        FOREIGN KEY (expertId) REFERENCES experts(id) ON DELETE CASCADE
      );
    `);

    // Tabella per i corsi
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        projectId VARCHAR(36) NOT NULL,
        projectName VARCHAR(255) NOT NULL,
        schoolId VARCHAR(36) NOT NULL,
        schoolName VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        totalHours INT NOT NULL,
        expertId VARCHAR(36) NOT NULL,
        expertName VARCHAR(255) NOT NULL,
        tutorName VARCHAR(255) NOT NULL,
        tutorPhone VARCHAR(20) NOT NULL,
        startDate DATE,
        endDate DATE,
        remainingHours INT,
        hourlyRate INT,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE,
        FOREIGN KEY (expertId) REFERENCES experts(id) ON DELETE SET NULL
      );
    `);

    // Tabella per le sessioni dei corsi
    await this.connection.execute(`
      CREATE TABLE IF NOT EXISTS course_sessions (
        id VARCHAR(36) PRIMARY KEY,
        courseId VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        startTime TIME NOT NULL,
        endTime TIME NOT NULL,
        hours INT NOT NULL,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
      );
    `);
  }

  private async loadInitialData(): Promise<void> {
    if (!this.connection) throw new Error('Database non inizializzato');

    // Verifichiamo se ci sono già dati nelle tabelle
    const [rows]: any = await this.connection.execute("SELECT COUNT(*) as count FROM schools");
    if (rows[0].count > 0) {
      console.log('I dati sono già presenti nel database');
      return;
    }

    // Dati iniziali per le scuole
    await this.connection.execute(`
      INSERT INTO schools (id, name, address, principalName, principalPhone, managerName, managerPhone, mapLink) VALUES
      ('1', 'ITIS Galileo Galilei', 'Via della Scienza 123, Roma', 'Prof. Alessandro Manzoni', '333-1234567', 'Dott.ssa Elena Rossi', '333-7654321', 'https://maps.google.com/?q=Roma'),
      ('2', 'Liceo Scientifico Einstein', 'Viale delle Scienze 78, Milano', 'Prof.ssa Maria Curie', '333-4445555', 'Dott. Roberto Bianchi', '333-6667777', 'https://maps.google.com/?q=Milano');
    `);

    // Dati iniziali per le sedi secondarie
    await this.connection.execute(`
      INSERT INTO school_locations (id, schoolId, name, address, managerName, managerPhone, mapLink) VALUES
      ('loc1', '1', 'Sede Distaccata Nord', 'Via dei Pini 45, Roma', 'Prof. Marco Verdi', '333-2223333', 'https://maps.google.com/?q=Roma+Via+dei+Pini');
    `);

    // Dati iniziali per i progetti
    await this.connection.execute(`
      INSERT INTO projects (id, schoolId, name, year, type) VALUES
      ('p1', '1', 'PNRR DM65', 2024, 'PNRR'),
      ('p2', '2', 'Scuola Viva', 2024, 'Regionale');
    `);

    // Dati iniziali per gli esperti
    await this.connection.execute(`
      INSERT INTO experts (id, firstName, lastName, phone, email, fiscalCode, vatNumber) VALUES
      ('exp1', 'Mario', 'Rossi', '333-1234567', 'mario.rossi@example.com', 'RSSMRA80A01H501T', '12345678901'),
      ('exp2', 'Laura', 'Bianchi', '333-7654321', 'laura.bianchi@example.com', 'BNCLRA75A41H501Y', '09876543210'),
      ('exp3', 'Giuseppe', 'Verdi', '333-5555555', 'giuseppe.verdi@example.com', 'VRDGPP82A01H501R', '11223344556');
    `);

    // Dati iniziali per le materie degli esperti
    await this.connection.execute(`
      INSERT INTO expert_subjects (expertId, subject) VALUES
      ('exp1', 'Programmazione'),
      ('exp1', 'Web Design'),
      ('exp1', 'Database'),
      ('exp2', 'Matematica'),
      ('exp2', 'Fisica'),
      ('exp3', 'Inglese'),
      ('exp3', 'Francese'),
      ('exp3', 'Tedesco');
    `);

    // Dati iniziali per i corsi
    await this.connection.execute(`
      INSERT INTO courses (id, title, description, projectId, projectName, schoolId, schoolName, location, 
        totalHours, expertId, expertName, tutorName, tutorPhone, startDate, endDate, remainingHours, hourlyRate) VALUES
      ('1', 'Programmazione Web Base', 'Corso di base di programmazione web', 'p1', 'PNRR DM65', '1', 
        'ITIS Galileo Galilei', 'Sede Principale', 30, 'exp1', 'Mario Rossi', 'Giuseppe Verdi', '333-5555555',
        '2024-03-01', '2024-05-30', 20, 70),
      ('2', 'Inglese Avanzato', 'Corso avanzato di inglese', 'p2', 'Scuola Viva', '2', 
        'Liceo Scientifico Einstein', 'Sede Centrale', 40, 'exp2', 'Maria Brown', 'Anna Neri', '333-4444444',
        '2024-04-01', '2024-06-15', 40, 60);
    `);

    // Dati iniziali per le sessioni dei corsi
    await this.connection.execute(`
      INSERT INTO course_sessions (id, courseId, date, startTime, endTime, hours) VALUES
      ('session1', '1', '2025-05-15', '14:30', '17:30', 3),
      ('session2', '1', '2025-05-22', '14:30', '17:30', 3),
      ('session3', '2', '2025-05-10', '09:00', '12:00', 3);
    `);
  }

  // Metodi per le operazioni CRUD sulle scuole
  async getSchools(): Promise<School[]> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    const [schoolRows]: any = await this.connection.execute(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM projects WHERE schoolId = s.id) as projectCount
      FROM schools s
    `);

    if (schoolRows.length === 0) {
      return [];
    }

    const schools: School[] = [];
    for (const row of schoolRows) {
      const schoolId = row.id;
      
      // Otteniamo le sedi secondarie
      const [locationRows]: any = await this.connection.execute(`
        SELECT * FROM school_locations WHERE schoolId = ?
      `, [schoolId]);
      
      const secondaryLocations: SchoolLocation[] = [];
      if (locationRows.length > 0) {
        for (const locationRow of locationRows) {
          secondaryLocations.push({
            name: locationRow.name,
            address: locationRow.address,
            managerName: locationRow.managerName,
            managerPhone: locationRow.managerPhone,
            mapLink: locationRow.mapLink,
          });
        }
      }

      // Otteniamo i progetti
      const [projectRows]: any = await this.connection.execute(`
        SELECT * FROM projects WHERE schoolId = ?
      `, [schoolId]);
      
      const projects: Project[] = [];
      if (projectRows.length > 0) {
        for (const projectRow of projectRows) {
          const projectId = projectRow.id;
          
          // Per ogni progetto, otteniamo i corsi correlati
          const [courseRows]: any = await this.connection.execute(`
            SELECT * FROM courses WHERE projectId = ?
          `, [projectId]);
          
          const courses: Course[] = [];
          if (courseRows.length > 0) {
            for (const courseRow of courseRows) {
              const courseId = courseRow.id;
              
              // Per ogni corso, otteniamo le sessioni
              const [sessionRows]: any = await this.connection.execute(`
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
              
              courses.push({
                id: courseId,
                title: courseRow.title,
                description: courseRow.description,
                projectId: courseRow.projectId,
                projectName: courseRow.projectName,
                schoolId: courseRow.schoolId,
                schoolName: courseRow.schoolName,
                location: courseRow.location,
                totalHours: courseRow.totalHours,
                experts: [{ 
                  id: courseRow.expertId, 
                  name: courseRow.expertName,
                  hourlyRate: courseRow.hourlyRate
                }],
                tutors: [{ 
                  name: courseRow.tutorName, 
                  phone: courseRow.tutorPhone 
                }],
                sessions,
              });
            }
          }
          
          projects.push({
            id: projectId,
            name: projectRow.name,
            year: projectRow.year,
            type: projectRow.type,
            documents: [],
            totalCourses: courses.length,
            courses,
          });
        }
      }
      
      schools.push({
        id: schoolId,
        name: row.name,
        address: row.address,
        principalName: row.principalName,
        principalPhone: row.principalPhone,
        managerName: row.managerName,
        managerPhone: row.managerPhone,
        mapLink: row.mapLink,
        secondaryLocations,
        projects,
      });
    }

    return schools;
  }

  async addSchool(school: Omit<School, "id" | "projects">): Promise<School> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    const schoolId = `school-${Date.now()}`;
    
    await this.connection.execute(`
      INSERT INTO schools (id, name, address, principalName, principalPhone, managerName, managerPhone, mapLink)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      schoolId, 
      school.name, 
      school.address, 
      school.principalName, 
      school.principalPhone, 
      school.managerName, 
      school.managerPhone, 
      school.mapLink || null
    ]);

    // Aggiungiamo le sedi secondarie
    for (const location of school.secondaryLocations || []) {
      const locationId = `loc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      await this.connection.execute(`
        INSERT INTO school_locations (id, schoolId, name, address, managerName, managerPhone, mapLink)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        locationId, 
        schoolId, 
        location.name, 
        location.address, 
        location.managerName, 
        location.managerPhone, 
        location.mapLink || null
      ]);
    }

    return {
      ...school,
      id: schoolId,
      projects: [],
    };
  }

  async updateSchool(school: School): Promise<School> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    await this.connection.execute(`
      UPDATE schools 
      SET name = ?, 
          address = ?, 
          principalName = ?, 
          principalPhone = ?, 
          managerName = ?, 
          managerPhone = ?, 
          mapLink = ?
      WHERE id = ?
    `, [
      school.name, 
      school.address, 
      school.principalName, 
      school.principalPhone, 
      school.managerName, 
      school.managerPhone, 
      school.mapLink || null,
      school.id
    ]);

    // Eliminiamo tutte le sedi secondarie esistenti
    await this.connection.execute(`DELETE FROM school_locations WHERE schoolId = ?`, [school.id]);

    // Aggiungiamo le nuove sedi secondarie
    for (const location of school.secondaryLocations || []) {
      const locationId = `loc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      await this.connection.execute(`
        INSERT INTO school_locations (id, schoolId, name, address, managerName, managerPhone, mapLink)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        locationId, 
        school.id, 
        location.name, 
        location.address, 
        location.managerName, 
        location.managerPhone, 
        location.mapLink || null
      ]);
    }

    return school;
  }

  async deleteSchool(schoolId: string): Promise<void> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    // MySQL cascade delete handles the child relationships
    await this.connection.execute(`DELETE FROM schools WHERE id = ?`, [schoolId]);
  }

  // Metodi per le operazioni CRUD sugli esperti
  async getExperts(): Promise<any[]> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    const [expertRows]: any = await this.connection.execute('SELECT * FROM experts');
    
    if (expertRows.length === 0) {
      return [];
    }

    const experts = [];
    for (const row of expertRows) {
      const expertId = row.id;
      
      // Otteniamo le materie dell'esperto
      const [subjectRows]: any = await this.connection.execute(`
        SELECT subject FROM expert_subjects WHERE expertId = ?
      `, [expertId]);
      
      const subjects: string[] = [];
      if (subjectRows.length > 0) {
        for (const subjectRow of subjectRows) {
          subjects.push(subjectRow.subject);
        }
      }
      
      experts.push({
        id: expertId,
        firstName: row.firstName,
        lastName: row.lastName,
        phone: row.phone,
        email: row.email,
        fiscalCode: row.fiscalCode,
        vatNumber: row.vatNumber,
        subjects,
      });
    }

    return experts;
  }

  async addExpert(expert: any): Promise<any> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    const expertId = expert.id || `expert-${Date.now()}`;
    
    await this.connection.execute(`
      INSERT INTO experts (id, firstName, lastName, phone, email, fiscalCode, vatNumber)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      expertId, 
      expert.firstName, 
      expert.lastName, 
      expert.phone,
      expert.email, 
      expert.fiscalCode, 
      expert.vatNumber
    ]);

    // Aggiungiamo le materie
    for (const subject of expert.subjects || []) {
      await this.connection.execute(`
        INSERT INTO expert_subjects (expertId, subject)
        VALUES (?, ?)
      `, [expertId, subject]);
    }

    return {
      ...expert,
      id: expertId,
    };
  }

  async updateExpert(expert: any): Promise<any> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    await this.connection.execute(`
      UPDATE experts 
      SET firstName = ?, 
          lastName = ?, 
          phone = ?, 
          email = ?, 
          fiscalCode = ?, 
          vatNumber = ?
      WHERE id = ?
    `, [
      expert.firstName, 
      expert.lastName, 
      expert.phone, 
      expert.email, 
      expert.fiscalCode, 
      expert.vatNumber,
      expert.id
    ]);

    // Eliminiamo tutte le materie esistenti
    await this.connection.execute(`DELETE FROM expert_subjects WHERE expertId = ?`, [expert.id]);

    // Aggiungiamo le nuove materie
    for (const subject of expert.subjects || []) {
      await this.connection.execute(`
        INSERT INTO expert_subjects (expertId, subject)
        VALUES (?, ?)
      `, [expert.id, subject]);
    }

    return expert;
  }

  async deleteExpert(expertId: string): Promise<void> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    // MySQL cascade delete handles child tables
    await this.connection.execute(`DELETE FROM experts WHERE id = ?`, [expertId]);
  }

  async addCourse(course: any): Promise<any> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    const courseId = course.id || `course-${Date.now()}`;
    
    // Get the primary expert and tutor if using the new structure
    const primaryExpert = course.experts && course.experts.length > 0 ? course.experts[0] : null;
    const primaryTutor = course.tutors && course.tutors.length > 0 ? course.tutors[0] : null;
    
    await this.connection.execute(`
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
      const sessionId = session.id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      await this.connection.execute(`
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
    }

    return {
      ...course,
      id: courseId,
    };
  }

  async updateCourse(course: any): Promise<any> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    // Get the primary expert and tutor if using the new structure
    const primaryExpert = course.experts && course.experts.length > 0 ? course.experts[0] : null;
    const primaryTutor = course.tutors && course.tutors.length > 0 ? course.tutors[0] : null;

    await this.connection.execute(`
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
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    // MySQL cascade delete handles child tables
    await this.connection.execute(`DELETE FROM courses WHERE id = ?`, [courseId]);
  }

  async addCourseSession(courseId: string, session: CourseSession): Promise<CourseSession> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    const sessionId = session.id || `session-${Date.now()}`;
    
    await this.connection.execute(`
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
    await this.connection.execute(`
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
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    // Otteniamo le ore attuali della sessione
    const [rows]: any = await this.connection.execute(`
      SELECT hours FROM course_sessions WHERE id = ?
    `, [session.id]);
    
    if (rows.length === 0) {
      throw new Error('Sessione non trovata');
    }
    
    const currentHours = rows[0].hours;
    
    await this.connection.execute(`
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
    await this.connection.execute(`
      UPDATE courses 
      SET remainingHours = remainingHours - ? + ?
      WHERE id = ?
    `, [session.hours, currentHours, courseId]);

    return session;
  }

  async deleteCourseSession(sessionId: string, courseId: string): Promise<void> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    // Otteniamo le ore della sessione
    const [rows]: any = await this.connection.execute(`
      SELECT hours FROM course_sessions WHERE id = ?
    `, [sessionId]);
    
    if (rows.length === 0) {
      throw new Error('Sessione non trovata');
    }
    
    const hours = rows[0].hours;
    
    // Eliminiamo la sessione
    await this.connection.execute(`DELETE FROM course_sessions WHERE id = ?`, [sessionId]);
    
    // Aggiorniamo le ore rimanenti del corso
    await this.connection.execute(`
      UPDATE courses 
      SET remainingHours = remainingHours + ?
      WHERE id = ?
    `, [hours, courseId]);
  }

  async getCourses(): Promise<any[]> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');

    const [courseRows]: any = await this.connection.execute('SELECT * FROM courses');
    
    if (courseRows.length === 0) {
      return [];
    }

    const courses = [];
    for (const row of courseRows) {
      const courseId = row.id;
      
      // Otteniamo le sessioni del corso
      const [sessionRows]: any = await this.connection.execute(`
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
}

export default DatabaseService;
