const axios = require('axios');

// Tests run over plain HTTP directly against the app container,
// bypassing the TLS reverse proxy.
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

function postForm(path, body) {
  return axios.post(`${BASE_URL}${path}`, body, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    validateStatus: () => true,
  });
}

describe('Search app integration tests', () => {
  test('home page loads with a search form', async () => {
    const res = await axios.get(BASE_URL);
    expect(res.status).toBe(200);
    expect(res.data).toContain('id="searchTerm"');
  });

  test('valid search term is accepted and shown on the result page', async () => {
    const res = await postForm('/search', 'searchTerm=hello world');
    expect(res.status).toBe(200);
    expect(res.data).toContain('hello world');
    expect(res.data).toContain('Back to Home');
  });

  test('SQL injection attempt is rejected and user stays on home page', async () => {
    const res = await postForm('/search', "searchTerm=' OR 1=1 --");
    expect(res.status).toBe(200);
    expect(res.data).toContain('Invalid input');
    expect(res.data).toContain('id="searchTerm"');
  });

  test('XSS attempt is rejected', async () => {
    const res = await postForm('/search', 'searchTerm=<script>alert(1)</script>');
    expect(res.status).toBe(200);
    expect(res.data).toContain('Invalid input');
  });

  test('empty search term is rejected', async () => {
    const res = await postForm('/search', 'searchTerm=');
    expect(res.status).toBe(200);
    expect(res.data).toContain('Invalid input');
  });

  test('over-length search term is rejected', async () => {
    const longTerm = 'a'.repeat(51);
    const res = await postForm('/search', `searchTerm=${longTerm}`);
    expect(res.status).toBe(200);
    expect(res.data).toContain('Invalid input');
  });
});
