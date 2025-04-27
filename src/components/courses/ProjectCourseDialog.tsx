
import { useState } from "react";
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
import { Course } from "@/types/schools";

interface ProjectCourseDialogProps {
  course?: Course;
  experts: Array<{ id: string; firstName: string; lastName: string }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (course: Course) => void;
}

export function ProjectCourseDialog({ course, experts, open, onOpenChange, onSave }: ProjectCourseDialogProps) {
  const [formData, setFormData] = useState<Omit<Course, "id" | "sessions">>({
    title: course?.title || "",
    description: course?.description || "",
    projectName: course?.projectName || "",
    schoolName: course?.schoolName || "",
    location: course?.location || "",
    totalHours: course?.totalHours || 0,
    expertId: course?.expertId || "",
    expertName: course?.expertName || "",
    tutor: course?.tutor || { name: "", phone: "" },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
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
        !formData.expertId || !formData.tutor.name || !formData.tutor.phone) {
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
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{course ? "Modifica Corso" : "Nuovo Corso"}</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli del corso
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="schoolName">Nome Scuola *</Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => handleInputChange("schoolName", e.target.value)}
                placeholder="Nome della scuola"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="projectName">Nome Progetto *</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => handleInputChange("projectName", e.target.value)}
                placeholder="Nome del progetto"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Sede *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Sede del corso"
                required
              />
            </div>
            
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
                  {experts.map((expert) => (
                    <SelectItem key={expert.id} value={expert.id}>
                      {expert.firstName} {expert.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
