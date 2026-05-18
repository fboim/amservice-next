module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        am: {
          primary: '#3b82f6',
          surface: '#1e293b',
          background: '#0f172a',
          border: '#334155',
          text: '#f1f5f9',
          'text-muted': '#64748b',
        },
      },
    },
  },
  plugins: [],
}