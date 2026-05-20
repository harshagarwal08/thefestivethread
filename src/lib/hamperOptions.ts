export type BoxId = "wooden" | "jute" | "velvet";
export type ChocolateId =
  | "none"
  | "silk-60"
  | "silk-144"
  | "fn-51"
  | "fn-129"
  | "oreo-124"
  | "ferrero-50"
  | "kitkat-4"
  | "kisses-36";

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

const cdn = (id: string) =>
  `https://res.cloudinary.com/dmyvc9kof/image/upload/f_auto,q_auto/v1/${id}`;

export const chocolates: ChocolateOption[] = [
  { id: "none",       label: "No Chocolate",              desc: "Skip the chocolate",                    price: 0,   image: undefined                              },
  { id: "silk-60",    label: "Dairy Milk Silk 60g",       desc: "Cadbury Dairy Milk Silk · 60 gms",      price: 99,  image: cdn("chocolates/cadbury-silk-60gms")   },
  { id: "silk-144",   label: "Dairy Milk Silk 144g",      desc: "Cadbury Dairy Milk Silk · 144 gms",     price: 199, image: cdn("chocolates/cadbury-silk-144gms")  },
  { id: "fn-51",      label: "Fruit & Nut 51g",           desc: "Cadbury Fruit & Nut · 51 gms",          price: 129, image: cdn("chocolates/cadbury-fruit-and-nut-51gms") },
  { id: "fn-129",     label: "Fruit & Nut 129g",          desc: "Cadbury Fruit & Nut · 129 gms",         price: 229, image: cdn("chocolates/cadbury-fruit-and-nut-129gms") },
  { id: "oreo-124",   label: "Oreo Bar 124g",             desc: "Cadbury Oreo chocolate bar · 124 gms",  price: 229, image: cdn("chocolates/cadbury-oreo-124gms")  },
  { id: "ferrero-50", label: "Ferrero Rocher 50g",        desc: "Ferrero Rocher · 50 gms",               price: 199, image: cdn("chocolates/ferrero-50gms")        },
  { id: "kitkat-4",   label: "KitKat 4 Fingers",          desc: "Nestlé KitKat 4-finger bar",            price: 49,  image: cdn("chocolates/kitkat-4fingers")      },
  { id: "kisses-36",  label: "Hershey's Kisses 36g",      desc: "Hershey's Kisses · 36 gms",             price: 59, image: cdn("chocolates/hersheys-kisses-36gms") },
];

export function getBox(id: BoxId): BoxOption {
  return boxes.find((b) => b.id === id) ?? boxes[0];
}

export function getChocolate(id: ChocolateId): ChocolateOption {
  return chocolates.find((c) => c.id === id) ?? chocolates[0];
}
