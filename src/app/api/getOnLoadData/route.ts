import { getFormattedData } from '@/app/get-on-load-data';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json();

  console.log('## getOnLoadData 1', body);

  const url = process.env.NEXT_PUBLIC_GET_ON_ALL_LOAD_URL as string;
  try {
    console.log('## getOnLoadData 2');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json', //<----
        'Content-Type': 'application/json', //<---
      },
      body: JSON.stringify({
        language: 'japanese',
        refs: JSON.stringify(body),
      }),
    });
    console.log('## getOnLoadData 3');

    if (!response.ok) {
      console.log('## getOnLoadData 4');
      return NextResponse.json({ exists: false }, { status: 200 });
    }
    console.log('## getOnLoadData 5');

    const jsonData = await response.json();
    console.log('## getOnLoadData 6');
    const data = getFormattedData(jsonData);
    console.log('## getOnLoadData 7');

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Error getOnLoadData:', err);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
