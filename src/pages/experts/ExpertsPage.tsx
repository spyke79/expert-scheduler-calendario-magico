
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Plus, Search, Mail, Phone, Eye } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { ExpertDialog } from "@/components/experts/ExpertDialog";
import { ExpertDetails } from "@/components/experts/ExpertDetails";
import DatabaseService from "@/services/database";
import { toast } from "sonner";

interface Expert {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  fiscalCode: string;
  vatNumber: string;
  subjects: string[];
}

const ExpertsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [allSubjects, setAllSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const db = DatabaseService.getInstance();
        const expertsData = await db.getExperts();
        setExperts(expertsData);
        
        const subjects = Array.from(
          new Set(expertsData.flatMap(expert => expert.subjects))
        );
        setAllSubjects(subjects);
      } catch (error) {
        console.error("Errore durante il caricamento degli esperti:", error);
        toast.error("Errore durante il caricamento degli esperti");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addExpert = async (newExpert: Expert) => {
    try {
      const db = DatabaseService.getInstance();
      const savedExpert = await db.addExpert(newExpert);
      setExperts([...experts, savedExpert]);
      
      // Aggiorniamo la lista delle materie
      const updatedSubjects = Array.from(
        new Set([...allSubjects, ...savedExpert.subjects])
      );
      setAllSubjects(updatedSubjects);
      
      setShowAddDialog(false);
      toast.success("Esperto aggiunto con successo");
    } catch (error) {
      console.error("Errore durante l'aggiunta dell'esperto:", error);
      toast.error("Errore durante l'aggiunta dell'esperto");
    }
  };

  const handleUpdateExpert = async (updatedExpert: Expert) => {
    try {
      const db = DatabaseService.getInstance();
      await db.updateExpert(updatedExpert);
      
      setExperts(experts.map(expert => 
        expert.id === updatedExpert.id ? updatedExpert : expert
      ));
      setSelectedExpert(updatedExpert);
      
      // Aggiorniamo la lista delle materie
      const updatedSubjects = Array.from(
        new Set([
          ...allSubjects,
          ...updatedExpert.subjects
        ])
      );
      setAllSubjects(updatedSubjects);
      
      toast.success("Esperto aggiornato con successo");
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'esperto:", error);
      toast.error("Errore durante l'aggiornamento dell'esperto");
    }
  };

  const filteredExperts = experts.filter(expert => {
    const nameMatches = `${expert.firstName} ${expert.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const subjectMatches = subjectFilter === "" || expert.subjects.includes(subjectFilter);
    return nameMatches && subjectMatches;
  });

  if (selectedExpert) {
    return (
      <MainLayout>
        <ExpertDetails 
          expert={selectedExpert} 
          onUpdate={handleUpdateExpert}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Esperti</h1>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Esperto
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Cerca esperto per nome..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full h-10 px-3 py-2 bg-white border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <option value="">Tutte le materie</option>
              {allSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center p-8">
            <p>Caricamento dati in corso...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert) => (
              <Card key={expert.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{expert.firstName} {expert.lastName}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        <span>{expert.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>{expert.phone}</span>
                      </div>
                    </div>
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  
                  <div className="mt-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Codice Fiscale</p>
                        <p className="font-mono">{expert.fiscalCode}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">P. IVA</p>
                        <p className="font-mono">{expert.vatNumber}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Materie</p>
                    <div className="flex flex-wrap gap-2">
                      {expert.subjects.map((subject) => (
                        <Badge key={subject} variant="outline">{subject}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4"
                    onClick={() => setSelectedExpert(expert)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizza Dettagli
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredExperts.length === 0 && (
          <div className="text-center p-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Nessun esperto trovato</h3>
            <p className="text-muted-foreground mt-1">
              Prova a modificare i filtri o aggiungi un nuovo esperto
            </p>
          </div>
        )}
      </div>
      
      <ExpertDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
        onSave={addExpert}
      />
    </MainLayout>
  );
};

export default ExpertsPage;
