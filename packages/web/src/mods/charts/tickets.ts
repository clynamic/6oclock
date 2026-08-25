export const TicketAgeColors = {
  oneDay: '#82b74b', // Moss green
  threeDays: '#ffcc5c', // Soft gold
  oneWeek: '#ffa07a', // Light coral
  twoWeeks: '#4682b4', // Steel blue
  oneMonth: '#6a5acd', // Royal purple
  aboveOneMonth: '#bf5b17', // Burnt orange
} as const;

export const TicketAgeLabels = {
  oneDay: '1 day',
  threeDays: '3 days',
  oneWeek: '1 week',
  twoWeeks: '2 weeks',
  oneMonth: '1 month',
  aboveOneMonth: '> 1 month',
} as const;

export const TicketTypeColors = {
  user: '#e1675d', // Vibrant coral
  comment: '#f2b07e', // Rich peach
  forum: '#d1b3f1', // Deep lavender
  blip: '#77c1e4', // Sky blue
  wiki: '#ffe36d', // Bold lemon
  pool: '#92e4aa', // Mint green
  set: '#f092b0', // Rose pink
  post: '#f0c23b', // Golden yellow
  dmail: '#88cc88', // Fresh green
  replacement: '#9ca3db', // Periwinkle blue
} as const;
