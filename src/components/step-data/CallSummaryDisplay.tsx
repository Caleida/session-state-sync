import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock, MessageSquare } from 'lucide-react';

interface CallSummaryDisplayProps {
  data: {
    call_duration?: number;
    termination_reason?: string;
    call_summary?: string;
    call_termination?: {
      call_duration?: number;
      call_summary?: string;
      termination_reason?: string;
      ended_at?: string;
      completed_successfully?: boolean;
    };
    completion_details?: {
      duration?: string;
      reason?: string;
      message?: string;
      ended_at?: string;
    };
  };
  isActive: boolean;
}

export const CallSummaryDisplay: React.FC<CallSummaryDisplayProps> = ({ data, isActive }) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Extract data from nested structures
  const callTermination = data.call_termination;
  const completionDetails = data.completion_details;
  
  const duration = data.call_duration || callTermination?.call_duration;
  const reason = data.termination_reason || callTermination?.termination_reason || completionDetails?.reason;
  const summary = data.call_summary || callTermination?.call_summary;
  const message = completionDetails?.message;
  const durationText = completionDetails?.duration;

  return (
    <div className={`mt-3 space-y-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
      <div className="flex items-center space-x-2">
        <Phone className="w-4 h-4" />
        <span className="text-sm font-medium">Llamada finalizada</span>
      </div>
      
      <div className="bg-card/50 rounded p-3 space-y-2">
        {duration && (
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-3 h-3" />
            <span>Duración: {formatDuration(duration)}</span>
          </div>
        )}
        
        {durationText && durationText !== "Not specified" && !duration && (
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-3 h-3" />
            <span>Duración: {durationText}</span>
          </div>
        )}
        
        {reason && (
          <div className="text-sm">
            <Badge variant="outline" className="text-xs">
              {reason}
            </Badge>
          </div>
        )}
        
        {message && (
          <div className="text-sm">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-xs mb-1">Estado:</div>
                <div className="text-xs text-muted-foreground">
                  {message}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {summary && (
          <div className="text-sm">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-xs mb-1">Resumen:</div>
                <div className="text-xs text-muted-foreground">
                  {summary}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};