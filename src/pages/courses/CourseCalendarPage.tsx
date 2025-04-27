
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { CourseCalendar } from "@/components/courses/CourseCalendar";
import { CourseSessionDialog } from "@/components/courses/CourseSessionDialog";
import { toast } from "sonner";
import { CourseSession } from "@/types/schools";

const CourseCalendarPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CourseSession | undefined>(undefined);
  
  // Mock data - in a real app, these would come from API calls
  const course = {
    id: id || "",
    title: "Corso di Esempio",
    description: "Descrizione del corso di esempio",
    projectName: "Progetto Demo",
    schoolName: "Scuola Demo",
    location: "Sede Principale",
    totalHours: 30,
    expertId: "exp1",
    expertName: "Mario Rossi",
    tutor: {
      name: "Luisa Bianchi",
      phone: "+39 123 456 7890"
    },
    sessions: [
      {
        id: "session1",
        date: "2025-05-15",
        startTime: "14:30",
        endTime: "17:30",
        hours: 3
      },
      {
        id: "session2",
        date: "2025-05-22",
        startTime: "14:30",
        endTime: "17:30",
        hours: 3
      }
    ]
  };

  const allCourses = [course];

  const handleAddSession = () => {
    setSelectedSession(undefined);
    setIsDialogOpen(true);
  };

  const handleEditSession = (session: CourseSession) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
  };

  const handleDeleteSession = (sessionId: string) => {
    toast.success("Incontro eliminato con successo");
    // In a real app, we would make an API call to delete the session
  };

  const handleSaveSession = (session: CourseSession) => {
    // In a real app, we would make an API call to save the session
    toast.success("Incontro salvato con successo");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold">{course.title} - Calendario</h1>
        </div>
        
        <CourseCalendar
          course={course}
          allCourses={allCourses}
          onAddSession={handleAddSession}
          onEditSession={handleEditSession}
          onDeleteSession={handleDeleteSession}
        />

        <CourseSessionDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          course={course}
          allCourses={allCourses}
          session={selectedSession}
          onSave={handleSaveSession}
        />
      </div>
    </MainLayout>
  );
};

export default CourseCalendarPage;
