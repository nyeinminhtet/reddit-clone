import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoetValidor } from "@/lib/validators/vote";
import { CachePost } from "@/types/redis";
import { z } from "zod";

const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, voteType } = PostVoetValidor.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }
    //checking existing vote
    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId,
      },
    });
    const post = await db.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id,
            },
          },
        });
        return new Response("Ok");
      }

      await db.vote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      });

      //recount the vote
      const voteAmt = post.votes.reduce((curr, vote) => {
        if (vote.type === "UP") return curr + 1;
        if (vote.type === "DOWN") return curr - 1;
        return curr;
      }, 0);

      if (voteAmt >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachePost = {
          id: post.id,
          title: post.title,
          authorUsername: post.author.username ?? "",
          content: JSON.stringify(post.content),
          currentVote: voteType,
          createdAt: post.createdAt,
        };

        await redis.hset(`post:${postId}`, cachePayload);
      }

      return new Response("Ok");
    }

    await db.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        postId,
      },
    });
    //recount the vote
    const voteAmt = post.votes.reduce((curr, vote) => {
      if (vote.type === "UP") return curr + 1;
      if (vote.type === "DOWN") return curr - 1;
      return curr;
    }, 0);

    if (voteAmt >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachePost = {
        id: post.id,
        title: post.title,
        authorUsername: post.author.username ?? "",
        content: JSON.stringify(post.content),
        currentVote: voteType,
        createdAt: post.createdAt,
      };

      await redis.hset(`post:${postId}`, cachePayload);
    }

    return new Response("Ok");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed.", { status: 422 });
    }

    return new Response("Could not create vote, please try again later.", {
      status: 500,
    });
  }
}
