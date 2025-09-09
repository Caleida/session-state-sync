import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Pizza, Coffee, Truck, CreditCard, MapPin, Clock } from 'lucide-react';

interface PizzaPricingCalculatedDisplayProps {
  data: {
    pizzas_total?: number;
    beverages_total?: number;
    delivery_cost?: number;
    subtotal?: number;
    total?: number;
    delivery_type?: string;
    payment_method?: string;
    delivery_time?: string;
    delivery_address?: string;
    message?: string;
  };
  isActive: boolean;
}

export const PizzaPricingCalculatedDisplay: React.FC<PizzaPricingCalculatedDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  return (
    <Card className={`transition-all duration-300 ${isActive ? 'ring-2 ring-primary shadow-md' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5 text-primary" />
          Cálculo de Precios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Breakdown */}
        <div className="space-y-3">
          {data.pizzas_total !== undefined && (
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <div className="flex items-center gap-2">
                <Pizza className="h-4 w-4 text-primary" />
                <span className="text-sm">Pizzas</span>
              </div>
              <span className="font-semibold">${data.pizzas_total.toFixed(2)}</span>
            </div>
          )}

          {data.beverages_total !== undefined && data.beverages_total > 0 && (
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-primary" />
                <span className="text-sm">Bebidas</span>
              </div>
              <span className="font-semibold">${data.beverages_total.toFixed(2)}</span>
            </div>
          )}

          {data.delivery_cost !== undefined && data.delivery_cost > 0 && (
            <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-sm">Envío</span>
              </div>
              <span className="font-semibold">${data.delivery_cost.toFixed(2)}</span>
            </div>
          )}

          {/* Subtotal */}
          {data.subtotal !== undefined && (
            <div className="flex items-center justify-between p-2 bg-accent/50 rounded border-t">
              <span className="text-sm font-medium">Subtotal</span>
              <span className="font-semibold">${data.subtotal.toFixed(2)}</span>
            </div>
          )}

          {/* Total */}
          {data.total !== undefined && (
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-xl text-primary">${data.total.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="grid gap-3 pt-2">
          {data.delivery_type && (
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Tipo:</span>
              <Badge variant="outline">{data.delivery_type}</Badge>
            </div>
          )}

          {data.payment_method && (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Pago:</span>
              <Badge variant="outline">{data.payment_method}</Badge>
            </div>
          )}

          {data.delivery_time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Tiempo estimado:</span>
              <Badge variant="secondary">{data.delivery_time}</Badge>
            </div>
          )}

          {data.delivery_address && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <span className="text-sm">Dirección:</span>
                <p className="text-sm text-muted-foreground mt-1">{data.delivery_address}</p>
              </div>
            </div>
          )}
        </div>

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