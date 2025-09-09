import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { session_id, pizzas, beverages, delivery_type, payment_method } = await req.json();
    
    if (!session_id || !pizzas) {
      return new Response(
        JSON.stringify({ error: 'session_id and pizzas are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Calculate pricing
    let pizzaTotal = 0;
    const pizzaBreakdown = [];

    for (const pizza of pizzas) {
      pizzaTotal += pizza.basePrice;
      pizzaBreakdown.push({
        description: pizza.description,
        size: pizza.size,
        price: pizza.basePrice
      });
    }

    const beverageTotal = (beverages || []).length * 3;
    const deliveryFee = delivery_type === 'domicilio' ? 4 : 0;
    const subtotal = pizzaTotal + beverageTotal;
    const total = subtotal + deliveryFee;

    // Create pricing data
    const pricingData = {
      pricing_calculated: {
        pizza_breakdown: pizzaBreakdown,
        beverage_breakdown: (beverages || []).map(bev => ({
          description: bev.description,
          price: 3
        })),
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total: total,
        delivery_type: delivery_type,
        payment_method: payment_method,
        calculation_time: new Date().toISOString(),
        summary: {
          total_pizzas: pizzas.length,
          total_beverages: (beverages || []).length,
          pizza_total: pizzaTotal,
          beverage_total: beverageTotal
        }
      }
    };

    // Update workflow in Supabase
    const { error } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type: 'order_management',
        current_step: 'pricing_calculated',
        step_data: pricingData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'session_id,workflow_type'
      });

    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deliveryText = delivery_type === 'domicilio' ? ` + €${deliveryFee} de envío` : '';
    const paymentText = payment_method ? ` Pagarás con ${payment_method}.` : '';
    
    const message = `Perfecto. El total de tu pedido es €${total} (€${subtotal} del pedido${deliveryText}).${paymentText} ¿Confirmas el pedido?`;

    return new Response(
      JSON.stringify({
        success: true,
        pricing: pricingData.pricing_calculated,
        message: message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in calculate-pizza-pricing function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});