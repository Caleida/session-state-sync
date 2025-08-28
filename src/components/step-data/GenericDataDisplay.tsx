import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface GenericDataDisplayProps {
  data: any;
  isActive: boolean;
}

export const GenericDataDisplay: React.FC<GenericDataDisplayProps> = ({ data, isActive }) => {
  const renderValue = (value: any, key?: string): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>;
    }
    
    if (typeof value === 'boolean') {
      return <Badge variant={value ? "default" : "secondary"}>{value.toString()}</Badge>;
    }
    
    if (typeof value === 'string') {
      return <span>{value}</span>;
    }
    
    if (typeof value === 'number') {
      return <span>{value}</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground italic">empty array</span>;
      }
      return (
        <div className="space-y-1">
          {value.slice(0, 3).map((item, index) => (
            <div key={index} className="text-xs pl-2 border-l-2 border-muted">
              {renderValue(item)}
            </div>
          ))}
          {value.length > 3 && (
            <div className="text-xs text-muted-foreground pl-2">
              + {value.length - 3} more items...
            </div>
          )}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const entries = Object.entries(value).slice(0, 3);
      return (
        <div className="space-y-1">
          {entries.map(([k, v]) => (
            <div key={k} className="text-xs">
              <span className="font-medium">{k}:</span> {renderValue(v, k)}
            </div>
          ))}
          {Object.keys(value).length > 3 && (
            <div className="text-xs text-muted-foreground">
              + {Object.keys(value).length - 3} more properties...
            </div>
          )}
        </div>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  // Filter out common keys that might not be interesting
  const filteredData = { ...data };
  delete filteredData.message; // Already handled by main renderer

  if (Object.keys(filteredData).length === 0) {
    return null;
  }

  return (
    <Card className={`mt-3 ${isActive ? 'border-primary' : 'border-border/50'}`}>
      <CardContent className="p-4">
        <div className={`space-y-2 text-sm ${isActive ? 'text-primary' : 'text-foreground'}`}>
          <div className="font-medium mb-2">Datos del paso:</div>
          <div className="space-y-1">
            {Object.entries(filteredData).map(([key, value]) => (
              <div key={key} className="flex flex-col space-y-1">
                <span className="font-medium">{key}:</span>
                <div className="pl-2">{renderValue(value, key)}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};