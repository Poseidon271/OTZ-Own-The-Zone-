/**
 * Comprehensive Location Data & Autocomplete Utilities for OTZ Marketplace
 * Extracted from Newspaper and Magazine inventory datasets.
 */

export const LOCATION_SUGGESTIONS = [
  // Primary Metro Cities (City, State format)
  {
    id: "delhi-delhi-ncr",
    label: "Delhi, Delhi NCR",
    city: "Delhi",
    state: "Delhi NCR",
    region: "North",
    type: "City",
    searchTerms: ["delhi", "delhi ncr", "del", "ncr", "dilli", "north", "national"],
  },
  {
    id: "new-delhi-delhi-ncr",
    label: "New Delhi, Delhi NCR",
    city: "New Delhi",
    state: "Delhi NCR",
    region: "North",
    type: "City",
    searchTerms: ["new delhi", "delhi", "delhi ncr", "del", "ncr", "north", "national"],
  },
  {
    id: "mumbai-maharashtra",
    label: "Mumbai, Maharashtra",
    city: "Mumbai",
    state: "Maharashtra",
    region: "West",
    type: "City",
    searchTerms: ["mumbai", "bombay", "maharashtra", "mum", "bom", "west", "national"],
  },
  {
    id: "bengaluru-karnataka",
    label: "Bengaluru, Karnataka",
    city: "Bengaluru",
    state: "Karnataka",
    region: "South",
    type: "City",
    searchTerms: ["bengaluru", "bangalore", "karnataka", "ban", "blr", "south"],
  },
  {
    id: "lucknow-uttar-pradesh",
    label: "Lucknow, Uttar Pradesh",
    city: "Lucknow",
    state: "Uttar Pradesh",
    region: "North",
    type: "City",
    searchTerms: ["lucknow", "uttar pradesh", "up", "luc", "lko", "north"],
  },
  {
    id: "chennai-tamil-nadu",
    label: "Chennai, Tamil Nadu",
    city: "Chennai",
    state: "Tamil Nadu",
    region: "South",
    type: "City",
    searchTerms: ["chennai", "madras", "tamil nadu", "tn", "che", "maa", "south", "national"],
  },
  {
    id: "kolkata-west-bengal",
    label: "Kolkata, West Bengal",
    city: "Kolkata",
    state: "West Bengal",
    region: "East",
    type: "City",
    searchTerms: ["kolkata", "calcutta", "west bengal", "wb", "kol", "ccu", "east"],
  },
  {
    id: "hyderabad-telangana",
    label: "Hyderabad, Telangana",
    city: "Hyderabad",
    state: "Telangana",
    region: "South",
    type: "City",
    searchTerms: ["hyderabad", "telangana", "ts", "hyd", "south", "andhra"],
  },
  {
    id: "ahmedabad-gujarat",
    label: "Ahmedabad, Gujarat",
    city: "Ahmedabad",
    state: "Gujarat",
    region: "West",
    type: "City",
    searchTerms: ["ahmedabad", "gujarat", "guj", "ahm", "amd", "west"],
  },
  {
    id: "pune-maharashtra",
    label: "Pune, Maharashtra",
    city: "Pune",
    state: "Maharashtra",
    region: "West",
    type: "City",
    searchTerms: ["pune", "poona", "maharashtra", "pun", "pnq", "west"],
  },
  {
    id: "jaipur-rajasthan",
    label: "Jaipur, Rajasthan",
    city: "Jaipur",
    state: "Rajasthan",
    region: "North",
    type: "City",
    searchTerms: ["jaipur", "rajasthan", "raj", "jai", "pink city", "north"],
  },
  {
    id: "kochi-kerala",
    label: "Kochi, Kerala",
    city: "Kochi",
    state: "Kerala",
    region: "South",
    type: "City",
    searchTerms: ["kochi", "cochin", "kerala", "ker", "koc", "cok", "south"],
  },
  {
    id: "jalandhar-punjab",
    label: "Jalandhar, Punjab",
    city: "Jalandhar",
    state: "Punjab",
    region: "North",
    type: "City",
    searchTerms: ["jalandhar", "punjab", "pb", "jal", "north"],
  },

  // State Coverage Options
  {
    id: "state-delhi-ncr",
    label: "Delhi NCR (State)",
    state: "Delhi NCR",
    region: "North",
    type: "State",
    searchTerms: ["delhi ncr", "delhi", "ncr", "national capital region", "state", "north"],
  },
  {
    id: "state-maharashtra",
    label: "Maharashtra (State)",
    state: "Maharashtra",
    region: "West",
    type: "State",
    searchTerms: ["maharashtra", "maha", "state", "west"],
  },
  {
    id: "state-karnataka",
    label: "Karnataka (State)",
    state: "Karnataka",
    region: "South",
    type: "State",
    searchTerms: ["karnataka", "kar", "state", "south"],
  },
  {
    id: "state-tamil-nadu",
    label: "Tamil Nadu (State)",
    state: "Tamil Nadu",
    region: "South",
    type: "State",
    searchTerms: ["tamil nadu", "tn", "state", "south"],
  },
  {
    id: "state-uttar-pradesh",
    label: "Uttar Pradesh (State)",
    state: "Uttar Pradesh",
    region: "North",
    type: "State",
    searchTerms: ["uttar pradesh", "up", "state", "north"],
  },
  {
    id: "state-rajasthan",
    label: "Rajasthan (State)",
    state: "Rajasthan",
    region: "North",
    type: "State",
    searchTerms: ["rajasthan", "raj", "state", "north"],
  },
  {
    id: "state-kerala",
    label: "Kerala (State)",
    state: "Kerala",
    region: "South",
    type: "State",
    searchTerms: ["kerala", "ker", "state", "south"],
  },
  {
    id: "state-telangana",
    label: "Telangana (State)",
    state: "Telangana",
    region: "South",
    type: "State",
    searchTerms: ["telangana", "ts", "state", "south"],
  },
  {
    id: "state-west-bengal",
    label: "West Bengal (State)",
    state: "West Bengal",
    region: "East",
    type: "State",
    searchTerms: ["west bengal", "wb", "state", "east"],
  },
  {
    id: "state-gujarat",
    label: "Gujarat (State)",
    state: "Gujarat",
    region: "West",
    type: "State",
    searchTerms: ["gujarat", "guj", "state", "west"],
  },
  {
    id: "state-punjab",
    label: "Punjab (State)",
    state: "Punjab",
    region: "North",
    type: "State",
    searchTerms: ["punjab", "pb", "state", "north"],
  },

  // Regional & Pan-India Coverage Options
  {
    id: "region-national",
    label: "National (All India)",
    region: "National",
    type: "Region",
    searchTerms: ["national", "all india", "pan india", "india", "nation", "countrywide"],
  },
  {
    id: "region-north",
    label: "North India (Region)",
    region: "North",
    type: "Region",
    searchTerms: ["north", "north india", "northern", "delhi", "punjab", "up", "rajasthan"],
  },
  {
    id: "region-south",
    label: "South India (Region)",
    region: "South",
    type: "Region",
    searchTerms: ["south", "south india", "southern", "karnataka", "tamil nadu", "kerala", "telangana"],
  },
  {
    id: "region-west",
    label: "West India (Region)",
    region: "West",
    type: "Region",
    searchTerms: ["west", "west india", "western", "maharashtra", "gujarat", "mumbai"],
  },
  {
    id: "region-east",
    label: "East India (Region)",
    region: "East",
    type: "Region",
    searchTerms: ["east", "east india", "eastern", "west bengal", "kolkata"],
  },
];

