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
    // New structure from edge function
    appointment?: {
      appointment_date: string;
      appointment_time: string;
      appointment_datetime: string;
      client_name: string;
      client_phone: string;
      confirmation_number: string;
      service_type: string;
      status: string;
      notes: string;
      confirmed_at: string;
    };
    confirmation_details?: {
      confirmation_number: string;
      message: string;
      next_steps: string[];
    };
  };
  isActive: boolean;
}

export const AppointmentConfirmationDisplay: React.FC<AppointmentConfirmationDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  // Handle both old and new data structures
  const appointment = data.confirmed_appointment || (data.appointment ? {
    date: data.appointment.appointment_date,
    time: data.appointment.appointment_time,
    service_type: data.appointment.service_type
  } : null);
  
  const confirmationNumber = data.confirmation_number || 
    data.confirmation_details?.confirmation_number || 
    data.appointment?.confirmation_number;
  
  const clientName = data.client_name || data.appointment?.client_name;
  const clientPhone = data.client_phone || data.appointment?.client_phone;
  const serviceType = data.service_type || data.appointment?.service_type;
  
  return (
    <div className={`mt-3 space-y-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-sm font-medium">Cita confirmada</span>
      </div>
      
      <div className="bg-card/50 rounded p-3 space-y-2">
        {confirmationNumber && (
          <div className="text-xs">
            <strong>Confirmación:</strong> #{confirmationNumber}
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
        
        {clientName && (
          <div className="flex items-center space-x-1 text-sm">
            <User className="w-3 h-3" />
            <span>{clientName}</span>
          </div>
        )}
        
        {clientPhone && (
          <div className="flex items-center space-x-1 text-sm">
            <Phone className="w-3 h-3" />
            <span>{clientPhone}</span>
          </div>
        )}
        
        {serviceType && (
          <Badge variant="secondary" className="text-xs">
            {serviceType}
          </Badge>
        )}
      </div>
    </div>
  );
};