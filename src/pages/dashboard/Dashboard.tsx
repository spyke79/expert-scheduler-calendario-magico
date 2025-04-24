
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, School, User, Book, AlertTriangle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

interface DashboardStat {
  title: string;
  value: number;
  icon: React.ReactNode;
}

interface UpcomingCourse {
  id: string;
  title: string;
  school: string;
  expert: string;
  date: string;
  time: string;
  remainingHours: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [upcomingCourses, setUpcomingCourses] = useState<UpcomingCourse[]>([]);
  
  useEffect(() => {
    // In a real application, we would fetch this data from an API
    setStats([
      { title: "Scuole", value: 12, icon: <School className="h-6 w-6 text-blue-500" /> },
      { title: "Esperti", value: 34, icon: <User className="h-6 w-6 text-green-500" /> },
      { title: "Corsi attivi", value: 28, icon: <Book className="h-6 w-6 text-purple-500" /> },
      { title: "Eventi oggi", value: 5, icon: <Calendar className="h-6 w-6 text-orange-500" /> },
    ]);
    
    setUpcomingCourses([
      {
        id: "1",
        title: "Programmazione Web Base",
        school: "ITIS Galileo Galilei",
        expert: "Mario Rossi",
        date: "28/04/2025",
        time: "15:00 - 18:00",
        remainingHours: 12
      },
      {
        id: "2",
        title: "Matematica Avanzata",
        school: "Liceo Scientifico Einstein",
        expert: "Laura Bianchi",
        date: "29/04/2025",
        time: "14:30 - 16:30",
        remainingHours: 8
      },
      {
        id: "3",
        title: "Inglese Commerciale",
        school: "ITC Marco Polo",
        expert: "Giuseppe Verdi",
        date: "30/04/2025",
        time: "09:00 - 12:00",
        remainingHours: 0
      }
    ]);
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="p-2 bg-gray-100 rounded-full">{stat.icon}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prossimi Eventi</CardTitle>
                <CardDescription>Gli eventi dei prossimi giorni</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">{course.school}</p>
                    <p className="text-sm">Esperto: {course.expert}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{course.date}</p>
                    <p className="text-sm">{course.time}</p>
                    {course.remainingHours > 0 ? (
                      <p className="text-sm text-amber-600">{course.remainingHours} ore rimanenti</p>
                    ) : (
                      <p className="text-sm text-green-600">Completato</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Alert className="bg-amber-50 text-amber-800 border-amber-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attenzione</AlertTitle>
          <AlertDescription>
            Ci sono 2 corsi con ore ancora da pianificare. Verifica la sezione dei corsi per maggiori dettagli.
          </AlertDescription>
        </Alert>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
