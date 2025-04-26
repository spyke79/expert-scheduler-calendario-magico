
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

export interface Project {
  id: string;
  name: string;
  year: number;
  type: string;
  documents: ProjectDocument[];
  totalCourses: number;
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
