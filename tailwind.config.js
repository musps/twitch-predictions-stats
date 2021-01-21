module.exports = {
  purge: {
    content: ['./pages/**/*.js', './components/**/*.js'],
    options: {
      safelist: {
        standard: [/^(text|bg)-(blue|pink)-800$/, /^text-(gray|yellow)-500$/],
      },
    },
  },
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'dark-bg': '#1a202c',
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
}
