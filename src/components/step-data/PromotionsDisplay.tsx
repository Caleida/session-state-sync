import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tag, Gift, Percent, Calendar } from 'lucide-react';

interface PromotionsDisplayProps {
  data: {
    offering_promotions?: {
      available_promotions: Array<{
        id: string;
        name: string;
        description: string;
        discount_type: string;
        discount_value: number;
        valid_until: string;
        conditions: string[];
        monthly_savings: number;
      }>;
      personalized_message: string;
      applicable_to_customer: boolean;
    };
  };
  isActive: boolean;
}

export const PromotionsDisplay: React.FC<PromotionsDisplayProps> = ({ 
  data, 
  isActive 
}) => {
  const promotionsData = data.offering_promotions;

  if (!promotionsData || !promotionsData.available_promotions) return null;

  return (
    <Card className={`mt-3 ${isActive ? 'border-primary' : 'border-border/50'}`}>
      <CardContent className="p-4">
        <div className={`space-y-3 text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
          <div className="flex items-center space-x-2">
            <Gift className="w-4 h-4 text-green-500" />
            <span className="font-medium">Promociones disponibles</span>
          </div>
          
          {promotionsData.personalized_message && (
            <div className="text-xs text-muted-foreground italic">
              {promotionsData.personalized_message}
            </div>
          )}

          <div className="space-y-2">
            {promotionsData.available_promotions.map((promotion, index) => (
              <div key={promotion.id} className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-md">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-green-700">{promotion.name}</div>
                    <div className="text-xs text-green-600 mt-1">{promotion.description}</div>
                  </div>
                  
                  <Badge variant="secondary" className="ml-2">
                    <Percent className="w-3 h-3 mr-1" />
                    {promotion.discount_type === 'percentage' ? `${promotion.discount_value}%` : `€${promotion.discount_value}`}
                  </Badge>
                </div>

                {promotion.monthly_savings && (
                  <div className="text-xs text-green-600 font-medium mb-2">
                    Ahorro mensual: €{promotion.monthly_savings.toFixed(2)}
                  </div>
                )}

                {promotion.conditions && promotion.conditions.length > 0 && (
                  <div className="mb-2">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Condiciones:</div>
                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                      {promotion.conditions.map((condition, condIndex) => (
                        <li key={condIndex}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Válido hasta: {promotion.valid_until}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};