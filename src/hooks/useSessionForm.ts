
import { useState, useEffect } from "react";
import { CourseSession, Course } from "@/types/schools";
import { hasExpertConflict, calculateHoursFromTimes } from "@/utils/courseCalendar";

interface UseSessionFormProps {
  session?: CourseSession;
  course: Course;
  allCourses: Course[];
  isOpen: boolean;
}

export function useSessionForm({ session, course, allCourses, isOpen }: UseSessionFormProps) {
  const [formData, setFormData] = useState<Omit<CourseSession, "id">>({
    date: session?.date || "",
    startTime: session?.startTime || "",
    endTime: session?.endTime || "",
    hours: session?.hours || 0,
  });
  
  const [hasConflict, setHasConflict] = useState<boolean>(false);
  const [conflictMessage, setConflictMessage] = useState<string>("");
  
  const isEditing = Boolean(session);
  
  const handleInputChange = (field: string, value: any) => {
    const updatedFormData = { ...formData, [field]: value };
    
    // Automatically calculate hours if both start and end times are set
    if ((field === 'startTime' || field === 'endTime') && 
        updatedFormData.startTime && updatedFormData.endTime) {
      const calculatedHours = calculateHoursFromTimes(
        updatedFormData.startTime,
        updatedFormData.endTime
      );
      updatedFormData.hours = calculatedHours;
    }
    
    setFormData(updatedFormData);
    
    // Check for conflicts whenever date or time changes
    if (field === 'date' || field === 'startTime' || field === 'endTime') {
      checkForConflicts(updatedFormData);
    }
  };

  const checkForConflicts = (data: Omit<CourseSession, "id">) => {
    // Only check if we have all the required fields
    if (data.date && data.startTime && data.endTime) {
      // Use the first expert's ID for conflict checking if available
      const expertId = course.experts && course.experts.length > 0 ? course.experts[0].id : '';
      
      const conflict = hasExpertConflict(
        data,
        expertId,
        allCourses,
        course.id
      );
      
      setHasConflict(conflict);
      setConflictMessage(
        conflict 
          ? "Conflitto: l'esperto ha già un altro corso programmato in questo orario" 
          : ""
      );
    }
  };

  // Recalculate hours when both times change and dialog opens
  useEffect(() => {
    if (isOpen && formData.startTime && formData.endTime) {
      const calculatedHours = calculateHoursFromTimes(
        formData.startTime,
        formData.endTime
      );
      
      if (calculatedHours !== formData.hours) {
        setFormData(prev => ({
          ...prev,
          hours: calculatedHours
        }));
      }
      
      checkForConflicts(formData);
    }
  }, [isOpen, formData.startTime, formData.endTime]);

  return {
    formData,
    hasConflict,
    conflictMessage,
    isEditing,
    handleInputChange
  };
}
