import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pizza, Coffee, CheckCircle, AlertTriangle, Hash } from 'lucide-react';

interface PizzaOrderValidatedDisplayProps {
  data: {
    validated_pizzas?: Array<{
      name: string;
      size: string;
      price: number;
      quantity: number;
    }>;
    beverages?: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    validation_errors?: string[];
    is_valid?: boolean;
    message?: string;
  };
  isActive: boolean;
}

export const PizzaOrderValidatedDisplay: React.FC<PizzaOrderValidatedDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  return (
    <Card className={`transition-all duration-300 ${isActive ? 'ring-2 ring-primary shadow-md' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CheckCircle className={`h-5 w-5 ${data.is_valid ? 'text-green-500' : 'text-orange-500'}`} />
          Validación del Pedido
          <Badge variant={data.is_valid ? "default" : "destructive"} className="ml-auto">
            {data.is_valid ? 'Válido' : 'Revisión requerida'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validated Pizzas */}
        {data.validated_pizzas && data.validated_pizzas.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Pizza className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Pizzas Validadas</span>
            </div>
            <div className="space-y-2">
              {data.validated_pizzas.map((pizza, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{pizza.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {pizza.size}
                    </Badge>
                    {pizza.quantity > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        x{pizza.quantity}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold">
                    ${pizza.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Beverages */}
        {data.beverages && data.beverages.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Coffee className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Bebidas</span>
            </div>
            <div className="space-y-2">
              {data.beverages.map((beverage, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{beverage.name}</span>
                    {beverage.quantity > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        x{beverage.quantity}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold">
                    ${beverage.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {data.validation_errors && data.validation_errors.length > 0 && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-medium text-sm text-destructive">Errores de Validación</span>
            </div>
            <ul className="text-sm space-y-1">
              {data.validation_errors.map((error, index) => (
                <li key={index} className="text-destructive/80">• {error}</li>
              ))}
            </ul>
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