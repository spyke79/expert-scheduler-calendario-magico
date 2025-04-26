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
import { Project } from "@/types/schools";

interface ProjectDialogProps {
  project?: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (project: Project) => void;
}

export function ProjectDialog({ project, open, onOpenChange, onSave }: ProjectDialogProps) {
  const [formData, setFormData] = useState<Omit<Project, "id" | "totalCourses" | "documents">>({
    name: project?.name || "",
    year: project?.year || new Date().getFullYear(),
    type: project?.type || "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    
    const newProject: Project = {
      id: project?.id || `project-${Date.now()}`,
      totalCourses: project?.totalCourses || 0,
      documents: project?.documents || [],
      ...formData
    };
    
    onSave(newProject);
    toast.success(project ? "Progetto aggiornato" : "Progetto aggiunto");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{project ? "Modifica Progetto" : "Aggiungi Progetto"}</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli del progetto
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Progetto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nome del progetto"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo Progetto *</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                placeholder="Es. PNRR, Scuola Viva, etc."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Anno *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange("year", Number(e.target.value))}
                min={2000}
                max={2100}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">
              {project ? "Aggiorna" : "Aggiungi"} Progetto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
