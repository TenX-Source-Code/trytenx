tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0D0F14',
          surface: '#13161D',
          elevated: '#1C2030',
        },
        accent: {
          cyan: '#00E676',  /* repurposed: now mint-green primary */
          green: '#00E676',
          amber: '#EAB308',
          red: '#EF4444',
        },
        fg: {
          primary: '#F0F4FF',
          secondary: '#8B92A8',
          muted: '#444C63',
        },
        line: {
          DEFAULT: '#1F2535',
          bright: '#2D3550',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
};
