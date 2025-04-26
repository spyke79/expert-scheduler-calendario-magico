
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
import { CourseSession } from "@/types/schools";

interface CourseSessionDialogProps {
  session?: CourseSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (session: CourseSession) => void;
}

export function CourseSessionDialog({ session, open, onOpenChange, onSave }: CourseSessionDialogProps) {
  const [formData, setFormData] = useState<Omit<CourseSession, "id">>({
    date: session?.date || "",
    startTime: session?.startTime || "",
    endTime: session?.endTime || "",
    hours: session?.hours || 0,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.hours) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    
    const newSession: CourseSession = {
      id: session?.id || `session-${Date.now()}`,
      ...formData
    };
    
    onSave(newSession);
    toast.success(session ? "Incontro aggiornato" : "Incontro aggiunto");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{session ? "Modifica Incontro" : "Nuovo Incontro"}</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli dell'incontro
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Ora Inizio *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">Ora Fine *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hours">Ore *</Label>
              <Input
                id="hours"
                type="number"
                value={formData.hours}
                onChange={(e) => handleInputChange("hours", Number(e.target.value))}
                min="1"
                step="0.5"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">
              {session ? "Aggiorna" : "Aggiungi"} Incontro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
