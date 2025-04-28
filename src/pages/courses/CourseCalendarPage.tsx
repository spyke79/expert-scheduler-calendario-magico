
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { CourseCalendar } from "@/components/courses/CourseCalendar";
import { CourseSessionDialog } from "@/components/courses/CourseSessionDialog";
import { toast } from "sonner";
import { CourseSession, Course } from "@/types/schools";
import DatabaseService from "@/services/database";

const CourseCalendarPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CourseSession | undefined>(undefined);
  const [course, setCourse] = useState<Course | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const db = DatabaseService.getInstance();
        
        // Carica tutti i corsi
        const coursesData = await db.getCourses();
        setAllCourses(coursesData);
        
        // Trova il corso specifico
        const currentCourse = coursesData.find(c => c.id === id);
        if (currentCourse) {
          setCourse(currentCourse);
        } else {
          toast.error("Corso non trovato");
        }
      } catch (error) {
        console.error("Errore durante il caricamento dei dati:", error);
        toast.error("Errore durante il caricamento dei dati");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleAddSession = () => {
    setSelectedSession(undefined);
    setIsDialogOpen(true);
  };

  const handleEditSession = (session: CourseSession) => {
    setSelectedSession(session);
    setIsDialogOpen(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!course) return;
    
    try {
      const db = DatabaseService.getInstance();
      await db.deleteCourseSession(sessionId, course.id);
      
      // Aggiorniamo il corso locale
      const updatedCourse = {
        ...course,
        sessions: course.sessions.filter(s => s.id !== sessionId)
      };
      setCourse(updatedCourse);
      
      // Aggiorniamo anche allCourses
      setAllCourses(allCourses.map(c => 
        c.id === course.id ? updatedCourse : c
      ));
      
      toast.success("Incontro eliminato con successo");
    } catch (error) {
      console.error("Errore durante l'eliminazione della sessione:", error);
      toast.error("Errore durante l'eliminazione della sessione");
    }
  };

  const handleSaveSession = async (session: CourseSession) => {
    if (!course) return;
    
    try {
      const db = DatabaseService.getInstance();
      let updatedSession;
      
      if (selectedSession) {
        // Aggiorna sessione esistente
        updatedSession = await db.updateCourseSession(session, course.id);
        
        // Aggiorna il corso locale
        const updatedCourse = {
          ...course,
          sessions: course.sessions.map(s => s.id === session.id ? updatedSession : s)
        };
        setCourse(updatedCourse);
        
        // Aggiorna anche allCourses
        setAllCourses(allCourses.map(c => 
          c.id === course.id ? updatedCourse : c
        ));
      } else {
        // Aggiunge nuova sessione
        updatedSession = await db.addCourseSession(course.id, session);
        
        // Aggiorna il corso locale
        const updatedCourse = {
          ...course,
          sessions: [...course.sessions, updatedSession]
        };
        setCourse(updatedCourse);
        
        // Aggiorna anche allCourses
        setAllCourses(allCourses.map(c => 
          c.id === course.id ? updatedCourse : c
        ));
      }
      
      toast.success("Incontro salvato con successo");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Errore durante il salvataggio della sessione:", error);
      toast.error("Errore durante il salvataggio della sessione");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p>Caricamento dati in corso...</p>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p>Corso non trovato</p>
        </div>
      </MainLayout>
    );
  }

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
