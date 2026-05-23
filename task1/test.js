/**
 * test.js — quick smoke test for all 5 Events API endpoints
 * Run: node test.js
 * Requires: server running at http://localhost:3000
 */

const BASE = 'http://localhost:3000/api/v3/app';
let createdId = null;

/* ── helpers ──────────────────────────────────────────────────────────────── */
function log(label, data) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`▶  ${label}`);
  console.log(JSON.stringify(data, null, 2));
}

async function jsonFetch(url, opts = {}) {
  const res = await fetch(url, opts);
  const body = await res.json();
  return { status: res.status, body };
}

/* ── 0. Health check ─────────────────────────────────────────────────────── */
async function healthCheck() {
  const { status, body } = await jsonFetch('http://localhost:3000/');
  log('0. GET / (health check)', { status, body });
}

/* ── 1. POST /events — create a new event ───────────────────────────────── */
async function createEvent() {
  const form = new FormData();
  form.append('name',         'Tech Summit 2025');
  form.append('tagline',      'Building the Future');
  form.append('schedule',     new Date('2025-09-15T10:00:00Z').toISOString());
  form.append('description',  'A premier technology conference.');
  form.append('moderator',    'Jane Doe');
  form.append('category',     'Technology');
  form.append('sub_category', 'AI & ML');
  form.append('rigor_rank',   '4');
  form.append('uid',          'user_001');
  // NOTE: no image file — optional in this test

  const { status, body } = await jsonFetch(`${BASE}/events`, {
    method: 'POST',
    body: form,
  });

  log('1. POST /events (create)', { status, body });
  if (body.success && body.data?.insertedId) {
    createdId = body.data.insertedId;
    console.log(`   ✔ Created event ID: ${createdId}`);
  }
}

/* ── 2. GET /events?id= — fetch by ID ───────────────────────────────────── */
async function getById() {
  if (!createdId) return console.log('\n⚠ Skipping getById — no createdId');
  const { status, body } = await jsonFetch(`${BASE}/events?id=${createdId}`);
  log('2. GET /events?id=<id>', { status, body });
}

/* ── 3. GET /events?type=latest — paginated list ────────────────────────── */
async function getLatest() {
  const { status, body } = await jsonFetch(`${BASE}/events?type=latest&limit=5&page=1`);
  log('3. GET /events?type=latest&limit=5&page=1', { status, body });
}

/* ── 4. PUT /events/:id — update ────────────────────────────────────────── */
async function updateEvent() {
  if (!createdId) return console.log('\n⚠ Skipping update — no createdId');
  const form = new FormData();
  form.append('name',    'Tech Summit 2025 — UPDATED');
  form.append('tagline', 'Innovation Redefined');

  const { status, body } = await jsonFetch(`${BASE}/events/${createdId}`, {
    method: 'PUT',
    body: form,
  });
  log('4. PUT /events/:id (update)', { status, body });
}

/* ── 5. DELETE /events/:id ───────────────────────────────────────────────── */
async function deleteEvent() {
  if (!createdId) return console.log('\n⚠ Skipping delete — no createdId');
  const { status, body } = await jsonFetch(`${BASE}/events/${createdId}`, {
    method: 'DELETE',
  });
  log('5. DELETE /events/:id', { status, body });
}

/* ── 6. GET after delete — expect 404 ───────────────────────────────────── */
async function getAfterDelete() {
  if (!createdId) return;
  const { status, body } = await jsonFetch(`${BASE}/events?id=${createdId}`);
  log('6. GET /events?id=<deleted_id> → should be 404', { status, body });
}

/* ── 7. Invalid ObjectId — expect 400 ───────────────────────────────────── */
async function invalidId() {
  const { status, body } = await jsonFetch(`${BASE}/events?id=not-a-valid-id`);
  log('7. GET /events?id=not-a-valid-id → should be 400', { status, body });
}

/* ── run all ─────────────────────────────────────────────────────────────── */
(async () => {
  console.log('🚀  Events API — Smoke Test');
  console.log(`    Target: ${BASE}`);
  try {
    await healthCheck();
    await createEvent();
    await getById();
    await getLatest();
    await updateEvent();
    await deleteEvent();
    await getAfterDelete();
    await invalidId();
    console.log(`\n${'═'.repeat(60)}`);
    console.log('✅  All tests ran. Check responses above for correctness.');
  } catch (e) {
    console.error('\n❌  Test runner error:', e.message);
    console.error('    Is the server running? → npm start');
  }
})();
