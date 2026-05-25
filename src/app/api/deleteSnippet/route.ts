export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_DELETE_SNIPPET_URL;
  if (!url) {
    return new Response(
      JSON.stringify({ error: 'DELETE_SNIPPET_URL is not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: {
    language?: string;
    contentId?: string;
    snippetId?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { language, contentId, snippetId } = body;
  if (!language || !contentId || !snippetId) {
    return new Response(
      JSON.stringify({
        error: 'Missing required fields: language, contentId, snippetId',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data: unknown = {};
    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: response.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete snippet failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
