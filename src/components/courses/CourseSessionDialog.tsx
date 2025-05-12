
import { useState, useEffect } from "react";
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
import { hasExpertConflict, getRemainingHours } from "@/utils/courseCalendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, AlertTriangle, Clock } from "lucide-react";
import { calculateHoursFromTimes } from "@/utils/courseCalendar";

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
  const [formData, setFormData] = useState<Omit<CourseSession, "id">>({
    date: session?.date || "",
    startTime: session?.startTime || "",
    endTime: session?.endTime || "",
    hours: session?.hours || 0,
  });
  
  const [hasConflict, setHasConflict] = useState<boolean>(false);
  const [conflictMessage, setConflictMessage] = useState<string>("");
  const remainingHours = getRemainingHours(course);
  const isEditing = Boolean(session);
  
  // Calculate maximum available hours
  const availableHours = isEditing 
    ? remainingHours + session.hours 
    : remainingHours;

  const handleInputChange = (field: string, value: any) => {
    const updatedFormData = { ...formData, [field]: value };
    
    // Automatically calculate hours if both start and end times are set
    if ((field === 'startTime' || field === 'endTime') && 
        updatedFormData.startTime && updatedFormData.endTime) {
      const calculatedHours = calculateHoursFromTimes(
        updatedFormData.startTime,
        updatedFormData.endTime
      );
      updatedFormData.hours = calculatedHours;
    }
    
    setFormData(updatedFormData);
    
    // Check for conflicts whenever date or time changes
    if (field === 'date' || field === 'startTime' || field === 'endTime') {
      checkForConflicts(updatedFormData);
    }
  };

  const checkForConflicts = (data: Omit<CourseSession, "id">) => {
    // Only check if we have all the required fields
    if (data.date && data.startTime && data.endTime) {
      // Use the first expert's ID for conflict checking if available
      const expertId = course.experts && course.experts.length > 0 ? course.experts[0].id : '';
      
      const conflict = hasExpertConflict(
        data,
        expertId,
        allCourses,
        course.id
      );
      
      setHasConflict(conflict);
      setConflictMessage(
        conflict 
          ? "Conflitto: l'esperto ha già un altro corso programmato in questo orario" 
          : ""
      );
    }
  };

  // Recalculate hours when both times change and dialog opens
  useEffect(() => {
    if (open && formData.startTime && formData.endTime) {
      const calculatedHours = calculateHoursFromTimes(
        formData.startTime,
        formData.endTime
      );
      
      if (calculatedHours !== formData.hours) {
        setFormData(prev => ({
          ...prev,
          hours: calculatedHours
        }));
      }
      
      checkForConflicts(formData);
    }
  }, [open, formData.startTime, formData.endTime]);

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
              <Label htmlFor="hours">Ore (calcolate automaticamente) *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="hours"
                  type="number"
                  value={formData.hours}
                  readOnly
                  className={`${formData.hours > availableHours ? "border-red-500" : ""} bg-muted`}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  Max: {availableHours}h
                </span>
              </div>
              {formData.hours > availableHours && (
                <p className="text-sm text-red-500">
                  Ore eccedenti il totale disponibile
                </p>
              )}
            </div>
            
            {hasConflict && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {conflictMessage}
                </AlertDescription>
              </Alert>
            )}
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
