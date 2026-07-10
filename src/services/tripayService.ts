import { PaymentChannel } from "@/types/payment";
import { supabase } from "@/integrations/supabase/client";

export const tripayService = {
  async getPaymentChannels(): Promise<PaymentChannel[]> {
    const { data, error } = await supabase.functions.invoke('get-tripay-channels', {
      method: 'GET'
    });

    if (error) {
      throw new Error(`Gagal memuat metode pembayaran Tripay (${error.message})`);
    }

    if (!data?.success) {
      throw new Error(data?.message || data?.error || "Failed to load payment channels");
    }

    return (data.data as PaymentChannel[]).filter((ch: any) => ch.active);
  },

  async createTransaction(orderId: string): Promise<{ checkout_url: string }> {
    const { data, error } = await supabase.functions.invoke('create-tripay-transaction', {
      body: { orderId }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  },
};
