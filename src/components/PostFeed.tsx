"use client";

import { ExtendedPost } from "@/types/db";
import React, { useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import axios from "axios";
import { useSession } from "next-auth/react";
import Post from "./Post";

interface Props {
  subredditName?: string;
  initialPosts: ExtendedPost[];
}

const PostFeed = ({ subredditName, initialPosts }: Props) => {
  const lastPostRef = useRef<HTMLElement>(null);

  const { data: session } = useSession();

  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite"],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subredditName ? `&subredditName=${subredditName}` : "");

      const { data } = await axios.get(query);
      return data as ExtendedPost[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
    }
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        const votesAmt = post.votes.reduce((curr, vote) => {
          if (vote.type === "UP") return curr + 1;
          if (vote.type === "DOWN") return curr - 1;
          return curr;
        }, 0);
        const currentVote = post.votes.find(
          (vote) => vote.userId === session?.user.id
        );

        if (index === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                votesAmt={votesAmt}
                currentVote={currentVote}
                subredditName={post.Subreddit.name}
                post={post}
                commentAmt={post.comments.length}
              />
            </li>
          );
        } else {
          return (
            <Post
              votesAmt={votesAmt}
              currentVote={currentVote}
              key={post.id}
              subredditName={post.Subreddit.name}
              post={post}
              commentAmt={post.comments.length}
            />
          );
        }
      })}
    </ul>
  );
};

export default PostFeed;
