import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getPermissions } from "@/lib/business/permissions";
import { getUserSubscription } from "@/lib/business/get-user-subscription";

const FEATURES = ["share", "export-pdf"] as const;
type Feature = (typeof FEATURES)[number];

const PERMISSION_MAP: Record<Feature, "canShare" | "canExportPdf"> = {
  share: "canShare",
  "export-pdf": "canExportPdf",
};

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 },
      );
    }

    const feature = request.nextUrl.searchParams.get("feature") as Feature | null;

    if (!feature || !FEATURES.includes(feature)) {
      return NextResponse.json(
        { error: "INVALID_FEATURE", message: "Specify a valid feature param: share or export-pdf." },
        { status: 400 },
      );
    }

    const subscription = await getUserSubscription();
    const permissions = getPermissions(subscription);
    const allowed = permissions[PERMISSION_MAP[feature]];

    if (!allowed) {
      return NextResponse.json(
        {
          error: "PRO_FEATURE_REQUIRED",
          message: "Upgrade to Pro to use this feature.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({ allowed: true });
  } catch (error) {
    console.error("validate-pro-feature error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
