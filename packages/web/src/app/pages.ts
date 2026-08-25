import { lazy } from 'react';

export const HomePage = lazy(() =>
  import('../home/HomePage').then((m) => ({ default: m.HomePage })),
);
export const HealthPage = lazy(() =>
  import('../health/HealthPage').then((m) => ({ default: m.HealthPage })),
);
export const JobsPage = lazy(() =>
  import('../health/jobs/JobsPage').then((m) => ({ default: m.JobsPage })),
);
export const ManifestHealthPage = lazy(() =>
  import('../health/manifests/ManifestHealthPage').then((m) => ({
    default: m.ManifestHealthPage,
  })),
);
export const TileHealthPage = lazy(() =>
  import('../health/tiles/TileHealthPage').then((m) => ({
    default: m.TileHealthPage,
  })),
);
export const JanitorOverviewPage = lazy(() =>
  import('../janitors/overview/JanitorOverviewPage').then((m) => ({
    default: m.JanitorOverviewPage,
  })),
);
export const PostUploaderPage = lazy(() =>
  import('../janitors/uploads/PostUploaderPage').then((m) => ({
    default: m.PostUploaderPage,
  })),
);
export const ModOverviewPage = lazy(() =>
  import('../mods/overview/ModOverviewPage').then((m) => ({
    default: m.ModOverviewPage,
  })),
);
export const TicketReporterPage = lazy(() =>
  import('../mods/reports/TicketReporterPage').then((m) => ({
    default: m.TicketReporterPage,
  })),
);
export const PerformanceDetailPage = lazy(() =>
  import('../performance/PerformanceDetailPage').then((m) => ({
    default: m.PerformanceDetailPage,
  })),
);
export const PerformanceTable = lazy(() =>
  import('../performance/PerformanceTable').then((m) => ({
    default: m.PerformanceTable,
  })),
);
export const ProfilePage = lazy(() =>
  import('../profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
export const SettingsPage = lazy(() =>
  import('../settings/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
