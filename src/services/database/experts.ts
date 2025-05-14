
import { DatabaseConnection } from './connection';

export class ExpertsService {
  private db = DatabaseConnection.getInstance();

  async getExperts(): Promise<any[]> {
    const expertRows = await this.db.execute('SELECT * FROM experts');
    
    if (expertRows.length === 0) {
      return [];
    }

    const experts = [];
    for (const row of expertRows) {
      const expertId = row.id;
      
      // Get subjects for this expert
      const subjectRows = await this.db.execute(`
        SELECT subject FROM expert_subjects WHERE expertId = ?
      `, [expertId]);
      
      const subjects: string[] = [];
      for (const subjectRow of subjectRows) {
        subjects.push(subjectRow.subject);
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
    const expertId = expert.id || `expert-${Date.now()}`;
    
    await this.db.execute(`
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

    // Add subjects
    for (const subject of expert.subjects || []) {
      await this.db.execute(`
        INSERT INTO expert_subjects (expertId, subject)
        VALUES (?, ?)
      `, [expertId, subject]);
    }

    // Save to localStorage
    DatabaseConnection.getInstance().saveToLocalStorage();

    return {
      ...expert,
      id: expertId,
    };
  }

  async updateExpert(expert: any): Promise<any> {
    await this.db.execute(`
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

    // Delete existing subjects
    await this.db.execute(`DELETE FROM expert_subjects WHERE expertId = ?`, [expert.id]);

    // Add new subjects
    for (const subject of expert.subjects || []) {
      await this.db.execute(`
        INSERT INTO expert_subjects (expertId, subject)
        VALUES (?, ?)
      `, [expert.id, subject]);
    }

    // Save to localStorage
    DatabaseConnection.getInstance().saveToLocalStorage();

    return expert;
  }

  async deleteExpert(expertId: string): Promise<void> {
    await this.db.execute(`DELETE FROM expert_subjects WHERE expertId = ?`, [expertId]);
    await this.db.execute(`DELETE FROM experts WHERE id = ?`, [expertId]);
    
    // Save to localStorage
    DatabaseConnection.getInstance().saveToLocalStorage();
  }
}
