import { mockHostDashboard } from "@/data/mockHostDashboard";

/**
 * Host Portal Dashboard Data Service Abstraction.
 * In the future, these functions can be replaced with real backend API/database calls.
 * 
 * Example:
 * export async function getHostDashboardData(hostId) {
 *   const res = await fetch(`/api/host/dashboard?hostId=${hostId}`);
 *   const data = await res.json();
 *   return data.overview;
 * }
 */

export async function getHostDashboardData(hostId) {
  // Simulate database latency
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockHostDashboard.overview;
}

export async function getHostListings(hostId) {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return mockHostDashboard.listings;
}

export async function getHostLeads(hostId) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return mockHostDashboard.leads;
}

export async function getHostBookings(hostId) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockHostDashboard.bookings;
}

export async function getHostAnalytics(hostId, timeRange = "30days") {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockHostDashboard.analytics[timeRange] || mockHostDashboard.analytics["30days"];
}

export async function getHostRecentActivity(hostId) {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return mockHostDashboard.recentActivity;
}
