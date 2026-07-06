import { PaymentChannel } from "@/types/payment";

function getSupabaseEnv() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase belum dikonfigurasi");
  }
  return { url, key };
}

export const tripayService = {
  async getPaymentChannels(): Promise<PaymentChannel[]> {
    const { url, key } = getSupabaseEnv();

    // Tripay API blocks browser CORS — proxy via Supabase Edge Function
    const response = await fetch(`${url}/functions/v1/get-tripay-channels`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal memuat metode pembayaran Tripay (${response.status})`);
    }

    const data = await response.json();
    if (!data?.success) {
      throw new Error(data?.message || data?.error || "Failed to load payment channels");
    }

    return (data.data as PaymentChannel[]).filter((ch) => ch.active);
  },

  async createTransaction(orderId: string): Promise<{ checkout_url: string }> {
    const { url, key } = getSupabaseEnv();

    const response = await fetch(`${url}/functions/v1/create-tripay-transaction`, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || "Gagal membuat transaksi Tripay");
    }

    return data;
  },
};
