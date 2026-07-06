import { Plus, Minus } from "lucide-react";
import { formatRupiah } from "@/lib/format";

type MenuCardProps = {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url?: string | null;
  category: string;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  onClick: () => void;
};

export function MenuCard({
  name,
  price,
  description,
  image_url,
  category,
  qty,
  onAdd,
  onRemove,
  onClick
}: MenuCardProps) {
  return (
    <article 
      onClick={onClick}
      className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft cursor-pointer transition hover:bg-secondary/20"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-accent/15">
        <img 
          src={image_url || `/images/${name.toLowerCase().replace(/\s+/g, '-')}.png`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = `/images/${category}.png`;
          }}
          alt={name} 
          className="h-full w-full object-cover" 
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-display text-base font-semibold">{name}</h3>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-accent">{formatRupiah(price)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-3.5" /> Tambah
          </button>
        </div>
      </div>
    </article>
  );
}
