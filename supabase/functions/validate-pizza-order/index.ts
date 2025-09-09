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
    const { session_id, order_description, delivery_type } = await req.json();
    
    if (!session_id || !order_description) {
      return new Response(
        JSON.stringify({ error: 'session_id and order_description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Valid pizza sizes (case insensitive)
    const validSizes = ['mediana', 'familiar', 'gigante'];
    
    // Toxic ingredients blacklist
    const toxicIngredients = [
      'veneno', 'tóxico', 'toxico', 'cloro', 'químico', 'quimico',
      'lejía', 'lejia', 'amoniaco', 'detergente', 'jabón', 'jabon',
      'gasolina', 'alcohol', 'medicamento', 'medicina'
    ];

    // Parse the order description to extract pizzas and validate
    const pizzas = [];
    const beverages = [];
    let validationErrors = [];

    // Simple parsing logic (this would be enhanced with better NLP)
    const orderLines = order_description.toLowerCase().split(/[,\n]/);
    
    for (const line of orderLines) {
      const trimmedLine = line.trim();
      
      // Check if it's a beverage
      if (trimmedLine.includes('bebida') || trimmedLine.includes('refresco') || 
          trimmedLine.includes('coca') || trimmedLine.includes('agua') ||
          trimmedLine.includes('cerveza') || trimmedLine.includes('zumo')) {
        beverages.push({
          description: trimmedLine,
          price: 3
        });
        continue;
      }

      // Check if it's a pizza
      if (trimmedLine.includes('pizza')) {
        // Extract size
        let size = null;
        for (const validSize of validSizes) {
          if (trimmedLine.includes(validSize)) {
            size = validSize;
            break;
          }
        }

        if (!size) {
          validationErrors.push(`Tamaño no válido en: "${trimmedLine}". Los tamaños válidos son: mediana, familiar, gigante.`);
          continue;
        }

        // Check for toxic ingredients
        const foundToxic = toxicIngredients.find(toxic => trimmedLine.includes(toxic));
        if (foundToxic) {
          validationErrors.push(`Ingrediente no permitido "${foundToxic}" en: "${trimmedLine}"`);
          continue;
        }

        // Calculate price based on size
        let basePrice = 15; // mediana
        if (size === 'familiar') basePrice = 20;
        if (size === 'gigante') basePrice = 25;

        pizzas.push({
          description: trimmedLine,
          size: size,
          basePrice: basePrice
        });
      }
    }

    // Create validated order data
    const validatedOrderData = {
      order_validated: {
        pizzas: pizzas,
        beverages: beverages,
        delivery_type: delivery_type || 'recoger',
        validation_errors: validationErrors,
        validation_success: validationErrors.length === 0,
        validation_time: new Date().toISOString(),
        total_pizzas: pizzas.length,
        total_beverages: beverages.length
      }
    };

    // Update workflow in Supabase
    const { error } = await supabase
      .from('workflows')
      .upsert({
        session_id,
        workflow_type: 'order_management',
        current_step: validationErrors.length === 0 ? 'order_validated' : 'order_validation_failed',
        step_data: validatedOrderData,
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

    let message;
    if (validationErrors.length === 0) {
      message = `Perfecto, he anotado ${pizzas.length} pizza(s) y ${beverages.length} bebida(s). ¿Algo más que quieras añadir al pedido?`;
    } else {
      message = `He encontrado algunos problemas con el pedido: ${validationErrors.join('. ')}. ¿Podrías corregirlos?`;
    }

    return new Response(
      JSON.stringify({
        success: true,
        validated_order: validatedOrderData.order_validated,
        message: message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-pizza-order function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});