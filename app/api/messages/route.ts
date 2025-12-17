import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db} from "@/lib/db";
import { Message } from "@/lib/generated/prisma";

const MESSAGES_BATCH = 25;

export async function GET(req:Request) {
    try{
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url)

        const cursor = searchParams.get("cursor");
        const channelId = searchParams.get("channelId");
        if(!profile){
            return new NextResponse("Unauthorized", { status: 401 })
        }
        if(!channelId){
            return new NextResponse("Channel ID Missing", { status: 400 })
        }
        let messages : Message[] = [];

        if(cursor){
            messages = await db.message.findMany({
                take: MESSAGES_BATCH,
                skip: 1,
                cursor:{
                    id: cursor,
                },
                where: {
                    channelId,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                            customRoles: {
                                include: { customRole: true },
                                orderBy: { customRole: { position: "desc" } }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc",
                }
            })
        }else{
            messages = await db.message.findMany({
                take: MESSAGES_BATCH,
                where: {
                    channelId,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                            customRoles: {
                                include: { customRole: true },
                                orderBy: { customRole: { position: "desc" } }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc",
                }
            })
        }
        let nextCursor = null;
        if(messages.length === MESSAGES_BATCH){
            nextCursor = messages[MESSAGES_BATCH - 1].id;
        }
        return NextResponse.json({
            items: messages,
            nextCursor
        });
    }catch (err) {
        console.log("[MESSAGE_GET]", err);
        return new NextResponse("Internal Error", { status: 500 })
    }
}