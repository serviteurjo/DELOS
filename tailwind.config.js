/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    './index.html',
    './admin.html',
    './admin/index.html',
    './delos-2026-app.html',
    './test-drag.html',
    './delos-data.js'
  ],
  theme: {
    extend: {
      colors: {
        violet: { DEFAULT: '#581C87', deep: '#3B0F5C', mid: '#6B21A8', soft: '#8B5CF6' },
        dynamo: '#DC2626',
        energie: '#F59E0B',
        equi: '#16A34A',
        lime: '#84CC16',
        anthra: '#111827',
        night: '#0d0618'
      },
      fontFamily: {
        logo: ['Cinzel', 'serif'],
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif']
      }
    }
  }
};
