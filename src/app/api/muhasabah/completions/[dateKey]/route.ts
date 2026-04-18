import { ApiError, dataResponse, errorResponse, requireFirebaseUser } from "@/lib/firebase/serverAuth";
import { hasCompletedSessionForDate, markSessionComplete } from "@/lib/muhasabahRepository";
import { isValidDateKey } from "@/lib/muhasabahScoring";

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
    return dataResponse(await hasCompletedSessionForDate(user.uid, dateKey));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await requireFirebaseUser(request);
    const dateKey = await getDateKey(context);
    return dataResponse(await markSessionComplete(user.uid, dateKey));
  } catch (error) {
    return errorResponse(error);
  }
}
