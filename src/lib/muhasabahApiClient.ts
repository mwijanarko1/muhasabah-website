type FetchImpl = typeof fetch;

type FetchMuhasabahApiOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | null;
  fetchImpl?: FetchImpl;
  getIdToken: () => Promise<string | null>;
  json?: unknown;
};

type ApiPayload<T> =
  | { data: T }
  | { error: { code: string; message: string } };

export async function fetchMuhasabahApi<T>(
  path: string,
  options: FetchMuhasabahApiOptions,
): Promise<T> {
  const { fetchImpl = fetch, getIdToken, headers, json, body, ...init } = options;
  const token = await getIdToken();

  if (!token) {
    throw new Error("Sign in before syncing your journal.");
  }

  const response = await fetchImpl(path, {
    ...init,
    body: json === undefined ? body : JSON.stringify(json),
    headers: {
      Accept: "application/json",
      ...(json === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
      Authorization: `Bearer ${token}`,
    },
  });

  const payload = (await response.json()) as ApiPayload<T>;
  if (!response.ok) {
    if ("error" in payload) throw new Error(payload.error.message);
    throw new Error("The journal could not sync. Try again.");
  }

  if (!("data" in payload)) {
    throw new Error("The journal could not sync. Try again.");
  }

  return payload.data;
}
