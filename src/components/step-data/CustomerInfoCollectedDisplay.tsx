import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, MapPin, UserCheck, Home } from 'lucide-react';

interface CustomerInfoCollectedDisplayProps {
  data: {
    customer?: {
      name?: string;
      phone?: string;
      address?: string;
      is_returning?: boolean;
    };
    delivery_preference?: string;
    message?: string;
  };
  isActive: boolean;
}

export const CustomerInfoCollectedDisplay: React.FC<CustomerInfoCollectedDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const customer = data.customer || {};
  
  return (
    <Card className={`transition-all duration-300 ${isActive ? 'ring-2 ring-primary shadow-md' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserCheck className="h-5 w-5 text-primary" />
          Información del Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Details */}
        <div className="grid gap-3">
          {customer.name && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{customer.name}</span>
              {customer.is_returning && (
                <Badge variant="secondary" className="text-xs">
                  Cliente habitual
                </Badge>
              )}
            </div>
          )}
          
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
          )}
          
          {customer.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{customer.address}</span>
            </div>
          )}
        </div>

        {/* Delivery Preference */}
        {data.delivery_preference && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Preferencia de entrega:</span>
            </div>
            <Badge variant="outline" className="mt-2">
              {data.delivery_preference}
            </Badge>
          </div>
        )}

        {/* Message */}
        {data.message && (
          <div className="text-xs text-muted-foreground mt-3 p-2 bg-accent/20 rounded">
            {data.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
};