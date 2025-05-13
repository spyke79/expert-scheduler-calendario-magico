
import { School, SchoolLocation, Project, Course, CourseSession } from '@/types/schools';
import { DatabaseConnection } from './connection';

export class SchoolsService {
  private db = DatabaseConnection.getInstance();

  async getSchools(): Promise<School[]> {
    const connection = await this.db.getConnection();

    const [schoolRows]: any = await connection.execute(`
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
      const [locationRows]: any = await connection.execute(`
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
      const [projectRows]: any = await connection.execute(`
        SELECT * FROM projects WHERE schoolId = ?
      `, [schoolId]);
      
      const projects: Project[] = [];
      if (projectRows.length > 0) {
        for (const projectRow of projectRows) {
          const projectId = projectRow.id;
          
          // Per ogni progetto, otteniamo i corsi correlati
          const [courseRows]: any = await connection.execute(`
            SELECT * FROM courses WHERE projectId = ?
          `, [projectId]);
          
          const courses: Course[] = [];
          if (courseRows.length > 0) {
            for (const courseRow of courseRows) {
              const courseId = courseRow.id;
              
              // Per ogni corso, otteniamo le sessioni
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
    const connection = await this.db.getConnection();

    const schoolId = `school-${Date.now()}`;
    
    await connection.execute(`
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
      await connection.execute(`
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
    const connection = await this.db.getConnection();

    await connection.execute(`
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
    await connection.execute(`DELETE FROM school_locations WHERE schoolId = ?`, [school.id]);

    // Aggiungiamo le nuove sedi secondarie
    for (const location of school.secondaryLocations || []) {
      const locationId = `loc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      await connection.execute(`
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
    const connection = await this.db.getConnection();
    // MySQL cascade delete handles the child relationships
    await connection.execute(`DELETE FROM schools WHERE id = ?`, [schoolId]);
  }
}
