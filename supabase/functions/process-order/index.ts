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
    const { session_id, current_step, order_data, customer_info } = await req.json();
    console.log('Processing order for session:', session_id);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Generate order number
    const orderNumber = 'PZ' + Date.now().toString().slice(-6);
    
    // Current time for order processing
    const orderTime = new Date();
    const estimatedDelivery = new Date(orderTime.getTime() + 35 * 60000); // +35 minutes

    // Process order (simulate POS system integration)
    const processedOrder = {
      order_number: orderNumber,
      customer: {
        name: customer_info?.name || 'Cliente',
        phone: customer_info?.phone || '',
        address: order_data?.address || ''
      },
      items: order_data?.order_items || [],
      pricing: {
        subtotal: order_data?.subtotal || 0,
        delivery_cost: order_data?.delivery_cost || 0,
        total: order_data?.total || 0
      },
      delivery: {
        zone: order_data?.zone || '',
        estimated_time: order_data?.estimated_time || '30-40 min',
        estimated_delivery: estimatedDelivery.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      status: 'confirmed',
      order_timestamp: orderTime.toISOString(),
      payment_method: 'efectivo', // Default for demo
      special_instructions: order_data?.instructions || ''
    };

    // Update workflow step in database
    const { data, error } = await supabase
      .from('workflows')
      .update({
        current_step: 'order_confirmed',
        step_data: processedOrder,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', session_id)
      .select();

    if (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }

    console.log('Order processed successfully:', data);

    return new Response(JSON.stringify({
      success: true,
      message: 'Pedido procesado exitosamente',
      order: processedOrder
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in process-order function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});