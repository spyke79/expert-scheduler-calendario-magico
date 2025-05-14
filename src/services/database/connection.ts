
import initSqlJs, { Database } from 'sql.js';

// Database configuration interface
export interface DbConfig {
  dbName?: string;
}

// Singleton class to manage database connection
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: Database | null = null;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private config: DbConfig = {
    dbName: 'school_management'
  };

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public setConfig(config: Partial<DbConfig>): void {
    this.config = { ...this.config, ...config };
    // Reset connection if already initialized
    if (this.db) {
      this.db = null;
      this.initPromise = null;
    }
  }

  public async getConnection(): Promise<Database> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  public async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = new Promise<void>(async (resolve, reject) => {
      try {
        console.log('Initializing database...');
        
        const SQL = await initSqlJs({
          // Fetch the wasm file
          locateFile: file => `https://sql.js.org/dist/${file}`
        });
        
        // Create the database
        this.db = new SQL.Database();

        // Create tables
        await this.createTables();
        await this.loadInitialData();
        console.log('Database initialized successfully');
        this.isInitializing = false;
        resolve();
      } catch (error) {
        console.error('Error during database initialization:', error);
        this.isInitializing = false;
        reject(error);
      }
    });

    return this.initPromise;
  }

  public async execute(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) {
      await this.init();
      if (!this.db) throw new Error('Database not initialized');
    }
    
    try {
      const stmt = this.db.prepare(sql);
      
      // Bind parameters
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      
      const results: any[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
  }

  // Save the database to localStorage
  public saveToLocalStorage(): void {
    if (!this.db) return;
    
    const data = this.db.export();
    const buffer = new Uint8Array(data);
    const blob = new Blob([buffer]);
    
    // Convert to base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      localStorage.setItem(`${this.config.dbName}_data`, base64data);
      console.log('Database saved to localStorage');
    };
  }

  // Load the database from localStorage
  public async loadFromLocalStorage(): Promise<boolean> {
    const data = localStorage.getItem(`${this.config.dbName}_data`);
    if (!data) return false;
    
    try {
      // Convert base64 to array buffer
      const binaryString = window.atob(data.split(',')[1]);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      
      this.db = new SQL.Database(bytes);
      console.log('Database loaded from localStorage');
      return true;
    } catch (error) {
      console.error('Error loading database from localStorage:', error);
      return false;
    }
  }

  private async createTables(): Promise<void> {
    // Create tables (similar structure to the MySQL schema)
    await this.execute(`
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

    await this.execute(`
      CREATE TABLE IF NOT EXISTS school_locations (
        id TEXT PRIMARY KEY,
        schoolId TEXT NOT NULL,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        managerName TEXT NOT NULL,
        managerPhone TEXT NOT NULL,
        mapLink TEXT,
        FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE
      );
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        schoolId TEXT NOT NULL,
        name TEXT NOT NULL,
        year INTEGER NOT NULL,
        type TEXT NOT NULL,
        FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE
      );
    `);

    await this.execute(`
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

    await this.execute(`
      CREATE TABLE IF NOT EXISTS expert_subjects (
        expertId TEXT NOT NULL,
        subject TEXT NOT NULL,
        PRIMARY KEY (expertId, subject),
        FOREIGN KEY (expertId) REFERENCES experts(id) ON DELETE CASCADE
      );
    `);

    await this.execute(`
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
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (schoolId) REFERENCES schools(id) ON DELETE CASCADE,
        FOREIGN KEY (expertId) REFERENCES experts(id)
      );
    `);

    await this.execute(`
      CREATE TABLE IF NOT EXISTS course_sessions (
        id TEXT PRIMARY KEY,
        courseId TEXT NOT NULL,
        date TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        hours INTEGER NOT NULL,
        FOREIGN KEY (courseId) REFERENCES courses(id) ON DELETE CASCADE
      );
    `);
  }

  private async loadInitialData(): Promise<void> {
    // Check if we already have data
    const schools = await this.execute("SELECT COUNT(*) as count FROM schools");
    if (schools[0].count > 0) {
      console.log('Data already exists in the database');
      return;
    }

    // Initial schools data
    await this.execute(`
      INSERT INTO schools (id, name, address, principalName, principalPhone, managerName, managerPhone, mapLink) VALUES
      ('1', 'ITIS Galileo Galilei', 'Via della Scienza 123, Roma', 'Prof. Alessandro Manzoni', '333-1234567', 'Dott.ssa Elena Rossi', '333-7654321', 'https://maps.google.com/?q=Roma'),
      ('2', 'Liceo Scientifico Einstein', 'Viale delle Scienze 78, Milano', 'Prof.ssa Maria Curie', '333-4445555', 'Dott. Roberto Bianchi', '333-6667777', 'https://maps.google.com/?q=Milano');
    `);

    // Initial secondary locations
    await this.execute(`
      INSERT INTO school_locations (id, schoolId, name, address, managerName, managerPhone, mapLink) VALUES
      ('loc1', '1', 'Sede Distaccata Nord', 'Via dei Pini 45, Roma', 'Prof. Marco Verdi', '333-2223333', 'https://maps.google.com/?q=Roma+Via+dei+Pini');
    `);

    // Initial projects
    await this.execute(`
      INSERT INTO projects (id, schoolId, name, year, type) VALUES
      ('p1', '1', 'PNRR DM65', 2024, 'PNRR'),
      ('p2', '2', 'Scuola Viva', 2024, 'Regionale');
    `);

    // Initial experts
    await this.execute(`
      INSERT INTO experts (id, firstName, lastName, phone, email, fiscalCode, vatNumber) VALUES
      ('exp1', 'Mario', 'Rossi', '333-1234567', 'mario.rossi@example.com', 'RSSMRA80A01H501T', '12345678901'),
      ('exp2', 'Laura', 'Bianchi', '333-7654321', 'laura.bianchi@example.com', 'BNCLRA75A41H501Y', '09876543210'),
      ('exp3', 'Giuseppe', 'Verdi', '333-5555555', 'giuseppe.verdi@example.com', 'VRDGPP82A01H501R', '11223344556');
    `);

    // Initial expert subjects
    await this.execute(`
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

    // Initial courses
    await this.execute(`
      INSERT INTO courses (id, title, description, projectId, projectName, schoolId, schoolName, location, 
        totalHours, expertId, expertName, tutorName, tutorPhone, startDate, endDate, remainingHours, hourlyRate) VALUES
      ('1', 'Programmazione Web Base', 'Corso di base di programmazione web', 'p1', 'PNRR DM65', '1', 
        'ITIS Galileo Galilei', 'Sede Principale', 30, 'exp1', 'Mario Rossi', 'Giuseppe Verdi', '333-5555555',
        '2024-03-01', '2024-05-30', 20, 70),
      ('2', 'Inglese Avanzato', 'Corso avanzato di inglese', 'p2', 'Scuola Viva', '2', 
        'Liceo Scientifico Einstein', 'Sede Centrale', 40, 'exp2', 'Maria Brown', 'Anna Neri', '333-4444444',
        '2024-04-01', '2024-06-15', 40, 60);
    `);

    // Initial course sessions
    await this.execute(`
      INSERT INTO course_sessions (id, courseId, date, startTime, endTime, hours) VALUES
      ('session1', '1', '2025-05-15', '14:30', '17:30', 3),
      ('session2', '1', '2025-05-22', '14:30', '17:30', 3),
      ('session3', '2', '2025-05-10', '09:00', '12:00', 3);
    `);

    // Save the data to localStorage
    this.saveToLocalStorage();
  }
}
