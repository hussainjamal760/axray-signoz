import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-on-surface": "var(--color-inverse-on-surface)",
        "surface-container-lowest": "var(--color-surface-container-lowest)",
        "primary-fixed": "var(--color-primary-fixed)",
        "primary-fixed-dim": "var(--color-primary-fixed-dim)",
        "on-primary": "var(--color-on-primary)",
        "surface-dim": "var(--color-surface-dim)",
        "secondary": "var(--color-secondary)",
        "on-tertiary": "var(--color-on-tertiary)",
        "error-container": "var(--color-error-container)",
        "on-secondary-fixed-variant": "var(--color-on-secondary-fixed-variant)",
        "on-primary-fixed-variant": "var(--color-on-primary-fixed-variant)",
        "tertiary-container": "var(--color-tertiary-container)",
        "error": "var(--color-error)",
        "background": "var(--color-background)",
        "on-secondary-container": "var(--color-on-secondary-container)",
        "on-secondary-fixed": "var(--color-on-secondary-fixed)",
        "surface-container-low": "var(--color-surface-container-low)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        "surface": "var(--color-surface)",
        "outline": "var(--color-outline)",
        "inverse-primary": "var(--color-inverse-primary)",
        "surface-tint": "var(--color-surface-tint)",
        "primary": "var(--color-primary)",
        "on-primary-container": "var(--color-on-primary-container)",
        "on-tertiary-fixed": "var(--color-on-tertiary-fixed)",
        "on-surface": "var(--color-on-surface)",
        "tertiary": "var(--color-tertiary)",
        "on-primary-fixed": "var(--color-on-primary-fixed)",
        "tertiary-fixed": "var(--color-tertiary-fixed)",
        "surface-container": "var(--color-surface-container)",
        "surface-variant": "var(--color-surface-variant)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "on-secondary": "var(--color-on-secondary)",
        "on-background": "var(--color-on-background)",
        "surface-container-high": "var(--color-surface-container-high)",
        "secondary-container": "var(--color-secondary-container)",
        "secondary-fixed-dim": "var(--color-secondary-fixed-dim)",
        "primary-container": "var(--color-primary-container)",
        "tertiary-fixed-dim": "var(--color-tertiary-fixed-dim)",
        "on-error": "var(--color-on-error)",
        "surface-bright": "var(--color-surface-bright)",
        "outline-variant": "var(--color-outline-variant)",
        "secondary-fixed": "var(--color-secondary-fixed)",
        "on-tertiary-container": "var(--color-on-tertiary-container)",
        "on-error-container": "var(--color-on-error-container)",
        "on-tertiary-fixed-variant": "var(--color-on-tertiary-fixed-variant)",
        "inverse-surface": "var(--color-inverse-surface)"
      },
      borderRadius: {
        "DEFAULT": "0px",
        "lg": "0px",
        "xl": "0px",
        "full": "9999px"
      },
      spacing: {
        "margin": "var(--spacing-margin)",
        "gutter": "var(--spacing-gutter)",
        "base": "var(--spacing-base)"
      },
      borderWidth: {
        "standard": "var(--border-width-standard)",
        "thick": "var(--border-width-thick)",
        "3": "3px"
      },
      fontFamily: {
        "headline-xl": ["var(--font-geist)"],
        "headline-lg-mobile": ["var(--font-geist)"],
        "headline-lg": ["var(--font-geist)"],
        "cta-label": ["var(--font-geist)"],
        "body-md": ["var(--font-geist)"],
        "mono-label": ["var(--font-jetbrains)"]
      },
      fontSize: {
        "headline-xl": ["48px", { lineHeight: "52px", letterSpacing: "-0.04em", fontWeight: "900" }],
        "mono-label": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "headline-lg-mobile": ["24px", { lineHeight: "28px", fontWeight: "800" }],
        "headline-lg": ["32px", { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "800" }],
        "cta-label": ["14px", { lineHeight: "16px", fontWeight: "800" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }]
      }
    },
  },
  plugins: [],
};
export default config;
