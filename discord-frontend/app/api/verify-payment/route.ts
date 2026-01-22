import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    console.log("Verifying payment for userId:", userId);
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    await db.profile.update({
      where: { userId },
      data: { isPremium: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
