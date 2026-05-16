export type Category = "single" | "combo" | "kids";

export interface ProductVariant {
  label: string;
  value: string;
  color: string; // hex for swatch
}

export interface Product {
  id: string;
  category: Category;
  name: string;
  price: number;
  image: string | null;
  image2?: string | null;
  tag?: string;
  description: string;
  variants?: ProductVariant[];
}

export const categories: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "single", label: "Single Rakhis" },
  { id: "combo", label: "Rakhi + Lumba" },
  { id: "kids", label: "Kid's Rakhis" },
];

export const categoryLabels: Record<Category, string> = {
  single: "Single Rakhis",
  combo: "Rakhi + Lumba Set",
  kids: "Kid's Rakhis",
};

const R = (n: string) => ({
  image: `/rakhis2026/rakhis/R${n}.png`,
  image2: `/rakhis2026/rakhis/R${n}-2.png`,
});
const C = (n: string) => ({
  image: `/rakhis2026/combo/C${n}-1.png`,
  image2: `/rakhis2026/combo/C${n}-2.png`,
});
const K = (n: string) => ({
  image: `/rakhis2026/kids/K${n}-1.png`,
  image2: `/rakhis2026/kids/K${n}-2.png`,
});

export const products: Product[] = [
  // Single Rakhis (26)
  { id: "sr-01", category: "single", name: "Golden Paisley", price: 69, ...R("01"), description: "Antique gold paisley medallion with kundan detailing and pearl bead accents on a classic red thread." },
  { id: "sr-02", category: "single", name: "Triple Gold", price: 59, ...R("02"), description: "Three stacked gold disc medallions lined up on a twisted saffron-red thread — bold, symmetrical, understated." },
  { id: "sr-03", category: "single", name: "Rosy Beads", price: 49, ...R("03"), description: "A soft pink floral charm flanked by candy-colored beads on a tricolor braided thread." },
  { id: "sr-04", category: "single", name: "Nazar Shield", price: 59, ...R("04"), tag: "New", description: "A bold blue evil eye center ringed with pearl-white petals — protective and striking on a cobalt blue thread." },
  { id: "sr-05", category: "single", name: "Crimson Halo", price: 59, ...R("05"), description: "Crystal rhinestone center set in a deep red medallion, bordered by coral and pearl beads on scarlet thread." },
  { id: "sr-06", category: "single", name: "Daisy & Crystal", price: 39, ...R("06"), description: "A delicate white daisy charm with silver crystal leaf sprigs on a bright marigold yellow thread." },
  { id: "sr-07", category: "single", name: "Om Jade", price: 49, ...R("07"), tag: "Bestseller", description: "Silver Om charm strung between pale jade green beads on golden thread — spiritual and serene." },
  { id: "sr-08", category: "single", name: "Sacred Swastik", price: 39, ...R("08"), description: "Antique gold swastik charm with coral and pearl bead accents on a traditional red-and-gold thread." },
  { id: "sr-09", category: "single", name: "Golden Diamond", price: 59, ...R("09"), description: "A geometric diamond-framed gold medallion with a sparkling center stone on red-and-gold thread." },
  { id: "sr-10", category: "single", name: "Pearl Strand", price: 69, ...R("10"), description: "A full strand of white pearls and gold beads centered on a delicate embroidered disc — refined and elegant." },
  { id: "sr-11", category: "single", name: "Antique Peacock", price: 59, ...R("11"), description: "A hand-cast antique gold peacock charm with pearl accents on a bold red-and-blue braided thread." },
  { id: "sr-12", category: "single", name: "Trishul", price: 49, tag: "Bestseller", ...R("12"), description: "A gleaming gold trishul charm flanked by red coral beads on a simple, sacred red thread." },
  { id: "sr-13", category: "single", name: "Meenakari Square", price: 49, ...R("13"), tag: "New", description: "A vibrant meenakari-inspired embroidered square in red and gold on a bright yellow thread with tassels." },
  { id: "sr-14", category: "single", name: "Blue Pearl Vine", price: 59, ...R("14"), description: "White seed beads and turquoise accents woven into a delicate vine, centered on a dainty pearl flower." },
  { id: "sr-15", category: "single", name: "Sunshine Nazar", price: 69, ...R("15"), description: "A sunny yellow evil eye medallion with a long pearl tassel drop on golden braided thread — cheerful protection." },
  { id: "sr-16", category: "single", name: "Garnet & Gold", price: 49, ...R("16"), description: "Deep red garnet-toned beads with a petite gold-set center gem on red thread — understated and gemstone-rich." },
  { id: "sr-17", category: "single", name: "Rose & Violet", price: 59, ...R("17"), description: "Candy-pink and lavender beads on violet silk thread, centered on a gold floral gem — soft and romantic." },
  { id: "sr-18", category: "single", name: "Pearl Bar", price: 49, ...R("18"), description: "A clean horizontal bar of white pearls set in gold on red-and-yellow thread — architectural and minimal." },
  { id: "sr-19", category: "single", name: "Lotus Bead", price: 49, ...R("19"), description: "Deep red crystal beads on red thread, punctuated by a small antique gold lotus charm at center." },
  { id: "sr-20", category: "single", name: "Diamond Pearl", price: 59, ...R("20"), description: "A sparkling diamond-cut crystal flanked by white pearls and red beads on a classic red thread." },
  { id: "sr-21", category: "single", name: "Grand Paisley", price: 79, ...R("21"), description: "An oversized antique gold paisley with red velvet inlay and pearl drop fringe — bold and ceremonial." },
  { id: "sr-22", category: "single", name: "Peacock Feather", price: 69, ...R("22"), description: "A hand-crafted teardrop with a peacock feather eye inlaid in pearl and blue — nature-inspired and striking." },
  { id: "sr-23", category: "single", name: "Panna Braid", price: 59, ...R("23"), description: "Coral and mint threads woven in a fishtail braid, centered on a dainty gold flower with pearl drop accents." },
  { id: "sr-24", category: "single", name: "Meena Round", price: 79, ...R("24"), description: "A vibrant round meenakari bead in jewel-bright enamel colors on a bold knotted cord.", variants: [{ label: "Red", value: "red", color: "#B5341E" }, { label: "Blue", value: "blue", color: "#1E40AF" }] },
  { id: "sr-25", category: "single", name: "Druzy Disc", price: 69, ...R("25"), description: "A chunky druzy-textured silver disc ringed with seed pearls on a warm orange-and-white braided thread." },
  { id: "sr-26", category: "single", name: "Crystal Crown", price: 79, ...R("26"), tag: "Premium", description: "A dazzling ring of crystals set in silver on a royal blue-and-pink braided thread — a statement rakhi." },

  // Combo (Rakhi + Lumba sets)
  { id: "cb-01", category: "combo", name: "Bhaiya Bhabhi Tag Set", price: 199, ...C("01"), tag: "Bestseller", description: "\"BHAIYA\" in a neat oval for him, \"BHABHI\" with a cheeky parrot and cascading pearl tassel for her." },
  { id: "cb-02", category: "combo", name: "Emerald Square Set", price: 149, ...C("02"), description: "Rich emerald green meenakari square pieces — a matching rakhi and lumba on gold chain, both dripping with pearl drops." },
  { id: "cb-03", category: "combo", name: "Rose Quartz Set", price: 129, ...C("03"), description: "Blush pink and lavender beads with an oval crystal center — a soft and romantic bhaiya-bhabhi duo." },
  { id: "cb-04", category: "combo", name: "Maharani Set", price: 249, ...C("04"), description: "Her lumba drips with marquise stones and floral clusters; his rakhi gleams with matching jewels. Regal." },
  { id: "cb-05", category: "combo", name: "Pearl Garden Set", price: 249, ...C("05"), description: "A grand floral lumba and a round pearl disc rakhi on golden thread — beautifully matched and breathtaking." },
  { id: "cb-06", category: "combo", name: "Crystal Lotus Set", price: 229, ...C("06"), description: "Sparkling crystal lotus-leaf motifs — her lumba with an amber bead cascade, his rakhi light and luminous." },
  { id: "cb-07", category: "combo", name: "Butterfly Nazar Set", price: 249, ...C("07"), description: "A bold golden butterfly lumba with evil eye center, paired with a petite matching eye rakhi — playful protection." },
  { id: "cb-08", category: "combo", name: "Maldar Bhabhi Set", price: 199, ...C("08"), description: "A cheeky cartoon \"Maldar Bhabhi\" lumba with flower trim and a dainty crystal floral rakhi — guaranteed smiles." },
  { id: "cb-09", category: "combo", name: "Diamond Tassel Set", price: 149, ...C("09"), tag: "New", description: "A sparkling diamond-cut oval rakhi and a matching pearl tassel lumba in rich maroon — glamorous and paired." },
  { id: "cb-10", category: "combo", name: "Vintage Bird Set", price: 199, ...C("10"), description: "Antique brass bird charms with teal enamel and pearl tassel drops on olive thread — artisanal, old-world character." },
  { id: "cb-11", category: "combo", name: "Autumn Leaf Set", price: 199, ...C("11"), description: "Oxidised gold maple-leaf motifs with pearl borders on vibrant orange-and-white braided thread — bold and festive." },
  { id: "cb-12", category: "combo", name: "Indigo Fan Set", price: 199, ...C("12"), tag: "Bestseller", description: "A dramatic indigo fan-shaped lumba with cascading blue beads paired with a matching evil eye rakhi — unforgettable." },
  // Kids
  { id: "kd-01", category: "kids", name: "Monster Mates", price: 39, ...K("01"), description: "Two cheeky cartoon monster charms — one on yellow, one on blue — for the little bhai who's anything but boring.", variants: [{ label: "Yellow", value: "yellow", color: "#D97706" }, { label: "Blue", value: "blue", color: "#1E40AF" }] },
  { id: "kd-02", category: "kids", name: "Fluffy OK", price: 39, ...K("02"), description: "Soft pink pom-pom rakhis with a fun bottle charm on cotton thread — squishy, sweet, and made for little wrists.", variants: [{ label: "Pink", value: "pink", color: "#DB2777" }, { label: "Blue", value: "blue", color: "#1E40AF" }] },
  { id: "kd-03", category: "kids", name: "Charm Bracelet Duo", price: 59, image: "/rakhis2026/kids/K03-1.png", description: "Rainbow crystal bead bracelets with a Hello Kitty charm and a silver bird — a set little sisters will treasure.", variants: [{ label: "Hello Kitty", value: "hello-kitty", color: "#F9A8D4" }, { label: "Bird Charm", value: "bird", color: "#9CA3AF" }] },
];

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getRelated(product: Product, count = 4) {
  return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, count);
}

const PLACEHOLDER_COLORS = ["#E8D5C4", "#DEC9B8", "#F0E0D0", "#CDBDAA", "#D8C8B5", "#E5D5C0"];
export function placeholderColor(id: string) {
  const n = parseInt(id.replace(/\D/g, "").slice(-2) || "0");
  return PLACEHOLDER_COLORS[n % PLACEHOLDER_COLORS.length];
}
