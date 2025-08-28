import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Phone, Clock, CheckCircle2 } from 'lucide-react';

interface SMSConfirmationDisplayProps {
  data: {
    sms_confirmation?: {
      sent_to: string;
      sent_at: string;
      message: string;
      status: string;
      delivery_status: string;
    };
    appointment?: {
      appointment_date: string;
      appointment_time: string;
      client_name: string;
      client_phone: string;
      confirmation_number: string;
      service_type: string;
    };
  };
  isActive: boolean;
}

export const SMSConfirmationDisplay: React.FC<SMSConfirmationDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const smsData = data.sms_confirmation;
  const appointmentData = data.appointment;
  
  if (!smsData) {
    return null;
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`mt-3 ${isActive ? 'border-primary' : 'border-border/50'}`}>
      <CardContent className="p-4">
        <div className={`space-y-2 text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-500" />
            <span className="font-medium">SMS de confirmación enviado</span>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
          
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3" />
            <span>Enviado a: {smsData.sent_to}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Enviado: {formatTime(smsData.sent_at)}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {smsData.status === 'sent' ? 'Enviado' : smsData.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {smsData.delivery_status === 'delivered' ? 'Entregado' : smsData.delivery_status}
            </Badge>
          </div>
          
          <div className="mt-3 p-2 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground italic">
              "{smsData.message}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};