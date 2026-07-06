import { Bike } from "lucide-react";
import { DriverType } from "@/types/order";

type DriverSelectorProps = {
  selected: DriverType;
  onSelect: (driver: DriverType) => void;
};

export function DriverSelector({ selected, onSelect }: DriverSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold">Pilih Layanan Pengiriman</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onSelect("gosend")}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
            selected === "gosend"
              ? "border-[#00AA13] bg-[#00AA13]/5"
              : "border-border hover:border-[#00AA13]/30"
          }`}
        >
          <div className={`p-2 rounded-full ${selected === "gosend" ? "bg-[#00AA13] text-white" : "bg-secondary text-muted-foreground"}`}>
            <Bike className="size-6" />
          </div>
          <div className="font-bold text-sm">GoSend</div>
        </button>
        <button
          onClick={() => onSelect("grabexpress")}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${
            selected === "grabexpress"
              ? "border-[#00B14F] bg-[#00B14F]/5"
              : "border-border hover:border-[#00B14F]/30"
          }`}
        >
          <div className={`p-2 rounded-full ${selected === "grabexpress" ? "bg-[#00B14F] text-white" : "bg-secondary text-muted-foreground"}`}>
            <Bike className="size-6" />
          </div>
          <div className="font-bold text-sm">GrabExpress</div>
        </button>
      </div>
    </div>
  );
}
