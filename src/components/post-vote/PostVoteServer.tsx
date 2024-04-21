import React from "react";
import { notFound } from "next/navigation";

import { getServerSession } from "next-auth";
import { Post, Vote } from "@prisma/client";

import PostVoteClient from "./PostVoteClient";
import { authOptions } from "@/lib/auth";

interface Props {
  postId: string;
  initialVoteAmt?: number;
  initialVote?: Vote["type"] | null;
  getData?: () => Promise<(Post & { votes: Vote[] }) | null>;
}

const PostVoteServer = async ({
  postId,
  initialVoteAmt,
  initialVote,
  getData,
}: Props) => {
  const session = await getServerSession(authOptions);

  let _votesAmt: number = 0;
  let _currentVote: Vote["type"] | null | undefined = undefined;

  if (getData) {
    const post = await getData();
    if (!post) return notFound();
    _votesAmt = post.votes.reduce((pre, vote) => {
      if (vote.type === "UP") return pre + 1;
      if (vote.type === "DOWN") return pre - 1;
      return pre;
    }, 0);

    _currentVote = post.votes.find(
      (vote) => vote.userId === session?.user?.id
    )?.type;
  } else {
    _votesAmt = initialVoteAmt!;
    _currentVote = initialVote;
  }

  return (
    <PostVoteClient
      postId={postId}
      initialVoteAmt={_votesAmt}
      initialVote={_currentVote}
    />
  );
};

export default PostVoteServer;
