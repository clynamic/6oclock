import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'react-transition-group/TransitionGroupContext':
        'react-transition-group/cjs/TransitionGroupContext.js',
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    env: {
      TZ: 'UTC',
    },
    server: {
      deps: {
        inline: [/@mui\/material/],
      },
    },
  },
});
