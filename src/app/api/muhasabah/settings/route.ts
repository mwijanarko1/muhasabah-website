import { z } from "zod";
import { ApiError, dataResponse, errorResponse, requireFirebaseUser } from "@/lib/firebase/serverAuth";
import { getUserSettings, upsertUserSettings } from "@/lib/muhasabahRepository";
import { userSettingsPayloadSchema } from "@/lib/muhasabahValidation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireFirebaseUser(request);
    return dataResponse(await getUserSettings(user.uid));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireFirebaseUser(request);
    const payload = userSettingsPayloadSchema.parse(await request.json());
    return dataResponse(await upsertUserSettings(user.uid, payload.ianaTimezone));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(new ApiError(422, "VALIDATION_ERROR", "Use a valid time zone."));
    }
    return errorResponse(error);
  }
}
