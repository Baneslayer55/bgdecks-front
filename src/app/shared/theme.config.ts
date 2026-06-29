// ─── Global colour palette ────────────────────────────────────────────────────
// Inspired by the Berserk Heroes card back: near-black neutral-charcoal
// background with a barely perceptible warm undertone, antique-gold ornamental
// accents. No blue, no strong red or brown — calm and dark throughout.

export const THEME = {
  // Antique gold — matches the ornamental borders on the card back
  primary: '#9E7C2E',

  // Surface scale for PrimeNG Aura dark mode (950 = darkest page bg, 0 = lightest text)
  surface: {
    950: '#0A0907',   // page background — near-black, barely warm
    900: '#100E0B',   // navbar
    800: '#171410',   // card / panel background
    700: '#1F1C16',   // elevated surfaces: dropdowns, modals
    600: '#28241C',   // hover states
    500: '#3A3528',   // borders, separators
    400: '#524C38',   // disabled / placeholder
    300: '#6E6650',   // secondary icons
    200: '#928870',   // secondary text
    100: '#B8B098',   // dim primary text
    50:  '#D4CCBC',   // primary text
    0:   '#E8E4DC',   // headings, active labels
  },

  // PrimeNG form field sizing
  formField: {
    paddingX: '0.5rem',
    paddingY: '0.25rem',
    fontSize:  '0.8125rem',
  },
} as const;
