import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import React from "react";
import PostComment from "./PostComment";
import CreateComment from "./CreateComment";

interface CommentProps {
  postId: string;
}

const CommentsSection = async ({ postId }: CommentProps) => {
  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: {
      postId,
      replyTo: null,
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });
  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />
      {/* create comment */}
      <CreateComment postId={postId} />

      {/* all comments */}
      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const toplevelCommentVotesAmt = topLevelComment.votes.reduce(
              (pre, vote) => {
                if (vote.type === "UP") return pre + 1;
                if (vote.type === "DOWN") return pre - 1;
                return pre;
              },
              0
            );

            const toplevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === session?.user.id
            );

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    comment={topLevelComment}
                    postId={postId}
                    votesAmt={toplevelCommentVotesAmt}
                    currentVote={toplevelCommentVote}
                  />
                </div>

                {/* render reply comment */}
                {topLevelComment.replies
                  .sort((a, b) => b.votes.length - a.votes.length)
                  .map((reply) => {
                    const replyVoteAmt = reply.votes.reduce((pre, vote) => {
                      if (vote.type === "UP") return pre + 1;
                      if (vote.type === "DOWN") return pre - 1;
                      return pre;
                    }, 0);

                    const replyVote = reply.votes.find(
                      (vote) => vote.userId === session?.user.id
                    );
                    return (
                      <div
                        key={reply.id}
                        className="ml-2 py-2 pl-4 border-l-2 border-zinc-200"
                      >
                        <PostComment
                          comment={reply}
                          postId={postId}
                          votesAmt={replyVoteAmt}
                          currentVote={replyVote}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentsSection;
