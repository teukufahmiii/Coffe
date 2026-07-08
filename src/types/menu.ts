export type MenuOptionChoice = { name: string; price_diff: number };
export type MenuOptionGroup = { name: string; type: "wajib" | "opsional"; choices: MenuOptionChoice[] };

export type MenuItem = {
  id: string;
  name: string;
  category: "coffee" | "hot-coffee" | "americano" | "non-coffee" | "snack" | "makanan" | "tumbler";
  price: number;
  description: string;
  image_url: string | null;
  available_branches?: string[];
  options?: MenuOptionGroup[] | null;
};

export const CATS = ["coffee", "hot-coffee", "americano", "non-coffee", "snack", "makanan", "tumbler"] as const;

export const PRESET_OPTIONS: MenuOptionGroup[] = [
  { name: "Ukuran Cup", type: "wajib", choices: [{ name: "Regular Ice", price_diff: 0 }, { name: "Large Ice", price_diff: 7000 }] },
  { name: "Sweetness", type: "wajib", choices: [{ name: "Normal Sweet", price_diff: 0 }, { name: "Less Sweet", price_diff: 0 }] },
  { name: "Ice Cube", type: "wajib", choices: [{ name: "Normal Ice", price_diff: 0 }, { name: "Less Ice", price_diff: 0 }, { name: "More Ice", price_diff: 0 }] },
  { name: "Espresso", type: "wajib", choices: [{ name: "Normal Shot", price_diff: 0 }, { name: "+1 Shot", price_diff: 7000 }, { name: "+2 Shot", price_diff: 14000 }] },
  { name: "Syrup", type: "opsional", choices: [{ name: "Aren", price_diff: 7000 }, { name: "Manuka", price_diff: 7000 }, { name: "Vanilla", price_diff: 7000 }, { name: "Salted Caramel", price_diff: 7000 }] }
];
