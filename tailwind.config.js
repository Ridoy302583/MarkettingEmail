import plugin from 'tailwindcss/plugin';

export default {
  content: ['./**/*.{html,js,ts,jsx,tsx,vue,svelte}'],
  theme: {
    extend: {},
  },
  plugins: [
    // Example: Add custom plugin for icon alignment
    plugin(function({ addUtilities }) {
      addUtilities({
        '.icon-inline': {
          display: 'inline-block',
          verticalAlign: 'middle',
        },
      });
    }),
  ],
}
