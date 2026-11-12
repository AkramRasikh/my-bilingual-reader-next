// Reads the enabled breakdown rules from RTDB `${language}/settings`
// via the existing getOnLoadData function.
export async function POST(req: Request) {
  const body = (await req.json()) as { language: string };

  const url = process.env.NEXT_PUBLIC_GET_ON_ALL_LOAD_URL as string;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: body.language, refs: ['settings'] }),
  });

  if (!response.ok) {
    return new Response(await response.text(), { status: response.status });
  }

  const [settingsData] = (await response.json()) as [
    { settings?: { breakdownRules?: string[] } },
  ];

  return new Response(
    JSON.stringify({
      breakdownRules: settingsData?.settings?.breakdownRules ?? [],
    }),
    { headers: { 'Content-Type': 'application/json' }, status: 200 },
  );
}
