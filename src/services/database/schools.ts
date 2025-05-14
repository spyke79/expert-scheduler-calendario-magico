
import { School, SchoolLocation, Project, Course, CourseSession } from '@/types/schools';
import { DatabaseConnection } from './connection';

export class SchoolsService {
  private db = DatabaseConnection.getInstance();

  async getSchools(): Promise<School[]> {
    // Get all schools with project count
    const schoolRows = await this.db.execute(`
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
      
      // Get secondary locations
      const locationRows = await this.db.execute(`
        SELECT * FROM school_locations WHERE schoolId = ?
      `, [schoolId]);
      
      const secondaryLocations: SchoolLocation[] = [];
      for (const locationRow of locationRows) {
        secondaryLocations.push({
          name: locationRow.name,
          address: locationRow.address,
          managerName: locationRow.managerName,
          managerPhone: locationRow.managerPhone,
          mapLink: locationRow.mapLink,
        });
      }

      // Get projects
      const projectRows = await this.db.execute(`
        SELECT * FROM projects WHERE schoolId = ?
      `, [schoolId]);
      
      const projects: Project[] = [];
      for (const projectRow of projectRows) {
        const projectId = projectRow.id;
        
        // Get courses for each project
        const courseRows = await this.db.execute(`
          SELECT * FROM courses WHERE projectId = ?
        `, [projectId]);
        
        const courses: Course[] = [];
        for (const courseRow of courseRows) {
          const courseId = courseRow.id;
          
          // Get sessions for each course
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
    const schoolId = `school-${Date.now()}`;
    
    await this.db.execute(`
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

    // Add secondary locations
    for (const location of school.secondaryLocations || []) {
      const locationId = `loc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      await this.db.execute(`
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

    // Save to localStorage
    DatabaseConnection.getInstance().saveToLocalStorage();

    return {
      ...school,
      id: schoolId,
      projects: [],
    };
  }

  async updateSchool(school: School): Promise<School> {
    await this.db.execute(`
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

    // Delete existing secondary locations
    await this.db.execute(`DELETE FROM school_locations WHERE schoolId = ?`, [school.id]);

    // Add new secondary locations
    for (const location of school.secondaryLocations || []) {
      const locationId = `loc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      await this.db.execute(`
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

    // Save to localStorage
    DatabaseConnection.getInstance().saveToLocalStorage();

    return school;
  }

  async deleteSchool(schoolId: string): Promise<void> {
    // SQLite doesn't automatically handle cascading deletes, so we need to do it manually
    const courseIds = await this.db.execute(`SELECT id FROM courses WHERE schoolId = ?`, [schoolId]);
    for (const course of courseIds) {
      await this.db.execute(`DELETE FROM course_sessions WHERE courseId = ?`, [course.id]);
    }
    
    await this.db.execute(`DELETE FROM courses WHERE schoolId = ?`, [schoolId]);
    
    const projectIds = await this.db.execute(`SELECT id FROM projects WHERE schoolId = ?`, [schoolId]);
    for (const project of projectIds) {
      await this.db.execute(`DELETE FROM projects WHERE id = ?`, [project.id]);
    }
    
    await this.db.execute(`DELETE FROM school_locations WHERE schoolId = ?`, [schoolId]);
    await this.db.execute(`DELETE FROM schools WHERE id = ?`, [schoolId]);
    
    // Save to localStorage
    DatabaseConnection.getInstance().saveToLocalStorage();
  }
}
