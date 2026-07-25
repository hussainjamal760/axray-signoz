const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export const apiClient = async <T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { body, ...rest } = options;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.error?.message ||
      errorData?.message ||
      `API error: ${response.status} ${response.statusText}`;
    const error: any = new Error(message);
    error.status = response.status;
    error.code = errorData?.error?.code || errorData?.code;
    throw error;
  }

  return response.json() as Promise<T>;
};

export { BASE_URL };
