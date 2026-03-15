// AdminGetUsers/index.js
// Returns all profiles using the Supabase service role key (bypasses RLS)
// Only callable by verified admin emails

const https = require('https');

const SUPABASE_URL    = process.env.SUPABASE_URL    || 'https://quknseohpwzlbbisgfpi.supabase.co';
const SERVICE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ADMIN_EMAILS    = ['arunimpandey2903@hotmail.com', 'demo@arunimitcaffe.com'];

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-email',
  };
}

function supabaseGet(path, serviceKey) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

module.exports = async function (context, req) {
  context.res = { headers: corsHeaders() };

  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }

  // Verify caller is an admin (by email header)
  const callerEmail = (req.headers['x-admin-email'] || '').toLowerCase().trim();
  if (!ADMIN_EMAILS.includes(callerEmail)) {
    context.res.status = 403;
    context.res.body = { error: 'Forbidden: not an admin' };
    return;
  }

  if (!SERVICE_KEY) {
    context.res.status = 500;
    context.res.body = {
      error: 'SUPABASE_SERVICE_ROLE_KEY not configured',
      hint: 'Add SUPABASE_SERVICE_ROLE_KEY to Azure Function App Settings (or local.settings.json)',
    };
    return;
  }

  try {
    // Fetch all profiles — service role key bypasses RLS completely
    const result = await supabaseGet(
      '/rest/v1/profiles?select=*&order=created_at.desc',
      SERVICE_KEY
    );

    if (result.status !== 200) {
      context.res.status = result.status;
      context.res.body = { error: 'Supabase error', detail: result.body };
      return;
    }

    context.res.status = 200;
    context.res.body = { users: result.body, count: result.body.length };
  } catch (err) {
    context.res.status = 500;
    context.res.body = { error: err.message };
  }
};
