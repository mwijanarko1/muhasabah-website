import { z } from "zod";
import { ApiError, dataResponse, errorResponse, requireFirebaseUser } from "@/lib/firebase/serverAuth";
import { listRecent } from "@/lib/muhasabahRepository";

export const runtime = "nodejs";

const recentQueryParamKeys = new Set(["limit"]);
const recentLimitSchema = z.coerce.number().int().min(1).max(100).default(30);

function parseLimit(request: Request): number {
  const url = new URL(request.url);
  for (const key of url.searchParams.keys()) {
    if (!recentQueryParamKeys.has(key)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Use only supported query parameters.");
    }
  }

  const limit = url.searchParams.get("limit");
  const parsed = recentLimitSchema.safeParse(limit ?? undefined);
  if (!parsed.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Use a limit from 1 to 100.");
  }
  return parsed.data;
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
