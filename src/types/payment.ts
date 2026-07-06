export type PaymentChannel = {
  group: string;
  code: string;
  name: string;
  type: string;
  fee_merchant: {
    flat: number;
    percent: string;
  };
  fee_customer: {
    flat: number;
    percent: string;
  };
  total_fee: {
    flat: number;
    percent: string;
  };
  minimum_fee: number;
  maximum_fee: number;
  icon_url: string;
  active: boolean;
};

export type PaymentMethod = PaymentChannel;
