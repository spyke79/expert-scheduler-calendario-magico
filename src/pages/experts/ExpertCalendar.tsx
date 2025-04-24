
import { useState } from "react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SessionDialog } from "@/components/courses/SessionDialog";

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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CourseSession | null>(null);

  // Demo data
  const sessions: CourseSession[] = [
    {
      id: "1",
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
    {
      id: "2",
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
    },
    {
      id: "3",
      courseId: "c3",
      courseName: "Inglese Commerciale",
      schoolName: "ITC Marco Polo",
      locationName: "Aula 3B",
      locationAddress: "Via dei Mercanti 45, Firenze",
      mapLink: "https://maps.google.com/?q=Firenze+Via+dei+Mercanti",
      tutorName: "Giulia Rossi",
      tutorPhone: "333-6667777",
      date: new Date(2025, 3, 30),
      startTime: "09:00",
      endTime: "12:00"
    }
  ];

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const sessionsForDay = (date: Date) => {
    return sessions.filter(session => isSameDay(session.date, date));
  };

  const totalSessions = sessions.length;
  const totalEarnings = 1250; // Example calculation

  const handlePrevWeek = () => {
    setStartDate(addDays(startDate, -7));
  };

  const handleNextWeek = () => {
    setStartDate(addDays(startDate, 7));
  };

  const handleSessionClick = (session: CourseSession) => {
    setSelectedSession(session);
    setSessionDialogOpen(true);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">Il Mio Calendario</h1>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Seleziona Data</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <CalendarIcon className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Totale Impegni</p>
              <p className="text-3xl font-bold">{totalSessions}</p>
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
        
        <Card>
          <CardHeader>
            <CardTitle>Pianificazione Settimanale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {daysOfWeek.map((day, index) => (
                <div
                  key={index}
                  className="text-center"
                >
                  <p className="text-sm font-medium">
                    {format(day, "EEE", { locale: it })}
                  </p>
                  <p className="text-lg">{format(day, "d")}</p>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2 h-[500px]">
              {daysOfWeek.map((day, dayIndex) => (
                <div key={dayIndex} className="border rounded-md overflow-auto p-2 h-full">
                  {sessionsForDay(day).map((session, sessionIndex) => (
                    <div
                      key={sessionIndex}
                      className="mb-2 p-2 bg-primary/10 rounded cursor-pointer hover:bg-primary/20"
                      onClick={() => handleSessionClick(session)}
                    >
                      <p className="font-medium text-sm truncate">{session.courseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.startTime} - {session.endTime}
                      </p>
                      <p className="text-xs truncate">{session.schoolName}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
