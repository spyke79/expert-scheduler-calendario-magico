import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MapPin, School as SchoolIcon, Phone, Edit, FileUp, Plus } from "lucide-react";
import { SchoolDialog } from "./SchoolDialog";
import { ProjectDialog } from "@/components/projects/ProjectDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface SchoolLocation {
  name: string;
  address: string;
  managerName: string;
  managerPhone: string;
  mapLink?: string;
}

interface ProjectDocument {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface Project {
  id: string;
  name: string;
  year: number;
  type: string;
  documents: ProjectDocument[];
  totalCourses: number;
}

interface School {
  id: string;
  name: string;
  address: string;
  principalName: string;
  principalPhone: string;
  managerName: string;
  managerPhone: string;
  mapLink?: string;
  secondaryLocations: SchoolLocation[];
  projects: Project[];
}

interface SchoolDetailsProps {
  school: School;
  onUpdate: (updatedSchool: School) => void;
}

export function SchoolDetails({ school, onUpdate }: SchoolDetailsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);

  const handleAddProject = (newProject: Project) => {
    const updatedSchool = {
      ...school,
      projects: [...school.projects, newProject],
    };
    onUpdate(updatedSchool);
    setShowProjectDialog(false);
    toast.success("Progetto aggiunto con successo");
  };

  const handleFileUpload = async (projectId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    input.onchange = async (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      const newDocuments: ProjectDocument[] = Array.from(files).map(file => ({
        id: `doc-${Date.now()}-${Math.random()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      }));

      const updatedSchool = {
        ...school,
        projects: school.projects.map(project => 
          project.id === projectId
            ? { ...project, documents: [...project.documents, ...newDocuments] }
            : project
        )
      };

      onUpdate(updatedSchool);
      toast.success("Documenti caricati con successo");
    };

    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SchoolIcon className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">{school.name}</h2>
        </div>
        <Button onClick={() => setShowEditDialog(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Modifica Scuola
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Informazioni</TabsTrigger>
          <TabsTrigger value="projects">Progetti</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sede Principale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p>{school.address}</p>
                    {school.mapLink && (
                      <a
                        href={school.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Apri in Google Maps
                      </a>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">Dirigente Scolastico</h4>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{school.principalName} • {school.principalPhone}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">DSGA</h4>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{school.managerName} • {school.managerPhone}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sedi Secondarie</CardTitle>
              </CardHeader>
              <CardContent>
                {school.secondaryLocations.length === 0 ? (
                  <p className="text-muted-foreground">Nessuna sede secondaria presente</p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {school.secondaryLocations.map((location, index) => (
                      <AccordionItem key={index} value={`location-${index}`}>
                        <AccordionTrigger>{location.name}</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                              <p>{location.address}</p>
                              {location.mapLink && (
                                <a
                                  href={location.mapLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  Apri in Google Maps
                                </a>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium">Responsabile</h4>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{location.managerName} • {location.managerPhone}</span>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Progetti della Scuola</h3>
            <Button onClick={() => setShowProjectDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Progetto
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {school.projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo: {project.type}</p>
                    <p className="text-sm text-muted-foreground">Anno: {project.year}</p>
                  </div>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="documents">
                      <AccordionTrigger>
                        Documentazione ({project.documents?.length || 0})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {project.documents?.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                {doc.name}
                              </a>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleFileUpload(project.id)}
                          >
                            <FileUp className="h-4 w-4 mr-2" />
                            Carica Documenti
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}

            {school.projects.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>Nessun progetto presente</p>
                <p className="text-sm">Clicca su "Nuovo Progetto" per aggiungerne uno</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <SchoolDialog
        school={school}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={onUpdate}
      />

      <ProjectDialog
        open={showProjectDialog}
        onOpenChange={setShowProjectDialog}
        onSave={handleAddProject}
      />
    </div>
  );
}
