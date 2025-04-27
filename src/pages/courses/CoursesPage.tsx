
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Plus, Search, Calendar } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { CourseDialog } from "@/components/courses/CourseDialog";
import { Course } from "@/types/schools";

interface CourseWithDates extends Course {
  startDate: string;
  endDate: string;
  remainingHours: number;
  hourlyRate: number;
  experts: {
    name: string;
    hourlyRate: number;
  }[];
}

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [courses, setCourses] = useState<CourseWithDates[]>([
    {
      id: "1",
      title: "Programmazione Web Base",
      description: "Corso di base di programmazione web",
      projectId: "p1",
      projectName: "PNRR DM65",
      schoolId: "1",
      schoolName: "ITIS Galileo Galilei",
      location: "Sede Principale",
      startDate: "2024-03-01",
      endDate: "2024-05-30",
      totalHours: 30,
      remainingHours: 20,
      hourlyRate: 70,
      expertId: "exp1",
      expertName: "Mario Rossi",
      experts: [
        { name: "Mario Rossi", hourlyRate: 50 },
        { name: "Laura Bianchi", hourlyRate: 50 }
      ],
      tutor: {
        name: "Giuseppe Verdi",
        phone: "333-5555555"
      },
      sessions: []
    },
    {
      id: "2",
      title: "Inglese Avanzato",
      description: "Corso avanzato di inglese",
      projectId: "p2",
      projectName: "Scuola Viva",
      schoolId: "1",
      schoolName: "Liceo Scientifico Einstein",
      location: "Sede Centrale",
      startDate: "2024-04-01",
      endDate: "2024-06-15",
      totalHours: 40,
      remainingHours: 40,
      hourlyRate: 60,
      expertId: "exp2",
      expertName: "Maria Brown",
      experts: [
        { name: "Maria Brown", hourlyRate: 45 }
      ],
      tutor: {
        name: "Anna Neri",
        phone: "333-4444444"
      },
      sessions: []
    }
  ]);

  // Mock experts for the CourseDialog
  const experts = [
    { id: "exp1", firstName: "Mario", lastName: "Rossi" },
    { id: "exp2", firstName: "Maria", lastName: "Brown" },
    { id: "exp3", firstName: "Laura", lastName: "Bianchi" }
  ];

  const addCourse = (newCourse: Course) => {
    // Convert the standard Course to CourseWithDates
    const courseWithDates: CourseWithDates = {
      ...newCourse,
      startDate: new Date().toISOString().split('T')[0], // Today as default start date
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +90 days as default end date
      remainingHours: newCourse.totalHours,
      hourlyRate: 60, // Default hourly rate
      experts: [
        { name: newCourse.expertName, hourlyRate: 60 }
      ]
    };
    
    setCourses([...courses, courseWithDates]);
    setShowAddDialog(false);
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
                      <p className="text-sm">{new Date(course.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Data Fine</p>
                      <p className="text-sm">{new Date(course.endDate).toLocaleDateString()}</p>
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
                    {course.experts.map((expert, index) => (
                      <p key={index} className="text-sm">{expert.name}</p>
                    ))}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Tutor</p>
                    <p className="text-sm">{course.tutor.name} • {course.tutor.phone}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/courses/${course.id}/calendar`}>
                      <Calendar className="h-4 w-4 mr-1" /> Calendario
                    </a>
                  </Button>
                  <Button variant="default" className="w-full">
                    Dettagli
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
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
