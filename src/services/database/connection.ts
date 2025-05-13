
import mysql from 'mysql2/promise';

// Database configuration interface
export interface DbConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

// Singleton class to manage database connection
export class DatabaseConnection {
  private static instance: DatabaseConnection;
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

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
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

  public async getConnection(): Promise<mysql.Connection> {
    await this.init();
    if (!this.connection) throw new Error('Database non inizializzato');
    return this.connection;
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
}
