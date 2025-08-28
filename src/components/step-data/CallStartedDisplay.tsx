import React from 'react';
import { Phone, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CallStartedDisplayProps {
  data: any;
  isActive: boolean;
}

export const CallStartedDisplay: React.FC<CallStartedDisplayProps> = ({ data, isActive }) => {
  const startDetails = data.start_details || {};
  const callInitiation = data.call_initiation || {};
  
  const startTime = startDetails.started_at || callInitiation.started_at;
  const workflowType = startDetails.workflow_type;
  const message = startDetails.message;
  
  const formatDateTime = (timestamp: string) => {
    if (!timestamp) return null;
    try {
      return new Date(timestamp).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <Card className={`mt-3 transition-all duration-200 ${
      isActive 
        ? 'border-primary shadow-md bg-primary/5' 
        : 'border-border/50 bg-background/50'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 p-2 rounded-full ${
            isActive 
              ? 'bg-primary/10 text-primary' 
              : 'bg-muted text-muted-foreground'
          }`}>
            <Phone className="h-5 w-5" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className={`font-medium ${
                isActive ? 'text-primary' : 'text-foreground'
              }`}>
                Llamada Iniciada
              </h4>
              {workflowType && (
                <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                  {workflowType}
                </Badge>
              )}
            </div>

            {message && (
              <p className={`text-sm ${
                isActive ? 'text-primary/80' : 'text-muted-foreground'
              }`}>
                {message}
              </p>
            )}

            {startTime && (
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${
                  isActive ? 'text-primary/60' : 'text-muted-foreground/60'
                }`} />
                <span className={`text-xs ${
                  isActive ? 'text-primary/70' : 'text-muted-foreground'
                }`}>
                  {formatDateTime(startTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};