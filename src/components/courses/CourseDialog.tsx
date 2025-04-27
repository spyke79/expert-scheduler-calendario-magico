
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Course, School } from "@/types/schools";

interface CourseDialogProps {
  course?: Course;
  experts: Array<{ id: string; firstName: string; lastName: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (course: Course) => void;
}

// Mock data - In a real app, this would come from an API
const mockSchools: School[] = [
  {
    id: "1",
    name: "ITIS Galileo Galilei",
    address: "Via Example 123",
    principalName: "Mario Rossi",
    principalPhone: "123456789",
    managerName: "Luigi Verdi",
    managerPhone: "987654321",
    secondaryLocations: [
      {
        name: "Sede Succursale",
        address: "Via Example 456",
        managerName: "Giuseppe Bianchi",
        managerPhone: "123123123"
      }
    ],
    projects: [
      {
        id: "p1",
        name: "PNRR DM65",
        year: 2024,
        type: "PNRR",
        documents: [],
        totalCourses: 5,
        courses: []
      },
      {
        id: "p2",
        name: "Scuola Viva",
        year: 2024,
        type: "PON",
        documents: [],
        totalCourses: 3,
        courses: []
      }
    ]
  }
];

export function CourseDialog({ course, experts, open, onOpenChange, onSave }: CourseDialogProps) {
  const [formData, setFormData] = useState<Omit<Course, "id" | "sessions">>({
    title: course?.title || "",
    description: course?.description || "",
    projectId: course?.projectId || "",
    projectName: course?.projectName || "",
    schoolId: course?.schoolId || "",
    schoolName: course?.schoolName || "",
    location: course?.location || "",
    totalHours: course?.totalHours || 0,
    expertId: course?.expertId || "",
    expertName: course?.expertName || "",
    tutor: course?.tutor || { name: "", phone: "" }
  });

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(course?.schoolId || "");
  
  const selectedSchool = useMemo(() => 
    mockSchools.find(s => s.id === selectedSchoolId), 
    [selectedSchoolId]
  );

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSchoolChange = (schoolId: string) => {
    const school = mockSchools.find(s => s.id === schoolId);
    if (school) {
      setSelectedSchoolId(schoolId);
      handleInputChange("schoolId", schoolId);
      handleInputChange("schoolName", school.name);
      handleInputChange("projectId", "");
      handleInputChange("projectName", "");
      handleInputChange("location", "");
    }
  };

  const handleProjectChange = (projectId: string) => {
    const project = selectedSchool?.projects.find(p => p.id === projectId);
    if (project) {
      handleInputChange("projectId", projectId);
      handleInputChange("projectName", project.name);
    }
  };

  const handleExpertChange = (expertId: string) => {
    const expert = experts.find(e => e.id === expertId);
    if (expert) {
      handleInputChange("expertId", expertId);
      handleInputChange("expertName", `${expert.firstName} ${expert.lastName}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.totalHours || 
        !formData.expertId || !formData.tutor.name || !formData.tutor.phone ||
        !formData.schoolId || !formData.projectId || !formData.location) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    
    const newCourse: Course = {
      id: course?.id || `course-${Date.now()}`,
      sessions: course?.sessions || [],
      ...formData
    };
    
    onSave(newCourse);
    toast.success(course ? "Corso aggiornato" : "Corso aggiunto");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{course ? "Modifica Corso" : "Aggiungi Corso"}</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli del corso di formazione
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo del Corso *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Titolo del corso"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descrizione del corso"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="school">Scuola *</Label>
                <Select
                  value={formData.schoolId}
                  onValueChange={handleSchoolChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona una scuola" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSchools && mockSchools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSchool && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="project">Progetto *</Label>
                    <Select
                      value={formData.projectId}
                      onValueChange={handleProjectChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un progetto" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedSchool.projects && selectedSchool.projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Sede del Corso *</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => handleInputChange("location", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona una sede" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={selectedSchool.address}>
                          Sede Principale - {selectedSchool.address}
                        </SelectItem>
                        {selectedSchool.secondaryLocations && selectedSchool.secondaryLocations.map((location, index) => (
                          <SelectItem key={index} value={location.address}>
                            {location.name} - {location.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalHours">Ore Totali *</Label>
                  <Input
                    id="totalHours"
                    type="number"
                    value={formData.totalHours}
                    onChange={(e) => handleInputChange("totalHours", Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expert">Esperto *</Label>
                  <Select
                    value={formData.expertId}
                    onValueChange={handleExpertChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un esperto" />
                    </SelectTrigger>
                    <SelectContent>
                      {experts && experts.map((expert) => (
                        <SelectItem key={expert.id} value={expert.id}>
                          {expert.firstName} {expert.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tutor del Corso</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={formData.tutor.name}
                    onChange={(e) => handleInputChange("tutor", { ...formData.tutor, name: e.target.value })}
                    placeholder="Nome e cognome del tutor"
                    required
                  />
                  <Input
                    value={formData.tutor.phone}
                    onChange={(e) => handleInputChange("tutor", { ...formData.tutor, phone: e.target.value })}
                    placeholder="Telefono del tutor"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">
              {course ? "Aggiorna" : "Aggiungi"} Corso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
