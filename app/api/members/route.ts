import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const MEMBERS_BATCH = 20;

// Optimized select clause for members - only fetch required fields
const memberSelect = {
    id: true,
    role: true,
    profileId: true,
    serverId: true,
    profile: {
        select: {
            id: true,
            name: true,
            imageUrl: true,
            isPremium: true,
            status: true,
            // Exclude: userId, email, lastSeen, createdAt, updatedAt
        }
    },
    customRoles: {
        select: {
            customRole: {
                select: {
                    id: true,
                    name: true,
                    color: true,
                    position: true,
                }
            }
        },
        orderBy: { customRole: { position: "desc" as const } }
    }
};

export async function GET(req: Request) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get("cursor");
        const serverId = searchParams.get("serverId");
        
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!serverId) {
            return new NextResponse("Server ID Missing", { status: 400 });
        }

        // Verify user is a member of the server
        const membership = await db.member.findFirst({
            where: {
                serverId,
                profileId: profile.id,
            }
        });

        if (!membership) {
            return new NextResponse("Not a member of this server", { status: 403 });
        }

        const queryOptions = {
            take: MEMBERS_BATCH,
            where: { serverId },
            select: memberSelect,
            orderBy: { role: "asc" as const },
        };

        const members = cursor
            ? await db.member.findMany({
                ...queryOptions,
                skip: 1,
                cursor: { id: cursor },
            })
            : await db.member.findMany(queryOptions);

        let nextCursor = null;
        if (members.length === MEMBERS_BATCH) {
            nextCursor = members[MEMBERS_BATCH - 1].id;
        }

        return NextResponse.json({
            items: members,
            nextCursor
        });
    } catch (err) {
        console.log("[MEMBERS_GET]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
