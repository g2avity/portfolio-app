/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/components/**/*.{js,ts,jsx,tsx}",
    "./app/routes/**/*.{js,ts,jsx,tsx}",
    "./app/lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Add any custom colors you want to extend
      },
      fontFamily: {
        // Add any custom fonts
      },
    },
  },
  plugins: [],
  // Ensure all CSS is included in production builds
  safelist: [
    // Add any critical classes that might be purged
    'layout-original',
    'sidebar-sticky',
    'main-content-area',
    'card-content-constrained',
    'entry-content',
    'entry-content.collapsed',
    'entry-content.expanded'
  ]
}
