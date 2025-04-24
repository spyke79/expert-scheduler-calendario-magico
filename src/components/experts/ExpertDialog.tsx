
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
import { X } from "lucide-react";
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

interface ExpertDialogProps {
  expert?: Expert;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (expert: Expert) => void;
}

export function ExpertDialog({ expert, open, onOpenChange, onSave }: ExpertDialogProps) {
  const [formData, setFormData] = useState<Omit<Expert, "id">>({
    firstName: expert?.firstName || "",
    lastName: expert?.lastName || "",
    phone: expert?.phone || "",
    email: expert?.email || "",
    fiscalCode: expert?.fiscalCode || "",
    vatNumber: expert?.vatNumber || "",
    subjects: expert?.subjects || [],
  });
  const [newSubject, setNewSubject] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const addSubject = () => {
    if (newSubject && !formData.subjects.includes(newSubject)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject]
      });
      setNewSubject("");
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(subject => subject !== subjectToRemove)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.fiscalCode || !formData.vatNumber) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Formato email non valido");
      return;
    }
    
    // Validate subjects
    if (formData.subjects.length === 0) {
      toast.error("Aggiungi almeno una materia");
      return;
    }
    
    const newExpert: Expert = {
      id: expert?.id || `expert-${Date.now()}`,
      ...formData
    };
    
    onSave(newExpert);
    toast.success(expert ? "Esperto aggiornato" : "Esperto aggiunto");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSubject) {
      e.preventDefault();
      addSubject();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{expert ? "Modifica Esperto" : "Aggiungi Esperto"}</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli dell'esperto e le materie di competenza
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">Nome *</Label>
                <Input
                  id="first-name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Nome"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last-name">Cognome *</Label>
                <Input
                  id="last-name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Cognome"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@esempio.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="Numero di telefono"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fiscal-code">Codice Fiscale *</Label>
              <Input
                id="fiscal-code"
                value={formData.fiscalCode}
                onChange={(e) => handleInputChange("fiscalCode", e.target.value.toUpperCase())}
                placeholder="RSSMRA80A01H501T"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vat-number">Partita IVA *</Label>
              <Input
                id="vat-number"
                value={formData.vatNumber}
                onChange={(e) => handleInputChange("vatNumber", e.target.value)}
                placeholder="12345678901"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Materie *</Label>
              <div className="flex space-x-2">
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Aggiungi una materia"
                />
                <Button type="button" onClick={addSubject}>
                  Aggiungi
                </Button>
              </div>
              
              {formData.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.subjects.map((subject) => (
                    <div
                      key={subject}
                      className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => removeSubject(subject)}
                        className="ml-1 p-1 rounded-full hover:bg-gray-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Nessuna materia aggiunta
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">
              {expert ? "Aggiorna" : "Aggiungi"} Esperto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
