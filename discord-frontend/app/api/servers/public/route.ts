import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { hobby, userId, searchQuery } = await req.json();
    const profile = await currentProfile();
    if (!profile) return new NextResponse("Unauthorized", { status: 401 });

    // Build where clause dynamically
    const whereClause: any = {
      isPublic: true,
      NOT: {
        OR: [
          { profile: { userId } },
          { members: { some: { profileId: profile.id } } },
        ],
      },
    };

    // Add hobby filter if provided
    if (hobby && hobby.length > 0) {
      whereClause.hobby = { in: hobby };
    }

    // Add search query filter if provided
    if (searchQuery && searchQuery.trim()) {
      whereClause.name = {
        contains: searchQuery.trim(),
      };
    }

    const servers = await db.server.findMany({
      where: whereClause,
      include: {
        profile: true,
        members: {
          select: { profileId: true },
        },
      },
      take: 20, // Limit results
    });

    return NextResponse.json(servers);
  } catch (err) {
    console.error("Error fetching public servers:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
