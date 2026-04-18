import type { DecodedIdToken } from "firebase-admin/auth";
import { getFirebaseAdminAuth } from "./admin";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function requireFirebaseUser(request: Request): Promise<DecodedIdToken> {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new ApiError(401, "UNAUTHENTICATED", "Sign in before syncing your journal.");
  }

  try {
    return await getFirebaseAdminAuth().verifyIdToken(match[1]);
  } catch {
    throw new ApiError(401, "UNAUTHENTICATED", "Your session expired. Sign in again.");
  }
}

export function dataResponse<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ data }, init);
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  console.error("Unhandled API error:", error);
  return Response.json(
    { error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong." } },
    { status: 500 },
  );
}
