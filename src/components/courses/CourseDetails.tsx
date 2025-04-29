
import React from "react";
import { Course, CourseSession } from "@/types/schools";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Book, Clock, Pencil } from "lucide-react";
import { format } from "date-fns";
import { CourseDialog } from "./CourseDialog";
import { it } from "date-fns/locale";

interface CourseDetailsProps {
  course: Course;
  experts: Array<{ id: string; firstName: string; lastName: string }>;
  onUpdate: (course: Course) => void;
  onClose: () => void;
}

export function CourseDetails({ course, experts, onUpdate, onClose }: CourseDetailsProps) {
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  // Ordina le sessioni per data
  const sortedSessions = [...course.sessions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calcola le ore completate e rimanenti
  const completedHours = sortedSessions.reduce((total, session) => total + session.hours, 0);
  const remainingHours = course.totalHours - completedHours;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: it });
    } catch (error) {
      return dateString;
    }
  };

  const handleUpdate = (updatedCourse: Course) => {
    onUpdate(updatedCourse);
    setShowEditDialog(false);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{course.projectName}</Badge>
              <Badge variant="outline">{course.schoolName}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
            <Pencil className="h-4 w-4 mr-1" /> Modifica
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Descrizione</h3>
            <p className="text-muted-foreground">{course.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Informazioni corso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Sede</p>
                <p className="text-sm">{course.location}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Progetto</p>
                <p className="text-sm">{course.projectName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Ore Totali</p>
                <p className="text-sm">{course.totalHours}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Ore Rimanenti</p>
                <p className="text-sm">{remainingHours}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Esperti</h3>
            <div className="space-y-2">
              {course.experts.map((expert) => (
                <div key={expert.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                  <span>{expert.name}</span>
                  <Badge variant="outline">{expert.hourlyRate || 60}€/ora</Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Tutor</h3>
            <div className="space-y-2">
              {course.tutors.map((tutor, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                  <span>{tutor.name}</span>
                  <span className="text-sm text-muted-foreground">{tutor.phone}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Calendario</h3>
            {sortedSessions.length > 0 ? (
              <div className="space-y-2">
                {sortedSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{formatDate(session.date)}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.startTime} - {session.endTime}
                        </p>
                      </div>
                    </div>
                    <Badge>{session.hours} ore</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 bg-slate-50 rounded-md">
                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nessuna sessione programmata</p>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Chiudi
          </Button>
        </CardFooter>
      </Card>

      <CourseDialog
        course={course}
        experts={experts}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleUpdate}
      />
    </>
  );
}
