import { MenuCard } from "@/components/shared/MenuCard";

const CATS = [
  { id: "coffee", label: "Coffee" },
  { id: "hot-coffee", label: "Hot Coffee" },
  { id: "americano", label: "Americano" },
  { id: "non-coffee", label: "Non-Coffee" },
  { id: "snack", label: "Snack" },
  { id: "makanan", label: "Makanan" },
  { id: "tumbler", label: "Tumbler" },
] as const;

type MenuListProps = {
  items: any[];
  category: string;
  cart: any;
  adjustQty: (item: any, delta: number) => void;
  setSelectedItem: (item: any) => void;
  isLoading: boolean;
};

export function MenuList({ items, category, cart, adjustQty, setSelectedItem, isLoading }: MenuListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-secondary" />
        ))}
      </div>
    );
  }

  // Render a specific category
  if (category !== "semua") {
    const filtered = items.filter((m) => m.category === category);
    return (
      <div className="space-y-3">
        {filtered.map((m) => (
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
    );
  }

  // category === "semua" -> Grouped View with Best Seller
  const bestSellerKeywords = ["gula aren", "croisant", "milo"]; // Matches "Croisant Original", "Coffe Gula Aren", "LNR Milo"
  
  const bestSellers = items.filter((m) => {
    const nameLower = m.name.toLowerCase();
    return bestSellerKeywords.some(kw => nameLower.includes(kw));
  });

  return (
    <div className="space-y-8 pb-10">
      {/* BEST SELLER SECTION */}
      {bestSellers.length > 0 && (
        <section>
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
      <div className="space-y-8">
        {CATS.map((catObj) => {
          const catItems = items.filter((m) => m.category === catObj.id);
          if (catItems.length === 0) return null;

          return (
            <section key={catObj.id}>
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
