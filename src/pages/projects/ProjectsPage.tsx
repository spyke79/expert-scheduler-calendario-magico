import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GitBranch, Plus, Search } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { Project } from "@/types/schools";

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "PNRR DM65",
      year: 2024,
      type: "PNRR",
      totalCourses: 5,
      documents: []
    },
    {
      id: "2",
      name: "Scuola Viva",
      year: 2024,
      type: "Regionale",
      totalCourses: 3,
      documents: []
    },
    {
      id: "3",
      name: "PNRR DM66",
      year: 2024,
      type: "PNRR",
      totalCourses: 7,
      documents: []
    },
  ]);

  const addProject = (newProject: Project) => {
    setProjects([...projects, newProject]);
    setShowAddDialog(false);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Progetti</h1>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Progetto
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Cerca progetto..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      Anno: {project.year}
                    </div>
                  </div>
                  <GitBranch className="h-6 w-6 text-primary" />
                </div>
                
                <div className="mt-4">
                  <div className="text-sm">
                    <span className="font-medium">Tipo:</span> {project.type}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium">Corsi totali:</span> {project.totalCourses}
                  </div>
                </div>
                
                <Button className="w-full mt-4" variant="outline">
                  Visualizza Corsi
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center p-8">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Nessun progetto trovato</h3>
            <p className="text-muted-foreground mt-1">
              Prova a modificare i filtri o aggiungi un nuovo progetto
            </p>
          </div>
        )}
      </div>

      <ProjectDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        onSave={addProject}
      />
    </MainLayout>
  );
};

export default ProjectsPage;
