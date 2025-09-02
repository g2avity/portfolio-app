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
    'entry-content.expanded',
    // Theme and styling modal classes
    'grid-cols-3',
    'max-w-5xl',
    'max-h-[90vh]',
    'overflow-y-auto',
    'p-4',
    'p-6',
    'space-y-4',
    'space-y-6',
    'gap-3',
    'gap-2',
    'rounded-lg',
    'border-2',
    'transition-all',
    'border-blue-500',
    'bg-blue-50',
    'dark:bg-blue-900/20',
    'border-gray-200',
    'dark:border-gray-600',
    'hover:border-gray-300',
    'dark:hover:border-gray-500',
    'text-yellow-600',
    'text-blue-600',
    'text-gray-600',
    'dark:text-gray-400',
    'text-gray-900',
    'dark:text-white',
    'text-xs',
    'font-medium',
    'mx-auto',
    'mb-2',
    'text-center'
  ]
}
