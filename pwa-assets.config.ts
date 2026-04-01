import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimalPreset,
    apple: {
      sizes: [180],
      padding: 0.1,
      resizeOptions: { background: '#1a6bcc' },
    },
    maskable: {
      sizes: [192, 512],
      padding: 0.15,
      resizeOptions: { background: '#1a6bcc' },
    },
    transparent: {
      sizes: [64, 192, 512],
      padding: 0.05,
    },
  },
  images: ['public/icons/favicon.svg'],
})
