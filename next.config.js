module.exports = {
  async rewrites() {
    return [
      {
        source: '/abc.js',
        destination: 'https://cdn.splitbee.io/sb.js',
      },
      {
        source: '/_abc/:slug',
        destination: 'https://hive.splitbee.io/:slug',
      },
    ]
  },
}
