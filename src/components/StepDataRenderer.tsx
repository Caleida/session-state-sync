import React from 'react';
import { AvailableSlotsDisplay } from './step-data/AvailableSlotsDisplay';
import { AppointmentConfirmationDisplay } from './step-data/AppointmentConfirmationDisplay';
import { CallSummaryDisplay } from './step-data/CallSummaryDisplay';
import { CallStartedDisplay } from './step-data/CallStartedDisplay';
import { SMSConfirmationDisplay } from './step-data/SMSConfirmationDisplay';
import { GenericDataDisplay } from './step-data/GenericDataDisplay';
import { PackageInfoDisplay } from './step-data/PackageInfoDisplay';
import { DeliveryOptionsDisplay } from './step-data/DeliveryOptionsDisplay';
import { DeliveryChangeConfirmationDisplay } from './step-data/DeliveryChangeConfirmationDisplay';
import { ProductCatalogDisplay } from './step-data/ProductCatalogDisplay';
import { OrderSummaryDisplay } from './step-data/OrderSummaryDisplay';
import { OrderConfirmationDisplay } from './step-data/OrderConfirmationDisplay';

interface StepDataRendererProps {
  stepData: any;
  stepId: string;
  isActive: boolean;
}

// Type detection functions
const hasAvailableSlots = (data: any): boolean => {
  return data && Array.isArray(data.available_slots) && data.available_slots.length > 0;
};

const hasConfirmedAppointment = (data: any): boolean => {
  return data && (
    data.confirmed_appointment || 
    data.confirmation_number ||
    data.appointment ||
    data.confirmation_details
  );
};

const hasCallSummary = (data: any): boolean => {
  return data && (
    data.call_termination || 
    data.completion_details ||
    data.call_duration || 
    data.call_summary || 
    data.termination_reason
  );
};

const hasCallStarted = (data: any): boolean => {
  return data && (
    data.call_initiation ||
    data.start_details ||
    (data.call_initiation?.call_initiated === true)
  );
};

const hasSMSConfirmation = (data: any): boolean => {
  return data && data.sms_confirmation;
};

const hasSimpleMessage = (data: any): boolean => {
  return data && typeof data.message === 'string';
};

const hasPackageInfo = (data: any): boolean => {
  return data && data.package_info && data.package_info.tracking_number;
};

const hasDeliveryOptions = (data: any): boolean => {
  return data && Array.isArray(data.available_options) && data.available_options.length > 0;
};

const hasDeliveryChangeConfirmation = (data: any): boolean => {
  return data && data.confirmed_change && data.confirmed_change.confirmation_number;
};

// Pizzeria order management detection functions
const hasProductCatalog = (data: any): boolean => {
  return data && typeof data === 'object' && 
         (data.pizzas || data.beverages || data.promotions);
};

const hasOrderSummary = (data: any): boolean => {
  return data && typeof data === 'object' && 
         data.order_items && Array.isArray(data.order_items) &&
         (data.subtotal !== undefined || data.total !== undefined);
};

const hasOrderConfirmation = (data: any): boolean => {
  return data && typeof data === 'object' && 
         data.order_number && 
         data.status === 'confirmed';
};

const hasGenericData = (data: any): boolean => {
  return data && typeof data === 'object' && Object.keys(data).length > 0;
};

export const StepDataRenderer: React.FC<StepDataRendererProps> = ({ 
  stepData, 
  stepId, 
  isActive 
}) => {
  // Return null if no data
  if (!stepData || (typeof stepData === 'object' && Object.keys(stepData).length === 0)) {
    return null;
  }

  // Render based on data structure detection
  if (hasPackageInfo(stepData)) {
    return <PackageInfoDisplay data={stepData} isActive={isActive} />;
  }

  if (hasDeliveryOptions(stepData)) {
    return <DeliveryOptionsDisplay data={stepData} isActive={isActive} />;
  }

  if (hasDeliveryChangeConfirmation(stepData)) {
    return <DeliveryChangeConfirmationDisplay data={stepData} isActive={isActive} />;
  }

  if (hasAvailableSlots(stepData)) {
    return <AvailableSlotsDisplay data={stepData} isActive={isActive} />;
  }

  if (hasConfirmedAppointment(stepData)) {
    return <AppointmentConfirmationDisplay data={stepData} isActive={isActive} />;
  }

  if (hasCallStarted(stepData)) {
    return <CallStartedDisplay data={stepData} isActive={isActive} />;
  }

  if (hasSMSConfirmation(stepData)) {
    return <SMSConfirmationDisplay data={stepData} isActive={isActive} />;
  }

  if (hasCallSummary(stepData)) {
    return <CallSummaryDisplay data={stepData} isActive={isActive} />;
  }

  // Pizzeria order management displays
  if (hasProductCatalog(stepData)) {
    return <ProductCatalogDisplay stepData={stepData} />;
  }

  if (hasOrderSummary(stepData)) {
    return <OrderSummaryDisplay stepData={stepData} />;
  }

  if (hasOrderConfirmation(stepData)) {
    return <OrderConfirmationDisplay stepData={stepData} />;
  }

  if (hasSimpleMessage(stepData)) {
    return (
      <div className={`text-sm mt-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
        {stepData.message}
      </div>
    );
  }

  if (hasGenericData(stepData)) {
    return <GenericDataDisplay data={stepData} isActive={isActive} />;
  }

  return null;
};