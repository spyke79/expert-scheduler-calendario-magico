
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface SessionConflictAlertProps {
  show: boolean;
  message: string;
}

export function SessionConflictAlert({ show, message }: SessionConflictAlertProps) {
  if (!show) return null;
  
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
