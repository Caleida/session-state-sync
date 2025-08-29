import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pizza, Coffee, Sparkles } from "lucide-react";

interface ProductCatalogDisplayProps {
  stepData: {
    pizzas?: Array<{
      id: string;
      name: string;
      description: string;
      sizes: Array<{
        size: string;
        price: number;
      }>;
      category: string;
    }>;
    beverages?: Array<{
      id: string;
      name: string;
      price: number;
    }>;
    promotions?: Array<{
      id: string;
      name: string;
      description: string;
      conditions?: string;
    }>;
    search_criteria?: {
      category: string;
    };
  };
}

export const ProductCatalogDisplay: React.FC<ProductCatalogDisplayProps> = ({ stepData }) => {
  const { pizzas = [], beverages = [], promotions = [], search_criteria } = stepData;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'classic':
        return <Pizza className="h-4 w-4" />;
      case 'specialty':
        return <Sparkles className="h-4 w-4" />;
      case 'gourmet':
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      default:
        return <Pizza className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'classic': 'Clásica',
      'specialty': 'Especial',
      'gourmet': 'Gourmet'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className="space-y-4">
      {search_criteria && (
        <div className="text-sm text-muted-foreground">
          Categoría: {search_criteria.category === 'all' ? 'Todas' : getCategoryLabel(search_criteria.category)}
        </div>
      )}

      {/* Promociones */}
      {promotions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Promociones Especiales
          </h4>
          {promotions.map((promo) => (
            <Card key={promo.id} className="border-l-4 border-l-primary bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{promo.name}</CardTitle>
                <CardDescription>{promo.description}</CardDescription>
              </CardHeader>
              {promo.conditions && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">* {promo.conditions}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pizzas */}
      {pizzas.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Pizza className="h-4 w-4" />
            Pizzas Disponibles ({pizzas.length})
          </h4>
          <div className="grid gap-3">
            {pizzas.map((pizza) => (
              <Card key={pizza.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {getCategoryIcon(pizza.category)}
                        {pizza.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {pizza.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {getCategoryLabel(pizza.category)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1">
                    {pizza.sizes.map((size, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{size.size}</span>
                        <span className="font-medium">${size.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Bebidas */}
      {beverages.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            Bebidas
          </h4>
          <div className="grid gap-2">
            {beverages.map((beverage) => (
              <div key={beverage.id} className="flex justify-between items-center p-3 border rounded-lg">
                <span className="text-sm">{beverage.name}</span>
                <span className="font-medium">${beverage.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground border-t pt-2">
        Catálogo actualizado - Precios incluyen IVA
      </div>
    </div>
  );
};