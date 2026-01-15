import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Profile } from "@/lib/generated/prisma";

export async function GET(req: Request) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        let profiles: Profile[] = [];

        if (query) {
            profiles = await db.profile.findMany({
                where: {
                    AND: [
                        { id: { not: profile.id } },
                        {
                            OR: [
                                { name: { contains: query } },
                            ]
                        }
                    ]
                },
                take: 10
            });
        } else {
        }

        return NextResponse.json(profiles);

    } catch (error) {
        console.log("[PROFILES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
