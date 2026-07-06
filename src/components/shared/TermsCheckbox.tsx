type TermsCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function TermsCheckbox({ checked, onChange }: TermsCheckboxProps) {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-border p-4 bg-secondary/30">
      <input 
        type="checkbox" 
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 size-5 shrink-0 accent-primary" 
        id="terms"
      />
      <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer">
        Saya menyetujui <span className="font-semibold text-foreground">Syarat & Ketentuan</span> LNR Coffee. Pesanan yang sudah diproses tidak dapat dibatalkan atau diubah. Metode pembayaran yang digunakan valid dan pesanan akan segera diproses setelah pembayaran lunas.
      </label>
    </div>
  );
}
