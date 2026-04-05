import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { short_id, password } = await req.json();

    if (!short_id || !password) {
      return Response.json({ valid: false, error: 'Fehlende Parameter' }, { status: 400 });
    }

    // Fetch memorial server-side — password never sent to client
    const memorials = await base44.asServiceRole.entities.Memorial.filter({ short_id });
    if (!memorials.length) {
      return Response.json({ valid: false, error: 'Nicht gefunden' }, { status: 404 });
    }

    const memorial = memorials[0];
    if (!memorial.is_private) {
      return Response.json({ valid: true });
    }

    const storedPw = (memorial.access_password || '').trim();
    const inputPw = password.trim();
    const valid = storedPw.length > 0 && inputPw === storedPw;

    return Response.json({ valid });
  } catch (error) {
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
});