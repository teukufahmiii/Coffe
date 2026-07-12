import { MenuCard } from "@/components/shared/MenuCard";

export const MENU_CATEGORIES = [
  { id: "semua", label: "Semua" },
  { id: "coffee", label: "Coffee" },
  { id: "hot-coffee", label: "Hot Coffee" },
  { id: "americano", label: "Americano" },
  { id: "non-coffee", label: "Non-Coffee" },
  { id: "makanan", label: "Makanan" },
  { id: "snack", label: "Snack" },
  { id: "tumbler", label: "Tumbler" },
] as const;

type MenuListProps = {
  items: any[];
  cart: any;
  adjustQty: (item: any, delta: number) => void;
  setSelectedItem: (item: any) => void;
  isLoading: boolean;
};

export function MenuList({ items, cart, adjustQty, setSelectedItem, isLoading }: MenuListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-secondary" />
        ))}
      </div>
    );
  }

  // Best Seller logic
  const bestSellerKeywords = ["gula aren", "croisant", "milo"]; // Matches "Croisant Original", "Coffe Gula Aren", "LNR Milo"
  const bestSellers = items.filter((m) => {
    const nameLower = m.name.toLowerCase();
    return bestSellerKeywords.some(kw => nameLower.includes(kw));
  });

  return (
    <div className="space-y-12 pb-10">
      {/* BEST SELLER SECTION */}
      {bestSellers.length > 0 && (
        <section id="category-semua" className="scroll-mt-40">
          <h3 className="font-display text-xl font-bold mb-4 text-primary">Best Seller</h3>
          {/* Horizontal scroll container */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
            {bestSellers.map((m) => (
              <div key={m.id} className="w-[280px] shrink-0 snap-center">
                <MenuCard
                  id={m.id}
                  name={m.name}
                  price={m.price}
                  description={m.description}
                  image_url={m.image_url}
                  category={m.category}
                  qty={cart[m.id]?.qty || 0}
                  onAdd={() => adjustQty({ id: m.id, name: m.name, price: m.price, image_url: m.image_url, category: m.category }, 1)}
                  onRemove={() => adjustQty({ id: m.id, name: m.name, price: m.price, image_url: m.image_url, category: m.category }, -1)}
                  onClick={() => setSelectedItem(m)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CATEGORIES SECTION */}
      <div className="space-y-10">
        {MENU_CATEGORIES.filter(c => c.id !== "semua").map((catObj) => {
          const catItems = items.filter((m) => m.category === catObj.id);
          if (catItems.length === 0) return null;

          return (
            <section id={`category-${catObj.id}`} key={catObj.id} className="scroll-mt-40">
              <h3 className="font-display text-xl font-bold mb-4 text-primary">{catObj.label}</h3>
              <div className="space-y-3">
                {catItems.map((m) => (
                  <MenuCard
                    key={m.id}
                    id={m.id}
                    name={m.name}
                    price={m.price}
                    description={m.description}
                    image_url={m.image_url}
                    category={m.category}
                    qty={cart[m.id]?.qty || 0}
                    onAdd={() => adjustQty({ id: m.id, name: m.name, price: m.price, image_url: m.image_url, category: m.category }, 1)}
                    onRemove={() => adjustQty({ id: m.id, name: m.name, price: m.price, image_url: m.image_url, category: m.category }, -1)}
                    onClick={() => setSelectedItem(m)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

