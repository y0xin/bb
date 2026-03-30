export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

export async function fetchFromStrapi(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`Strapi error: ${res.statusText}`);
  return res.json();
}
