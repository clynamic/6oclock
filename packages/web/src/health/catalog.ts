import { DashboardCatalog, createLayout } from '../dashboard/DashboardItem';
import { JobsDisplay } from './jobs/JobsBoard';
import { ManifestHealthDisplay } from './manifests/ManifestHealthBoard';
import { TileHealthDisplay } from './tiles/TileHealthBoard';

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
        sm: { x: 0, y: 0, w: 4, h: 12 },
        md: { x: 0, y: 0, w: 5, h: 12 },
        lg: { x: 0, y: 0, w: 5, h: 12 },
        xl: { x: 0, y: 0, w: 5, h: 12 },
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
        sm: { x: 4, y: 0, w: 2, h: 20 },
        md: { x: 5, y: 0, w: 4, h: 12 },
        lg: { x: 9, y: 0, w: 3, h: 12 },
        xl: { x: 10, y: 0, w: 6, h: 12 },
      },
    ),
    card: {
      title: 'Jobs',
      variant: 'outlined',
    },
    component: JobsDisplay,
  },
  'health-tiles': {
    name: 'Tiles',
    layout: createLayout(
      {
        minH: 8,
        maxH: 20,
      },
      {
        xs: { x: 0, y: 24, w: 4, h: 12 },
        sm: { x: 0, y: 12, w: 4, h: 12 },
        md: { x: 0, y: 12, w: 9, h: 12 },
        lg: { x: 5, y: 0, w: 4, h: 12 },
        xl: { x: 5, y: 0, w: 5, h: 12 },
      },
    ),
    card: {
      title: 'Tiles',
      variant: 'outlined',
    },
    component: TileHealthDisplay,
  },
};
