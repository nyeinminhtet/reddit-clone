import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidor } from "@/lib/validators/comment";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { postId, text, replyToId } = CommentValidor.parse(body);

    const session = await getAuthSession();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await db.comment.create({
      data: {
        postId,
        text,
        authorId: session.user.id,
        replyToId,
      },
    });

    return new Response("ok");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed.", { status: 422 });
    }
    return new Response("Could not create comment please try again later.", {
      status: 500,
    });
  }
}
