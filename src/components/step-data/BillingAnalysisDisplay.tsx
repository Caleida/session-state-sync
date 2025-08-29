import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';

interface BillingAnalysisDisplayProps {
  data: {
    explaining_charges?: {
      billing_details: {
        current_bill: {
          amount: number;
          currency: string;
          billing_period: string;
          due_date: string;
        };
        previous_bill: {
          amount: number;
          currency: string;
        };
        detected_changes: Array<{
          service: string;
          type: string;
          amount: number;
          activation_date: string;
          description: string;
        }>;
        services: Array<{
          name: string;
          amount: number;
          status: string;
          activation_date?: string;
        }>;
      };
      increment_detected: boolean;
      increment_amount: number;
      increment_reason: string;
    };
  };
  isActive: boolean;
}

export const BillingAnalysisDisplay: React.FC<BillingAnalysisDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const billingData = data.explaining_charges;

  if (!billingData) return null;

  const { billing_details, increment_detected, increment_amount, increment_reason } = billingData;

  return (
    <Card className={`mt-3 ${isActive ? 'border-primary' : 'border-border/50'}`}>
      <CardContent className="p-4">
        <div className={`space-y-3 text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Análisis de facturación</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Factura anterior</div>
              <div className="font-medium">
                {billing_details.previous_bill.amount.toFixed(2)} {billing_details.previous_bill.currency}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground">Factura actual</div>
              <div className="font-medium">
                {billing_details.current_bill.amount.toFixed(2)} {billing_details.current_bill.currency}
              </div>
            </div>
          </div>

          {increment_detected && (
            <div className="p-2 bg-orange-50 border border-orange-200 rounded-md">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="w-3 h-3 text-orange-600" />
                <span className="font-medium text-orange-700">Incremento detectado</span>
              </div>
              <div className="text-xs text-orange-600">
                +{increment_amount.toFixed(2)} {billing_details.current_bill.currency}
              </div>
              <div className="text-xs text-orange-600 mt-1">
                {increment_reason}
              </div>
            </div>
          )}

          {billing_details.detected_changes && billing_details.detected_changes.length > 0 && (
            <div>
              <div className="text-xs font-medium mb-2">Cambios detectados:</div>
              {billing_details.detected_changes.map((change, index) => (
                <div key={index} className="p-2 bg-muted rounded-md mb-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{change.service}</span>
                    <Badge variant="outline" className="text-xs">
                      +{change.amount.toFixed(2)} {billing_details.current_bill.currency}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {change.description}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Desde: {change.activation_date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};