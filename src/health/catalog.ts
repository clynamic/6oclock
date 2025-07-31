import { DashboardCatalog, createLayout } from '../dashboard/DashboardItem';
import { JobsDisplay } from './jobs/JobsBoard';
import { ManifestHealthDisplay } from './manifests/ManifestHealthBoard';

export const healthCatalog: DashboardCatalog = {
  'health-manifests': {
    name: 'Manifests',
    layout: createLayout(
      {
        minH: 8,
        maxH: 20,
      },
      {
        xs: { x: 0, y: 0, w: 4, h: 12 },
        sm: { x: 0, y: 0, w: 6, h: 12 },
        md: { x: 0, y: 0, w: 5, h: 12 },
        lg: { x: 0, y: 0, w: 6, h: 12 },
        xl: { x: 0, y: 0, w: 6, h: 12 },
      },
    ),
    card: {
      title: 'Manifests',
      variant: 'outlined',
    },
    component: ManifestHealthDisplay,
  },
  'health-jobs': {
    name: 'Jobs',
    layout: createLayout(
      {
        minH: 8,
        maxH: 20,
      },
      {
        xs: { x: 0, y: 12, w: 4, h: 12 },
        sm: { x: 0, y: 12, w: 6, h: 12 },
        md: { x: 5, y: 0, w: 4, h: 12 },
        lg: { x: 6, y: 0, w: 6, h: 12 },
        xl: { x: 6, y: 0, w: 6, h: 12 },
      },
    ),
    card: {
      title: 'Jobs',
      variant: 'outlined',
    },
    component: JobsDisplay,
  },
};
