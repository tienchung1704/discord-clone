import { currentProfile } from "@/lib/current-profile";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const SEARCH_RESULTS_LIMIT = 25;

/**
 * Highlights matching text in content by wrapping matches with <mark> tags
 */
function highlightText(content: string, query: string): string {
  if (!query.trim()) return content;
  
  // Escape special regex characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  
  return content.replace(regex, '<mark>$1</mark>');
}

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("query");
    const channelId = searchParams.get("channelId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!query || query.trim().length === 0) {
      return new NextResponse("Query is required", { status: 400 });
    }

    if (!channelId) {
      return new NextResponse("Channel ID is required", { status: 400 });
    }

    // Verify user has access to this channel through server membership
    const channel = await db.channel.findUnique({
      where: { id: channelId },
      include: {
        server: {
          include: {
            members: {
              where: { profileId: profile.id }
            }
          }
        }
      }
    });

    if (!channel || channel.server.members.length === 0) {
      return new NextResponse("Channel not found or access denied", { status: 404 });
    }

    // Search messages using Prisma's contains for full-text search
    const messages = await db.message.findMany({
      where: {
        channelId,
        deleted: false,
        content: {
          contains: query.trim()
        }
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        channelId: true,
        member: {
          select: {
            id: true,
            profile: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: SEARCH_RESULTS_LIMIT
    });

    // Transform results with highlighted content
    const results = messages.map((message) => ({
      messageId: message.id,
      content: message.content,
      highlightedContent: highlightText(message.content, query.trim()),
      author: {
        name: message.member.profile.name,
        imageUrl: message.member.profile.imageUrl
      },
      timestamp: message.createdAt,
      channelId: message.channelId
    }));

    return NextResponse.json({
      results,
      query: query.trim(),
      totalCount: results.length
    });
  } catch (err) {
    console.log("[MESSAGE_SEARCH]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
