import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, MapPin, Phone, User, Receipt } from "lucide-react";

interface OrderConfirmationDisplayProps {
  stepData: {
    order_number?: string;
    customer?: {
      name: string;
      phone: string;
      address: string;
    };
    items?: Array<{
      name: string;
      size?: string;
      quantity: number;
      price: number;
    }>;
    pricing?: {
      subtotal: number;
      delivery_cost: number;
      total: number;
    };
    delivery?: {
      zone: string;
      estimated_time: string;
      estimated_delivery: string;
    };
    status?: string;
    order_timestamp?: string;
    payment_method?: string;
    special_instructions?: string;
  };
}

export const OrderConfirmationDisplay: React.FC<OrderConfirmationDisplayProps> = ({ stepData }) => {
  const {
    order_number,
    customer,
    items = [],
    pricing,
    delivery,
    status,
    order_timestamp,
    payment_method,
    special_instructions
  } = stepData;

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header de confirmación */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-800">¡Pedido Confirmado!</CardTitle>
          </div>
          {order_number && (
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span className="text-lg font-mono">{order_number}</span>
              <Badge variant="outline" className="border-green-600 text-green-700">
                {status === 'confirmed' ? 'Confirmado' : status}
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Información del cliente */}
      {customer && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Datos del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Nombre:</span> {customer.name}
            </div>
            {customer.phone && (
              <div className="text-sm flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span className="font-medium">Teléfono:</span> {customer.phone}
              </div>
            )}
            <div className="text-sm flex items-start gap-1">
              <MapPin className="h-3 w-3 mt-0.5" />
              <div>
                <span className="font-medium">Dirección:</span>
                <div className="text-muted-foreground">{customer.address}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen del pedido */}
      {items.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detalle del Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-start p-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    {item.size && (
                      <div className="text-xs text-muted-foreground">Tamaño: {item.size}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Cantidad: {item.quantity}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de entrega y pago */}
      <div className="grid gap-4 md:grid-cols-2">
        {delivery && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Zona:</span>
                <Badge variant="outline" className="ml-2">{delivery.zone}</Badge>
              </div>
              <div className="text-sm">
                <span className="font-medium">Tiempo estimado:</span> {delivery.estimated_time}
              </div>
              {delivery.estimated_delivery && (
                <div className="text-sm">
                  <span className="font-medium">Entrega aproximada:</span> {delivery.estimated_delivery}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {payment_method && (
              <div className="text-sm">
                <span className="font-medium">Método:</span>
                <Badge variant="outline" className="ml-2 capitalize">{payment_method}</Badge>
              </div>
            )}
            {pricing && (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>${pricing.delivery_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Total:</span>
                  <span className="text-primary">${pricing.total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instrucciones especiales */}
      {special_instructions && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Instrucciones Especiales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{special_instructions}</p>
          </CardContent>
        </Card>
      )}

      {/* Footer con timestamp */}
      <div className="text-xs text-muted-foreground border-t pt-2">
        Pedido realizado el {formatTime(order_timestamp)}
      </div>
    </div>
  );
};