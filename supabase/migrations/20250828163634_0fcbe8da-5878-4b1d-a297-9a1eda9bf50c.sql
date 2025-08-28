-- Actualizar el workflow_type de "appointments" a "booking" en workflow_definitions
UPDATE workflow_definitions 
SET workflow_type = 'booking' 
WHERE workflow_type = 'appointments';

-- Actualizar el workflow_type de "appointments" a "booking" en workflows existentes
UPDATE workflows 
SET workflow_type = 'booking' 
WHERE workflow_type = 'appointments';