
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Course, CourseSession } from "@/types/schools";
import { getRemainingHours, formatSessionDate } from "@/utils/courseCalendar";
import { Calendar, Clock, Plus, Edit, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseCalendarProps {
  course: Course;
  allCourses: Course[];
  onAddSession: () => void;
  onEditSession: (session: CourseSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function CourseCalendar({ 
  course, 
  allCourses, 
  onAddSession, 
  onEditSession, 
  onDeleteSession 
}: CourseCalendarProps) {
  const remainingHours = getRemainingHours(course);
  const assignedHours = course.totalHours - remainingHours;
  const percentComplete = (assignedHours / course.totalHours) * 100;
  
  // Sort sessions by date and time
  const sortedSessions = [...course.sessions].sort((a, b) => {
    return a.date.localeCompare(b.date) || 
           a.startTime.localeCompare(b.startTime);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendario Incontri
            </CardTitle>
            <CardDescription>
              Programma e gestisci gli incontri del corso
            </CardDescription>
          </div>
          <Button 
            onClick={onAddSession}
            disabled={remainingHours <= 0}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Incontro
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-1 text-sm">
            <span>Completamento ore</span>
            <span>
              {assignedHours} / {course.totalHours} ore 
              ({Math.round(percentComplete)}%)
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded overflow-hidden">
            <div 
              className={cn(
                "h-full", 
                remainingHours === 0 ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
          {remainingHours === 0 ? (
            <p className="text-sm text-green-500 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Tutte le ore sono state assegnate
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Ore rimanenti da assegnare: {remainingHours}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {sortedSessions.length === 0 ? (
            <div className="text-center p-6 border border-dashed rounded-md">
              <p className="text-muted-foreground">
                Nessun incontro programmato per questo corso
              </p>
            </div>
          ) : (
            sortedSessions.map((session) => (
              <div 
                key={session.id}
                className="p-3 border rounded-md flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    {formatSessionDate(session.date)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {session.startTime} - {session.endTime} 
                    <Badge variant="outline">
                      {session.hours} {session.hours === 1 ? "ora" : "ore"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditSession(session)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteSession(session.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {sortedSessions.length} {sortedSessions.length === 1 ? "incontro" : "incontri"} in totale
        </div>
      </CardFooter>
    </Card>
  );
}
