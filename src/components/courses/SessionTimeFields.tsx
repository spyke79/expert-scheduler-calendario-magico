
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SessionTimeFieldsProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

export function SessionTimeFields({ 
  startTime, 
  endTime, 
  onStartTimeChange, 
  onEndTimeChange 
}: SessionTimeFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="startTime">Ora Inizio *</Label>
        <Input
          id="startTime"
          type="time"
          value={startTime}
          onChange={(e) => onStartTimeChange(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="endTime">Ora Fine *</Label>
        <Input
          id="endTime"
          type="time"
          value={endTime}
          onChange={(e) => onEndTimeChange(e.target.value)}
          required
        />
      </div>
    </div>
  );
}
