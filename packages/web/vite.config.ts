import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 47823,
    watch: {
      usePolling: true,
    },
  },
  plugins: [react()],
});
