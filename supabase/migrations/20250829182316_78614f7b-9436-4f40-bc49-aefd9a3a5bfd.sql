-- Standardize booking workflow to use 'steps' instead of 'workflow_steps' and 'icon' instead of 'iconName'
UPDATE workflow_definitions 
SET steps_config = jsonb_set(
  jsonb_set(
    steps_config,
    '{steps}',
    (
      SELECT jsonb_object_agg(
        key,
        jsonb_set(value, '{icon}', value->'iconName') - 'iconName'
      )
      FROM jsonb_each(steps_config->'workflow_steps')
    )
  ) - 'workflow_steps',
  '{step_order}',
  steps_config->'step_order'
)
WHERE workflow_type = 'booking';

-- Remove 'action' fields from delivery_change workflow steps
UPDATE workflow_definitions
SET steps_config = jsonb_set(
  steps_config,
  '{steps}',
  (
    SELECT jsonb_object_agg(
      key,
      value - 'action'
    )
    FROM jsonb_each(steps_config->'steps')
  )
)
WHERE workflow_type = 'delivery_change';

-- Standardize order_management workflow: change 'iconName' to 'icon', 'stepOrder' to 'step_order', and remove 'action' fields
UPDATE workflow_definitions
SET steps_config = jsonb_set(
  jsonb_set(
    steps_config,
    '{steps}',
    (
      SELECT jsonb_object_agg(
        key,
        jsonb_set(value - 'action', '{icon}', value->'iconName') - 'iconName'
      )
      FROM jsonb_each(steps_config->'steps')
    )
  ),
  '{step_order}',
  steps_config->'stepOrder'
) - 'stepOrder'
WHERE workflow_type = 'order_management';