import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Clock, User, Weight } from 'lucide-react';

interface PackageInfoDisplayProps {
  data: {
    package_info: {
      tracking_number: string;
      sender: string;
      recipient: string;
      current_status: string;
      estimated_delivery: string;
      current_delivery_address: string;
      package_type: string;
      weight: string;
      dimensions: string;
      delivery_window: string;
    };
    lookup_timestamp: string;
    found: boolean;
  };
  isActive: boolean;
}

export const PackageInfoDisplay: React.FC<PackageInfoDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const { package_info } = data;

  return (
    <Card className={`mt-3 ${isActive ? 'border-primary' : 'border-border'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Package className="h-4 w-4 text-primary" />
          Información del Paquete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="font-medium text-muted-foreground">Tracking</div>
            <div className="font-mono text-foreground">{package_info.tracking_number}</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-muted-foreground">Estado</div>
            <Badge variant="secondary" className="text-xs">
              {package_info.current_status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="font-medium text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Remitente
            </div>
            <div className="text-foreground">{package_info.sender}</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              Destinatario
            </div>
            <div className="text-foreground">{package_info.recipient}</div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="font-medium text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Dirección de Entrega
          </div>
          <div className="text-foreground text-sm">{package_info.current_delivery_address}</div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="space-y-1">
            <div className="font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Entrega
            </div>
            <div className="text-foreground">{package_info.estimated_delivery}</div>
            <div className="text-xs text-muted-foreground">{package_info.delivery_window}</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-muted-foreground flex items-center gap-1">
              <Weight className="h-3 w-3" />
              Peso
            </div>
            <div className="text-foreground">{package_info.weight}</div>
          </div>
          <div className="space-y-1">
            <div className="font-medium text-muted-foreground">Dimensiones</div>
            <div className="text-foreground">{package_info.dimensions}</div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Tipo: {package_info.package_type}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};