import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const { name, imageUrl, hobbyServer, isPublic } = await req.json();
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const server = await db.server.create({
      data: {
        profileId: profile.id,
        name: name,
        imageUrl,
        inviteCode: uuidv4(),
        isPublic: isPublic ?? false,
        hobby: hobbyServer,
        channels: {
          create: [{ name: "general", profileId: profile.id }],
        },
        members: {
          create: [
            {
              profileId: profile.id,
              role: "ADMIN", 
            },
          ]
        },
      },
    });
    return NextResponse.json(server, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/servers:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Server ID is required" }, { status: 400 });
    }

    const server = await db.server.findUnique({
      where: { id },
      include: {
        members: {
          include: { profile: true },
          orderBy: { role: "asc" },
        },
        channels: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    return NextResponse.json(server);
  } catch (err) {
    console.error("Error fetching server:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}