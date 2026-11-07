import magazinesData from "@/data/magazines.json";

export function getAllMagazines() {
  return magazinesData;
}

export function getMagazineById(id) {
  if (!id) return null;
  return magazinesData.find((mag) => mag.id === id || mag.id === `mag-${id}`) || null;
}

export function formatIndianCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAudienceReach(count) {
  if (count === undefined || count === null || isNaN(count)) return "0";
  return new Intl.NumberFormat("en-IN").format(count);
}

