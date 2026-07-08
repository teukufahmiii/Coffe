import { PaymentChannel } from "@/types/payment";
import { supabase } from "@/integrations/supabase/client";

const TRIPAY_API_KEY = import.meta.env.VITE_TRIPAY_API_KEY;
const TRIPAY_PRIVATE_KEY = import.meta.env.VITE_TRIPAY_PRIVATE_KEY;
const TRIPAY_MERCHANT_CODE = import.meta.env.VITE_TRIPAY_MERCHANT_CODE;

export const tripayService = {
  async getPaymentChannels(): Promise<PaymentChannel[]> {
    const targetUrl = 'https://tripay.co.id/api-sandbox/merchant/payment-channel';
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxyUrl, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${TRIPAY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal memuat metode pembayaran Tripay (${response.status})`);
    }

    const data = await response.json();
    if (!data?.success) {
      throw new Error(data?.message || data?.error || "Failed to load payment channels");
    }

    return (data.data as PaymentChannel[]).filter((ch: any) => ch.active);
  },

  async createTransaction(orderId: string): Promise<{ checkout_url: string }> {
    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    const merchantRef = orderId.replace(/-/g, "").substring(0, 20);
    const amount = order.total;

    // Generate Signature: HMAC SHA256 (merchantCode + merchantRef + amount)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(TRIPAY_PRIVATE_KEY),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const dataToSign = encoder.encode(TRIPAY_MERCHANT_CODE + merchantRef + amount);
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataToSign);
    
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const method = order.payment_channel || "QRISC";
    let customerName = order.customer_name || "Pelanggan LNR";
    let customerPhone = order.customer_phone || "08000000000";

    const payload = {
      method,
      merchant_ref: merchantRef,
      amount,
      customer_name: customerName,
      customer_email: "customer@lnrcoffee.com",
      customer_phone: customerPhone,
      order_items: [
        {
          sku: "ORDER",
          name: "Pesanan LNR Coffee",
          price: amount,
          quantity: 1
        }
      ],
      return_url: `${window.location.origin}/order/${orderId}`,
      expired_time: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      signature
    };

    const targetUrl = 'https://tripay.co.id/api-sandbox/transaction/create';
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    
    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TRIPAY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const tripayData = await response.json();

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

    return tripayData.data;
  },
};
