module.exports = {
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'postcss-import': {},
    'postcss-preset-env': {
      stage: 1,
      features: {
        'focus-within-pseudo-class': false
      }
    }
  }
};
