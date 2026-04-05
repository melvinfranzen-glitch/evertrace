import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { memorial_id, password } = await req.json();

    if (!memorial_id || !password) {
      return Response.json({ valid: false, error: 'Fehlende Parameter' }, { status: 400 });
    }

    const memorial = await base44.asServiceRole.entities.Memorial.get(memorial_id);
    if (!memorial) {
      return Response.json({ valid: false, error: 'Nicht gefunden' }, { status: 404 });
    }

    const storedPw = (memorial.family_password || '').trim();
    const inputPw = password.trim();
    const valid = storedPw.length > 0 && inputPw === storedPw;

    return Response.json({ valid });
  } catch (error) {
    return Response.json({ valid: false, error: error.message }, { status: 500 });
  }
});