export const COMPANY = {
  name: "Subterra Nexus Pvt Ltd",
  shortName: "Subterra Nexus",
  founded: "2025",
  tagline: "Global Commodities. Trusted Networks. Timely Delivery.",
  email: "info@subterranexus.com",
  phone: "+91 92461 55100",
  whatsapp: "919246155100", // E.164 without + for wa.me links
  address: {
    line1: "Plot No 33, Phase-1 Sancharpuri Colony",
    line2: "New Bowenpally, Hyderabad 500011",
    city: "Hyderabad",
    country: "India",
  },
  markets: ["UAE", "Brazil", "Ecuador", "USA", "Asia", "MENA", "LATAM"],
};

export const buildWhatsAppLink = (commodity = "") => {
  const base = `https://wa.me/${COMPANY.whatsapp}`;
  const message = commodity
    ? `Hello Subterra Nexus, I am interested in ${commodity}. Please share details.`
    : `Hello Subterra Nexus, I would like to connect with your trade desk. Please share details.`;
  return `${base}?text=${encodeURIComponent(message)}`;
};
