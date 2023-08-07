import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import React from "react";
import PostFeed from "./PostFeed";

const CustomFeed = async () => {
  const session = await getAuthSession();

  const followCommunities = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      subreddit: true,
    },
  });

  const posts = await db.post.findMany({
    where: {
      Subreddit: {
        id: {
          in: followCommunities.map((sub) => sub.subreddit.id), //name into id
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      votes: true,
      comments: true,
      author: true,
      Subreddit: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  });
  return <PostFeed initialPosts={posts} />;
};

export default CustomFeed;
