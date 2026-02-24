import type { Config } from 'tailwindcss';

const withOpacity = (variable: string) => {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue === undefined) {
      return `oklch(var(${variable}))`;
    }
    return `oklch(var(${variable}) / ${opacityValue})`;
  };
};

export default {
  content: ['./src/**/*.{astro,html,js,jsx,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: withOpacity('--background-values'),
        foreground: withOpacity('--foreground-values'),
        card: withOpacity('--card-values'),
        'card-foreground': withOpacity('--card-foreground-values'),
        popover: withOpacity('--popover-values'),
        'popover-foreground': withOpacity('--popover-foreground-values'),
        primary: {
          DEFAULT: withOpacity('--primary-values'),
          foreground: withOpacity('--primary-foreground-values'),
        },
        secondary: {
          DEFAULT: withOpacity('--secondary-values'),
          foreground: withOpacity('--secondary-foreground-values'),
        },
        muted: {
          DEFAULT: withOpacity('--muted-values'),
          foreground: withOpacity('--muted-foreground-values'),
        },
        accent: {
          DEFAULT: withOpacity('--accent-values'),
          foreground: withOpacity('--accent-foreground-values'),
        },
        destructive: {
          DEFAULT: withOpacity('--destructive-values'),
          foreground: withOpacity('--destructive-foreground-values'),
        },
        border: withOpacity('--border-values'),
        input: withOpacity('--input-values'),
        ring: withOpacity('--ring-values'),
        info: {
          DEFAULT: withOpacity('--info-values'),
          foreground: withOpacity('--info-foreground-values'),
        },
        warning: {
          DEFAULT: withOpacity('--warning-values'),
          foreground: withOpacity('--warning-foreground-values'),
        },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        serif: 'var(--font-serif)',
        mono: 'var(--font-mono)',
      },
      borderRadius: {
        sm: 'calc(var(--radius) - 4px)',
        md: 'var(--radius)',
        lg: 'calc(var(--radius) + 2px)',
        xl: 'calc(var(--radius) + 4px)',
      },
      boxShadow: {
        '2xs': '0 1px 1px 0 rgb(0 0 0 / 0.03)', // Softer smallest shadow
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.04)', // Reduced from default
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)', // Reduced opacity
        'DEFAULT': '0 2px 4px -1px rgb(0 0 0 / 0.05), 0 1px 2px -2px rgb(0 0 0 / 0.03)', // Reduced from default
        'md': '0 3px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)', // Reduced from default
        'lg': '0 6px 10px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)', // Reduced from default
        'xl': '0 8px 12px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06)', // Reduced from default
        '2xl': '0 12px 16px -4px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.08)', // Reduced from default
      },
      borderWidth: {
        DEFAULT: '0.5px', // Reduced from 1px
      },
    },
  },
  plugins: [],
} satisfies Config;
