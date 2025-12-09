export async function apiRequestWrapper<T>({
  url,
  body,
  options = {},
}: {
  url: string;
  body?: object;
  options?: RequestInit;
}): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }

  return response.json();
}
