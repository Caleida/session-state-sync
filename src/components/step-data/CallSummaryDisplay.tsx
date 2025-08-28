import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, MessageSquare } from 'lucide-react';

interface CallSummaryDisplayProps {
  data: {
    call_duration?: number;
    termination_reason?: string;
    call_summary?: string;
  };
  isActive: boolean;
}

export const CallSummaryDisplay: React.FC<CallSummaryDisplayProps> = ({ data, isActive }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`mt-3 space-y-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
      <div className="flex items-center space-x-2">
        <Phone className="w-4 h-4" />
        <span className="text-sm font-medium">Llamada finalizada</span>
      </div>
      
      <div className="bg-card/50 rounded p-3 space-y-2">
        {data.call_duration && (
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-3 h-3" />
            <span>Duración: {formatDuration(data.call_duration)}</span>
          </div>
        )}
        
        {data.termination_reason && (
          <div className="text-sm">
            <Badge variant="outline" className="text-xs">
              {data.termination_reason}
            </Badge>
          </div>
        )}
        
        {data.call_summary && (
          <div className="text-sm">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-xs mb-1">Resumen:</div>
                <div className="text-xs text-muted-foreground">
                  {data.call_summary}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};