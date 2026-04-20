/**
 * Forecast 2026 - RQS Google Sheet
 * Direct data from Ruben & Matthijs
 * Last updated: 2026-04-20
 */

// Monthly totals from RQS sheet (row 66)
export const FORECAST_2026_MONTHLY = {
  januari: 86995,
  februari: 95995,
  maart: 84470,
  april: 98570,
  mei: 99770,
  juni: 98870,
  juli: 98870,
  augustus: 98870,
  september: 96470,
  oktober: 96270,
  november: 96270,
  december: 96270,
} as const;

// Client cohorts by start year
export const CLIENT_COHORTS_2026 = [
  {
    year: 2022,
    count: 4,
    totalAnnual: 142800,
    clients: [
      { name: 'Tours & Tickets', lead: 'Matthijs', status: 'Actief', monthly: 6000 },
      { name: 'Kisch', lead: 'RQS', status: 'Actief', monthly: 833 }, // €3k/yr
      { name: 'Spirit', lead: 'RQS', status: 'Actief', monthly: 4250 },
      { name: 'SB+WAA+Fun', lead: 'RQS', status: 'Actief', monthly: 1400 },
    ],
  },
  {
    year: 2023,
    count: 3,
    totalAnnual: 68850,
    clients: [
      { name: 'Caron', lead: 'Merijn', status: 'Actief', monthly: 1025 }, // €7.65k/yr
      { name: 'The Branding Club NL', lead: 'RQS', status: 'Actief', monthly: 2500 },
      { name: 'Talent Care', lead: 'Jaron', status: 'Actief', monthly: 2600 },
    ],
  },
  {
    year: 2024,
    count: 4, // 2 stopped
    totalAnnual: 92200,
    clients: [
      { name: 'Restaurants Shaul', lead: 'RQS', status: 'Actief', monthly: 1000 },
      { name: 'Digital Notary', lead: 'Carbon', status: 'Actief', monthly: 1200 }, // €14.4k, stopped in May
      { name: 'Padelpoints', lead: 'Max', status: 'Actief', monthly: 1800 },
      { name: 'Franky Amsterdam', lead: 'RQS', status: 'Actief', monthly: 3000 },
      // Van der Kooij & The Core stopped
    ],
  },
  {
    year: 2025,
    count: 12, // 1 stopped
    totalAnnual: 424840,
    clients: [
      { name: 'Ripple Surf Therapy', lead: 'Loes', status: 'Actief', monthly: 1000 },
      { name: 'FlorisDaken/Mankracht', lead: 'David', status: 'Actief', monthly: 800 },
      { name: 'Rust Zacht', lead: 'Jaron', status: 'Actief', monthly: 2000 },
      { name: 'Eginstill', lead: 'Charlotte', status: 'Actief', monthly: 1200 },
      { name: 'Floryn', lead: 'Roy', status: 'Actief', monthly: 3220 },
      { name: 'Student Experience', lead: 'Cold', status: 'Actief', monthly: 900 }, // Stopped July
      { name: 'BunBun/Little Bonfire', lead: 'RQS', status: 'Actief', monthly: 1500 },
      { name: 'Momentum', lead: 'Lidewij', status: 'Actief', monthly: 2800 },
      { name: 'Stories', lead: 'Roy', status: 'Actief', monthly: 2600 },
      { name: 'Unity Units', lead: 'Benjamin Tug', status: 'Actief', monthly: 7200 },
      { name: 'Displine', lead: 'Jaron', status: 'Actief', monthly: 3400 },
      { name: 'Distillery/Phima', lead: 'RQS', status: 'Actief', monthly: 3200 },
      { name: 'Lake Cycling', lead: 'Jaron', status: 'Actief', monthly: 6200 },
      { name: 'Johan Cruyff', lead: 'RQS', status: 'Actief', monthly: 1667 }, // €5k/yr
      // App4Sales stopped
    ],
  },
  {
    year: 2026,
    count: 9,
    totalAnnual: 419000,
    clients: [
      { name: 'Bikeshoe4u/Grutto', lead: 'Jaron', status: 'Actief', monthly: 4950 },
      { name: 'Synvest', lead: 'Jasper', status: 'Actief', monthly: 2375 },
      { name: 'Kremer Collectie', lead: 'RQS', status: 'Actief', monthly: 1533 }, // Stopped March
      { name: 'Renaissance/CIMA', lead: 'Matthijs', status: 'Actief', monthly: 4983 },
      { name: 'Carelli', lead: 'RQS', status: 'Actief', monthly: 2833 },
      { name: 'Mr Fris', lead: 'Benjamin Lyppens', status: 'Actief', monthly: 4467 },
      { name: 'Insetto', lead: 'Jaron', status: 'Actief', monthly: 700 },
      { name: 'Code Zero', lead: 'RQS', status: 'Actief', monthly: 3058 },
      { name: 'Travelteq', lead: 'Pien', status: 'Actief', monthly: 2625 },
      { name: 'ESTG', lead: 'RQS', status: 'Actief', monthly: 2742 },
      { name: 'Mim Amsterdam', lead: 'Matthijs', status: 'Actief', monthly: 2800 },
      { name: 'LOR Finance', lead: 'Matthijs', status: 'Actief', monthly: 3000 },
    ],
  },
];

// Annual summary
export const FORECAST_2026_SUMMARY = {
  totalARR: 1147690,
  totalMRR: 95641,
  totalClients: 34,
  averageMRR: 95641 / 34, // €2813/client avg
  totalMonths: Object.values(FORECAST_2026_MONTHLY).reduce((a, b) => a + b, 0),
};

// Monthly forecast array (for dashboard integration)
export const DEFAULT_MONTHLY_FORECAST_2026 = [
  { month: 1, monthName: 'januari', forecast: 86995, target: 108333 },
  { month: 2, monthName: 'februari', forecast: 95995, target: 108333 },
  { month: 3, monthName: 'maart', forecast: 84470, target: 108333 },
  { month: 4, monthName: 'april', forecast: 98570, target: 108333 },
  { month: 5, monthName: 'mei', forecast: 99770, target: 108333 },
  { month: 6, monthName: 'juni', forecast: 98870, target: 108333 },
  { month: 7, monthName: 'juli', forecast: 98870, target: 108333 },
  { month: 8, monthName: 'augustus', forecast: 98870, target: 108333 },
  { month: 9, monthName: 'september', forecast: 96470, target: 108333 },
  { month: 10, monthName: 'oktober', forecast: 96270, target: 108333 },
  { month: 11, monthName: 'november', forecast: 96270, target: 108333 },
  { month: 12, monthName: 'december', forecast: 96270, target: 108333 },
] as const;

// Key insights
export const FORECAST_INSIGHTS = {
  status: '✅ Forecast locked for 2026',
  arrTarget: 1300000,
  arrForecast: 1147690,
  gap: 1300000 - 1147690, // €152,310 needed in new deals
  gapPercentage: ((1300000 - 1147690) / 1300000) * 100,
  newDealsNeeded: 'Approx 3-4 deals @ €40k avg to hit target',
  riskFactors: [
    'Digital Notary stopped in May (lost €14.4k)',
    'The Core stopped (lost €6k)',
    'Student Experience stopped July (lost €4.5k)',
    'Kremer & Synvest ramping slowly',
  ],
  opportunities: [
    'Unity Units: €86.4k potential (strong performer)',
    'Lake Cycling: €74.4k (growing)',
    'Floryn: €38.6k (growing)',
    'Momentum: €33.6k (stable)',
  ],
};
