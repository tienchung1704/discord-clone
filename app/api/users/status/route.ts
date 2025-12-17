import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const profile = await currentProfile();
    
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json({ status: profile.status });
  } catch (error) {
    console.error("[USER_STATUS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const profile = await currentProfile();
    
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await req.json();

    if (!["ONLINE", "IDLE", "DND", "OFFLINE"].includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    const updatedProfile = await db.profile.update({
      where: { id: profile.id },
      data: { 
        status,
        lastSeen: new Date(),
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("[USER_STATUS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
