
export interface SchoolLocation {
  name: string;
  address: string;
  managerName: string;
  managerPhone: string;
  mapLink?: string;
}

export interface ProjectDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

export interface CourseSession {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
}

export interface Expert {
  id: string;
  name: string;
  hourlyRate?: number;
}

export interface Tutor {
  name: string;
  phone: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  projectName: string;
  schoolId?: string;
  schoolName: string;
  location: string;
  totalHours: number;
  experts: Expert[];
  tutors: Tutor[];
  sessions: CourseSession[];
}

export interface Project {
  id: string;
  name: string;
  year: number;
  type: string;
  documents: ProjectDocument[];
  totalCourses: number;
  courses: Course[];
}

export interface School {
  id: string;
  name: string;
  address: string;
  principalName: string;
  principalPhone: string;
  managerName: string;
  managerPhone: string;
  mapLink?: string;
  secondaryLocations: SchoolLocation[];
  projects: Project[];
}
