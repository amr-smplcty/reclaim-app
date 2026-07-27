// Edge Function: delete-account
//
// Closes BACKLOG #40 — the one deletion step an anon-key client structurally
// cannot do: removing the caller's own `auth.users` row (Supabase only permits
// that with a service-role key, which must never ship in the app).
//
// Flow:
//   1. Authenticate the caller from the JWT the app forwards
//      (supabase.functions.invoke sends the current session's access token as
//      the Authorization header; verify_jwt is on by default, so an
//      unauthenticated call is rejected before this code even runs).
//   2. Delete the caller's rows in every app table (defense-in-depth: the
//      FK ON DELETE CASCADE to auth.users would remove them anyway, but we
//      delete explicitly so a future table that forgets the cascade still
//      gets cleaned).
//   3. Delete the auth.users row itself via the service-role admin API.
//
// Security: the service-role key is read from SUPABASE_SERVICE_ROLE_KEY, which
// Supabase auto-injects into the function's server-side environment. It is
// never present in the client bundle or in .env — the whole reason this lives
// server-side.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  // CORS preflight (harmless for the RN client; correct for any web caller).
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    // Misconfiguration (a secret missing) — never leak which one.
    console.error('delete-account: missing required environment configuration');
    return json({ error: 'Server is not configured for account deletion.' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Not authenticated.' }, 401);
  }

  // 1. Identify the caller from their own JWT (anon client + forwarded token).
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: userData, error: userError } = await callerClient.auth.getUser();
  const user = userData?.user;
  if (userError || !user) {
    return json({ error: 'Not authenticated.' }, 401);
  }

  // 2 & 3 run with the service role — the only key that can delete an auth user.
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 2. Delete the caller's rows in every app table, scoped to their own id.
  const userTables = ['legal_acceptances', 'assessment_history'];
  for (const table of userTables) {
    const { error } = await admin.from(table).delete().eq('user_id', user.id);
    if (error) {
      console.error(`delete-account: failed deleting from ${table}:`, error.message);
      return json({ error: 'Could not delete your data. Please try again.' }, 500);
    }
  }

  // 3. Delete the auth user itself — the step the client can never do.
  const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteUserError) {
    console.error('delete-account: failed deleting auth user:', deleteUserError.message);
    return json({ error: 'Could not delete your account. Please try again.' }, 500);
  }

  return json({ success: true }, 200);
});
