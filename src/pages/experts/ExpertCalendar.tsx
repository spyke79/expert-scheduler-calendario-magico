
import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { CalendarIcon } from "lucide-react";
import { SessionDialog } from "@/components/courses/SessionDialog";
import { ExpertSchedule } from "@/components/experts/ExpertSchedule";

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

const ExpertCalendar = () => {
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CourseSession | null>(null);

  // Demo data - in a real app this would come from API or context
  const expertId = "exp-1"; // Current logged-in expert
  const courses = [
    {
      id: "c1",
      title: "Programmazione Web Base",
      description: "Introduzione alla programmazione web",
      projectName: "PNRR",
      schoolName: "ITIS Informatica",
      location: "Aula Magna",
      totalHours: 30,
      expertId: "exp-1",
      expertName: "Mario Rossi",
      tutor: {
        name: "Marco Verdi",
        phone: "333-2223333"
      },
      sessions: [
        {
          id: "s1",
          date: "2025-04-28",
          startTime: "15:00",
          endTime: "18:00",
          hours: 3
        },
        {
          id: "s2",
          date: "2025-04-30",
          startTime: "15:00",
          endTime: "18:00",
          hours: 3
        }
      ]
    },
    {
      id: "c2",
      title: "Matematica Avanzata",
      description: "Corso di matematica avanzata",
      projectName: "PON 2024",
      schoolName: "Liceo Scientifico",
      location: "Aula 3B",
      totalHours: 20,
      expertId: "exp-1",
      expertName: "Mario Rossi",
      tutor: {
        name: "Luisa Neri",
        phone: "333-4445555"
      },
      sessions: [
        {
          id: "s3",
          date: "2025-04-29",
          startTime: "14:30",
          endTime: "16:30",
          hours: 2
        }
      ]
    },
    {
      id: "c3",
      title: "Inglese Commerciale",
      description: "Business English",
      projectName: "Erasmus Plus",
      schoolName: "Istituto Tecnico",
      location: "Aula Lingue",
      totalHours: 25,
      expertId: "exp-2", // Different expert
      expertName: "Giovanna Bianchi",
      tutor: {
        name: "Giulia Rossi",
        phone: "333-6667777"
      },
      sessions: [
        {
          id: "s4",
          date: "2025-04-30",
          startTime: "09:00",
          endTime: "12:00",
          hours: 3
        }
      ]
    }
  ];

  // Demo session data mapping
  const sessionMap: Record<string, CourseSession> = {
    "s1": {
      id: "s1",
      courseId: "c1",
      courseName: "Programmazione Web Base",
      schoolName: "ITIS Galileo Galilei",
      locationName: "Sede Centrale",
      locationAddress: "Via della Scienza 123, Roma",
      mapLink: "https://maps.google.com/?q=Roma+Via+della+Scienza",
      tutorName: "Marco Verdi",
      tutorPhone: "333-2223333",
      date: new Date(2025, 3, 28),
      startTime: "15:00",
      endTime: "18:00"
    },
    "s2": {
      id: "s2",
      courseId: "c1",
      courseName: "Programmazione Web Base",
      schoolName: "ITIS Galileo Galilei",
      locationName: "Sede Centrale",
      locationAddress: "Via della Scienza 123, Roma",
      mapLink: "https://maps.google.com/?q=Roma+Via+della+Scienza",
      tutorName: "Marco Verdi",
      tutorPhone: "333-2223333",
      date: new Date(2025, 3, 30),
      startTime: "15:00",
      endTime: "18:00"
    },
    "s3": {
      id: "s3",
      courseId: "c2",
      courseName: "Matematica Avanzata",
      schoolName: "Liceo Scientifico Einstein",
      locationName: "Aula Magna",
      locationAddress: "Viale delle Scienze 78, Milano",
      mapLink: "https://maps.google.com/?q=Milano+Viale+delle+Scienze",
      tutorName: "Luisa Neri",
      tutorPhone: "333-4445555",
      date: new Date(2025, 3, 29),
      startTime: "14:30",
      endTime: "16:30"
    }
  };

  const handleViewSession = (courseId: string, sessionId: string) => {
    const session = sessionMap[sessionId];
    if (session) {
      setSelectedSession(session);
      setSessionDialogOpen(true);
    }
  };

  // Calculate statistics
  const expertCourses = courses.filter(course => course.expertId === expertId);
  const totalSessions = expertCourses.reduce(
    (count, course) => count + course.sessions.length, 
    0
  );
  
  const totalHours = expertCourses.reduce(
    (hours, course) => hours + course.sessions.reduce(
      (sessionHours, session) => sessionHours + session.hours, 
      0
    ), 
    0
  );
  
  // Example calculation for earnings (€25 per hour)
  const hourlyRate = 25;
  const totalEarnings = totalHours * hourlyRate;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Il Mio Calendario</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <CalendarIcon className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Totale Incontri</p>
              <p className="text-3xl font-bold">{totalSessions}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <CalendarIcon className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Totale Ore</p>
              <p className="text-3xl font-bold">{totalHours}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <CalendarIcon className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Guadagno Totale</p>
              <p className="text-3xl font-bold">€{totalEarnings}</p>
            </CardContent>
          </Card>
        </div>
        
        <ExpertSchedule 
          expertId={expertId}
          courses={courses}
          onViewSessionDetails={handleViewSession}
        />
      </div>
      
      {selectedSession && (
        <SessionDialog
          open={sessionDialogOpen}
          onOpenChange={setSessionDialogOpen}
          session={selectedSession}
        />
      )}
    </MainLayout>
  );
};

export default ExpertCalendar;
