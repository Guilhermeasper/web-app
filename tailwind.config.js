/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

function fromCssVariable(variableName) {
  return `rgb(var(${variableName}))`;
}

module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: 'selector',
  theme: {
    fontFamily: {
      geometric: ['Geologica', 'sans-serif'],
      grotesque: ['Bricolage Grotesque', 'sans-serif'],
    },
    colors: {
      // Base guideline colors
      beterraba: fromCssVariable('--color-beterraba'),
      tamarindo: fromCssVariable('--color-tamarindo'),
      acerola: fromCssVariable('--color-acerola'),
      farofa: {
        DEFAULT: fromCssVariable('--color-farofa'),
        tint: fromCssVariable('--color-farofa-tint'),
      },
      mostarda: fromCssVariable('--color-mostarda'),
      laranja: fromCssVariable('--color-laranja'),
      acelga: {
        DEFAULT: fromCssVariable('--color-acelga'),
        shade: fromCssVariable('--color-acelga-shade'),
        tint: fromCssVariable('--color-acelga-tint'),
      },
      bandeja: fromCssVariable('--color-bandeja'),

      // Semantic colors
      background: {
        DEFAULT: fromCssVariable('--color-background'),
        contrast: fromCssVariable('--color-background-contrast'),
      },
      header: fromCssVariable('--color-header'),
      accent: {
        DEFAULT: fromCssVariable('--color-accent'),
        contrast: fromCssVariable('--color-accent-contrast'),
        hover: fromCssVariable('--color-accent-hover'),
      },
      overlay: {
        DEFAULT: fromCssVariable('--color-overlay'),
        contrast: fromCssVariable('--color-overlay-contrast'),
        positive: fromCssVariable('--color-overlay-positive'),
        negative: fromCssVariable('--color-overlay-negative'),
        hover: fromCssVariable('--color-overlay-hover'),
      },
      'highlight-a': {
        DEFAULT: fromCssVariable('--color-highlight-a'),
        contrast: fromCssVariable('--color-highlight-a-contrast'),
        accent: fromCssVariable('--color-highlight-a-accent'),
        hover: fromCssVariable('--color-highlight-a-hover'),
      },
      'highlight-b': {
        DEFAULT: fromCssVariable('--color-highlight-b'),
        contrast: fromCssVariable('--color-highlight-b-contrast'),
        accent: fromCssVariable('--color-highlight-b-accent'),
        hover: fromCssVariable('--color-highlight-b-hover'),
      },
    },
    screens: {
      surehover: { raw: '(hover: hover) and (pointer: fine)' },
      xs: '390px',
      ...defaultTheme.screens,
    },
    extend: {
      backgroundPosition: {
        close: 'right bottom -125%',
        over: 'right -15% bottom -15%',
        'over-distant': 'right -15% bottom -10%',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
