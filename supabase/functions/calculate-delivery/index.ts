import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, address, order_items } = await req.json();
    const workflow_type = 'order_management'; // Hardcoded for this workflow
    console.log('Calculating delivery for session:', session_id, 'workflow:', workflow_type, 'address:', address);

    // Validate required parameters
    if (!session_id || !address || !order_items) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Faltan parámetros requeridos: session_id, address, order_items'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Simulated delivery calculation based on address zones
    const deliveryZones = {
      'centro': { time: '20-30 min', cost: 3.00, zone: 'Centro' },
      'norte': { time: '30-40 min', cost: 4.50, zone: 'Zona Norte' },
      'sur': { time: '25-35 min', cost: 4.00, zone: 'Zona Sur' },
      'este': { time: '35-45 min', cost: 5.00, zone: 'Zona Este' },
      'oeste': { time: '30-40 min', cost: 4.50, zone: 'Zona Oeste' }
    };

    // Determine zone based on address (simple simulation)
    let deliveryInfo = deliveryZones['centro']; // default
    const addressLower = address?.toLowerCase() || '';
    
    if (addressLower.includes('norte') || addressLower.includes('san isidro')) {
      deliveryInfo = deliveryZones['norte'];
    } else if (addressLower.includes('sur') || addressLower.includes('lomas')) {
      deliveryInfo = deliveryZones['sur'];
    } else if (addressLower.includes('este') || addressLower.includes('la plata')) {
      deliveryInfo = deliveryZones['este'];
    } else if (addressLower.includes('oeste') || addressLower.includes('moron')) {
      deliveryInfo = deliveryZones['oeste'];
    }

    // Calculate order total
    let subtotal = 0;
    if (order_items && Array.isArray(order_items)) {
      subtotal = order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    const delivery_cost = deliveryInfo.cost;
    const total = subtotal + delivery_cost;

    const calculationResult = {
      address: address,
      zone: deliveryInfo.zone,
      estimated_time: deliveryInfo.time,
      delivery_cost: delivery_cost,
      subtotal: subtotal,
      total: total,
      order_items: order_items,
      calculation_timestamp: new Date().toISOString()
    };

    // Update workflow step in database
    const { data, error } = await supabase
      .from('workflows')
      .update({
        current_step: 'confirming_order',
        step_data: calculationResult,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', session_id)
      .select();

    if (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }

    console.log('Delivery calculation updated successfully:', data);

    return new Response(JSON.stringify({
      success: true,
      message: 'Cálculo de delivery completado',
      delivery_info: calculationResult
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in calculate-delivery function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});