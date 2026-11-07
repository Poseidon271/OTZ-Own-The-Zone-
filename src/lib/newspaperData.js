import newspapersData from "@/data/newspapers.json";

export function getAllNewspapers() {
  return newspapersData;
}

export function getNewspaperById(id) {
  if (!id) return null;
  return newspapersData.find((news) => news.id === id || news.id === `news-${id}`) || null;
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

