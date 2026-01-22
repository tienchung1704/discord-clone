import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const profile = await currentProfile();
        const { memberId } = await req.json();

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!memberId) {
            return new NextResponse("Member ID missing", { status: 400 });
        }

        // Check if conversation already exists
        let conversation = await db.globalConversation.findFirst({
            where: {
                OR: [
                    {
                        AND: [
                            { profileOneId: profile.id },
                            { profileTwoId: memberId }
                        ]
                    },
                    {
                        AND: [
                            { profileOneId: memberId },
                            { profileTwoId: profile.id }
                        ]
                    }
                ]
            },
            include: {
                profileOne: true,
                profileTwo: true
            }
        });

        if (!conversation) {
            conversation = await db.globalConversation.create({
                data: {
                    profileOneId: profile.id,
                    profileTwoId: memberId,
                },
                include: {
                    profileOne: true,
                    profileTwo: true
                }
            })
        }

        return NextResponse.json(conversation);

    } catch (error) {
        console.log("[CONVERSATIONS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
