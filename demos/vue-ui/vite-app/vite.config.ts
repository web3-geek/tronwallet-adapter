import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      include: ['crypto', 'buffer', 'stream'],
      globals: {
        Buffer: true,
      }
    }),
    vue()
  ],
  server: {
    host: "0.0.0.0",
    // https: true,
    port: 5003,
  }
})
