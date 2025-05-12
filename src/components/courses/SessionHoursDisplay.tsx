
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SessionHoursDisplayProps {
  hours: number;
  availableHours: number;
}

export function SessionHoursDisplay({ hours, availableHours }: SessionHoursDisplayProps) {
  const exceededHours = hours > availableHours;
  
  return (
    <div className="space-y-2">
      <Label htmlFor="hours">Ore (calcolate automaticamente) *</Label>
      <div className="flex items-center gap-2">
        <Input
          id="hours"
          type="number"
          value={hours}
          readOnly
          className={`${exceededHours ? "border-red-500" : ""} bg-muted`}
        />
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Max: {availableHours}h
        </span>
      </div>
      {exceededHours && (
        <p className="text-sm text-red-500">
          Ore eccedenti il totale disponibile
        </p>
      )}
    </div>
  );
}
