
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  projectName: string;
  schoolName: string;
  location: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  remainingHours: number;
  hourlyRate: number;
  experts: {
    name: string;
    hourlyRate: number;
  }[];
  tutor: {
    name: string;
    phone: string;
  };
}

interface CourseDialogProps {
  course?: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (course: Course) => void;
}

export function CourseDialog({ course, open, onOpenChange, onSave }: CourseDialogProps) {
  const [formData, setFormData] = useState<Omit<Course, "id" | "remainingHours">>({
    title: course?.title || "",
    projectName: course?.projectName || "",
    schoolName: course?.schoolName || "",
    location: course?.location || "",
    startDate: course?.startDate || "",
    endDate: course?.endDate || "",
    totalHours: course?.totalHours || 0,
    hourlyRate: course?.hourlyRate || 0,
    experts: course?.experts || [],
    tutor: course?.tutor || { name: "", phone: "" }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.projectName || !formData.schoolName || 
        !formData.startDate || !formData.endDate || !formData.totalHours || 
        !formData.hourlyRate || !formData.tutor.name || !formData.tutor.phone) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    
    if (formData.experts.length === 0) {
      toast.error("Aggiungi almeno un esperto al corso");
      return;
    }
    
    const newCourse: Course = {
      id: course?.id || `course-${Date.now()}`,
      remainingHours: formData.totalHours,
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Progetto *</Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange("projectName", e.target.value)}
                    placeholder="Nome del progetto"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="schoolName">Scuola *</Label>
                  <Input
                    id="schoolName"
                    value={formData.schoolName}
                    onChange={(e) => handleInputChange("schoolName", e.target.value)}
                    placeholder="Nome della scuola"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Sede del Corso *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Sede dove si terrà il corso"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data Inizio *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data Fine *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    required
                  />
                </div>
              </div>
              
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
                  <Label htmlFor="hourlyRate">Costo Orario *</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange("hourlyRate", Number(e.target.value))}
                    min="0"
                    required
                  />
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
