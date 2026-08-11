/**
 * Smart Goal-to-Channel Recommendation Engine Logic
 * Modular, scalable, and easy to expand.
 */

// Core objective-to-channel mapping (general guidelines)
const OBJECTIVE_MAPPINGS = {
  Awareness: ["TV", "OOH", "Digital"],
  Sales: ["Digital", "Influencer"],
  "App Downloads": ["Digital", "Influencer"],
  "Lead Generation": ["Digital", "Search", "Influencer"]
};

// Advanced layers (exact industry + goal pair overrides)
const ADVANCED_OVERRIDES = [
  {
    industry: "FMCG",
    goal: "Awareness",
    channels: ["TV", "OOH"]
  },
  {
    industry: "Tech",
    goal: "App Downloads",
    channels: ["Digital", "Influencer"]
  },
  {
    industry: "Real Estate",
    goal: "Lead Generation",
    channels: ["Digital", "Search"]
  },
  {
    industry: "Fashion",
    goal: "Sales",
    channels: ["Influencer", "Digital"]
  }
];

// Explainability dictionary
const CHANNEL_REASONING = {
  TV: {
    general: "TV broadcasting establishes mass-market authority and high-frequency visual brand presence.",
    overrides: {
      "FMCG-Awareness": "TV slots command maximum brand recall and mass household reach critical for FMCG consumer packaged goods."
    }
  },
  OOH: {
    general: "Out-of-Home ads offer geographical targeting and visual prominence in high-density urban areas.",
    overrides: {
      "FMCG-Awareness": "Large-format highway billboards sustain brand recall and drive local purchase prompts in busy retail zones."
    }
  },
  Digital: {
    general: "Digital media ensures laser-focused targeting, dynamic optimization, and real-time conversion metrics.",
    overrides: {
      "Tech-App Downloads": "Programmatic mobile banners and social ads link directly to app store listings, minimizing click friction.",
      "Fashion-Sales": "Social retargeting ads capture shoppers who recently browsed catalogs, triggering fast conversions.",
      "Real Estate-Lead Generation": "Localized display and native ads filter by income demographics, capturing high-quality property leads."
    }
  },
  Influencer: {
    general: "Influencers deliver peer-to-peer visual trust and high engagement among specific target demographics.",
    overrides: {
      "Tech-App Downloads": "Creators demonstrating tech solutions in real-time build trust and drive high-intent direct installations.",
      "Fashion-Sales": "Stylist lookbooks and social try-on hauls offer instant visual proof, converting passive viewers into active buyers."
    }
  },
  Search: {
    general: "Search engine ads capture high-intent users actively searching for solutions to their needs.",
    overrides: {
      "Real Estate-Lead Generation": "Google Search ads target active property search keywords, capturing high-quality investment leads."
    }
  },
  Radio: {
    general: "Radio provides localized audio reach to daily commuters at very cost-effective placement rates.",
    overrides: {}
  }
};

// Budget Weighting configurations (base weight points for dynamic scaling)
const BASE_WEIGHTS = {
  Digital: { recommended: 40, normal: 15 },
  Influencer: { recommended: 30, normal: 10 },
  Search: { recommended: 25, normal: 8 },
  TV: { recommended: 25, normal: 8 },
  OOH: { recommended: 15, normal: 5 },
  Radio: { recommended: 10, normal: 5 }
};

/**
 * Calculates recommended channels based on selected industries and campaign goals
 * Handles multi-selection by checking active goal + industry contexts.
 */
export function getRecommendations(selectedIndustries = [], selectedObjectives = []) {
  if (selectedObjectives.length === 0) return [];

  const recommendations = new Set();

  selectedObjectives.forEach((goal) => {
    // If no industries are selected, default to general goal rules
    if (selectedIndustries.length === 0) {
      const defaultChannels = OBJECTIVE_MAPPINGS[goal] || [];
      defaultChannels.forEach((ch) => recommendations.add(ch));
    } else {
      // Loop through industries to check for overrides
      selectedIndustries.forEach((industry) => {
        const override = ADVANCED_OVERRIDES.find(
          (rule) => rule.industry === industry && rule.goal === goal
        );
        if (override) {
          override.channels.forEach((ch) => recommendations.add(ch));
        } else {
          // Fall back to default mapping for this goal
          const defaultChannels = OBJECTIVE_MAPPINGS[goal] || [];
          defaultChannels.forEach((ch) => recommendations.add(ch));
        }
      });
    }
  });

  return Array.from(recommendations);
}

/**
 * Computes dynamic budget weighting percentage split based on selected vs recommended channels.
 * Recommended channels are allocated higher weights.
 */
export function getBudgetAllocation(selectedChannels = [], recommendedChannels = []) {
  if (selectedChannels.length === 0) return [];

  // Determine weight points for each selected channel
  const weights = selectedChannels.map((channel) => {
    const isRecommended = recommendedChannels.includes(channel);
    const weightConfig = BASE_WEIGHTS[channel] || { recommended: 10, normal: 5 };
    return isRecommended ? weightConfig.recommended : weightConfig.normal;
  });

  const sum = weights.reduce((a, b) => a + b, 0);

  // Normalize to 100%
  let totalPercent = 0;
  return selectedChannels
    .map((channel, idx) => {
      let percent = Math.round((weights[idx] / sum) * 100);
      if (idx === selectedChannels.length - 1) {
        percent = 100 - totalPercent; // Guarantee it sums to exactly 100
      }
      totalPercent += percent;
      return { channel, percentage: percent };
    })
    .sort((a, b) => b.percentage - a.percentage);
}

/**
 * Compiles reasoning explainability blocks based on selections
 */
export function getExplanations(selectedIndustries = [], selectedObjectives = [], recommendedChannels = []) {
  const explanations = [];

  recommendedChannels.forEach((channel) => {
    const reasoning = CHANNEL_REASONING[channel];
    if (!reasoning) return;

    let text = reasoning.general;
    let hasOverride = false;

    // Check if any selected industry + goal combination matches an override description
    for (const industry of selectedIndustries) {
      for (const goal of selectedObjectives) {
        const key = `${industry}-${goal}`;
        if (reasoning.overrides && reasoning.overrides[key]) {
          text = reasoning.overrides[key];
          hasOverride = true;
          break;
        }
      }
      if (hasOverride) break;
    }

    explanations.push({
      channel,
      text,
      isSpecific: hasOverride
    });
  });

  return explanations;
}
