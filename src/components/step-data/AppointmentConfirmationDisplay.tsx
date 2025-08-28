import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, Phone, Calendar, Clock } from 'lucide-react';

interface AppointmentConfirmationDisplayProps {
  data: {
    confirmed_appointment?: {
      date: string;
      time: string;
      service_type: string;
    };
    confirmation_number?: string;
    client_name?: string;
    client_phone?: string;
    service_type?: string;
  };
  isActive: boolean;
}

export const AppointmentConfirmationDisplay: React.FC<AppointmentConfirmationDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const appointment = data.confirmed_appointment;
  
  return (
    <div className={`mt-3 space-y-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-sm font-medium">Cita confirmada</span>
      </div>
      
      <div className="bg-card/50 rounded p-3 space-y-2">
        {data.confirmation_number && (
          <div className="text-xs">
            <strong>Confirmación:</strong> #{data.confirmation_number}
          </div>
        )}
        
        {appointment && (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{appointment.date}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{appointment.time}</span>
            </div>
          </div>
        )}
        
        {data.client_name && (
          <div className="flex items-center space-x-1 text-sm">
            <User className="w-3 h-3" />
            <span>{data.client_name}</span>
          </div>
        )}
        
        {data.client_phone && (
          <div className="flex items-center space-x-1 text-sm">
            <Phone className="w-3 h-3" />
            <span>{data.client_phone}</span>
          </div>
        )}
        
        {(appointment?.service_type || data.service_type) && (
          <Badge variant="secondary" className="text-xs">
            {appointment?.service_type || data.service_type}
          </Badge>
        )}
      </div>
    </div>
  );
};