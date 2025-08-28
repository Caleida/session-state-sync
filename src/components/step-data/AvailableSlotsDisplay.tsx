import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Calendar } from 'lucide-react';

interface AvailableSlotsDisplayProps {
  data: {
    available_slots: Array<{
      date: string;
      time: string;
      datetime: string;
      service_type: string;
    }>;
    search_criteria?: {
      preferred_date?: string;
      service_type?: string;
    };
    searched_at?: string;
  };
  isActive: boolean;
}

export const AvailableSlotsDisplay: React.FC<AvailableSlotsDisplayProps> = ({ data, isActive }) => {
  return (
    <Card className={`mt-3 ${isActive ? 'border-primary' : 'border-border/50'}`}>
      <CardContent className="p-4">
        <div className={`space-y-2 text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
          {data.search_criteria && (
            <div className="text-xs">
              <strong>Búsqueda:</strong> {data.search_criteria.service_type} 
              {data.search_criteria.preferred_date && ` para ${data.search_criteria.preferred_date}`}
            </div>
          )}
          
          <div className="font-medium">
            {data.available_slots.length} citas disponibles:
          </div>
          
          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
            {data.available_slots.slice(0, 5).map((slot, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 rounded border bg-card/50"
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{slot.date}</span>
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{slot.time}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {slot.service_type}
                </Badge>
              </div>
            ))}
            
            {data.available_slots.length > 5 && (
              <div className="text-xs text-muted-foreground text-center py-1">
                + {data.available_slots.length - 5} más...
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};