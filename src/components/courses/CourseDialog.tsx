
import { useState, useEffect } from "react";
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
import { Course, School, Expert, Tutor } from "@/types/schools";
import DatabaseService from "@/services/database";
import { Plus, X, UserPlus } from "lucide-react";

interface CourseDialogProps {
  course?: Course;
  experts: Array<{ id: string; firstName: string; lastName: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (course: Course) => void;
}

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
    experts: course?.experts || [],
    tutors: course?.tutors || []
  });

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(course?.schoolId || "");
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedExpertId, setSelectedExpertId] = useState<string>("");
  const [newTutor, setNewTutor] = useState<{name: string, phone: string}>({name: "", phone: ""});
  
  // Carica le scuole dal database
  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoading(true);
        const db = DatabaseService.getInstance();
        const schoolsData = await db.getSchools();
        setSchools(schoolsData);
      } catch (error) {
        console.error("Errore durante il caricamento delle scuole:", error);
        toast.error("Errore durante il caricamento delle scuole");
      } finally {
        setLoading(false);
      }
    };

    loadSchools();
  }, []);

  // Trova la scuola selezionata
  const selectedSchool = schools.find(s => s.id === selectedSchoolId);

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSchoolChange = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
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

  const addExpert = () => {
    if (!selectedExpertId) return;
    
    const expert = experts.find(e => e.id === selectedExpertId);
    if (expert) {
      // Verifica che l'esperto non sia già presente
      if (formData.experts.some(e => e.id === expert.id)) {
        toast.error("Questo esperto è già stato aggiunto");
        return;
      }
      
      const newExperts = [
        ...formData.experts,
        { 
          id: expert.id, 
          name: `${expert.firstName} ${expert.lastName}` 
        }
      ];
      
      handleInputChange("experts", newExperts);
      setSelectedExpertId("");
    }
  };

  const removeExpert = (expertId: string) => {
    const newExperts = formData.experts.filter(e => e.id !== expertId);
    handleInputChange("experts", newExperts);
  };

  const addTutor = () => {
    if (!newTutor.name || !newTutor.phone) {
      toast.error("Inserisci nome e telefono del tutor");
      return;
    }
    
    const newTutors = [...formData.tutors, newTutor];
    handleInputChange("tutors", newTutors);
    setNewTutor({name: "", phone: ""});
  };

  const removeTutor = (index: number) => {
    const newTutors = [...formData.tutors];
    newTutors.splice(index, 1);
    handleInputChange("tutors", newTutors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.totalHours || 
        formData.experts.length === 0 || formData.tutors.length === 0 ||
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
                {loading ? (
                  <div className="text-sm text-muted-foreground">Caricamento scuole...</div>
                ) : (
                  <Select
                    value={formData.schoolId}
                    onValueChange={handleSchoolChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona una scuola" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              {selectedSchool && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="project">Progetto *</Label>
                    <Select
                      value={formData.projectId}
                      onValueChange={handleProjectChange}
                      required
                      disabled={!selectedSchool || selectedSchool.projects.length === 0}
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
                <Label>Esperti del Corso *</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex gap-2">
                    <Select
                      value={selectedExpertId}
                      onValueChange={setSelectedExpertId}
                    >
                      <SelectTrigger className="flex-1">
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
                    <Button type="button" onClick={addExpert}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    {formData.experts.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Nessun esperto aggiunto</div>
                    ) : (
                      formData.experts.map((expert) => (
                        <div key={expert.id} className="flex items-center justify-between border p-2 rounded-md">
                          <span>{expert.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExpert(expert.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tutor del Corso *</Label>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex gap-2">
                    <Input
                      value={newTutor.name}
                      onChange={(e) => setNewTutor({...newTutor, name: e.target.value})}
                      placeholder="Nome e cognome del tutor"
                      className="flex-1"
                    />
                    <Input
                      value={newTutor.phone}
                      onChange={(e) => setNewTutor({...newTutor, phone: e.target.value})}
                      placeholder="Telefono del tutor"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addTutor}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 mt-2">
                    {formData.tutors.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Nessun tutor aggiunto</div>
                    ) : (
                      formData.tutors.map((tutor, index) => (
                        <div key={index} className="flex items-center justify-between border p-2 rounded-md">
                          <span>{tutor.name} • {tutor.phone}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTutor(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
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
