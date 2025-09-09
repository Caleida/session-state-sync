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
import { CustomerIdentificationDisplay } from './step-data/CustomerIdentificationDisplay';
import { BillingAnalysisDisplay } from './step-data/BillingAnalysisDisplay';
import { PromotionsDisplay } from './step-data/PromotionsDisplay';
import { AgentHandoffDisplay } from './step-data/AgentHandoffDisplay';
import { IncidentAnalysisDisplay } from './step-data/IncidentAnalysisDisplay';
import { CustomerInfoCollectedDisplay } from './step-data/CustomerInfoCollectedDisplay';
import { PizzaOrderValidatedDisplay } from './step-data/PizzaOrderValidatedDisplay';
import { PizzaPricingCalculatedDisplay } from './step-data/PizzaPricingCalculatedDisplay';

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

// Customer support detection functions
const hasCustomerIdentification = (data: any): boolean => {
  return data && data.customer_identified && data.customer_identified.customer_info;
};

const hasBillingAnalysis = (data: any): boolean => {
  return data && data.analyzing_bill && data.analyzing_bill.billing_details;
};

const hasChargesExplanation = (data: any): boolean => {
  return data && data.explaining_charges && data.explaining_charges.charges_breakdown;
};

const hasPromotions = (data: any): boolean => {
  return data && data.offering_promotions && data.offering_promotions.available_promotions;
};

const hasAgentHandoff = (data: any): boolean => {
  return data && data.agent_connected && data.agent_connected.agent_details;
};

const hasIncidentAnalysis = (data: any): boolean => {
  return data && data.incident_analysis && data.incident_analysis.issue_type;
};

// New detection functions for pizzeria workflow
const hasCustomerInfoCollected = (data: any): boolean => {
  return data && data.customer_info_collected && data.customer_info_collected.customer_info;
};

const hasPizzaOrderValidated = (data: any): boolean => {
  return data && data.order_validated && (
    data.order_validated.pizzas || 
    data.order_validated.validation_errors !== undefined || 
    data.order_validated.validation_success !== undefined
  );
};

const hasPizzaPricingCalculated = (data: any): boolean => {
  return data && data.pricing_calculated && (
    data.pricing_calculated.subtotal !== undefined || 
    data.pricing_calculated.delivery_fee !== undefined || 
    data.pricing_calculated.total !== undefined
  );
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

  // Pizzeria-specific displays (check first for priority)
  if (hasCustomerInfoCollected(stepData)) {
    return <CustomerInfoCollectedDisplay data={stepData} isActive={isActive} />;
  }
  
  if (hasPizzaOrderValidated(stepData)) {
    return <PizzaOrderValidatedDisplay data={stepData.order_validated} isActive={isActive} />;
  }
  
  if (hasPizzaPricingCalculated(stepData)) {
    return <PizzaPricingCalculatedDisplay data={stepData.pricing_calculated} isActive={isActive} />;
  }

  // Customer support displays
  if (hasCustomerIdentification(stepData)) {
    return <CustomerIdentificationDisplay data={stepData} isActive={isActive} />;
  }

  if (hasBillingAnalysis(stepData)) {
    return <BillingAnalysisDisplay data={stepData} isActive={isActive} />;
  }

  if (hasChargesExplanation(stepData)) {
    return <BillingAnalysisDisplay data={stepData} isActive={isActive} />;
  }

  if (hasPromotions(stepData)) {
    return <PromotionsDisplay data={stepData} isActive={isActive} />;
  }

  if (hasAgentHandoff(stepData)) {
    return <AgentHandoffDisplay data={stepData} isActive={isActive} />;
  }

  if (hasIncidentAnalysis(stepData)) {
    return <IncidentAnalysisDisplay data={stepData} isActive={isActive} />;
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