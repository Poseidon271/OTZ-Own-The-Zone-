import fs from "fs";
import path from "path";

// DB directory setup
const DB_DIR = path.join(process.cwd(), "src", "data", "db");

// Simple JSON DB Helper class
class FileDb {
  constructor() {
    this.initialized = false;
    this.tables = {
      accounts: [],
      users: [],
      sessions: [],
      otp_challenges: [],
      auth_events: [],
      listings: [],
      enquiries: [],
      audit_logs: [],
      brand_profiles: [],
      taxonomy: {
        niches: [
          "FMCG",
          "Fashion & Lifestyle",
          "Technology & SaaS",
          "Real Estate & Infrastructure",
          "Healthcare & Wellness",
          "Automobiles",
          "Entertainment & Sports",
          "Education & EdTech",
          "Finance & Insurance",
          "Food & Hospitality"
        ],
        goals: [
          { value: "awareness", label: "Brand Awareness" },
          { value: "app downloads", label: "App Downloads" },
          { value: "subscribers", label: "Increase Subscribers" },
          { value: "orders", label: "Drive Orders/Sales" },
          { value: "portal visits", label: "Portal Visits" },
          { value: "footfall", label: "Increase Footfall" }
        ],
        media_types: [
          "TV",
          "Print",
          "Radio",
          "OOH",
          "Digital",
          "Influencer-Creator",
          "Event or Venue",
          "Production partner"
        ],
        cities: ["Mumbai", "Delhi-NCR"],
        price_bands: ["₹10K - ₹50K", "₹50K - ₹2L", "₹2L - ₹10L", "₹10L+"],
        visibility_bands: ["< 100K views", "100K - 500K views", "500K - 2M views", "2M+ views"]
      }
    };
  }

