import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, AlertTriangle } from 'lucide-react';

interface BillingAnalysisDisplayProps {
  data: {
    analyzing_bill?: {
      billing_details: {
        current_bill: {
          amount: number;
          currency: string;
          billing_period: string;
          due_date: string;
          issued_date: string;
        };
        previous_bill: {
          amount: number;
          currency: string;
          billing_period: string;
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
    explaining_charges?: {
      charges_breakdown: {
        detailed_breakdown: {
          service_changes: Array<{
            service_name: string;
            previous_cost: number;
            current_cost: number;
            difference: number;
            activation_date: string;
            explanation: string;
            billing_cycle: string;
            next_billing: string;
          }>;
          monthly_summary: {
            base_services: number;
            new_services: number;
            total_current: number;
            total_previous: number;
            difference: number;
            percentage_increase: number;
          };
          explanation_details: {
            reason: string;
            impact: string;
            next_steps: string[];
          };
        };
      };
    };
  };
  isActive: boolean;
}

export const BillingAnalysisDisplay: React.FC<BillingAnalysisDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const analyzingData = data.analyzing_bill;
  const chargesData = data.explaining_charges;

  // Handle analyzing_bill structure
  if (analyzingData) {
    return (
      <Card className={`p-4 ${isActive ? 'border-primary' : 'border-border'}`}>
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <h3 className={`font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                Análisis de Facturación
              </h3>
            </div>
            
            {analyzingData.increment_detected && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    Incremento Detectado: +€{analyzingData.increment_amount}
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  {analyzingData.increment_reason}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Factura Actual</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold">
                    €{analyzingData.billing_details.current_bill.amount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {analyzingData.billing_details.current_bill.billing_period}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Factura Anterior</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-semibold">
                    €{analyzingData.billing_details.previous_bill.amount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {analyzingData.billing_details.previous_bill.billing_period}
                  </p>
                </div>
              </div>
            </div>

            {analyzingData.billing_details.detected_changes && analyzingData.billing_details.detected_changes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Cambios Detectados</h4>
                {analyzingData.billing_details.detected_changes.map((change, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{change.service}</span>
                      <Badge variant={change.type === 'new_subscription' ? 'default' : 'secondary'}>
                        +€{change.amount}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{change.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Activado: {new Date(change.activation_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle explaining_charges structure  
  if (chargesData) {
    return (
      <Card className={`p-4 ${isActive ? 'border-primary' : 'border-border'}`}>
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <h3 className={`font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                Explicación de Cargos
              </h3>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Resumen del Cambio</h4>
              <p className="text-sm text-blue-700">
                {chargesData.charges_breakdown.detailed_breakdown.explanation_details.reason}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {chargesData.charges_breakdown.detailed_breakdown.explanation_details.impact}
              </p>
            </div>

            {chargesData.charges_breakdown.detailed_breakdown.service_changes.map((change, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{change.service_name}</span>
                  <Badge variant="secondary">
                    +€{change.difference}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{change.explanation}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Anterior: €{change.previous_cost}</div>
                  <div>Actual: €{change.current_cost}</div>
                  <div>Ciclo: {change.billing_cycle}</div>
                  <div>Próxima factura: {new Date(change.next_billing).toLocaleDateString('es-ES')}</div>
                </div>
              </div>
            ))}

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Próximos pasos sugeridos</h4>
              <ul className="list-disc list-inside space-y-1">
                {chargesData.charges_breakdown.detailed_breakdown.explanation_details.next_steps.map((step, index) => (
                  <li key={index} className="text-sm text-muted-foreground">{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};