
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Phone, Mail, User, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExpertDialog } from "./ExpertDialog";
import { useNavigate } from "react-router-dom";

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

interface ExpertDetailsProps {
  expert: Expert;
  onUpdate: (updatedExpert: Expert) => void;
}

export function ExpertDetails({ expert, onUpdate }: ExpertDetailsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/experts")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">{expert.firstName} {expert.lastName}</h2>
          </div>
        </div>
        <Button onClick={() => setShowEditDialog(true)}>
          <PenLine className="h-4 w-4 mr-2" />
          Modifica Esperto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informazioni di Contatto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{expert.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{expert.phone}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dati Fiscali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Codice Fiscale</h4>
              <p className="font-mono">{expert.fiscalCode}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-1">Partita IVA</h4>
              <p className="font-mono">{expert.vatNumber}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Materie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {expert.subjects.map((subject) => (
                <Badge key={subject} variant="outline">
                  {subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ExpertDialog
        expert={expert}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={onUpdate}
      />
    </div>
  );
}
