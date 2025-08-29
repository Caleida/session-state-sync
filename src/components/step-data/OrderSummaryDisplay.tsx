import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MapPin, Clock } from "lucide-react";

interface OrderSummaryDisplayProps {
  stepData: {
    address?: string;
    zone?: string;
    estimated_time?: string;
    delivery_cost?: number;
    subtotal?: number;
    total?: number;
    order_items?: Array<{
      id: string;
      name: string;
      size?: string;
      quantity: number;
      price: number;
      total?: number;
    }>;
    calculation_timestamp?: string;
  };
}

export const OrderSummaryDisplay: React.FC<OrderSummaryDisplayProps> = ({ stepData }) => {
  const {
    address,
    zone,
    estimated_time,
    delivery_cost = 0,
    subtotal = 0,
    total = 0,
    order_items = []
  } = stepData;

  return (
    <div className="space-y-4">
      {/* Resumen de productos */}
      {order_items.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Productos Seleccionados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order_items.map((item, index) => (
              <div key={index} className="flex justify-between items-start p-2 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.name}</div>
                  {item.size && (
                    <div className="text-xs text-muted-foreground">Tamaño: {item.size}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Cantidad: {item.quantity} x ${item.price.toFixed(2)}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Información de entrega */}
      {address && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Información de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium">Dirección:</span> {address}
              </div>
              {zone && (
                <div className="text-sm">
                  <span className="font-medium">Zona:</span>
                  <Badge variant="outline" className="ml-2">{zone}</Badge>
                </div>
              )}
              {estimated_time && (
                <div className="text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">Tiempo estimado:</span> {estimated_time}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de precios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumen de Precios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Costo de envío:</span>
              <span>${delivery_cost.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span className="text-lg text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Los precios incluyen IVA. El tiempo de entrega es aproximado.
      </div>
    </div>
  );
};