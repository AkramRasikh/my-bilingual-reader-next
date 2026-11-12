export async function POST(req: Request) {
  const body = (await req.json()) as { language: string };

  const url = process.env.NEXT_PUBLIC_GET_RULE_CATALOG_URL as string;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: body.language }),
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: response.status,
  });
}
