import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const TRIPAY_API_KEY = Deno.env.get('TRIPAY_API_KEY') || 'DEV-FuifX106CyACBaYJ6VCgCCLEbgJ8gj24iSelutnw';
    
    // Using Sandbox URL
    const response = await fetch('https://tripay.co.id/api-sandbox/merchant/payment-channel', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`
      }
    });

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

    
    // Using Sandbox URL
    const response = await fetch('https://tripay.co.id/api-sandbox/merchant/payment-channel', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`
      }
    });

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
