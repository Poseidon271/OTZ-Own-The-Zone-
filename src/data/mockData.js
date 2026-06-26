export const mockAdvertisingAssets = [
  {
    id: "asset-1",
    title: "Premium Digital Billboard - Times Square Hub",
    category: "Digital Ads",
    price: 4500,
    location: "Times Square, New York",
    description: "Ultra-high-definition LED screen situated in the highest traffic zone of Times Square, offering maximum brand visibility with dynamic rotation.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    reach: "1.2M daily impressions",
    specs: "30ft x 40ft, 15s slot",
    availability: { "Jul": true, "Aug": false, "Sep": true, "Oct": true, "Nov": false, "Dec": true },
    pastExecutions: [
      "https://placehold.co/600x400/2e1065/ffffff?text=Coca-Cola+Holiday+TimesSquare",
      "https://placehold.co/600x400/1e1b4b/ffffff?text=Samsung+Galaxy+S26+Launch"
    ]
  },
  {
    id: "asset-2",
    title: "Highway Single-Sided Billboard - I-95 Route",
    category: "Billboards",
    price: 1800,
    location: "I-95 Expressway, Miami",
    description: "Classic large-format static billboard targeting commuters entering downtown Miami. Perfect for long-term brand awareness campaigns.",
    image: "https://images.unsplash.com/photo-1541535650810-10d26f5c2ab3?auto=format&fit=crop&q=80&w=800",
    reach: "450K weekly views",
    specs: "14ft x 48ft, Static Vinyl",
    availability: { "Jul": true, "Aug": true, "Sep": false, "Oct": true, "Nov": true, "Dec": true },
    pastExecutions: [
      "https://placehold.co/600x400/111827/ffffff?text=Ford+F-150+Promo+I-95",
      "https://placehold.co/600x400/0f172a/ffffff?text=McDonalds+Breakfast+Express"
    ]
  },
  {
    id: "asset-3",
    title: "Premium Screen 1 & 2 Pre-Show Advertising",
    category: "Cinema",
    price: 650,
    location: "AMC Empire 25, New York",
    description: "Capture captive audiences with high-impact screen advertisements played right before blockbusters. High recall rate.",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800",
    reach: "25K monthly viewers",
    specs: "30s video slot, Dolby Digital Sound",
    availability: { "Jul": false, "Aug": false, "Sep": false, "Oct": false, "Nov": false, "Dec": false },
    pastExecutions: [] // Empty list to test fallback message
  },
  {
    id: "asset-4",
    title: "Prime Time Breakfast Show Spot - 98.1 FM",
    category: "Radio",
    price: 350,
    location: "Boston Metro Area",
    description: "A 30-second audio ad slot during the highly-rated Morning Wake-up Show, targeting professional adults and daily commuters.",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800",
    reach: "150K live listeners",
    specs: "30s audio slot, Mon-Fri 7 AM - 9 AM",
    availability: { "Jul": true, "Aug": true, "Sep": true, "Oct": true, "Nov": true, "Dec": true },
    pastExecutions: [
      "https://placehold.co/600x400/312e81/ffffff?text=Dunkin+Morning+Spot+98.1",
      "https://placehold.co/600x400/1e1b4b/ffffff?text=Geico+Radio+Breakfast"
    ]
  },
  {
    id: "asset-5",
    title: "Double-Decker Bus Wrap - Downtown Line",
    category: "Billboards",
    price: 3200,
    location: "Chicago Loop, Chicago",
    description: "Full transit wrap on active downtown double-decker buses. Highly mobile advertising that covers major business districts.",
    image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800",
    reach: "800K monthly impressions",
    specs: "Full exterior vinyl wrap",
    availability: { "Jul": false, "Aug": true, "Sep": true, "Oct": false, "Nov": true, "Dec": false },
    pastExecutions: [
      "https://placehold.co/600x400/4c1d95/ffffff?text=United+Airlines+Bus+Wrap",
      "https://placehold.co/600x400/030712/ffffff?text=T-Mobile+5G+Bus+Wrap"
    ]
  },
  {
    id: "asset-6",
    title: "Bus Shelter Backlit Display - Sunset Blvd",
    category: "Billboards",
    price: 950,
    location: "Sunset Boulevard, Los Angeles",
    description: "Backlit street furniture poster displaying at eye-level to pedestrians and slow-moving traffic on Sunset Blvd.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800",
    reach: "120K weekly views",
    specs: "4ft x 6ft, Backlit Poster",
    availability: { "Jul": true, "Aug": false, "Sep": true, "Oct": false, "Nov": true, "Dec": true },
    pastExecutions: [
      "https://placehold.co/600x400/065f46/ffffff?text=Nike+Sunset+Blvd+Shelter",
      "https://placehold.co/600x400/1f2937/ffffff?text=Disney+Plus+Movie+Poster"
    ]
  },
  {
    id: "asset-7",
    title: "Interactive Kiosk Display - Fashion Mall",
    category: "Digital Ads",
    price: 1200,
    location: "Galleria Mall, Houston",
    description: "Digital directory screen ads located near major retailers. Features touch-interaction opportunities for shoppers.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800",
    reach: "300K monthly shoppers",
    specs: "55-inch Touchscreen, 10s slot",
    availability: { "Jul": true, "Aug": true, "Sep": false, "Oct": false, "Nov": true, "Dec": true },
    pastExecutions: [] // Empty list to test fallback message
  },
  {
    id: "asset-8",
    title: "Late Night Lounge Podcast Sponsorship",
    category: "Radio",
    price: 500,
    location: "National Audience (Digital)",
    description: "Audio sponsorships read by the host on the top-trending 'Late Night Lounge' podcast. Perfect for tech & lifestyle products.",
    image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800",
    reach: "85K average downloads/episode",
    specs: "60s Mid-roll host-read integration",
    availability: { "Jul": false, "Aug": false, "Sep": true, "Oct": true, "Nov": true, "Dec": true },
    pastExecutions: [
      "https://placehold.co/600x400/1e1b4b/ffffff?text=Squarespace+Podcast+Midroll",
      "https://placehold.co/600x400/020617/ffffff?text=BetterHelp+Late+Night+Read"
    ]
  },
  {
    id: "asset-9",
    title: "Cinema Lobby Video Wall Advertising",
    category: "Cinema",
    price: 400,
    location: "Regal LA Live, Los Angeles",
    description: "Full HD video wall placed directly above ticket counters and snack bars in the main lobby, commanding high dwell time.",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800",
    reach: "40K monthly visitors",
    specs: "4x4 LCD display grid, 15s rotation",
    availability: { "Jul": true, "Aug": true, "Sep": true, "Oct": false, "Nov": false, "Dec": true },
    pastExecutions: [
      "https://placehold.co/600x400/451a03/ffffff?text=Marvel+Studios+PreShow",
      "https://placehold.co/600x400/1c1917/ffffff?text=Netflix+Stranger+Things+Cinema"
    ]
  },
  {
    id: "asset-10",
    title: "Airport Arrival Terminal Digital Screen",
    category: "Digital Ads",
    price: 5200,
    location: "JFK Airport Terminal 4, New York",
    description: "Premium large-format digital LED display hanging right above the baggage claim carousel, welcoming domestic and international travelers.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800",
    reach: "1.5M monthly travelers",
    specs: "10ft x 25ft LED screen, 10s rotation",
    availability: { "Jul": false, "Aug": false, "Sep": false, "Oct": false, "Nov": true, "Dec": false },
    pastExecutions: [
      "https://placehold.co/600x400/172554/ffffff?text=Delta+Arrival+Terminal+JFK",
      "https://placehold.co/600x400/0f172a/ffffff?text=Chase+Sapphire+Welcomes+You"
    ]
  },
  {
    id: "asset-11",
    title: "Drive-Time Traffic Audio Spot - 104.3 FM",
    category: "Radio",
    price: 450,
    location: "San Francisco Bay Area",
    description: "High-frequency audio spots broadcasted specifically during the afternoon rush-hour traffic block. Great for local services.",
    image: "https://placehold.co/600x400/0066cc/ffffff?text=Radio+Media+Spot",
    reach: "200K drive-time listeners",
    specs: "30s audio slot, Mon-Fri 4 PM - 6 PM",
    availability: { "Jul": true, "Aug": true, "Sep": true, "Oct": true, "Nov": false, "Dec": false },
    pastExecutions: [
      "https://placehold.co/600x400/111827/ffffff?text=Chevron+Commute+AudioSpot",
      "https://placehold.co/600x400/090d16/ffffff?text=Progressive+DriveTime+Traffic"
    ]
  },
  {
    id: "asset-12",
    title: "Pillar Billboards - Metro Station Entrance",
    category: "Billboards",
    price: 1100,
    location: "Metro Center, Washington D.C.",
    description: "Static illuminated pillar prints placed strategically around the highest-traffic entrances and exits of Metro Center station.",
    image: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&q=80&w=800",
    reach: "350K weekly commuters",
    specs: "Four 3ft x 8ft illuminated wraps",
    availability: { "Jul": true, "Aug": false, "Sep": true, "Oct": true, "Nov": true, "Dec": true },
    pastExecutions: [
      "https://placehold.co/600x400/581c87/ffffff?text=Verizon+Metro+Entrance+Wraps",
      "https://placehold.co/600x400/0f172a/ffffff?text=Capital+One+Pillar+Prints"
    ]
  }
];
