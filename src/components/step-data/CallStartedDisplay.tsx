import React from 'react';
import { Phone, Clock, CheckCircle } from 'lucide-react';
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
  const workflowType = startDetails.workflow_type || 'call';
  const message = startDetails.message || 'Call initiated successfully';
  
  const formatTime = (timestamp: string) => {
    if (!timestamp) return 'Unknown';
    try {
      return new Date(timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Invalid time';
    }
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'Unknown';
    try {
      return new Date(timestamp).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
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
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <h4 className={`font-medium ${
                  isActive ? 'text-primary' : 'text-foreground'
                }`}>
                  Llamada Iniciada
                </h4>
                <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
                  {workflowType}
                </Badge>
              </div>
            </div>

            <p className={`text-sm ${
              isActive ? 'text-primary/80' : 'text-muted-foreground'
            }`}>
              {message}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Clock className={`h-4 w-4 ${
                  isActive ? 'text-primary/60' : 'text-muted-foreground/60'
                }`} />
                <div className="text-xs space-y-1">
                  <div className={`font-medium ${
                    isActive ? 'text-primary' : 'text-foreground'
                  }`}>
                    {formatTime(startTime)}
                  </div>
                  <div className={`${
                    isActive ? 'text-primary/60' : 'text-muted-foreground'
                  }`}>
                    {formatDate(startTime)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  isActive ? 'bg-primary' : 'bg-muted-foreground'
                }`} />
                <span className={`text-xs font-medium ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  Conexión Activa
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};