export async function POST(req: Request) {
  const body = await req.json();
  const url =
    process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + '/update-sentence-review';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: response.status,
  });
}
