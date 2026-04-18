import { ApiError, dataResponse, errorResponse, requireFirebaseUser } from "@/lib/firebase/serverAuth";
import { listRecent } from "@/lib/muhasabahRepository";

export const runtime = "nodejs";

function parseLimit(request: Request): number {
  const url = new URL(request.url);
  const raw = Number(url.searchParams.get("limit") ?? 30);
  if (!Number.isFinite(raw)) return 30;
  return Math.min(100, Math.max(1, Math.floor(raw)));
}

export async function GET(request: Request) {
  try {
    const user = await requireFirebaseUser(request);
    return dataResponse(await listRecent(user.uid, parseLimit(request)));
  } catch (error) {
    return errorResponse(
      error instanceof ApiError ? error : new ApiError(500, "INTERNAL_SERVER_ERROR", "Something went wrong."),
    );
  }
}
