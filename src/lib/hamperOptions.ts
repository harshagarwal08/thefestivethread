export type BoxId = "wooden" | "jute" | "velvet";
export type ChocolateId = "none" | "dairymilk" | "kitkat" | "ferrero";

export interface BoxOption {
  id: BoxId;
  label: string;
  desc: string;
  price: number;
  image?: string;
}

export interface ChocolateOption {
  id: ChocolateId;
  label: string;
  desc: string;
  price: number;
  image?: string;
}

export const boxes: BoxOption[] = [
  { id: "wooden", label: "Box 1", desc: "Rustic, reusable keepsake box",   price: 299, image: "/images/box1.jpg"  },
  { id: "jute",   label: "Box 2", desc: "Eco-friendly, elegant jute bag",  price: 149, image: "/images/box2.webp" },
  { id: "velvet", label: "Box 3", desc: "Luxurious velvet gift box",        price: 399, image: "/images/box3.webp" },
];

export const chocolates: ChocolateOption[] = [
  { id: "none",      label: "No Chocolate",   desc: "Skip the chocolate",           price: 0,   image: undefined                       },
  { id: "dairymilk", label: "Dairy Milk",     desc: "Cadbury Dairy Milk bar",       price: 99,  image: "/images/cadbury.jpg"           },
  { id: "kitkat",    label: "KitKat",         desc: "Nestlé KitKat 4-finger",       price: 99,  image: "/images/kitkat.jpg"            },
  { id: "ferrero",   label: "Ferrero Rocher", desc: "Ferrero Rocher (box of 3)",    price: 199, image: "/images/ferrero.avif"          },
];

export function getBox(id: BoxId): BoxOption {
  return boxes.find((b) => b.id === id) ?? boxes[0];
}

export function getChocolate(id: ChocolateId): ChocolateOption {
  return chocolates.find((c) => c.id === id) ?? chocolates[0];
}
