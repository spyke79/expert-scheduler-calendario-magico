
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Plus, Search, Calendar, Info } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { CourseDialog } from "@/components/courses/CourseDialog";
import { CourseDetails } from "@/components/courses/CourseDetails";
import { Course } from "@/types/schools";
import DatabaseService from "@/services/database";
import { toast } from "sonner";

interface CourseWithDates extends Course {
  startDate: string;
  endDate: string;
  remainingHours: number;
  hourlyRate: number;
}

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithDates | null>(null);
  const [courses, setCourses] = useState<CourseWithDates[]>([]);
  const [experts, setExperts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const db = DatabaseService.getInstance();
        
        // Carichiamo i corsi
        const coursesData = await db.getCourses();
        setCourses(coursesData.map(course => ({
          ...course,
          // Converti la vecchia struttura al nuovo formato con array di esperti e tutor
          experts: course.experts || [
            { id: course.expertId, name: course.expertName, hourlyRate: course.hourlyRate || 60 }
          ],
          tutors: course.tutors || [
            { name: course.tutor?.name || "", phone: course.tutor?.phone || "" }
          ],
        })));
        
        // Carichiamo gli esperti
        const expertsData = await db.getExperts();
        setExperts(expertsData.map(expert => ({
          id: expert.id,
          firstName: expert.firstName,
          lastName: expert.lastName
        })));
      } catch (error) {
        console.error("Errore durante il caricamento dei corsi:", error);
        toast.error("Errore durante il caricamento dei corsi");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addCourse = async (newCourse: Course) => {
    try {
      const db = DatabaseService.getInstance();
      
      // Aggiungiamo i campi extra necessari per CourseWithDates
      const courseToAdd = {
        ...newCourse,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        remainingHours: newCourse.totalHours,
        hourlyRate: 60
      };
      
      const savedCourse = await db.addCourse(courseToAdd);
      
      setCourses([...courses, savedCourse as CourseWithDates]);
      setShowAddDialog(false);
      toast.success("Corso aggiunto con successo");
    } catch (error) {
      console.error("Errore durante l'aggiunta del corso:", error);
      toast.error("Errore durante l'aggiunta del corso");
    }
  };

  const updateCourse = async (updatedCourse: Course) => {
    try {
      const db = DatabaseService.getInstance();
      
      const courseToUpdate = {
        ...updatedCourse,
        // Mantieni i campi extra che potrebbero non essere nella nuova versione
        startDate: (selectedCourse?.startDate || new Date().toISOString().split('T')[0]),
        endDate: (selectedCourse?.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
        remainingHours: (selectedCourse?.remainingHours || updatedCourse.totalHours),
        hourlyRate: (selectedCourse?.hourlyRate || 60)
      };
      
      await db.updateCourse(courseToUpdate);
      
      setCourses(courses.map(course => 
        course.id === updatedCourse.id ? courseToUpdate as CourseWithDates : course
      ));
      
      setSelectedCourse(courseToUpdate as CourseWithDates);
      toast.success("Corso aggiornato con successo");
    } catch (error) {
      console.error("Errore durante l'aggiornamento del corso:", error);
      toast.error("Errore durante l'aggiornamento del corso");
    }
  };

  const handleViewDetails = (course: CourseWithDates) => {
    setSelectedCourse(course);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Corsi</h1>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Corso
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Cerca corso per titolo o progetto..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center p-8">
            <p>Caricamento dati in corso...</p>
          </div>
        ) : selectedCourse ? (
          <CourseDetails 
            course={selectedCourse} 
            experts={experts} 
            onUpdate={updateCourse} 
            onClose={() => setSelectedCourse(null)} 
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{course.projectName}</Badge>
                        <Badge variant="outline">{course.schoolName}</Badge>
                      </div>
                    </div>
                    <Book className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Data Inizio</p>
                        <p className="text-sm">{course.startDate ? new Date(course.startDate).toLocaleDateString() : 'N/D'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Data Fine</p>
                        <p className="text-sm">{course.endDate ? new Date(course.endDate).toLocaleDateString() : 'N/D'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Ore Totali</p>
                        <p className="text-sm">{course.totalHours}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Ore Rimanenti</p>
                        <p className="text-sm">{course.remainingHours}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Esperti</p>
                      <div className="flex flex-wrap gap-1">
                        {course.experts.map((expert, index) => (
                          <Badge key={expert.id || index} variant="outline">
                            {expert.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Tutor</p>
                      <div className="flex flex-wrap gap-1">
                        {course.tutors.map((tutor, index) => (
                          <Badge key={index} variant="outline">
                            {tutor.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/courses/${course.id}/calendar`}>
                        <Calendar className="h-4 w-4 mr-1" /> Calendario
                      </a>
                    </Button>
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => handleViewDetails(course)}
                    >
                      <Info className="h-4 w-4 mr-1" /> Dettagli
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !selectedCourse && filteredCourses.length === 0 && (
          <div className="text-center p-8">
            <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Nessun corso trovato</h3>
            <p className="text-muted-foreground mt-1">
              Prova a modificare i filtri o aggiungi un nuovo corso
            </p>
          </div>
        )}

        <CourseDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
          experts={experts}
          onSave={addCourse}
        />
      </div>
    </MainLayout>
  );
};

export default CoursesPage;
