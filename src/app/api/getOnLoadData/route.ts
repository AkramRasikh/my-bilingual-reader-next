import { readJsonFromFile, saveJsonToFile } from '@/utils/setup-mock-data';
import { NextResponse } from 'next/server';
import { getFormattedData } from './on-load-data-formatted';

export async function POST(req: Request) {
  const body = await req.json();
  const { refs, language } = body;

  const isMockEnv = process.env.NEXT_PUBLIC_IS_MOCK;

  if (isMockEnv) {
    return NextResponse.json(await readJsonFromFile(), { status: 200 });
  }

  const url = process.env.NEXT_PUBLIC_GET_ON_ALL_LOAD_URL as string;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language,
        refs,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    const [jsonData] = await response.json(); // not sure why it is an array
    const data = getFormattedData(jsonData);
    await saveJsonToFile(data);

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Error getOnLoadData:', err);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