/**
 * Dynamically search location suggestions as the user types.
 * Supports case-insensitive partial city, state, region, and alias matching.
 */
export function searchLocations(query) {
  if (!query || !query.trim()) return [];
  const q = query.toLowerCase().trim();

  // Deduplicated matches
  const results = [];
  const seenIds = new Set();

  for (const item of LOCATION_SUGGESTIONS) {
    if (seenIds.has(item.id)) continue;

    const labelLower = item.label.toLowerCase();
    const cityLower = item.city ? item.city.toLowerCase() : "";
    const stateLower = item.state ? item.state.toLowerCase() : "";
    const regionLower = item.region ? item.region.toLowerCase() : "";

    const matchesLabel = labelLower.includes(q);
    const matchesCity = cityLower.startsWith(q) || cityLower.includes(q);
    const matchesState = stateLower.startsWith(q) || stateLower.includes(q);
    const matchesRegion = regionLower.startsWith(q) || regionLower.includes(q);
    const matchesTerms = item.searchTerms.some(
      (term) => term.startsWith(q) || term.includes(q)
    );

    if (matchesLabel || matchesCity || matchesState || matchesRegion || matchesTerms) {
      // Calculate relevance score: Cities first, exact prefix matches higher priority
      let priority = 10;
      if (cityLower.startsWith(q)) priority = 1;
      else if (cityLower.includes(q)) priority = 2;
      else if (labelLower.startsWith(q)) priority = 3;
      else if (item.type === "City" && matchesTerms) priority = 4;
      else if (stateLower.startsWith(q)) priority = 5;
      else if (item.type === "State") priority = 6;
      else priority = 7;

      results.push({ ...item, priority });
      seenIds.add(item.id);
    }
  }

  // Sort by relevance priority then alphabetically
  return results.sort((a, b) => a.priority - b.priority || a.label.localeCompare(b.label));
}

