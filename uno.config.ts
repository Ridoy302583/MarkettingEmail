import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        hugeicons: () => import('@iconify-json/hugeicons').then(i => i.icons),
      },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  content: {
    filesystem: ['src/**/*.{html,js,ts,jsx,tsx,vue,svelte}'], // only scan src folder
  },
  // ✅ Correct placement
  exclude: [
    'node_modules/**/*',
    '.git/**/*',
    'dist/**/*',
  ],
})
