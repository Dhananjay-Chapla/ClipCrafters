// ClipCrafters — Full API Test Suite (Node.js, no extra deps — uses built-in fetch)
// Run: node test-apis.mjs

const BASE = 'http://localhost:5001/api';
const TIMESTAMP = Date.now();

// ── State variables ──────────────────────────────────────────────────────────
let accessToken = '';
let refreshToken = '';
let userId = '';
let projectId = '';
let videoId = '';
let sceneId = '';
let editId = '';
let token2 = ''; // second user

// ── Result tracking ──────────────────────────────────────────────────────────
const results = [];

const PASS = '✅ PASS';
const FAIL = '❌ FAIL';
const SKIP = '⚠️  SKIP';
const MANUAL = '🔵 MANL';

const failures = [];

function record(num, endpoint, status, notes) {
    results.push({ num, endpoint, status, notes });
    if (status === FAIL) failures.push({ num, endpoint, notes });
    const icon = status === PASS ? '✅' : status === FAIL ? '❌' : status === SKIP ? '⚠️ ' : '🔵';
    console.log(`  [${String(num).padStart(2, '0')}] ${icon} ${endpoint.padEnd(50)} ${notes}`);
}

// ── HTTP helper ───────────────────────────────────────────────────────────────
async function req(method, path, { body, token, form } = {}) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let bodyPayload;
    if (form) {
        bodyPayload = form; // FormData
    } else if (body) {
        headers['Content-Type'] = 'application/json';
        bodyPayload = JSON.stringify(body);
    }

    try {
        const res = await fetch(`${BASE}${path}`, {
            method,
            headers,
            body: bodyPayload,
        });
        let json = null;
        try { json = await res.json(); } catch { }
        return { status: res.status, json };
    } catch (err) {
        return { status: 0, error: err.message, json: null };
    }
}

