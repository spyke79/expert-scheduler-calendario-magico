
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
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { Course, Expert, Tutor } from "@/types/schools";

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
    experts: course?.experts || [],
    tutors: course?.tutors || [{ name: "", phone: "" }],
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleExpertChange = (expertId: string) => {
    const expert = experts.find(e => e.id === expertId);
    if (expert) {
      // Create a new expert entry with default hourly rate
      const newExpert: Expert = {
        id: expertId,
        name: `${expert.firstName} ${expert.lastName}`,
        hourlyRate: 60 // Default hourly rate
      };

      // Add expert if not already in the list
      if (!formData.experts.some(e => e.id === expertId)) {
        handleInputChange("experts", [...formData.experts, newExpert]);
      }
    }
  };

  const handleExpertHourlyRateChange = (expertId: string, hourlyRate: number) => {
    const updatedExperts = formData.experts.map(expert => 
      expert.id === expertId ? { ...expert, hourlyRate } : expert
    );
    handleInputChange("experts", updatedExperts);
  };

  const handleRemoveExpert = (expertId: string) => {
    handleInputChange("experts", formData.experts.filter(e => e.id !== expertId));
  };

  const handleAddTutor = () => {
    handleInputChange("tutors", [...formData.tutors, { name: "", phone: "" }]);
  };

  const handleTutorChange = (index: number, field: keyof Tutor, value: string) => {
    const updatedTutors = [...formData.tutors];
    updatedTutors[index] = { ...updatedTutors[index], [field]: value };
    handleInputChange("tutors", updatedTutors);
  };

  const handleRemoveTutor = (index: number) => {
    if (formData.tutors.length > 1) {
      handleInputChange("tutors", formData.tutors.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.totalHours || 
        formData.experts.length === 0) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    
    // Validate tutors
    const invalidTutors = formData.tutors.some(tutor => !tutor.name || !tutor.phone);
    if (invalidTutors) {
      toast.error("Completa i dati di tutti i tutor");
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
              <Label>Esperti *</Label>
              <div className="space-y-2">
                {formData.experts.map((expert, index) => (
                  <div key={expert.id} className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-50 p-2 rounded-md">
                      {expert.name}
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        value={expert.hourlyRate || 60}
                        onChange={(e) => handleExpertHourlyRateChange(expert.id, Number(e.target.value))}
                        min="1"
                        placeholder="€/ora"
                        className="w-full text-right"
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveExpert(expert.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Select onValueChange={handleExpertChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Aggiungi esperto" />
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
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tutor del Corso</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddTutor}
                >
                  <Plus className="h-4 w-4 mr-1" /> Aggiungi Tutor
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.tutors.map((tutor, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={tutor.name}
                      onChange={(e) => handleTutorChange(index, "name", e.target.value)}
                      placeholder="Nome e cognome del tutor"
                      required
                    />
                    <Input
                      value={tutor.phone}
                      onChange={(e) => handleTutorChange(index, "phone", e.target.value)}
                      placeholder="Telefono del tutor"
                      required
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveTutor(index)}
                      disabled={formData.tutors.length === 1}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
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
