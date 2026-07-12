export type MenuOptionChoice = { name: string; price_diff: number; icon?: string };
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

