import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck, Phone, User, MapPin, Calendar } from 'lucide-react';

interface CustomerIdentificationDisplayProps {
  data: {
    customer_identification?: {
      customer_info: {
        name: string;
        phone: string;
        customer_id: string;
        account_status: string;
        services: string[];
        last_payment: string;
        address: string;
      };
      search_time: string;
    };
  };
  isActive: boolean;
}

export const CustomerIdentificationDisplay: React.FC<CustomerIdentificationDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const customerInfo = data.customer_identification?.customer_info;

  if (!customerInfo) return null;

  return (
    <Card className={`mt-3 ${isActive ? 'border-primary' : 'border-border/50'}`}>
      <CardContent className="p-4">
        <div className={`space-y-3 text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-green-500" />
            <span className="font-medium">Cliente identificado</span>
            <Badge 
              variant={customerInfo.account_status === 'active' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {customerInfo.account_status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center space-x-2">
              <User className="w-3 h-3" />
              <span className="font-medium">{customerInfo.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Phone className="w-3 h-3" />
              <span>{customerInfo.phone}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{customerInfo.address}</span>
            </div>
          </div>

          {customerInfo.services && customerInfo.services.length > 0 && (
            <div>
              <div className="text-xs font-medium mb-1">Servicios activos:</div>
              <div className="flex flex-wrap gap-1">
                {customerInfo.services.map((service, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {customerInfo.last_payment && (
            <div className="flex items-center space-x-2 text-xs">
              <Calendar className="w-3 h-3" />
              <span>Último pago: {customerInfo.last_payment}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};