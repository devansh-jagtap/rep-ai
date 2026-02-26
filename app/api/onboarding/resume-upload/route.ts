import { NextResponse } from "next/server";
import { getSession } from "@/auth";
import { getUploadUrl } from "@/lib/storage/s3";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("fileName");
  const mimeType = searchParams.get("mimeType");

  if (!fileName || !mimeType) {
    return NextResponse.json({ error: "Missing fileName or mimeType" }, { status: 400 });
  }

  const allowedMimeTypes = ["application/pdf"];
  if (!allowedMimeTypes.includes(mimeType)) {
    return NextResponse.json({ error: "Invalid file type. Only PDF allowed." }, { status: 400 });
  }

  try {
    const { uploadUrl, key, publicUrl } = await getUploadUrl(
      fileName,
      mimeType,
      `onboarding-${session.user.id}`
    );

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl,
    });
  } catch (error) {
    console.error("Failed to generate upload URL:", error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
