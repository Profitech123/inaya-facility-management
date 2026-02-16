import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { prompt } = await req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await base44.integrations.Core.GenerateImage({ prompt });
    
    return Response.json({ url: result.url });
  } catch (error) {
    console.error('Image generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});