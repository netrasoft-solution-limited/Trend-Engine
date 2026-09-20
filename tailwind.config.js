export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: '#E6E6E4',
        shell: '#F5F5F3',
        card: '#FFFFFF',
        line: '#ECECE8',
        ink: {
          DEFAULT: '#151513',
          soft: '#45453F',
          mute: '#8B8B83',
        },
        accent: {
          DEFAULT: '#E8552D',
          deep: '#C4411D',
          soft: '#FCEAE3',
        },
        ok: { DEFAULT: '#2E7A52', soft: '#E6F2EB' },
        warn: { DEFAULT: '#A9711A', soft: '#FAF0DC' },
        bad: { DEFAULT: '#BF3D2C', soft: '#FBE7E3' },
        info: { DEFAULT: '#37589E', soft: '#E9EDF8' },
        slate: { DEFAULT: '#6A6A63', soft: '#EFEFEB' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '4xl': '28px',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(21,21,19,0.04)',
      },
      fontSize: {
        '2xs': ['11px', '14px'],
      },
    },
  },
}
