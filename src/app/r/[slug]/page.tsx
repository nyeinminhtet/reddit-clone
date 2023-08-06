import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";

interface SlugProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: SlugProps) => {
  const { slug } = params;

  const session = await getAuthSession();

  const subreddit = await db.subreddit.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          Subreddit: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
      },
    },
  });

  if (!subreddit) return notFound();

  return (
    <>
      <h1 className=" font-bold text-3xl md:text-4xl h-1/4">
        r/{subreddit.name}
      </h1>

      <MiniCreatePost session={session} />

      {/* show posts in user feed  */}
      <PostFeed subredditName={subreddit.name} initialPosts={subreddit.posts} />
    </>
  );
};

export default page;
