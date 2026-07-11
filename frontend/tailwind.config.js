/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F7F4EF',
        surface: '#FBF9F5',
        border: '#E7E1D7',
        ink: '#1F2421',
        muted: '#5C635D',
        charcoal: '#1F2421',
        terracotta: {
          DEFAULT: '#C4612F',
          hover: '#A94E22',
          tint: '#F2E3D6',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-fraunces)', 'serif'],
      },
    },
  },
  plugins: [],
}