/**
 * Determine if a publication matches a given location filter string.
 * Supports "City, State", "State (State)", "Region (Region)", or raw strings.
 */
export function matchesLocation(publication, locationString) {
  if (!locationString) return true;
  const l = locationString.toLowerCase().trim();

  const itemCity = (publication.location?.city || "").toLowerCase().trim();
  const itemState = (publication.location?.state || "").toLowerCase().trim();
  const itemRegion = (publication.location?.region || "").toLowerCase().trim();
  const itemFullLoc =
    typeof publication.location === "string"
      ? publication.location.toLowerCase().trim()
      : "";

  // 1. "City, State" format: e.g. "Delhi, Delhi NCR", "Bengaluru, Karnataka"
  if (l.includes(",")) {
    const parts = l.split(",").map((p) => p.trim());
    const queryCity = parts[0];
    const queryState = parts[1] || "";

    const isCityMatch =
      itemCity === queryCity ||
      (queryCity === "new delhi" && itemCity === "delhi") ||
      (queryCity === "delhi" && itemCity === "new delhi") ||
      (queryCity === "bengaluru" && (itemCity === "bangalore" || itemCity === "bengaluru")) ||
      (queryCity === "bangalore" && (itemCity === "bengaluru" || itemCity === "bangalore")) ||
      itemCity.includes(queryCity) ||
      queryCity.includes(itemCity);

    if (isCityMatch) return true;

    // Direct match against full string or city+state
    if (itemFullLoc && (itemFullLoc.includes(queryCity) || queryCity.includes(itemFullLoc))) {
      return true;
    }

    if (queryState && itemState === queryState && isCityMatch) return true;

    return false;
  }

  // 2. Region matches: e.g. "National (All India)", "North India (Region)"
  if (l.includes("national")) {
    return itemRegion === "national";
  }
  if (l.includes("north")) {
    return itemRegion === "north" || itemRegion === "national";
  }
  if (l.includes("south")) {
    return itemRegion === "south" || itemRegion === "national";
  }
  if (l.includes("west")) {
    return itemRegion === "west" || itemRegion === "national";
  }
  if (l.includes("east")) {
    return itemRegion === "east" || itemRegion === "national";
  }

  // 3. State or clean term format: e.g. "Maharashtra (State)", "Maharashtra"
  const cleanTerm = l.replace(/\s*\(.*?\)\s*/g, "").trim();
  if (itemState === cleanTerm || itemState.includes(cleanTerm)) return true;
  if (itemCity === cleanTerm || itemCity.includes(cleanTerm)) return true;
  if (itemRegion === cleanTerm || itemRegion.includes(cleanTerm)) return true;
  if (itemFullLoc && (itemFullLoc === cleanTerm || itemFullLoc.includes(cleanTerm))) return true;

  return false;
}
