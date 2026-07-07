import { DriverType } from "@/types/order";

type DriverSelectorProps = {
  selected: DriverType;
  onSelect: (driver: DriverType) => void;
};

export function DriverSelector({ selected, onSelect }: DriverSelectorProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="driver-select" className="text-sm font-semibold">
        Pilih Layanan Pengiriman
      </label>
      <select
        id="driver-select"
        value={selected}
        onChange={(e) => onSelect(e.target.value as DriverType)}
        className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-[#5C4033]"
      >
        <option value="gosend">GoSend</option>
        <option value="grabexpress">GrabExpress</option>
      </select>
    </div>
  );
}
