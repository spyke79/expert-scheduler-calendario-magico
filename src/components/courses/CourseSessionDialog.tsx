
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
import { CourseSession, Course } from "@/types/schools";
import { getRemainingHours } from "@/utils/courseCalendar";
import { Clock } from "lucide-react";
import { useSessionForm } from "@/hooks/useSessionForm";
import { SessionTimeFields } from "./SessionTimeFields";
import { SessionConflictAlert } from "./SessionConflictAlert";
import { SessionHoursDisplay } from "./SessionHoursDisplay";

interface CourseSessionDialogProps {
  session?: CourseSession;
  course: Course;
  allCourses: Course[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (session: CourseSession) => void;
}

export function CourseSessionDialog({ 
  session, 
  course, 
  allCourses,
  open, 
  onOpenChange, 
  onSave 
}: CourseSessionDialogProps) {
  const {
    formData,
    hasConflict,
    conflictMessage,
    isEditing,
    handleInputChange
  } = useSessionForm({
    session,
    course,
    allCourses,
    isOpen: open
  });
  
  const remainingHours = getRemainingHours(course);
  
  // Calculate maximum available hours
  const availableHours = isEditing 
    ? remainingHours + (session?.hours || 0)
    : remainingHours;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.startTime || !formData.endTime || formData.hours <= 0) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    
    if (hasConflict) {
      toast.error("Impossibile programmare: l'esperto ha un conflitto di orario");
      return;
    }
    
    if (formData.hours > availableHours) {
      toast.error(`Non puoi assegnare più di ${availableHours} ore disponibili`);
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
              Inserisci i dettagli dell'incontro per il corso "{course.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2 rounded-md bg-muted/50 p-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm">
                  <span className="font-medium">Ore corso:</span> {course.totalHours}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Ore rimanenti:</span> {availableHours}
                </p>
              </div>
            </div>
            
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
            
            <SessionTimeFields
              startTime={formData.startTime}
              endTime={formData.endTime}
              onStartTimeChange={(value) => handleInputChange("startTime", value)}
              onEndTimeChange={(value) => handleInputChange("endTime", value)}
            />
            
            <SessionHoursDisplay
              hours={formData.hours}
              availableHours={availableHours}
            />
            
            <SessionConflictAlert 
              show={hasConflict} 
              message={conflictMessage} 
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={hasConflict || formData.hours > availableHours}
            >
              {session ? "Aggiorna" : "Aggiungi"} Incontro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
