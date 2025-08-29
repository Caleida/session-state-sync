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
  // SMS confirmation should be checked early to avoid conflicts
  if (hasSMSConfirmation(stepData)) {
    return <SMSConfirmationDisplay data={stepData} isActive={isActive} />;
  }

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

  if (hasCallSummary(stepData)) {
    return <CallSummaryDisplay data={stepData} isActive={isActive} />;
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