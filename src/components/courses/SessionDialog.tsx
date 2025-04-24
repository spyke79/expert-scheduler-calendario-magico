
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Phone, Clock, User } from "lucide-react";
import { format } from "date-fns";

interface CourseSession {
  id: string;
  courseId: string;
  courseName: string;
  schoolName: string;
  locationName: string;
  locationAddress: string;
  mapLink: string;
  tutorName: string;
  tutorPhone: string;
  date: Date;
  startTime: string;
  endTime: string;
}

interface SessionDialogProps {
  session: CourseSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionDialog({ session, open, onOpenChange }: SessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{session.courseName}</DialogTitle>
          <DialogDescription>
            {session.schoolName} - {session.locationName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Data</p>
              <p>{format(session.date, "dd/MM/yyyy")}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Orario</p>
              <p>{session.startTime} - {session.endTime}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Luogo</p>
              <p>{session.locationAddress}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Tutor</p>
              <div className="flex items-center">
                <span>{session.tutorName}</span>
                <a
                  href={`tel:${session.tutorPhone}`}
                  className="inline-flex items-center ml-2 text-primary"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  {session.tutorPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Chiudi
          </Button>
          <Button asChild>
            <a href={session.mapLink} target="_blank" rel="noopener noreferrer">
              <MapPin className="h-4 w-4 mr-2" />
              Visualizza Mappa
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
