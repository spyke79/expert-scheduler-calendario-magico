
import React, { useState } from "react";
import { format, parseISO, isSameDay, addDays, startOfWeek } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Course, CourseSession } from "@/types/schools";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ExpertScheduleProps {
  expertId: string;
  courses: Course[];
  onViewSessionDetails?: (courseId: string, sessionId: string) => void;
}

interface ScheduleSession {
  id: string;
  courseId: string;
  courseName: string;
  date: Date;
  startTime: string;
  endTime: string;
  hours: number;
}

export function ExpertSchedule({ expertId, courses, onViewSessionDetails }: ExpertScheduleProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Extract all sessions for this expert
  const expertSessions: ScheduleSession[] = [];
  
  courses
    .filter(course => course.expertId === expertId)
    .forEach(course => {
      course.sessions.forEach(session => {
        try {
          const sessionDate = parseISO(session.date);
          expertSessions.push({
            id: session.id,
            courseId: course.id,
            courseName: course.title,
            date: sessionDate,
            startTime: session.startTime,
            endTime: session.endTime,
            hours: session.hours
          });
        } catch (error) {
          console.error("Invalid date:", session.date);
        }
      });
    });

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const sessionsForDay = (date: Date) => {
    return expertSessions.filter(session => isSameDay(session.date, date));
  };

  const handlePrevWeek = () => {
    setStartDate(addDays(startDate, -7));
  };

  const handleNextWeek = () => {
    setStartDate(addDays(startDate, 7));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      // Find the beginning of the week for this date
      setStartDate(startOfWeek(date, { weekStartsOn: 1 }));
    }
  };

  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardTitle>Calendario Esperto</CardTitle>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Seleziona</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" size="icon" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-7 gap-2 mb-4">
          {daysOfWeek.map((day, index) => (
            <div
              key={index}
              className="text-center"
            >
              <p className="text-xs font-medium">
                {format(day, "EEE", { locale: it })}
              </p>
              <p className="text-sm">{format(day, "d")}</p>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2 h-[400px]">
          {daysOfWeek.map((day, dayIndex) => (
            <div key={dayIndex} className="border rounded-md overflow-auto p-2 h-full text-xs">
              {sessionsForDay(day).length > 0 ? (
                sessionsForDay(day).map((session, sessionIndex) => (
                  <div
                    key={sessionIndex}
                    className="mb-2 p-2 bg-primary/10 rounded cursor-pointer hover:bg-primary/20"
                    onClick={() => onViewSessionDetails?.(session.courseId, session.id)}
                  >
                    <p className="font-medium truncate">{session.courseName}</p>
                    <p className="text-muted-foreground">
                      {session.startTime} - {session.endTime}
                    </p>
                    <p>{session.hours} {session.hours === 1 ? "ora" : "ore"}</p>
                  </div>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                  <p>-</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
