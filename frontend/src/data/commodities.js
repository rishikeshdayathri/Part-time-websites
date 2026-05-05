// Commodities grouped by category. Images sourced from Unsplash/Pexels.
export const COMMODITY_CATEGORIES = [
  {
    slug: "petrochemicals",
    title: "Petrochemicals",
    summary:
      "Refined hydrocarbons and industrial chemicals for manufacturing, fuel blending, and lubricant production.",
    image:
      "https://images.unsplash.com/photo-1653352639753-8debcc830014?auto=format&fit=crop&w=1600&q=80",
    items: [
      { name: "LPG",             desc: "Liquefied Petroleum Gas — bulk and packaged supply." },
      { name: "Methanol",        desc: "Industrial-grade methanol for chemical and fuel applications." },
      { name: "SN150 Base Oil",  desc: "Light-viscosity base oil for lubricant blending." },
      { name: "SN500 Base Oil",  desc: "Medium-viscosity base oil for industrial lubricants." },
      { name: "Acetone",         desc: "High-purity acetone for solvent and pharma use." },
      { name: "Acetic Acid",     desc: "Glacial acetic acid for chemical intermediates." },
      { name: "Sulphur",         desc: "Granular and lump sulphur for fertilizer and chemicals." },
    ],
  },
  {
    slug: "food-commodities",
    title: "Food Commodities",
    summary:
      "Quality-verified agricultural and spice commodities sourced from trusted growers and processors.",
    image:
      "https://images.unsplash.com/photo-1688278526565-5bb028024473?auto=format&fit=crop&w=1600&q=80",
    items: [
      { name: "Sugar ICUMSA 45", desc: "Refined white sugar meeting ICUMSA 45 specification." },
      { name: "Cardamom",        desc: "Green cardamom — premium export grades." },
      { name: "Cloves",          desc: "Whole cloves with consistent moisture and oil content." },
      { name: "Bay Leaf",        desc: "Dried bay leaf — hand-sorted and export-graded." },
      { name: "Areca Nut",       desc: "Whole and split areca nut for multiple markets." },
    ],
  },
  {
    slug: "metals",
    title: "Metals",
    summary:
      "Non-ferrous and specialty metals for industrial, electrical, and manufacturing supply chains.",
    image:
      "https://images.unsplash.com/photo-1701542206760-b13339bd226d?auto=format&fit=crop&w=1600&q=80",
    items: [
      { name: "Aluminium Ingots A7 Grade", desc: "99.7% primary aluminium ingots (LME-grade equivalent)." },
      { name: "Copper Cathode Grade A",    desc: "LME Grade-A copper cathodes, 99.99% purity." },
      { name: "Antimony Ingots",           desc: "Industrial antimony for alloys and flame retardants." },
      { name: "Molybdenum",                desc: "Molybdenum for steel alloying and specialty applications." },
    ],
  },
  {
    slug: "minerals",
    title: "Minerals",
    summary:
      "Bulk minerals and ores for smelters, refiners, and industrial producers across global markets.",
    image:
      "https://images.unsplash.com/photo-1645505298235-dd222c05b7ce?auto=format&fit=crop&w=1600&q=80",
    items: [
      { name: "Iron Ore",        desc: "Fines and lumps across Fe 58% – 65% specifications." },
      { name: "Bauxite Ore",     desc: "Metallurgical-grade bauxite for alumina production." },
      { name: "Calcined Alumina", desc: "High-purity calcined alumina for refractory and industrial use." },
    ],
  },
];

export const ALL_COMMODITIES = COMMODITY_CATEGORIES.flatMap((c) =>
  c.items.map((i) => ({ ...i, category: c.title, slug: c.slug }))
);
