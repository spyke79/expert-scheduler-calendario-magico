
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { School, Plus, MapPin, Search } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { SchoolDialog } from "@/components/schools/SchoolDialog";

interface SchoolLocation {
  name: string;
  address: string;
  managerName: string;
  managerPhone: string;
  mapLink?: string;
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
}

const SchoolsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [schools, setSchools] = useState<School[]>([
    {
      id: "1",
      name: "ITIS Galileo Galilei",
      address: "Via della Scienza 123, Roma",
      principalName: "Prof. Alessandro Manzoni",
      principalPhone: "333-1234567",
      managerName: "Dott.ssa Elena Rossi",
      managerPhone: "333-7654321",
      mapLink: "https://maps.google.com/?q=Roma",
      secondaryLocations: [
        {
          name: "Sede Distaccata Nord",
          address: "Via dei Pini 45, Roma",
          managerName: "Prof. Marco Verdi",
          managerPhone: "333-2223333",
          mapLink: "https://maps.google.com/?q=Roma+Via+dei+Pini"
        }
      ]
    },
    {
      id: "2",
      name: "Liceo Scientifico Einstein",
      address: "Viale delle Scienze 78, Milano",
      principalName: "Prof.ssa Maria Curie",
      principalPhone: "333-4445555",
      managerName: "Dott. Roberto Bianchi",
      managerPhone: "333-6667777",
      mapLink: "https://maps.google.com/?q=Milano",
      secondaryLocations: []
    }
  ]);

  const addSchool = (newSchool: School) => {
    setSchools([...schools, newSchool]);
    setShowAddDialog(false);
  };

  const filteredSchools = schools.filter(school => 
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    <School className="h-6 w-6 text-primary" />
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
                    <Button variant="default" size="sm" className="w-full">
                      Dettagli
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSchools.length === 0 && (
          <div className="text-center p-8">
            <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
