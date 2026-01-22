import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const MESSAGES_BATCH = 25;

// Optimized select clause for messages - only fetch required fields
const messageSelect = {
    id: true,
    content: true,
    fileUrl: true,
    deleted: true,
    createdAt: true,
    updatedAt: true,
    memberId: true,
    channelId: true,
    member: {
        select: {
            id: true,
            role: true,
            profileId: true,
            profile: {
                select: {
                    id: true,
                    name: true,
                    imageUrl: true,
                    // Exclude: userId, email, isPremium, status, lastSeen, createdAt, updatedAt
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
                            // Exclude: serverId, createdAt, updatedAt
                        }
                    }
                },
                orderBy: { customRole: { position: "desc" as const } }
            }
        }
    },
    reactions: {
        select: {
            id: true,
            emoji: true,
            memberId: true,
            member: {
                select: {
                    id: true,
                    profile: {
                        select: {
                            id: true,
                            name: true,
                            imageUrl: true,
                        }
                    }
                }
            }
        }
    },
    pinnedMessage: {
        select: {
            id: true,
        }
    }
};

export async function GET(req: Request) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get("cursor");
        const channelId = searchParams.get("channelId");
        
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!channelId) {
            return new NextResponse("Channel ID Missing", { status: 400 });
        }

        const queryOptions = {
            take: MESSAGES_BATCH,
            where: { channelId },
            select: messageSelect,
            orderBy: { createdAt: "desc" as const },
        };

        const messages = cursor
            ? await db.message.findMany({
                ...queryOptions,
                skip: 1,
                cursor: { id: cursor },
            })
            : await db.message.findMany(queryOptions);

        let nextCursor = null;
        if (messages.length === MESSAGES_BATCH) {
            nextCursor = messages[MESSAGES_BATCH - 1].id;
        }

        return NextResponse.json({
            items: messages,
            nextCursor
        });
    } catch (err) {
        console.log("[MESSAGE_GET]", err);
        return new NextResponse("Internal Error", { status: 500 });
    }
}