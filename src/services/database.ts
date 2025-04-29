import initSqlJs, { Database, SqlValue } from 'sql.js';
import { Course, School, Project, SchoolLocation, CourseSession } from '@/types/schools';

// Classe singleton per gestire l'accesso al database
class DatabaseService {
  private static instance: DatabaseService;
  private db: Database | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = new Promise<void>(async (resolve, reject) => {
      try {
        console.log('Inizializzazione del database...');
        const SQL = await initSqlJs({
          // Localizzazione del file wasm
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`
        });

        this.db = new SQL.Database();
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
    if (!this.db) throw new Error('Database non inizializzato');

    // Tabella per le scuole
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schools (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        principalName TEXT NOT NULL,
        principalPhone TEXT NOT NULL,
        managerName TEXT NOT NULL,
        managerPhone TEXT NOT NULL,
        mapLink TEXT
      );
    `);

    // Tabella per le sedi secondarie
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS school_locations (
        id TEXT PRIMARY KEY,
        schoolId TEXT NOT NULL,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        managerName TEXT NOT NULL,
        managerPhone TEXT NOT NULL,
        mapLink TEXT,
        FOREIGN KEY (schoolId) REFERENCES schools(id)
      );
    `);

    // Tabella per i progetti
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        schoolId TEXT NOT NULL,
        name TEXT NOT NULL,
        year INTEGER NOT NULL,
        type TEXT NOT NULL,
        FOREIGN KEY (schoolId) REFERENCES schools(id)
      );
    `);

    // Tabella per gli esperti
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS experts (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        fiscalCode TEXT NOT NULL,
        vatNumber TEXT NOT NULL
      );
    `);

    // Tabella per le materie degli esperti
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS expert_subjects (
        expertId TEXT NOT NULL,
        subject TEXT NOT NULL,
        PRIMARY KEY (expertId, subject),
        FOREIGN KEY (expertId) REFERENCES experts(id)
      );
    `);

    // Tabella per i corsi
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        projectId TEXT NOT NULL,
        projectName TEXT NOT NULL,
        schoolId TEXT NOT NULL,
        schoolName TEXT NOT NULL,
        location TEXT NOT NULL,
        totalHours INTEGER NOT NULL,
        expertId TEXT NOT NULL,
        expertName TEXT NOT NULL,
        tutorName TEXT NOT NULL,
        tutorPhone TEXT NOT NULL,
        startDate TEXT,
        endDate TEXT,
        remainingHours INTEGER,
        hourlyRate INTEGER,
        FOREIGN KEY (projectId) REFERENCES projects(id),
        FOREIGN KEY (schoolId) REFERENCES schools(id),
        FOREIGN KEY (expertId) REFERENCES experts(id)
      );
    `);

    // Tabella per le sessioni dei corsi
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS course_sessions (
        id TEXT PRIMARY KEY,
        courseId TEXT NOT NULL,
        date TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        hours INTEGER NOT NULL,
        FOREIGN KEY (courseId) REFERENCES courses(id)
      );
    `);
  }

  private async loadInitialData(): Promise<void> {
    if (!this.db) throw new Error('Database non inizializzato');

    // Verifichiamo se ci sono già dati nelle tabelle
    const result = this.db.exec("SELECT COUNT(*) as count FROM schools");
    if (result.length > 0 && Number(result[0].values[0][0]) > 0) {
      console.log('I dati sono già presenti nel database');
      return;
    }

    // Dati iniziali per le scuole
    this.db.exec(`
      INSERT INTO schools (id, name, address, principalName, principalPhone, managerName, managerPhone, mapLink) VALUES
      ('1', 'ITIS Galileo Galilei', 'Via della Scienza 123, Roma', 'Prof. Alessandro Manzoni', '333-1234567', 'Dott.ssa Elena Rossi', '333-7654321', 'https://maps.google.com/?q=Roma'),
      ('2', 'Liceo Scientifico Einstein', 'Viale delle Scienze 78, Milano', 'Prof.ssa Maria Curie', '333-4445555', 'Dott. Roberto Bianchi', '333-6667777', 'https://maps.google.com/?q=Milano');
    `);

    // Dati iniziali per le sedi secondarie
    this.db.exec(`
      INSERT INTO school_locations (id, schoolId, name, address, managerName, managerPhone, mapLink) VALUES
      ('loc1', '1', 'Sede Distaccata Nord', 'Via dei Pini 45, Roma', 'Prof. Marco Verdi', '333-2223333', 'https://maps.google.com/?q=Roma+Via+dei+Pini');
    `);

    // Dati iniziali per i progetti
    this.db.exec(`
      INSERT INTO projects (id, schoolId, name, year, type) VALUES
      ('p1', '1', 'PNRR DM65', 2024, 'PNRR'),
      ('p2', '2', 'Scuola Viva', 2024, 'Regionale');
    `);

    // Dati iniziali per gli esperti
    this.db.exec(`
      INSERT INTO experts (id, firstName, lastName, phone, email, fiscalCode, vatNumber) VALUES
      ('exp1', 'Mario', 'Rossi', '333-1234567', 'mario.rossi@example.com', 'RSSMRA80A01H501T', '12345678901'),
      ('exp2', 'Laura', 'Bianchi', '333-7654321', 'laura.bianchi@example.com', 'BNCLRA75A41H501Y', '09876543210'),
      ('exp3', 'Giuseppe', 'Verdi', '333-5555555', 'giuseppe.verdi@example.com', 'VRDGPP82A01H501R', '11223344556');
    `);

    // Dati iniziali per le materie degli esperti
    this.db.exec(`
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
    this.db.exec(`
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
    this.db.exec(`
      INSERT INTO course_sessions (id, courseId, date, startTime, endTime, hours) VALUES
      ('session1', '1', '2025-05-15', '14:30', '17:30', 3),
      ('session2', '1', '2025-05-22', '14:30', '17:30', 3),
      ('session3', '2', '2025-05-10', '09:00', '12:00', 3);
    `);
  }

  // Metodi per le operazioni CRUD sulle scuole
  async getSchools(): Promise<School[]> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    const result = this.db.exec(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM projects WHERE schoolId = s.id) as projectCount
      FROM schools s
    `);

    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }

    const schools: School[] = [];
    for (const row of result[0].values) {
      const schoolId = row[0] as string;
      
      // Otteniamo le sedi secondarie
      const locationsResult = this.db.exec(`
        SELECT * FROM school_locations WHERE schoolId = '${schoolId}'
      `);
      
      const secondaryLocations: SchoolLocation[] = [];
      if (locationsResult.length > 0) {
        for (const locationRow of locationsResult[0].values) {
          secondaryLocations.push({
            name: locationRow[2] as string,
            address: locationRow[3] as string,
            managerName: locationRow[4] as string,
            managerPhone: locationRow[5] as string,
            mapLink: locationRow[6] as string | undefined,
          });
        }
      }

      // Otteniamo i progetti
      const projectsResult = this.db.exec(`
        SELECT * FROM projects WHERE schoolId = '${schoolId}'
      `);
      
      const projects: Project[] = [];
      if (projectsResult.length > 0) {
        for (const projectRow of projectsResult[0].values) {
          const projectId = projectRow[0] as string;
          
          // Per ogni progetto, otteniamo i corsi correlati
          const coursesResult = this.db.exec(`
            SELECT * FROM courses WHERE projectId = '${projectId}'
          `);
          
          const courses: Course[] = [];
          if (coursesResult.length > 0) {
            for (const courseRow of coursesResult[0].values) {
              const courseId = courseRow[0] as string;
              
              // Per ogni corso, otteniamo le sessioni
              const sessionsResult = this.db.exec(`
                SELECT * FROM course_sessions WHERE courseId = '${courseId}'
              `);
              
              const sessions: CourseSession[] = [];
              if (sessionsResult.length > 0) {
                for (const sessionRow of sessionsResult[0].values) {
                  sessions.push({
                    id: sessionRow[0] as string,
                    date: sessionRow[2] as string,
                    startTime: sessionRow[3] as string,
                    endTime: sessionRow[4] as string,
                    hours: sessionRow[5] as number,
                  });
                }
              }
              
              courses.push({
                id: courseId,
                title: courseRow[1] as string,
                description: courseRow[2] as string,
                projectId: courseRow[3] as string,
                projectName: courseRow[4] as string,
                schoolId: courseRow[5] as string,
                schoolName: courseRow[6] as string,
                location: courseRow[7] as string,
                totalHours: courseRow[8] as number,
                experts: [{ 
                  id: courseRow[9] as string, 
                  name: courseRow[10] as string,
                  hourlyRate: courseRow[16] as number
                }],
                tutors: [{ 
                  name: courseRow[11] as string, 
                  phone: courseRow[12] as string 
                }],
                sessions,
              });
            }
          }
          
          projects.push({
            id: projectId,
            name: projectRow[2] as string,
            year: projectRow[3] as number,
            type: projectRow[4] as string,
            documents: [],
            totalCourses: courses.length,
            courses,
          });
        }
      }
      
      schools.push({
        id: schoolId,
        name: row[1] as string,
        address: row[2] as string,
        principalName: row[3] as string,
        principalPhone: row[4] as string,
        managerName: row[5] as string,
        managerPhone: row[6] as string,
        mapLink: row[7] as string | undefined,
        secondaryLocations,
        projects,
      });
    }

    return schools;
  }

  async addSchool(school: Omit<School, "id" | "projects">): Promise<School> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    const schoolId = `school-${Date.now()}`;
    
    this.db.exec(`
      INSERT INTO schools (id, name, address, principalName, principalPhone, managerName, managerPhone, mapLink)
      VALUES ('${schoolId}', '${school.name}', '${school.address}', '${school.principalName}', 
        '${school.principalPhone}', '${school.managerName}', '${school.managerPhone}', 
        ${school.mapLink ? `'${school.mapLink}'` : 'NULL'});
    `);

    // Aggiungiamo le sedi secondarie
    for (const location of school.secondaryLocations || []) {
      const locationId = `loc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      this.db.exec(`
        INSERT INTO school_locations (id, schoolId, name, address, managerName, managerPhone, mapLink)
        VALUES ('${locationId}', '${schoolId}', '${location.name}', '${location.address}', 
          '${location.managerName}', '${location.managerPhone}', 
          ${location.mapLink ? `'${location.mapLink}'` : 'NULL'});
      `);
    }

    return {
      ...school,
      id: schoolId,
      projects: [],
    };
  }

  async updateSchool(school: School): Promise<School> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    this.db.exec(`
      UPDATE schools 
      SET name = '${school.name}', 
          address = '${school.address}', 
          principalName = '${school.principalName}', 
          principalPhone = '${school.principalPhone}', 
          managerName = '${school.managerName}', 
          managerPhone = '${school.managerPhone}', 
          mapLink = ${school.mapLink ? `'${school.mapLink}'` : 'NULL'}
      WHERE id = '${school.id}';
    `);

    // Eliminiamo tutte le sedi secondarie esistenti
    this.db.exec(`DELETE FROM school_locations WHERE schoolId = '${school.id}';`);

    // Aggiungiamo le nuove sedi secondarie
    for (const location of school.secondaryLocations || []) {
      const locationId = `loc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      this.db.exec(`
        INSERT INTO school_locations (id, schoolId, name, address, managerName, managerPhone, mapLink)
        VALUES ('${locationId}', '${school.id}', '${location.name}', '${location.address}', 
          '${location.managerName}', '${location.managerPhone}', 
          ${location.mapLink ? `'${location.mapLink}'` : 'NULL'});
      `);
    }

    return school;
  }

  async deleteSchool(schoolId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    // Eliminiamo prima tutte le relazioni
    this.db.exec(`DELETE FROM school_locations WHERE schoolId = '${schoolId}';`);
    
    // Otteniamo i progetti della scuola
    const projectsResult = this.db.exec(`SELECT id FROM projects WHERE schoolId = '${schoolId}'`);
    if (projectsResult.length > 0) {
      for (const projectRow of projectsResult[0].values) {
        const projectId = projectRow[0] as string;
        
        // Otteniamo i corsi del progetto
        const coursesResult = this.db.exec(`SELECT id FROM courses WHERE projectId = '${projectId}'`);
        if (coursesResult.length > 0) {
          for (const courseRow of coursesResult[0].values) {
            const courseId = courseRow[0] as string;
            
            // Eliminiamo le sessioni del corso
            this.db.exec(`DELETE FROM course_sessions WHERE courseId = '${courseId}';`);
          }
        }
        
        // Eliminiamo i corsi del progetto
        this.db.exec(`DELETE FROM courses WHERE projectId = '${projectId}';`);
      }
    }
    
    // Eliminiamo i progetti della scuola
    this.db.exec(`DELETE FROM projects WHERE schoolId = '${schoolId}';`);
    
    // Infine eliminiamo la scuola
    this.db.exec(`DELETE FROM schools WHERE id = '${schoolId}';`);
  }

  // Metodi per le operazioni CRUD sugli esperti
  async getExperts(): Promise<any[]> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    const result = this.db.exec('SELECT * FROM experts');
    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }

    const experts = [];
    for (const row of result[0].values) {
      const expertId = row[0] as string;
      
      // Otteniamo le materie dell'esperto
      const subjectsResult = this.db.exec(`
        SELECT subject FROM expert_subjects WHERE expertId = '${expertId}'
      `);
      
      const subjects: string[] = [];
      if (subjectsResult.length > 0) {
        for (const subjectRow of subjectsResult[0].values) {
          subjects.push(subjectRow[0] as string);
        }
      }
      
      experts.push({
        id: expertId,
        firstName: row[1] as string,
        lastName: row[2] as string,
        phone: row[3] as string,
        email: row[4] as string,
        fiscalCode: row[5] as string,
        vatNumber: row[6] as string,
        subjects,
      });
    }

    return experts;
  }

  async addExpert(expert: any): Promise<any> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    const expertId = expert.id || `expert-${Date.now()}`;
    
    this.db.exec(`
      INSERT INTO experts (id, firstName, lastName, phone, email, fiscalCode, vatNumber)
      VALUES ('${expertId}', '${expert.firstName}', '${expert.lastName}', '${expert.phone}',
        '${expert.email}', '${expert.fiscalCode}', '${expert.vatNumber}');
    `);

    // Aggiungiamo le materie
    for (const subject of expert.subjects || []) {
      this.db.exec(`
        INSERT INTO expert_subjects (expertId, subject)
        VALUES ('${expertId}', '${subject}');
      `);
    }

    return {
      ...expert,
      id: expertId,
    };
  }

  async updateExpert(expert: any): Promise<any> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    this.db.exec(`
      UPDATE experts 
      SET firstName = '${expert.firstName}', 
          lastName = '${expert.lastName}', 
          phone = '${expert.phone}', 
          email = '${expert.email}', 
          fiscalCode = '${expert.fiscalCode}', 
          vatNumber = '${expert.vatNumber}'
      WHERE id = '${expert.id}';
    `);

    // Eliminiamo tutte le materie esistenti
    this.db.exec(`DELETE FROM expert_subjects WHERE expertId = '${expert.id}';`);

    // Aggiungiamo le nuove materie
    for (const subject of expert.subjects || []) {
      this.db.exec(`
        INSERT INTO expert_subjects (expertId, subject)
        VALUES ('${expert.id}', '${subject}');
      `);
    }

    return expert;
  }

  async deleteExpert(expertId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    // Eliminiamo prima le relazioni
    this.db.exec(`DELETE FROM expert_subjects WHERE expertId = '${expertId}';`);
    
    // Aggiorniamo i corsi che fanno riferimento a questo esperto (in un'app reale potrebbe essere meglio impedire l'eliminazione)
    this.db.exec(`
      UPDATE courses SET expertId = 'deleted', expertName = 'Esperto rimosso'
      WHERE expertId = '${expertId}';
    `);
    
    // Infine eliminiamo l'esperto
    this.db.exec(`DELETE FROM experts WHERE id = '${expertId}';`);
  }

// Add this method inside the DatabaseService class to update course data structure:
async addCourse(course: any): Promise<any> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    const courseId = course.id || `course-${Date.now()}`;
    
    // Get the primary expert and tutor if using the new structure
    const primaryExpert = course.experts && course.experts.length > 0 ? course.experts[0] : null;
    const primaryTutor = course.tutors && course.tutors.length > 0 ? course.tutors[0] : null;
    
    this.db.exec(`
      INSERT INTO courses (
        id, title, description, projectId, projectName, schoolId, schoolName, 
        location, totalHours, expertId, expertName, tutorName, tutorPhone,
        startDate, endDate, remainingHours, hourlyRate
      )
      VALUES (
        '${courseId}', '${course.title}', '${course.description}', 
        '${course.projectId || ""}', '${course.projectName}', 
        '${course.schoolId || ""}', '${course.schoolName}', 
        '${course.location}', ${course.totalHours}, 
        '${primaryExpert ? primaryExpert.id : ""}', 
        '${primaryExpert ? primaryExpert.name : ""}', 
        '${primaryTutor ? primaryTutor.name : ""}', 
        '${primaryTutor ? primaryTutor.phone : ""}',
        ${course.startDate ? `'${course.startDate}'` : 'NULL'}, 
        ${course.endDate ? `'${course.endDate}'` : 'NULL'}, 
        ${course.totalHours}, 
        ${course.hourlyRate || 60}
      );
    `);

    // Aggiungiamo le sessioni
    for (const session of course.sessions || []) {
      const sessionId = session.id || `session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      this.db.exec(`
        INSERT INTO course_sessions (id, courseId, date, startTime, endTime, hours)
        VALUES ('${sessionId}', '${courseId}', '${session.date}', '${session.startTime}',
          '${session.endTime}', ${session.hours});
      `);
    }

    return {
      ...course,
      id: courseId,
    };
  }

  async updateCourse(course: any): Promise<any> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    // Get the primary expert and tutor if using the new structure
    const primaryExpert = course.experts && course.experts.length > 0 ? course.experts[0] : null;
    const primaryTutor = course.tutors && course.tutors.length > 0 ? course.tutors[0] : null;

    this.db.exec(`
      UPDATE courses 
      SET title = '${course.title}', 
          description = '${course.description}', 
          projectId = '${course.projectId || ""}', 
          projectName = '${course.projectName}', 
          schoolId = '${course.schoolId || ""}', 
          schoolName = '${course.schoolName}', 
          location = '${course.location}', 
          totalHours = ${course.totalHours}, 
          expertId = '${primaryExpert ? primaryExpert.id : ""}', 
          expertName = '${primaryExpert ? primaryExpert.name : ""}', 
          tutorName = '${primaryTutor ? primaryTutor.name : ""}', 
          tutorPhone = '${primaryTutor ? primaryTutor.phone : ""}',
          startDate = ${course.startDate ? `'${course.startDate}'` : 'NULL'}, 
          endDate = ${course.endDate ? `'${course.endDate}'` : 'NULL'}, 
          remainingHours = ${course.remainingHours || course.totalHours}, 
          hourlyRate = ${course.hourlyRate || 60}
      WHERE id = '${course.id}';
    `);

    return course;
  }

  async deleteCourse(courseId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    // Eliminiamo prima le sessioni
    this.db.exec(`DELETE FROM course_sessions WHERE courseId = '${courseId}';`);
    
    // Poi eliminiamo il corso
    this.db.exec(`DELETE FROM courses WHERE id = '${courseId}';`);
  }

  async addCourseSession(courseId: string, session: CourseSession): Promise<CourseSession> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    const sessionId = session.id || `session-${Date.now()}`;
    
    this.db.exec(`
      INSERT INTO course_sessions (id, courseId, date, startTime, endTime, hours)
      VALUES ('${sessionId}', '${courseId}', '${session.date}', '${session.startTime}',
        '${session.endTime}', ${session.hours});
    `);

    // Aggiorniamo le ore rimanenti del corso
    this.db.exec(`
      UPDATE courses 
      SET remainingHours = remainingHours - ${session.hours}
      WHERE id = '${courseId}';
    `);

    return {
      ...session,
      id: sessionId,
    };
  }

  async updateCourseSession(session: CourseSession, courseId: string): Promise<CourseSession> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    // Otteniamo le ore attuali della sessione
    const currentResult = this.db.exec(`
      SELECT hours FROM course_sessions WHERE id = '${session.id}'
    `);
    
    if (currentResult.length === 0 || currentResult[0].values.length === 0) {
      throw new Error('Sessione non trovata');
    }
    
    // Convert SqlValue to number with Number() function
    const currentHours = Number(currentResult[0].values[0][0]);
    
    this.db.exec(`
      UPDATE course_sessions 
      SET date = '${session.date}', 
          startTime = '${session.startTime}', 
          endTime = '${session.endTime}', 
          hours = ${session.hours}
      WHERE id = '${session.id}';
    `);

    // Aggiorniamo le ore rimanenti del corso
    this.db.exec(`
      UPDATE courses 
      SET remainingHours = remainingHours - ${session.hours} + ${currentHours}
      WHERE id = '${courseId}';
    `);

    return session;
  }

  async deleteCourseSession(sessionId: string, courseId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    // Otteniamo le ore della sessione
    const result = this.db.exec(`
      SELECT hours FROM course_sessions WHERE id = '${sessionId}'
    `);
    
    if (result.length === 0 || result[0].values.length === 0) {
      throw new Error('Sessione non trovata');
    }
    
    // Convert SqlValue to number with Number() function
    const hours = Number(result[0].values[0][0]);
    
    // Eliminiamo la sessione
    this.db.exec(`DELETE FROM course_sessions WHERE id = '${sessionId}';`);
    
    // Aggiorniamo le ore rimanenti del corso
    this.db.exec(`
      UPDATE courses 
      SET remainingHours = remainingHours + ${hours}
      WHERE id = '${courseId}';
    `);
  }

  // Metodo per salvare il database come file (da implementare in una versione futura)
  exportDatabaseToFile(): Uint8Array {
    if (!this.db) throw new Error('Database non inizializzato');
    return this.db.export();
  }

  // Update this method to handle the new structure
  async getCourses(): Promise<any[]> {
    await this.init();
    if (!this.db) throw new Error('Database non inizializzato');

    const result = this.db.exec('SELECT * FROM courses');
    if (result.length === 0 || result[0].values.length === 0) {
      return [];
    }

    const courses = [];
    for (const row of result[0].values) {
      const courseId = row[0] as string;
      
      // Otteniamo le sessioni del corso
      const sessionsResult = this.db.exec(`
        SELECT * FROM course_sessions WHERE courseId = '${courseId}'
      `);
      
      const sessions: CourseSession[] = [];
      if (sessionsResult.length > 0) {
        for (const sessionRow of sessionsResult[0].values) {
          sessions.push({
            id: sessionRow[0] as string,
            date: sessionRow[2] as string,
            startTime: sessionRow[3] as string,
            endTime: sessionRow[4] as string,
            hours: sessionRow[5] as number,
          });
        }
      }
      
      // Create course with the new structure
      courses.push({
        id: courseId,
        title: row[1] as string,
        description: row[2] as string,
        projectId: row[3] as string,
        projectName: row[4] as string,
        schoolId: row[5] as string,
        schoolName: row[6] as string,
        location: row[7] as string,
        totalHours: row[8] as number,
        experts: [{ 
          id: row[9] as string, 
          name: row[10] as string,
          hourlyRate: row[16] as number
        }],
        tutors: [{ 
          name: row[11] as string, 
          phone: row[12] as string 
        }],
        startDate: row[13] as string,
        endDate: row[14] as string,
        remainingHours: row[15] as number,
        hourlyRate: row[16] as number,
        sessions,
      });
    }

    return courses;
  }
}

export default DatabaseService;
