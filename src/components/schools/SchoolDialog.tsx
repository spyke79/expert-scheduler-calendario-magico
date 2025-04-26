import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { School, SchoolLocation } from "@/types/schools";

interface SchoolDialogProps {
  school?: School;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (school: School) => void;
}

export function SchoolDialog({ school, open, onOpenChange, onSave }: SchoolDialogProps) {
  const [formData, setFormData] = useState<Omit<School, "id">>({
    name: school?.name || "",
    address: school?.address || "",
    principalName: school?.principalName || "",
    principalPhone: school?.principalPhone || "",
    managerName: school?.managerName || "",
    managerPhone: school?.managerPhone || "",
    mapLink: school?.mapLink || "",
    secondaryLocations: school?.secondaryLocations || [],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleLocationInputChange = (index: number, field: string, value: string) => {
    const updatedLocations = [...formData.secondaryLocations];
    updatedLocations[index] = { ...updatedLocations[index], [field]: value };
    setFormData({ ...formData, secondaryLocations: updatedLocations });
  };

  const addSecondaryLocation = () => {
    setFormData({
      ...formData,
      secondaryLocations: [
        ...formData.secondaryLocations,
        { name: "", address: "", managerName: "", managerPhone: "" }
      ]
    });
  };

  const removeSecondaryLocation = (index: number) => {
    const updatedLocations = formData.secondaryLocations.filter((_, i) => i !== index);
    setFormData({ ...formData, secondaryLocations: updatedLocations });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.address || !formData.principalName || 
        !formData.principalPhone || !formData.managerName || !formData.managerPhone) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    
    // Validate secondary locations
    for (const location of formData.secondaryLocations) {
      if (!location.name || !location.address || !location.managerName || !location.managerPhone) {
        toast.error("Compila tutti i campi per le sedi secondarie");
        return;
      }
    }
    
    const newSchool: School = {
      id: school?.id || `school-${Date.now()}`,
      ...formData,
      projects: school?.projects || []
    };
    
    onSave(newSchool);
    toast.success(school ? "Scuola aggiornata" : "Scuola aggiunta");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{school ? "Modifica Scuola" : "Aggiungi Scuola"}</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli della scuola e delle eventuali sedi secondarie
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-lg font-medium">Informazioni Principali</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name">Nome Scuola *</Label>
                  <Input
                    id="school-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nome dell'istituto"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="school-address">Indirizzo *</Label>
                  <Input
                    id="school-address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Indirizzo completo"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="map-link">Link Google Maps</Label>
                <Input
                  id="map-link"
                  value={formData.mapLink}
                  onChange={(e) => handleInputChange("mapLink", e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-lg font-medium">Dirigente Scolastico</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="principal-name">Nome e Cognome *</Label>
                  <Input
                    id="principal-name"
                    value={formData.principalName}
                    onChange={(e) => handleInputChange("principalName", e.target.value)}
                    placeholder="Nome e cognome del DS"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="principal-phone">Telefono *</Label>
                  <Input
                    id="principal-phone"
                    value={formData.principalPhone}
                    onChange={(e) => handleInputChange("principalPhone", e.target.value)}
                    placeholder="Numero di telefono"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <h3 className="text-lg font-medium">DSGA</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manager-name">Nome e Cognome *</Label>
                  <Input
                    id="manager-name"
                    value={formData.managerName}
                    onChange={(e) => handleInputChange("managerName", e.target.value)}
                    placeholder="Nome e cognome del DSGA"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manager-phone">Telefono *</Label>
                  <Input
                    id="manager-phone"
                    value={formData.managerPhone}
                    onChange={(e) => handleInputChange("managerPhone", e.target.value)}
                    placeholder="Numero di telefono"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Sedi Secondarie</h3>
                <Button type="button" variant="outline" size="sm" onClick={addSecondaryLocation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Sede
                </Button>
              </div>
              
              {formData.secondaryLocations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nessuna sede secondaria presente</p>
              ) : (
                formData.secondaryLocations.map((location, index) => (
                  <div key={index} className="border rounded-md p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Sede Secondaria {index + 1}</h4>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeSecondaryLocation(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome Sede *</Label>
                        <Input
                          value={location.name}
                          onChange={(e) => handleLocationInputChange(index, "name", e.target.value)}
                          placeholder="Nome della sede"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Indirizzo *</Label>
                        <Input
                          value={location.address}
                          onChange={(e) => handleLocationInputChange(index, "address", e.target.value)}
                          placeholder="Indirizzo completo"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Responsabile *</Label>
                        <Input
                          value={location.managerName}
                          onChange={(e) => handleLocationInputChange(index, "managerName", e.target.value)}
                          placeholder="Nome e cognome"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Telefono *</Label>
                        <Input
                          value={location.managerPhone}
                          onChange={(e) => handleLocationInputChange(index, "managerPhone", e.target.value)}
                          placeholder="Numero di telefono"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label>Link Google Maps</Label>
                        <Input
                          value={location.mapLink}
                          onChange={(e) => handleLocationInputChange(index, "mapLink", e.target.value)}
                          placeholder="https://maps.google.com/?q=..."
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">
              {school ? "Aggiorna" : "Aggiungi"} Scuola
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
