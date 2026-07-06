import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    // Fetch order items
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    // Tripay Config (Sandbox keys from user env, fallback to provided keys)
    const apiKey = Deno.env.get("TRIPAY_API_KEY") || "DEV-BYENBpPByxR2CK3nd3cD1ml9LO01LP6kWiPpTL38";
    const privateKey = Deno.env.get("TRIPAY_PRIVATE_KEY") || "EpCVx-Tu8m1-tz63A-2ePs1-wsJob";
    const merchantCode = Deno.env.get("TRIPAY_MERCHANT_CODE") || "T51310";
    
    const merchantRef = orderId.replace(/-/g, "").substring(0, 20); // Tripay limit maybe
    const amount = order.total;

    // Generate Signature: HMAC SHA256 (merchantCode + merchantRef + amount)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(privateKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const dataToSign = encoder.encode(merchantCode + merchantRef + amount);
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataToSign);
    
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Note: Use payment_channel from order
    const method = order.payment_channel || "QRISC";
    
    // Extract customer info from native columns
    let customerName = order.customer_name || "Pelanggan LNR";
    let customerPhone = order.customer_phone || "08000000000";

    const returnUrl = Deno.env.get("FRONTEND_URL") || "https://lnrcoffee.com";
    
    const payload = {
      method,
      merchant_ref: merchantRef,
      amount,
      customer_name: customerName,
      customer_email: "customer@lnrcoffee.com",
      customer_phone: customerPhone,
      order_items: items?.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.qty
      })) || [{ name: "Pesanan LNR", price: amount, quantity: 1 }],
      return_url: `${returnUrl}/order/${orderId}`,
      expired_time: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      signature
    };

    const tripayResponse = await fetch("https://tripay.co.id/api-sandbox/transaction/create", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const tripayData = await tripayResponse.json();

    if (!tripayData.success) {
      console.error("Tripay Error:", tripayData);
      throw new Error(tripayData.message || "Failed to create tripay transaction");
    }

    const checkoutUrl = tripayData.data.checkout_url;
    const paymentReference = tripayData.data.reference;
    const qrUrl = tripayData.data.qr_url || tripayData.data.qr_data || null;
    const instructions = tripayData.data.instructions || null;
    const payCode = tripayData.data.pay_code || null;

    await supabase
      .from("orders")
      .update({
        payment_url: checkoutUrl,
        payment_reference: paymentReference,
        payment_qr_url: qrUrl,
        payment_instructions: instructions,
        payment_code: payCode
      })
      .eq("id", orderId);

    return new Response(JSON.stringify({ 
      checkout_url: checkoutUrl,
      order_id: orderId,
      qr_url: qrUrl
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
