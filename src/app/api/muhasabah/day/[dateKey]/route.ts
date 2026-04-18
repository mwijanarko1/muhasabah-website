import { z } from "zod";
import { ApiError, dataResponse, errorResponse, requireFirebaseUser } from "@/lib/firebase/serverAuth";
import { getDay, upsertDay } from "@/lib/muhasabahRepository";
import { isValidDateKey } from "@/lib/muhasabahScoring";
import type { MuhasabahEntryInput } from "@/lib/muhasabahTypes";
import { parseEntryPayload } from "@/lib/muhasabahValidation";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ dateKey: string }>;
};

async function getDateKey(context: RouteContext): Promise<string> {
  const { dateKey } = await context.params;
  if (!isValidDateKey(dateKey)) {
    throw new ApiError(400, "INVALID_DATE_KEY", "Use a valid YYYY-MM-DD date.");
  }
  return dateKey;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireFirebaseUser(request);
    const dateKey = await getDateKey(context);
    return dataResponse(await getDay(user.uid, dateKey));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await requireFirebaseUser(request);
    const dateKey = await getDateKey(context);
    let entry: MuhasabahEntryInput;
    try {
      entry = parseEntryPayload(dateKey, await request.json());
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(new ApiError(422, "VALIDATION_ERROR", "Check your journal scores."));
      }
      if (error instanceof Error && error.message !== "Unexpected end of JSON input") {
        return errorResponse(new ApiError(422, "VALIDATION_ERROR", error.message));
      }
      throw error;
    }
    return dataResponse(await upsertDay(user.uid, entry));
  } catch (error) {
    return errorResponse(error);
  }
}
