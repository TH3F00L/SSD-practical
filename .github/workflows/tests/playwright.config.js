module.exports = {
  testDir: '.',
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
  },
};
