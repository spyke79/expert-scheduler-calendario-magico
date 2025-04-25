
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MapPin, School as SchoolIcon, Phone, Edit } from "lucide-react";
import { SchoolDialog } from "./SchoolDialog";

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

interface SchoolDetailsProps {
  school: School;
  onUpdate: (updatedSchool: School) => void;
}

export function SchoolDetails({ school, onUpdate }: SchoolDetailsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);

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

      <SchoolDialog
        school={school}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={onUpdate}
      />
    </div>
  );
}
