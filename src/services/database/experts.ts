
import { DatabaseConnection } from './connection';

export class ExpertsService {
  private db = DatabaseConnection.getInstance();

  async getExperts(): Promise<any[]> {
    const connection = await this.db.getConnection();

    const [expertRows]: any = await connection.execute('SELECT * FROM experts');
    
    if (expertRows.length === 0) {
      return [];
    }

    const experts = [];
    for (const row of expertRows) {
      const expertId = row.id;
      
      // Otteniamo le materie dell'esperto
      const [subjectRows]: any = await connection.execute(`
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
    const connection = await this.db.getConnection();

    const expertId = expert.id || `expert-${Date.now()}`;
    
    await connection.execute(`
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
      await connection.execute(`
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
    const connection = await this.db.getConnection();

    await connection.execute(`
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
    await connection.execute(`DELETE FROM expert_subjects WHERE expertId = ?`, [expert.id]);

    // Aggiungiamo le nuove materie
    for (const subject of expert.subjects || []) {
      await connection.execute(`
        INSERT INTO expert_subjects (expertId, subject)
        VALUES (?, ?)
      `, [expert.id, subject]);
    }

    return expert;
  }

  async deleteExpert(expertId: string): Promise<void> {
    const connection = await this.db.getConnection();
    // MySQL cascade delete handles child tables
    await connection.execute(`DELETE FROM experts WHERE id = ?`, [expertId]);
  }
}
