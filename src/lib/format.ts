export const formatRupiah = (value: number) =>
  "Rp " + Math.round(value).toLocaleString("id-ID");
