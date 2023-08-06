import { z } from "zod";

export const PostVoetValidor = z.object({
  postId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export type PostVoteRequest = z.infer<typeof PostVoetValidor>;

export const CommentVoetValidor = z.object({
  commentId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export type CommentVoteRequest = z.infer<typeof CommentVoetValidor>;
