export const mockHostDashboard = {
  host: {
    id: "host_001",
    name: "Rajiv Sharma",
    company: "Sharma Media Networks"
  },

  overview: {
    totalListings: 24,
    activeListings: 21,
    totalLeads: 148,
    activeBookings: 12,
    estimatedRevenue: 482000, // in Rupees (₹4.82L)
    averageViews: 8420
  },

  listings: [
    {
      id: "AD-001",
      title: "Times of India Bangalore Front Page",
      media_type: "Print",
      geography: ["Bengaluru"],
      views: 12400,
      leads: 42,
      bookings: 5,
      revenue: 2250000,
      status: "Active",
      image_url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "AD-002",
      title: "Bandra Worli Sea Link Digital Billboard",
      media_type: "OOH",
      geography: ["Mumbai"],
      views: 9800,
      leads: 31,
      bookings: 3,
      revenue: 840000,
      status: "Active",
      image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "AD-005",
      title: "Delhi Metro Yellow Line Panels",
      media_type: "OOH",
      geography: ["Delhi NCR"],
      views: 7200,
      leads: 24,
      bookings: 2,
      revenue: 360000,
      status: "Active",
      image_url: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "AD-009",
      title: "DLF CyberHub Main Atrium LED",
      media_type: "Digital",
      geography: ["Delhi NCR"],
      views: 6400,
      leads: 19,
      bookings: 1,
      revenue: 280000,
      status: "Active",
      image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "AD-012",
      title: "Red FM Bengaluru Primetime Radio Spot",
      media_type: "Radio",
      geography: ["Bengaluru"],
      views: 5100,
      leads: 15,
      bookings: 1,
      revenue: 120000,
      status: "Pending Review",
      image_url: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "AD-015",
      title: "PVR Cinemas National Audio Interstitial",
      media_type: "Cinema",
      geography: ["National Grid"],
      views: 4300,
      leads: 12,
      bookings: 0,
      revenue: 0,
      status: "Draft",
      image_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800"
    }
  ],

  leads: [
    {
      id: "LD-101",
      brandName: "ABC Foods",
      campaignName: "Summer FMCG Campaign",
      listingTitle: "Bandra Worli Sea Link Digital Billboard",
      budget: 250000,
      status: "New",
      date: "Today"
    },
    {
      id: "LD-102",
      brandName: "Zeta Mobility",
      campaignName: "EV Launch Blitz",
      listingTitle: "Delhi Metro Yellow Line Panels",
      budget: 180000,
      status: "Contacted",
      date: "Yesterday"
    },
    {
      id: "LD-103",
      brandName: "Prime Tech",
      campaignName: "SaaS Q3 Funnel",
      listingTitle: "DLF CyberHub Main Atrium LED",
      budget: 280000,
      status: "Negotiating",
      date: "3 days ago"
    },
    {
      id: "LD-104",
      brandName: "Craft Fashion",
      campaignName: "Autumn Collection Launch",
      listingTitle: "Times of India Bangalore Front Page",
      budget: 450000,
      status: "Booked",
      date: "5 days ago"
    },
    {
      id: "LD-105",
      brandName: "MedCare Health",
      campaignName: "National Wellness Awareness",
      listingTitle: "Red FM Bengaluru Primetime Radio Spot",
      budget: 120000,
      status: "Closed",
      date: "1 week ago"
    }
  ],

  bookings: [
    {
      id: "BK-201",
      listingTitle: "Times of India Bangalore Front Page",
      clientCompany: "Craft Fashion",
      amount: 450000,
      startDate: "2026-09-01",
      endDate: "2026-09-02",
      status: "Confirmed"
    },
    {
      id: "BK-202",
      listingTitle: "Bandra Worli Sea Link Digital Billboard",
      clientCompany: "ABC Foods",
      amount: 280000,
      startDate: "2026-08-25",
      endDate: "2026-09-25",
      status: "Pending Approval"
    },
    {
      id: "BK-203",
      listingTitle: "DLF CyberHub Main Atrium LED",
      clientCompany: "Prime Tech",
      amount: 280000,
      startDate: "2026-09-10",
      endDate: "2026-10-10",
      status: "In Progress"
    }
  ],

  analytics: {
    "7days": [
      { name: "Mon", views: 1200, leads: 4, bookings: 0 },
      { name: "Tue", views: 1400, leads: 6, bookings: 1 },
      { name: "Wed", views: 1100, leads: 3, bookings: 0 },
      { name: "Thu", views: 1500, leads: 7, bookings: 1 },
      { name: "Fri", views: 1800, leads: 9, bookings: 2 },
      { name: "Sat", views: 1300, leads: 5, bookings: 0 },
      { name: "Sun", views: 900, leads: 2, bookings: 0 }
    ],
    "30days": [
      { name: "Week 1", views: 8200, leads: 32, bookings: 3 },
      { name: "Week 2", views: 9500, leads: 38, bookings: 4 },
      { name: "Week 3", views: 11200, leads: 48, bookings: 3 },
      { name: "Week 4", views: 10400, leads: 30, bookings: 2 }
    ],
    "90days": [
      { name: "Jun", views: 32000, leads: 110, bookings: 8 },
      { name: "Jul", views: 38000, leads: 132, bookings: 10 },
      { name: "Aug", views: 42000, leads: 148, bookings: 12 }
    ]
  },

  recentActivity: [
    {
      id: "ACT-001",
      event: "New enquiry received",
      listingTitle: "Bandra Worli Sea Link Digital Billboard",
      userCompany: "ABC Foods",
      date: "Today, 10:30 AM",
      status: "new"
    },
    {
      id: "ACT-002",
      event: "Booking request received",
      listingTitle: "DLF CyberHub Main Atrium LED",
      userCompany: "Prime Tech",
      date: "Yesterday, 4:15 PM",
      status: "pending"
    },
    {
      id: "ACT-003",
      event: "Listing approved",
      listingTitle: "Red FM Bengaluru Primetime Radio Spot",
      userCompany: "OTZ Admin",
      date: "2 days ago",
      status: "approved"
    },
    {
      id: "ACT-004",
      event: "Payment received",
      listingTitle: "Times of India Bangalore Front Page",
      userCompany: "Craft Fashion",
      date: "3 days ago",
      status: "success"
    },
    {
      id: "ACT-005",
      event: "Campaign completed",
      listingTitle: "DLF CyberHub Main Atrium LED",
      userCompany: "Zeta Mobility",
      date: "1 week ago",
      status: "completed"
    }
  ]
};
