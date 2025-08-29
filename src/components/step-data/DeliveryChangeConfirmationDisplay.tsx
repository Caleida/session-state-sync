import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, MapPin, Phone, Hash } from 'lucide-react';

interface DeliveryChangeConfirmationDisplayProps {
  data: {
    confirmed_change: {
      confirmation_number: string;
      new_delivery_date: string;
      new_time_slot: string;
      new_address: string;
      contact_name: string;
      contact_phone: string;
      change_type: string;
    };
    original_delivery_date: string;
    confirmed_at: string;
    status: string;
  };
  isActive: boolean;
}

export const DeliveryChangeConfirmationDisplay: React.FC<DeliveryChangeConfirmationDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const { confirmed_change, original_delivery_date, confirmed_at, status } = data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES');
  };

  return (
    <Card className={`mt-3 ${isActive ? 'border-primary' : 'border-border'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-green-600">
          <CheckCircle className="h-4 w-4" />
          Cambio de Entrega Confirmado
        </CardTitle>
        <Badge variant="secondary" className="w-fit">
          {status === 'confirmed' ? 'Confirmado' : status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confirmation Number */}
        <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Hash className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-200">
              Número de Confirmación
            </span>
          </div>
          <div className="text-lg font-mono font-bold text-green-900 dark:text-green-100">
            {confirmed_change.confirmation_number}
          </div>
        </div>

        {/* Change Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Nueva Fecha y Horario
              </div>
              <div className="text-foreground">
                {formatDate(confirmed_change.new_delivery_date)}
              </div>
              <div className="text-sm text-muted-foreground">
                {confirmed_change.new_time_slot}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-medium text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Dirección de Entrega
            </div>
            <div className="text-foreground text-sm">
              {confirmed_change.new_address}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Contacto</div>
              <div className="text-foreground">{confirmed_change.contact_name}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Teléfono
              </div>
              <div className="text-foreground font-mono">{confirmed_change.contact_phone}</div>
            </div>
          </div>
        </div>

        {/* Original vs New Comparison */}
        <div className="pt-3 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Fecha original: {formatDate(original_delivery_date)}</div>
            <div>Cambio confirmado: {formatDateTime(confirmed_at)}</div>
            <div>
              Tipo de cambio: {confirmed_change.change_type === 'address_and_date' 
                ? 'Fecha y dirección' 
                : 'Solo fecha'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};