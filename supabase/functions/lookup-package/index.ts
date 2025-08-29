import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Package lookup request received');
    
    const { session_id, tracking_number, workflow_type = 'delivery_change' } = await req.json();
    
    console.log('Request data:', { session_id, tracking_number, workflow_type });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const mockPackageData = {
      tracking_number: tracking_number,
      sender: "Amazon España",
      recipient: "María García López", 
      current_status: "En tránsito",
      estimated_delivery: "2025-08-30",
      current_delivery_address: "Calle Mayor 45, 3º B, 28013 Madrid",
      package_type: "Paquete estándar",
      weight: "2.3 kg",
      dimensions: "30x25x15 cm",
      delivery_window: "09:00 - 18:00"
    };

    const packageLookupData = {
      package_info: mockPackageData,
      lookup_timestamp: new Date().toISOString(),
      found: true
    };

    const { error: upsertError } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type,
        current_step: 'package_lookup',
        step_data: packageLookupData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,workflow_type'
      });

    if (upsertError) {
      console.error('Error updating workflow:', upsertError);
      return new Response(
        JSON.stringify({ error: 'Failed to update workflow' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        next_step: 'package_lookup',
        package_info: mockPackageData
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lookup-package function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});