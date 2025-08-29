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
    const { session_id, current_step, category } = await req.json();
    console.log('Searching products for session:', session_id, 'category:', category);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Simulated pizza catalog
    const pizzaCatalog = {
      pizzas: [
        {
          id: 'pizza_001',
          name: 'Pizza Margarita',
          description: 'Salsa de tomate, mozzarella fresca, albahaca',
          sizes: [
            { size: 'Personal', price: 12.90 },
            { size: 'Mediana', price: 18.90 },
            { size: 'Familiar', price: 24.90 }
          ],
          category: 'classic'
        },
        {
          id: 'pizza_002',
          name: 'Pizza Pepperoni',
          description: 'Salsa de tomate, mozzarella, pepperoni',
          sizes: [
            { size: 'Personal', price: 14.90 },
            { size: 'Mediana', price: 20.90 },
            { size: 'Familiar', price: 26.90 }
          ],
          category: 'classic'
        },
        {
          id: 'pizza_003',
          name: 'Pizza Hawaiana',
          description: 'Salsa de tomate, mozzarella, jamón, piña',
          sizes: [
            { size: 'Personal', price: 15.90 },
            { size: 'Mediana', price: 21.90 },
            { size: 'Familiar', price: 27.90 }
          ],
          category: 'specialty'
        },
        {
          id: 'pizza_004',
          name: 'Pizza Cuatro Quesos',
          description: 'Mozzarella, parmesano, gorgonzola, provolone',
          sizes: [
            { size: 'Personal', price: 16.90 },
            { size: 'Mediana', price: 22.90 },
            { size: 'Familiar', price: 28.90 }
          ],
          category: 'gourmet'
        }
      ],
      beverages: [
        { id: 'bev_001', name: 'Coca Cola 500ml', price: 3.50 },
        { id: 'bev_002', name: 'Agua 500ml', price: 2.00 },
        { id: 'bev_003', name: 'Jugo de Naranja 400ml', price: 4.00 }
      ],
      promotions: [
        {
          id: 'promo_001',
          name: '2x1 Pizzas Familiares',
          description: 'Lleva 2 pizzas familiares al precio de 1',
          conditions: 'Solo pizzas clásicas'
        }
      ]
    };

    // Filter by category if specified
    let products = pizzaCatalog;
    if (category && category !== 'all') {
      products = {
        ...pizzaCatalog,
        pizzas: pizzaCatalog.pizzas.filter(pizza => pizza.category === category)
      };
    }

    // Update workflow step in database
    const { data, error } = await supabase
      .from('workflows')
      .update({
        current_step: 'showing_catalog',
        step_data: {
          ...products,
          search_criteria: { category: category || 'all' },
          timestamp: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('session_id', session_id)
      .select();

    if (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }

    console.log('Product catalog updated successfully:', data);

    return new Response(JSON.stringify({
      success: true,
      message: 'Catálogo de productos cargado exitosamente',
      products: products,
      total_pizzas: products.pizzas.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in search-products function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});