  ensureDbDir() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  init() {
    if (this.initialized) return;
    this.ensureDbDir();

    // Load each table
    Object.keys(this.tables).forEach((table) => {
      const filePath = path.join(DB_DIR, `${table}.json`);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, "utf-8");
          this.tables[table] = JSON.parse(content);
        } catch (e) {
          console.error(`Failed to parse table ${table}, reset to empty`, e);
        }
      } else {
        // Seed initial data if tables are empty
        if (table === "listings") {
          this.tables[table] = this.generateSeedListings();
        } else if (table === "users") {
          // Add default admin/ops user
          this.tables[table] = [
            {
              id: "usr-ops-1",
              account_id: "acc-ops-1",
              name: "Operations Manager",
              email: "ops@otz.com",
              phone: "9999999999",
              role: "ops",
              created_at: new Date().toISOString()
            }
          ];
        } else if (table === "accounts") {
          this.tables[table] = [
            {
              id: "acc-ops-1",
              role: "ops",
              name: "Own The Zone Team",
              company: "OTZ Ops",
              state: "verified",
              created_at: new Date().toISOString()
            }
          ];
        }
        this.saveTable(table);
      }
    });

    this.initialized = true;
  }

  saveTable(table) {
    this.ensureDbDir();
    const filePath = path.join(DB_DIR, `${table}.json`);
    fs.writeFileSync(filePath, JSON.stringify(this.tables[table], null, 2), "utf-8");
  }

  // Relational operations
  get(table, filterFn = () => true) {
    this.init();
    return this.tables[table].filter(filterFn);
  }

  find(table, key, val) {
    this.init();
    return this.tables[table].find((item) => item[key] === val);
  }

  insert(table, record) {
    this.init();
    const id = record.id || `${table.substring(0, 3)}-${Math.random().toString(36).substr(2, 9)}`;
    const newRecord = { id, ...record, created_at: new Date().toISOString() };
    this.tables[table].push(newRecord);
    this.saveTable(table);
    return newRecord;
  }

  update(table, key, val, updates) {
    this.init();
    let updatedRecord = null;
    this.tables[table] = this.tables[table].map((item) => {
      if (item[key] === val) {
        updatedRecord = { ...item, ...updates, updated_at: new Date().toISOString() };
        return updatedRecord;
      }
      return item;
    });
    if (updatedRecord) {
      this.saveTable(table);
    }
    return updatedRecord;
  }

  delete(table, key, val) {
    this.init();
    const initialLength = this.tables[table].length;
    this.tables[table] = this.tables[table].filter((item) => item[key] !== val);
    if (this.tables[table].length !== initialLength) {
      this.saveTable(table);
      return true;
    }
    return false;
  }

  // 150+ seed items generator matching PRD parameters
  generateSeedListings() {
    const listings = [];
    
    const mediaTypes = ["OOH", "Digital", "Influencer-Creator", "Event or Venue", "TV", "Radio", "Print"];
    const cities = ["Mumbai", "Delhi-NCR"];
    
    const niches = [
      "FMCG", "Fashion & Lifestyle", "Technology & SaaS", 
      "Real Estate & Infrastructure", "Healthcare & Wellness", "Automobiles",
      "Entertainment & Sports", "Finance & Insurance", "Food & Hospitality"
    ];

    // OOH Locations
    const oohLocations = {
      "Mumbai": [
        { loc: "Bandra Worli Sea Link Toll", reach: "1.2M weekly", src: "BARC Outdoor 2026", parent: "Times OOH", price: 150000 },
        { loc: "Western Express Highway (WEH) Bandra", reach: "800K weekly", src: "IRS 2026 Q1", parent: "Adspace India", price: 95000 },
        { loc: "Andheri Link Road Junction", reach: "600K weekly", src: "BARC Outdoor 2026", parent: "Times OOH", price: 75000 },
        { loc: "Juhu Tara Road Billboard", reach: "400K weekly", src: "Self-declared", parent: "Juhu Media", price: 60000 },
        { loc: "Lower Parel Flyover Gantry", reach: "900K weekly", src: "BARC Outdoor 2026", parent: "Times OOH", price: 110000 },
        { loc: "Sion Circle High-Impact LED", reach: "500K weekly", src: "IRS 2026 Q2", parent: "Signage Corp", price: 80000 },
        { loc: "Chhatrapati Shivaji Terminal Entrance", reach: "1.5M weekly", src: "Platform Insights 2026", parent: "CST Media", price: 130000 },
        { loc: "Worli Naka Backlit Display", reach: "350K weekly", src: "Self-declared", parent: "Worli Outdoor", price: 55000 },
        { loc: "Link Road Malad Digital Screen", reach: "450K weekly", src: "Platform Insights 2026", parent: "Times OOH", price: 70000 },
        { loc: "Colaba Causeway Static Wallboard", reach: "300K weekly", src: "IRS 2025 Q4", parent: "Heritage Media", price: 40000 }
      ],
      "Delhi-NCR": [
        { loc: "DND Flyway Gantry Billboard", reach: "1.4M weekly", src: "BARC Outdoor 2026", parent: "Delhi OOH", price: 160000 },
        { loc: "DLF CyberHub Main Entrance LED", reach: "750K weekly", src: "Platform Insights 2026", parent: "DLF Media", price: 120000 },
        { loc: "Connaught Place Radial Road", reach: "850K weekly", src: "IRS 2026 Q1", parent: "CP Outdoor", price: 100000 },
        { loc: "Noida Sector 18 Market Plaza", reach: "500K weekly", src: "Self-declared", parent: "Noida Signs", price: 65000 },
        { loc: "MG Road Gurgaon Pillars", reach: "650K weekly", src: "BARC Outdoor 2026", parent: "Delhi OOH", price: 85000 },
        { loc: "NH8 Gurgaon Toll Plaza", reach: "1.8M weekly", src: "IRS 2026 Q1", parent: "National Trans", price: 180000 },
        { loc: "South Ext Part II Ring Road", reach: "700K weekly", src: "BARC Outdoor 2026", parent: "Delhi OOH", price: 95000 },
        { loc: "Noida-Greater Noida Expressway Gantry", reach: "800K weekly", src: "IRS 2026 Q2", parent: "Noida Express", price: 110000 },
        { loc: "Delhi Airport Terminal 3 Arrival LED", reach: "2.0M weekly", src: "Platform Insights 2026", parent: "GMR Media", price: 250000 },
        { loc: "Rajiv Chowk Metro Entrance Backlit", reach: "1.1M weekly", src: "DMRC Traffic Report 2026", parent: "Metro Ads", price: 90000 }
      ]
    };

    // Creator/Influencer Niche-mapped handles
    const creatorHandles = [
      { name: "TechGyan / Sanskar", handle: "techgyan", niche: "Technology & SaaS", reach: "2.5M subscribers", src: "Platform Analytics 2026", price: 120000 },
      { name: "FitWithPriya", handle: "fitwithpriya", niche: "Healthcare & Wellness", reach: "850K followers", src: "Instagram Insights 2026", price: 55000 },
      { name: "Rohan Vlogs", handle: "rohanvlogs", niche: "Fashion & Lifestyle", reach: "1.2M followers", src: "YouTube Creator Studio 2026", price: 80000 },
      { name: "InvestWithAbhinav", handle: "invest_abhinav", niche: "Finance & Insurance", reach: "450K followers", src: "Platform Analytics 2026", price: 65000 },
      { name: "BombayFoodGuide", handle: "bombay_foodie", niche: "Food & Hospitality", reach: "750K followers", src: "Instagram Insights 2026", price: 45000 },
      { name: "Ria Verma Style", handle: "ria_style", niche: "Fashion & Lifestyle", reach: "600K followers", src: "Self-declared", price: 35000 },
      { name: "AutoRider India", handle: "autorider", niche: "Automobiles", reach: "900K subscribers", src: "Platform Analytics 2026", price: 90000 },
      { name: "DilliWalaKhana", handle: "dilli_food_walks", niche: "Food & Hospitality", reach: "550K followers", src: "Instagram Insights 2026", price: 30000 },
      { name: "StudySmart / Anita", handle: "studysmart", niche: "Education & EdTech", reach: "650K subscribers", src: "YouTube Studio 2026", price: 50000 },
      { name: "GameTime Rohit", handle: "gametime_rohit", niche: "Entertainment & Sports", reach: "1.5M subscribers", src: "YouTube Creator Studio 2026", price: 100000 }
    ];

    // IP Event Names
    const ipEventPool = [
      { name: "Global FinTech Congress 2026", city: "Delhi-NCR", niche: "Finance & Insurance", reach: "15K attendees", price: 500000 },
      { name: "India Fashion Awards Week 2026", city: "Mumbai", niche: "Fashion & Lifestyle", reach: "30K visitors", price: 750000 },
      { name: "Tech-X Expo India", city: "Delhi-NCR", niche: "Technology & SaaS", reach: "45K attendees", price: 600000 },
      { name: "Mumbai Food Carnival", city: "Mumbai", niche: "Food & Hospitality", reach: "80K attendees", price: 350000 },
      { name: "National Auto Summit", city: "Delhi-NCR", niche: "Automobiles", reach: "25K visitors", price: 550000 },
      { name: "FitFest India", city: "Mumbai", niche: "Healthcare & Wellness", reach: "20K attendees", price: 300000 }
    ];

    let index = 1;

    // Helper to get budget band
    const getPriceBand = (price) => {
      if (price <= 50000) return "₹10K - ₹50K";
      if (price <= 200000) return "₹50K - ₹2L";
      if (price <= 1000000) return "₹2L - ₹10L";
      return "₹10L+";
    };

    // Helper to get visibility band
    const getVisibilityBand = (reachStr) => {
      const num = parseFloat(reachStr);
      const isM = reachStr.toLowerCase().includes("m");
      const isK = reachStr.toLowerCase().includes("k");
      let count = num;
      if (isM) count = num * 1000000;
      else if (isK) count = num * 1000;

      if (count < 100000) return "< 100K views";
      if (count <= 500000) return "100K - 500K views";
      if (count <= 2000000) return "500K - 2M views";
      return "2M+ views";
    };

    // 1. Generate OOH Listings (40 listings)
    for (let i = 0; i < 40; i++) {
      const city = cities[i % cities.length];
      const locations = oohLocations[city];
      const locationData = locations[Math.floor(i / cities.length) % locations.length];
      const niche = niches[i % niches.length];

      listings.push({
        id: `lst-ooh-${index++}`,
        group_id: `grp-ooh-${i}`,
        owner_account_id: `acc-host-ooh-${i}`,
        media_type: "OOH",
        title: `${locationData.loc} Billboard - #${100 + i}`,
        parent_network: locationData.parent,
        geography: [city],
        niche_tags: [niche],
        language: ["English", "Hindi"],
        visibility_metric: locationData.reach,
        reach_source: locationData.src,
        reach_date: "June 2026",
        price_band: getPriceBand(locationData.price),
        raw_price: locationData.price,
        formats: ["Static Vinyl Banner", "15s Digital Slot", "30s Digital Slot"],
        state: "published",
        verified: true,
        image_url: `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800`
      });
    }

    // 2. Generate Influencer Listings (40 listings)
    for (let i = 0; i < 40; i++) {
      const creator = creatorHandles[i % creatorHandles.length];
      const city = cities[i % cities.length];

      listings.push({
        id: `lst-inf-${index++}`,
        group_id: `grp-inf-${i}`,
        owner_account_id: `acc-host-inf-${i}`,
        media_type: "Influencer-Creator",
        title: `${creator.name} (@${creator.handle}) Integration`,
        parent_network: "Independent Creator",
        geography: [city, "Pan-India"],
        niche_tags: [creator.niche],
        language: ["Hindi", "English"],
        visibility_metric: creator.reach,
        reach_source: creator.src,
        reach_date: "July 2026",
        price_band: getPriceBand(creator.price),
        raw_price: creator.price,
        formats: ["Instagram Reel Integration", "YouTube Mid-Roll Ad", "Dedicated Vlog Sponsor"],
        state: "published",
        verified: true,
        image_url: `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800`
      });
    }

    // 3. Generate Event Sponsorships (30 listings)
    for (let i = 0; i < 30; i++) {
      const eventData = ipEventPool[i % ipEventPool.length];
      const tierNames = ["Title Sponsor", "Co-Powered Sponsor", "Associate Sponsor", "On-Ground Booth"];
      const tierPrices = [eventData.price * 2, eventData.price * 1.2, eventData.price * 0.7, eventData.price * 0.3];
      const randomIdx = i % 4;

      listings.push({
        id: `lst-evt-${index++}`,
        group_id: `grp-evt-${i}`,
        owner_account_id: `acc-host-evt-${i}`,
        media_type: "Event or Venue",
        title: `${eventData.name} - ${tierNames[randomIdx]}`,
        parent_network: "OTZ Originals",
        geography: [eventData.city],
        niche_tags: [eventData.niche],
        language: ["English"],
        visibility_metric: eventData.reach,
        reach_source: "Exhibition Association Report",
        reach_date: "May 2026",
        price_band: getPriceBand(tierPrices[randomIdx]),
        raw_price: tierPrices[randomIdx],
        formats: [tierNames[randomIdx]],
        state: "published",
        verified: true,
        is_otz_original: true,
        sponsorship_tiers: tierNames,
        event_date: "Nov 2026",
        image_url: `https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&q=80&w=800`
      });
    }

    // 4. Generate Digital / Web Listings (30 listings)
    for (let i = 0; i < 30; i++) {
      const city = cities[i % cities.length];
      const niche = niches[i % niches.length];
      const price = 20000 + (i * 4000);
      const portals = ["Inshorts News Banner", "Moneycontrol FinTech Section", "Zomato In-App Splash", "NDTV Food Section banner", "Cricbuzz Banner Slot"];
      const portal = portals[i % portals.length];

      listings.push({
        id: `lst-dig-${index++}`,
        group_id: `grp-dig-${i}`,
        owner_account_id: `acc-host-dig-${i}`,
        media_type: "Digital",
        title: `${portal} - Premium Ad Block`,
        parent_network: portal.split(" ")[0],
        geography: ["Pan-India", city],
        niche_tags: [niche],
        language: ["English", "Hindi"],
        visibility_metric: `${100 + (i * 20)}K monthly clicks`,
        reach_source: "Google Analytics reports",
        reach_date: "June 2026",
        price_band: getPriceBand(price),
        raw_price: price,
        formats: ["250x250 Banner Box", "Header Interstitial Box", "Sponsored Native Post"],
        state: "published",
        verified: true,
        image_url: `https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=800`
      });
    }

    // 5. Generate TV / Radio / Print Listings (20 listings)
    for (let i = 0; i < 20; i++) {
      const city = cities[i % cities.length];
      const niche = niches[i % niches.length];
      const price = 80000 + (i * 25000);
      const networks = ["Star Sports Plus", "Radio City 91.1 FM", "Times of India Delhi Edition", "Zee TV Prime Slot", "Fever 104 FM"];
      const network = networks[i % networks.length];
      const type = network.includes("FM") ? "Radio" : network.includes("Times") ? "Print" : "TV";

      listings.push({
        id: `lst-trp-${index++}`,
        group_id: `grp-trp-${i}`,
        owner_account_id: `acc-host-trp-${i}`,
        media_type: type,
        title: `${network} Prime Slot Spot`,
        parent_network: network.split(" ")[0],
        geography: [city],
        niche_tags: [niche],
        language: ["Hindi", "English"],
        visibility_metric: type === "Radio" ? "350K listeners" : type === "Print" ? "1.8M circulation" : "2.5M viewers",
        reach_source: type === "Radio" ? "IRS reports" : type === "Print" ? "ABC circulation data" : "BARC reports",
        reach_date: "June 2026",
        price_band: getPriceBand(price),
        raw_price: price,
        formats: type === "Radio" ? ["30s Audio slot"] : type === "Print" ? ["Quarter page block"] : ["10s Prime video spot"],
        state: "published",
        verified: i % 3 !== 0,
        image_url: type === "Radio" 
          ? "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800"
          : type === "Print"
          ? "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800"
          : "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=800"
      });
    }

    return listings;
  }
}

// Export a single global DB helper (Node server instance)
export const db = new FileDb();
export default db;
