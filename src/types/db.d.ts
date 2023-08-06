import { Comment, Post, Subreddit, User, Vote } from "@prisma/client";

export type ExtendedPost = Post & {
  Subreddit: Subreddit;
  votes: Vote[];
  author: User;
  comments: Comment[];
};
