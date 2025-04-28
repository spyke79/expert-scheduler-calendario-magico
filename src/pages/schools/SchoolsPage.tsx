
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { School as SchoolIcon, Plus, MapPin, Search } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { SchoolDialog } from "@/components/schools/SchoolDialog";
import { SchoolDetails } from "@/components/schools/SchoolDetails";
import { School, SchoolLocation, Project } from "@/types/schools";
import DatabaseService from "@/services/database";
import { toast } from "sonner";

const SchoolsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const db = DatabaseService.getInstance();
        const schoolsData = await db.getSchools();
        setSchools(schoolsData);
      } catch (error) {
        console.error("Errore durante il caricamento delle scuole:", error);
        toast.error("Errore durante il caricamento delle scuole");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addSchool = async (newSchool: School) => {
    try {
      const db = DatabaseService.getInstance();
      const savedSchool = await db.addSchool(newSchool);
      setSchools([...schools, savedSchool]);
      setShowAddDialog(false);
      toast.success("Scuola aggiunta con successo");
    } catch (error) {
      console.error("Errore durante l'aggiunta della scuola:", error);
      toast.error("Errore durante l'aggiunta della scuola");
    }
  };

  const updateSchool = async (updatedSchool: School) => {
    try {
      const db = DatabaseService.getInstance();
      await db.updateSchool(updatedSchool);
      setSchools(schools.map(school => 
        school.id === updatedSchool.id ? updatedSchool : school
      ));
      if (selectedSchool?.id === updatedSchool.id) {
        setSelectedSchool(updatedSchool);
      }
      toast.success("Scuola aggiornata con successo");
    } catch (error) {
      console.error("Errore durante l'aggiornamento della scuola:", error);
      toast.error("Errore durante l'aggiornamento della scuola");
    }
  };

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedSchool) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedSchool(null)}>
              Torna all'elenco
            </Button>
          </div>
          <SchoolDetails school={selectedSchool} onUpdate={updateSchool} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Scuole</h1>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Scuola
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Cerca scuola per nome..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center p-8">
            <p>Caricamento dati in corso...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <Card key={school.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{school.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{school.address}</span>
                        </div>
                      </div>
                      <SchoolIcon className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div>
                        <p className="text-sm font-medium">Dirigente Scolastico</p>
                        <p className="text-sm">{school.principalName} • {school.principalPhone}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">DSGA</p>
                        <p className="text-sm">{school.managerName} • {school.managerPhone}</p>
                      </div>
                    </div>
                    
                    {school.secondaryLocations.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium">Sedi secondarie: {school.secondaryLocations.length}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t p-4 bg-gray-50">
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={school.mapLink} target="_blank" rel="noopener noreferrer">
                          <MapPin className="h-4 w-4 mr-1" /> Mappa
                        </a>
                      </Button>
                      <div className="w-2"></div>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedSchool(school)}
                      >
                        Dettagli
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredSchools.length === 0 && (
          <div className="text-center p-8">
            <SchoolIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Nessuna scuola trovata</h3>
            <p className="text-muted-foreground mt-1">
              Prova a modificare i filtri o aggiungi una nuova scuola
            </p>
          </div>
        )}
      </div>
      
      <SchoolDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        onSave={addSchool}
      />
    </MainLayout>
  );
};

export default SchoolsPage;
