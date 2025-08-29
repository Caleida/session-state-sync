import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle } from 'lucide-react';

interface DeliveryOptionsDisplayProps {
  data: {
    available_options: Array<{
      option_id: string;
      date: string;
      time_slot: string;
      slot_type: string;
      available: boolean;
      price_adjustment: number;
    }>;
    original_date: string;
    options_generated_at: string;
    total_options: number;
  };
  isActive: boolean;
}

export const DeliveryOptionsDisplay: React.FC<DeliveryOptionsDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const { available_options, original_date, total_options } = data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getSlotTypeLabel = (slotType: string) => {
    return slotType === 'mañana' ? 'Mañana' : 'Tarde';
  };

  return (
    <Card className={`mt-3 ${isActive ? 'border-primary' : 'border-border'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4 text-primary" />
          Opciones de Entrega Disponibles
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Fecha original: {formatDate(original_date)} • {total_options} opciones disponibles
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2">
          {available_options.map((option) => (
            <div 
              key={option.option_id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="font-medium text-foreground">
                    {formatDate(option.date)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {option.time_slot}
                    <Badge variant="outline" className="text-xs">
                      {getSlotTypeLabel(option.slot_type)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {option.price_adjustment === 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Sin coste adicional
                  </Badge>
                )}
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </div>
          ))}
        </div>

        {available_options.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No hay opciones de entrega disponibles en este momento</p>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Horarios sujetos a disponibilidad del transportista
          </div>
        </div>
      </CardContent>
    </Card>
  );
};