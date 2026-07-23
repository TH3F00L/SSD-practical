const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const { validate, MIN_LENGTH, MAX_LENGTH } = require('./validate');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: false }));
// Serve the shared validator to the browser so the frontend uses the
// exact same rules as the backend.
app.use('/validate.js', express.static(path.join(__dirname, 'validate.js')));

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'searchapp',
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASSWORD || 'apppass',
  connectionTimeoutMillis: 5000,
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function homePage(message) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>Search</title>
  <script src="/validate.js"></script>
</head>
<body>
  <h1>Search</h1>
  ${message ? `<p>${escapeHtml(message)}</p>` : ''}
  <form id="searchForm" action="/search" method="POST" onsubmit="return handleSubmit()">
    <input type="text" id="searchTerm" name="searchTerm"
           required minlength="${MIN_LENGTH}" maxlength="${MAX_LENGTH}" />
    <button type="submit">Search</button>
  </form>
  <script>
    function handleSubmit() {
      var input = document.getElementById('searchTerm');
      var result = SearchValidator.validate(input.value);
      if (!result.valid) {
        input.value = '';
        alert(result.reason);
        return false;
      }
      return true;
    }
  </script>
</body>
</html>`;
}

function resultPage(term) {
  return `<!DOCTYPE html>
<html>
<head><title>Search Result</title></head>
<body>
  <h1>Search Result</h1>
  <p>You searched for: <strong>${escapeHtml(term)}</strong></p>
  <form action="/" method="GET">
    <button type="submit">Back to Home</button>
  </form>
</body>
</html>`;
}

app.get('/', (req, res) => {
  res.send(homePage());
});

app.post('/search', async (req, res) => {
  const term = req.body.searchTerm || '';
  const result = validate(term);

  if (!result.valid) {
    // Backend re-validates independently of the frontend (defense in
    // depth). Anything that fails the allow-list - including SQL
    // injection / XSS payloads - is rejected, the input is cleared,
    // and the user stays on the home page to try again.
    return res.send(homePage('Invalid input - please try again.'));
  }

  try {
    // Parameterized query: the validated value is never concatenated
    // into SQL text, which prevents SQL injection regardless of
    // content (OWASP Proactive Control C3).
    await pool.query(
      'INSERT INTO "2402209" (search_query, query_time) VALUES ($1, NOW())',
      [result.value]
    );
  } catch (err) {
    console.error('DB insert failed:', err);
    return res.send(homePage('Something went wrong - please try again.'));
  }

  res.send(resultPage(result.value));
});

app.listen(PORT, () => {
  console.log(`Search app listening on port ${PORT}`);
});
