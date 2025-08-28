import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface CallStartedDisplayProps {
  data: any;
  isActive: boolean;
}

export const CallStartedDisplay: React.FC<CallStartedDisplayProps> = ({ data, isActive }) => {
  const startDetails = data.start_details || {};
  const callInitiation = data.call_initiation || {};
  
  const formatDateTime = (timestamp: string) => {
    if (!timestamp) return timestamp;
    try {
      return new Date(timestamp).toLocaleString('es-ES');
    } catch {
      return timestamp;
    }
  };

  return (
    <Card className={`mt-3 ${isActive ? 'border-primary' : 'border-border/50'}`}>
      <CardContent className="p-4">
        <div className="space-y-2 text-sm">
          {startDetails.message && (
            <div className={isActive ? 'text-primary' : 'text-foreground'}>
              <strong>Message:</strong> {startDetails.message}
            </div>
          )}
          
          {startDetails.workflow_type && (
            <div className={isActive ? 'text-primary' : 'text-foreground'}>
              <strong>Workflow Type:</strong> {startDetails.workflow_type}
            </div>
          )}
          
          {startDetails.started_at && (
            <div className={isActive ? 'text-primary' : 'text-foreground'}>
              <strong>Started At:</strong> {formatDateTime(startDetails.started_at)}
            </div>
          )}
          
          {callInitiation.call_initiated !== undefined && (
            <div className={isActive ? 'text-primary' : 'text-foreground'}>
              <strong>Call Initiated:</strong> {callInitiation.call_initiated ? 'true' : 'false'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};