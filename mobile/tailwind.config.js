/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy: '#0B1F33',
        slate: '#263746',
        gold: '#C89B5D',
        ivory: '#F7F5F0',
        white: '#FFFFFF',
        mist: '#EEF1F3',
        charcoal: '#17212B',
        'slate-gray': '#68737D',
        success: '#237A57',
        warning: '#D89B35',
        error: '#C94C4C',
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '22px',
        hero: '20px',
      },
      fontFamily: {
        sans: ['Inter_400Regular', 'Manrope_400Regular', 'System'],
        'sans-medium': ['Inter_500Medium', 'Manrope_500Medium', 'System'],
        'sans-semibold': ['Inter_600SemiBold', 'Manrope_600SemiBold', 'System'],
        'sans-bold': ['Inter_700Bold', 'Manrope_700Bold', 'System'],
      },
    },
  },
  plugins: [],
};
