import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, MapPin, UserCheck } from 'lucide-react';

interface CustomerInfoCollectedDisplayProps {
  data: {
    customer_info_collected?: {
      customer_info?: {
        name?: string;
        phone?: string;
        address?: string;
        is_returning?: boolean;
      };
      delivery_type_question?: string;
      identification_success?: boolean;
      next_step?: string;
    };
  };
  isActive: boolean;
}

export const CustomerInfoCollectedDisplay: React.FC<CustomerInfoCollectedDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const customer = data.customer_info_collected?.customer_info || {};
  
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

        {/* Success Status */}
        {data.customer_info_collected?.identification_success && (
          <div className="text-xs text-muted-foreground mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            ✓ Cliente identificado correctamente
          </div>
        )}
      </CardContent>
    </Card>
  );
};