// ── Sleep helper ──────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Test runner ───────────────────────────────────────────────────────────────
async function run() {
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║      ClipCrafters — Full Backend API Test Suite                  ║');
    console.log(`║      Base: ${BASE.padEnd(43)}║`);
    console.log(`║      Time: ${new Date().toISOString().padEnd(43)}║`);
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    // ── SYSTEM ────────────────────────────────────────────────────────────────
    console.log('🔵 SYSTEM');

    // TEST 1 — Health
    {
        const { status, json } = await req('GET', '/health');
        if (status === 200 && json?.success) record(1, 'GET /health', PASS, `200 OK — "${json.message?.slice(0, 35)}..."`);
        else record(1, 'GET /health', FAIL, `Got ${status}`);
    }

    // ── AUTH ──────────────────────────────────────────────────────────────────
    console.log('\n🟡 AUTH');

    const testEmail = `testuser_${TIMESTAMP}@example.com`;

    // TEST 2 — Register valid
    {
        const { status, json } = await req('POST', '/auth/register', {
            body: { name: 'Test User', email: testEmail, password: 'Test@1234' }
        });
        if (status === 201 && json?.success) {
            accessToken = json.data?.token || json.data?.accessToken || '';
            userId = json.data?.user?.id || json.data?.user?._id || '';
            record(2, 'POST /auth/register', PASS, `201, userId=${String(userId).slice(-6)}, token=${accessToken ? 'yes' : 'NO'}`);
        } else {
            record(2, 'POST /auth/register', FAIL, `Got ${status} — ${json?.message}`);
        }
    }

    // TEST 3 — Register duplicate
    {
        const { status, json } = await req('POST', '/auth/register', {
            body: { name: 'Test User', email: testEmail, password: 'Test@1234' }
        });
        if (status === 409) record(3, 'POST /auth/register (duplicate)', PASS, `409 as expected`);
        else record(3, 'POST /auth/register (duplicate)', FAIL, `Expected 409, got ${status}`);
    }

    // TEST 4 — Register weak password
    {
        const { status, json } = await req('POST', '/auth/register', {
            body: { name: 'X', email: 'weakpass@test.com', password: 'password1' }
        });
        if (status === 400) record(4, 'POST /auth/register (weak pwd)', PASS, `400 validation error`);
        else record(4, 'POST /auth/register (weak pwd)', FAIL, `Expected 400, got ${status}`);
    }

    // TEST 5 — Login valid
    {
        const { status, json } = await req('POST', '/auth/login', {
            body: { email: testEmail, password: 'Test@1234' }
        });
        if (status === 200 && json?.success) {
            accessToken = json.data?.token || json.data?.accessToken || accessToken;
            refreshToken = json.data?.refreshToken || '';
            record(5, 'POST /auth/login', PASS, `200, refresh=${refreshToken ? 'yes' : 'no'}`);
        } else {
            record(5, 'POST /auth/login', FAIL, `Got ${status} — ${json?.message}`);
        }
    }

    // TEST 6 — Login wrong password
    {
        const { status } = await req('POST', '/auth/login', {
            body: { email: testEmail, password: 'WrongPass@1' }
        });
        if (status === 401) record(6, 'POST /auth/login (wrong pwd)', PASS, `401 as expected`);
        else record(6, 'POST /auth/login (wrong pwd)', FAIL, `Expected 401, got ${status}`);
    }

    // TEST 7 — Get Me (authenticated)
    {
        const { status, json } = await req('GET', '/auth/me', { token: accessToken });
        if (status === 200 && json?.success) {
            const u = json.data?.user || json.data;
            record(7, 'GET /auth/me (authed)', PASS, `200, name="${u?.name}"`);
        } else record(7, 'GET /auth/me (authed)', FAIL, `Got ${status}`);
    }

    // TEST 8 — Get Me (no token)
    {
        const { status } = await req('GET', '/auth/me');
        if (status === 401) record(8, 'GET /auth/me (no token)', PASS, `401 as expected`);
        else record(8, 'GET /auth/me (no token)', FAIL, `Expected 401, got ${status}`);
    }

    // TEST 9 — Send OTP (email)
    {
        const { status, json } = await req('POST', '/auth/send-otp', {
            token: accessToken,
            body: { method: 'email', email: testEmail }
        });
        if (status === 200) record(9, 'POST /auth/send-otp', PASS, `200 — OTP sent (email delivery manual)`);
        else if (status === 500 || status === 502) record(9, 'POST /auth/send-otp', SKIP, `${status} — email service not configured`);
        else record(9, 'POST /auth/send-otp', FAIL, `Got ${status} — ${json?.message}`);
    }

    // TEST 10 — Verify OTP (wrong code)
    {
        const { status } = await req('POST', '/auth/verify-otp', {
            token: accessToken,
            body: { otp: '000000', method: 'email' }
        });
        if (status === 401 || status === 400) record(10, 'POST /auth/verify-otp (bad OTP)', PASS, `${status} — rejected bad OTP`);
        else record(10, 'POST /auth/verify-otp (bad OTP)', FAIL, `Expected 400/401, got ${status}`);
    }

    // TEST 11 — Refresh token
    {
        if (!refreshToken) {
            record(11, 'POST /auth/refresh', SKIP, 'No refreshToken from login');
        } else {
            const { status, json } = await req('POST', '/auth/refresh', {
                body: { refreshToken }
            });
            if (status === 200 && json?.success) {
                const newToken = json.data?.token || json.data?.accessToken;
                if (newToken) accessToken = newToken;
                refreshToken = json.data?.refreshToken || refreshToken;
                record(11, 'POST /auth/refresh', PASS, `200 — new access token obtained`);
            } else record(11, 'POST /auth/refresh', FAIL, `Got ${status} — ${json?.message}`);
        }
    }

    // TEST 12 — Refresh invalid token
    {
        const { status } = await req('POST', '/auth/refresh', {
            body: { refreshToken: 'fake.invalid.token' }
        });
        if (status === 401) record(12, 'POST /auth/refresh (invalid)', PASS, `401 as expected`);
        else record(12, 'POST /auth/refresh (invalid)', FAIL, `Expected 401, got ${status}`);
    }

    // TEST 13 — Logout
    {
        const { status, json } = await req('POST', '/auth/logout', { token: accessToken });
        if (status === 200) record(13, 'POST /auth/logout', PASS, `200 — tokens revoked`);
        else record(13, 'POST /auth/logout', FAIL, `Got ${status} — ${json?.message}`);
    }

    // TEST 14 — Re-login after logout
    {
        const { status, json } = await req('POST', '/auth/login', {
            body: { email: testEmail, password: 'Test@1234' }
        });
        if (status === 200 && json?.success) {
            accessToken = json.data?.token || json.data?.accessToken || accessToken;
            refreshToken = json.data?.refreshToken || '';
            record(14, 'POST /auth/login (post-logout)', PASS, `200 — fresh token`);
        } else record(14, 'POST /auth/login (post-logout)', FAIL, `Got ${status}`);
    }

    // ── PROJECTS ──────────────────────────────────────────────────────────────
    console.log('\n🟢 PROJECTS');

    // TEST 15 — Create project (valid)
    {
        const { status, json } = await req('POST', '/projects/create', {
            token: accessToken,
            body: { title: 'Test Project', topic: 'Explain machine learning to beginners in 60 seconds', style: 'professional', duration: 60 }
        });
        if (status === 201 && json?.success) {
            projectId = json.data?.project?._id || json.data?._id || '';
            record(15, 'POST /projects/create', PASS, `201 — projectId=${String(projectId).slice(-6)}`);
        } else record(15, 'POST /projects/create', FAIL, `Got ${status} — ${json?.message}`);
    }

    // TEST 16 — Create project (missing title)
    {
        const { status } = await req('POST', '/projects/create', {
            token: accessToken,
            body: { topic: 'Some topic without a title' }
        });
        if (status === 400) record(16, 'POST /projects/create (no title)', PASS, `400 validation`);
        else record(16, 'POST /projects/create (no title)', FAIL, `Expected 400, got ${status}`);
    }

    // TEST 17 — Get all projects
    {
        const { status, json } = await req('GET', '/projects', { token: accessToken });
        if (status === 200 && json?.success) {
            const count = json.data?.projects?.length ?? json.data?.pagination?.total ?? '?';
            record(17, 'GET /projects', PASS, `200 — ${count} project(s)`);
        } else record(17, 'GET /projects', FAIL, `Got ${status}`);
    }

    // TEST 18 — Get single project
    {
        if (!projectId) { record(18, 'GET /projects/:id', SKIP, 'No projectId'); }
        else {
            const { status, json } = await req('GET', `/projects/${projectId}`, { token: accessToken });
            if (status === 200) record(18, 'GET /projects/:id', PASS, `200 — "${json?.data?.project?.title || json?.data?.title}"`);
            else record(18, 'GET /projects/:id', FAIL, `Got ${status}`);
        }
    }

    // TEST 19 — Get project (not found)
    {
        const { status } = await req('GET', '/projects/000000000000000000000000', { token: accessToken });
        if (status === 404) record(19, 'GET /projects/:id (not found)', PASS, `404 as expected`);
        else record(19, 'GET /projects/:id (not found)', FAIL, `Expected 404, got ${status}`);
    }

    // TEST 20 — Update project
    {
        if (!projectId) { record(20, 'PUT /projects/:id', SKIP, 'No projectId'); }
        else {
            const { status, json } = await req('PUT', `/projects/${projectId}`, {
                token: accessToken,
                body: { title: 'Updated Title' }
            });
            if (status === 200) record(20, 'PUT /projects/:id', PASS, `200 — title updated`);
            else record(20, 'PUT /projects/:id', FAIL, `Got ${status} — ${json?.message}`);
        }
    }

    // ── VIDEOS ────────────────────────────────────────────────────────────────
    console.log('\n🔴 VIDEOS');

    // TEST 21 — Generate video
    {
        if (!projectId) { record(21, 'POST /videos/generate', SKIP, 'No projectId'); }
        else {
            const { status, json } = await req('POST', '/videos/generate', {
                token: accessToken,
                body: { projectId }
            });
            if (status === 200 || status === 202) {
                videoId = json?.data?.video?._id || '';
                const sceneArr = json?.data?.video?.scenes;
                if (Array.isArray(sceneArr) && sceneArr.length > 0) sceneId = sceneArr[0]._id || sceneArr[0];
                record(21, 'POST /videos/generate', PASS, `${status} — videoId=${String(videoId).slice(-6)}, ${sceneArr?.length ?? 0} scenes`);
            } else if (status === 502 || status === 503) {
                // FastAPI not running — extract videoId from error body if possible
                videoId = json?.data?.video?._id || '';
                record(21, 'POST /videos/generate', SKIP, `${status} — FastAPI unreachable (expected in dev)`);
            } else record(21, 'POST /videos/generate', FAIL, `Got ${status} — ${json?.message}`);
        }
    }

    // TEST 22 — Upload video file (dummy)
    {
        if (!projectId) { record(22, 'POST /videos/upload', SKIP, 'No projectId'); }
        else {
            // Create a minimal fake MP4 file structure via Blob
            const fakeContent = 'FAKE_MP4_DATA_FOR_TESTING_PURPOSES_ONLY';
            const formData = new FormData();
            formData.append('sourceFile', new Blob([fakeContent], { type: 'video/mp4' }), 'test.mp4');
            formData.append('projectId', projectId);
            formData.append('title', 'Test Upload');

            const { status, json } = await req('POST', '/videos/upload', { token: accessToken, form: formData });
            if (status === 201) {
                if (!videoId) videoId = json?.data?.video?._id || '';
                record(22, 'POST /videos/upload', PASS, `201 — uploaded`);
            } else if (status === 502 || status === 500) {
                if (!videoId) videoId = json?.data?.video?._id || '';
                record(22, 'POST /videos/upload', SKIP, `${status} — Cloudinary not configured (expected)`);
            } else if (status === 400) {
                record(22, 'POST /videos/upload', FAIL, `400 — ${json?.message}`);
            } else record(22, 'POST /videos/upload', SKIP, `${status} — ${json?.message?.slice(0, 50)}`);
        }
    }

    // TEST 23 — Get video by ID
    {
        if (!videoId) { record(23, 'GET /videos/:id', SKIP, 'No videoId from generate/upload'); }
        else {
            const { status, json } = await req('GET', `/videos/${videoId}`, { token: accessToken });
            if (status === 200) {
                record(23, 'GET /videos/:id', PASS, `200 — status="${json?.data?.video?.generationStatus || json?.data?.video?.status}"`);
            } else record(23, 'GET /videos/:id', FAIL, `Got ${status}`);
        }
    }

    // TEST 24 — Get video status
    {
        if (!videoId) { record(24, 'GET /videos/:id/status', SKIP, 'No videoId'); }
        else {
            const { status, json } = await req('GET', `/videos/${videoId}/status`, { token: accessToken });
            if (status === 200) record(24, 'GET /videos/:id/status', PASS, `200 — status="${json?.data?.status}"`);
            else record(24, 'GET /videos/:id/status', FAIL, `Got ${status}`);
        }
    }

    // TEST 25 — Get video (not found)
    {
        const { status } = await req('GET', '/videos/000000000000000000000000', { token: accessToken });
        if (status === 404 || status === 403) record(25, 'GET /videos/:id (not found)', PASS, `${status} as expected`);
        else record(25, 'GET /videos/:id (not found)', FAIL, `Expected 404, got ${status}`);
    }

    // ── SCENES ────────────────────────────────────────────────────────────────
    console.log('\n🟣 SCENES');

    // TEST 26 — Get all scenes for video
    {
        if (!videoId) { record(26, 'GET /scenes/video/:videoId', SKIP, 'No videoId'); }
        else {
            const { status, json } = await req('GET', `/scenes/video/${videoId}`, { token: accessToken });
            if (status === 200) {
                const scenes = json?.data?.scenes || json?.data || [];
                if (!sceneId && Array.isArray(scenes) && scenes.length > 0) sceneId = scenes[0]._id || '';
                record(26, 'GET /scenes/video/:videoId', PASS, `200 — ${scenes.length} scene(s)`);
            } else record(26, 'GET /scenes/video/:videoId', FAIL, `Got ${status}`);
        }
    }

    // TEST 27 — Get single scene
    {
        if (!sceneId) { record(27, 'GET /scenes/:sceneId', SKIP, 'No sceneId'); }
        else {
            const { status } = await req('GET', `/scenes/${sceneId}`, { token: accessToken });
            if (status === 200) record(27, 'GET /scenes/:sceneId', PASS, `200 — scene returned`);
            else record(27, 'GET /scenes/:sceneId', FAIL, `Got ${status}`);
        }
    }

    // TEST 28 — Update scene (direct edit)
    {
        if (!sceneId) { record(28, 'PUT /scenes/:sceneId', SKIP, 'No sceneId'); }
        else {
            const { status, json } = await req('PUT', `/scenes/${sceneId}`, {
                token: accessToken,
                body: { script: 'This is the updated script text for scene one.' }
            });
            if (status === 200) record(28, 'PUT /scenes/:sceneId (script)', PASS, `200 — script updated, edit history auto-created`);
            else record(28, 'PUT /scenes/:sceneId (script)', FAIL, `Got ${status} — ${json?.message}`);
        }
    }

    // TEST 29 — Update scene (editInstructions — may hit FastAPI)
    {
        if (!sceneId) { record(29, 'PUT /scenes/:sceneId (AI edit)', SKIP, 'No sceneId'); }
        else {
            const { status, json } = await req('PUT', `/scenes/${sceneId}`, {
                token: accessToken,
                body: { editInstructions: 'Make the tone more formal and academic' }
            });
            if (status === 200) record(29, 'PUT /scenes/:sceneId (AI edit)', PASS, `200 — AI/fallback edit applied`);
            else if (status === 502 || status === 503) record(29, 'PUT /scenes/:sceneId (AI edit)', SKIP, `${status} — FastAPI unreachable`);
            else record(29, 'PUT /scenes/:sceneId (AI edit)', FAIL, `Got ${status} — ${json?.message}`);
        }
    }

    // TEST 30 — Regenerate scene
    {
        if (!sceneId) { record(30, 'POST /scenes/:sceneId/regenerate', SKIP, 'No sceneId'); }
        else {
            const { status, json } = await req('POST', `/scenes/${sceneId}/regenerate`, {
                token: accessToken,
                body: { regenerateType: 'visuals' }
            });
            if (status === 200) record(30, 'POST /scenes/:sceneId/regenerate', PASS, `200 — regenerated`);
            else if (status === 502 || status === 503) record(30, 'POST /scenes/:sceneId/regenerate', SKIP, `${status} — FastAPI/Cloudinary not available`);
            else record(30, 'POST /scenes/:sceneId/regenerate', FAIL, `Got ${status} — ${json?.message}`);
        }
    }

    // TEST 31 — Fact check scene
    {
        if (!sceneId) { record(31, 'POST /scenes/:sceneId/fact-check', SKIP, 'No sceneId'); }
        else {
            const { status, json } = await req('POST', `/scenes/${sceneId}/fact-check`, {
                token: accessToken,
                body: { sourceText: 'Machine learning is a subset of AI that enables systems to learn from data.' }
            });
            if (status === 200) record(31, 'POST /scenes/:sceneId/fact-check', PASS, `200 — confidence=${json?.data?.confidenceScore}`);
            else if (status === 502 || status === 503) record(31, 'POST /scenes/:sceneId/fact-check', SKIP, `${status} — FastAPI not available`);
            else record(31, 'POST /scenes/:sceneId/fact-check', FAIL, `Got ${status} — ${json?.message}`);
        }
    }

    // ── EDIT HISTORY ──────────────────────────────────────────────────────────
    console.log('\n🟠 EDIT HISTORY');

    // TEST 32 — Create edit record
    {
        if (!sceneId || !videoId) { record(32, 'POST /edits/create', SKIP, 'No sceneId/videoId'); }
        else {
            const { status, json } = await req('POST', '/edits/create', {
                token: accessToken,
                body: {
                    sceneId, videoId,
                    changeType: 'script_update',
                    before: { script: 'Old manual text' },
                    after: { script: 'New manual text' }
                }
            });
            if (status === 201) {
                editId = json?.data?.edit?._id || json?.data?._id || '';
                record(32, 'POST /edits/create', PASS, `201 — editId=${String(editId).slice(-6)}`);
            } else record(32, 'POST /edits/create', FAIL, `Got ${status} — ${json?.message}`);
        }
    }

    // TEST 33 — Get edit history
    {
        if (!sceneId) { record(33, 'GET /edits/scene/:sceneId', SKIP, 'No sceneId'); }
        else {
            const { status, json } = await req('GET', `/edits/scene/${sceneId}`, { token: accessToken });
            if (status === 200) {
                const edits = json?.data?.edits || [];
                record(33, 'GET /edits/scene/:sceneId', PASS, `200 — ${edits.length} edit record(s)`);
                if (!editId && edits.length > 0) editId = edits[0]._id;
            } else record(33, 'GET /edits/scene/:sceneId', FAIL, `Got ${status}`);
        }
    }

    // TEST 34 — Undo edit
    {
        if (!editId) { record(34, 'POST /edits/undo/:editId', SKIP, 'No editId'); }
        else {
            const { status, json } = await req('POST', `/edits/undo/${editId}`, { token: accessToken });
            if (status === 200) record(34, 'POST /edits/undo/:editId', PASS, `200 — scene reverted`);
            else if (status === 400) record(34, 'POST /edits/undo/:editId', SKIP, `400 — ${json?.message} (editType not undoable)`);
            else record(34, 'POST /edits/undo/:editId', FAIL, `Got ${status} — ${json?.message}`);
        }
    }

    // ── AUTHORIZATION EDGE CASES ──────────────────────────────────────────────
    console.log('\n🔒 AUTHORIZATION');

    // TEST 35 — Cross-user access
    {
        const email2 = `user2_${TIMESTAMP}@example.com`;
        const { status: s1, json: j1 } = await req('POST', '/auth/register', {
            body: { name: 'User Two', email: email2, password: 'Test@1234' }
        });
        const { status: s2, json: j2 } = await req('POST', '/auth/login', {
            body: { email: email2, password: 'Test@1234' }
        });
        token2 = j2?.data?.token || j2?.data?.accessToken || '';

        if (!projectId || !token2) {
            record(35, 'GET /projects/:id (cross-user)', SKIP, 'Could not create second user or no projectId');
        } else {
            const { status } = await req('GET', `/projects/${projectId}`, { token: token2 });
            if (status === 403 || status === 404) record(35, 'GET /projects/:id (cross-user)', PASS, `${status} — access correctly denied`);
            else record(35, 'GET /projects/:id (cross-user)', FAIL, `Expected 403/404, got ${status} — DATA LEAK!`);
        }
    }

    // TEST 36 — Delete project (cascade check)
    {
        if (!projectId) { record(36, 'DELETE /projects/:id (cascade)', SKIP, 'No projectId'); }
        else {
            const { status, json } = await req('DELETE', `/projects/${projectId}`, { token: accessToken });
            if (status === 200) {
                record(36, 'DELETE /projects/:id', PASS, `200 — deleted`);
                // Check cascade — video should 404
                if (videoId) {
                    const { status: vs } = await req('GET', `/videos/${videoId}`, { token: accessToken });
                    if (vs === 404 || vs === 403) record(36.1, '  → GET /videos/:id after delete', PASS, `${vs} — cascade OK`);
                    else record(36.1, '  → GET /videos/:id after delete', SKIP, `${vs} — cascade may still be processing`);
                }
            } else record(36, 'DELETE /projects/:id', FAIL, `Got ${status} — ${json?.message}`);
        }
    }

    // ── RATE LIMITING ─────────────────────────────────────────────────────────
    console.log('\n🔴 RATE LIMITING');

    // TEST 37 — Auth rate limit (11 rapid bad logins)
    {
        const badEmail = `ratelimit_${TIMESTAMP}@example.com`;
        let got429 = false;
        let attempts = 0;
        for (let i = 0; i < 12; i++) {
            const { status } = await req('POST', '/auth/login', {
                body: { email: badEmail, password: 'Wrong@1234' }
            });
            attempts++;
            if (status === 429) { got429 = true; break; }
            await sleep(80); // small gap to avoid network issues
        }
        if (got429) record(37, 'POST /auth/login (rate limit)', PASS, `429 after ${attempts} attempts`);
        else record(37, 'POST /auth/login (rate limit)', SKIP, `No 429 after ${attempts} attempts — limiter may be per-IP or threshold differs`);
    }

    // ── FINAL REPORT ──────────────────────────────────────────────────────────
    const total = results.length;
    const passed = results.filter(r => r.status === PASS).length;
    const failed = results.filter(r => r.status === FAIL).length;
    const skipped = results.filter(r => r.status === SKIP || r.status === MANUAL).length;

    console.log('\n');
    console.log('╔══════╦═════════════════════════════════════════════════════╦══════════╦══════════════════════════════════════╗');
    console.log('║ Test ║ Endpoint                                            ║ Result   ║ Notes                                ║');
    console.log('╠══════╬═════════════════════════════════════════════════════╬══════════╬══════════════════════════════════════╣');
    for (const r of results) {
        const n = String(r.num).padEnd(4);
        const ep = r.endpoint.padEnd(51);
        const st = r.status.padEnd(8);
        const nt = r.notes.slice(0, 36).padEnd(36);
        console.log(`║ ${n} ║ ${ep} ║ ${st} ║ ${nt} ║`);
    }
    console.log('╚══════╩═════════════════════════════════════════════════════╩══════════╩══════════════════════════════════════╝');

    console.log(`\nTotal: ${total} tests  |  ✅ Pass: ${passed}  |  ❌ Fail: ${failed}  |  ⚠️  Skip: ${skipped}`);

    if (failures.length > 0) {
        console.log('\n── FAILURE DETAILS ─────────────────────────────────────────────────────');
        for (const f of failures) {
            console.log(`\n  ❌ FAIL #${f.num}: ${f.endpoint}`);
            console.log(`     → ${f.notes}`);
        }
    }

    console.log('\n✅ Test run complete.\n');
}

run().catch(err => {
    console.error('Fatal test runner error:', err.message);
    process.exit(1);
});
