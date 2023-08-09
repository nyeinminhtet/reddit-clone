"use client";

import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { PostVoteRequest } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

interface Props {
  postId: string;
  initialVoteAmt: number;
  initialVote?: VoteType | null;
}

const PostVoteClient = ({ postId, initialVote, initialVoteAmt }: Props) => {
  const { loginToast } = useCustomToast();
  const [voteAmt, setVoteAmt] = useState<number>(initialVoteAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const preVote = usePrevious(currentVote);
  const pathName = usePathname();
  console.log(pathName.includes("/post"));
  const detailPage = "flex flex-row gap-1 sm:gap-3  pr-2 sm:w-20 pb-2 sm:pb-0";
  const otherPage = "flex flex-col gap-1 sm:gap-3  pr-2 sm:w-20 pb-2 sm:pb-0";

  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/vote", payload);
    },
    onError: (err, voteType) => {
      if (voteType === "UP") setVoteAmt((pre) => pre - 1);
      else setVoteAmt((pre) => pre + 1);

      //reset the current vote
      setCurrentVote(preVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }

        return toast({
          title: "Something went wrong!",
          description: "Your vote was not register, please try again.",
        });
      }
    },
    onMutate: (type: VoteType) => {
      if (currentVote === type) {
        setCurrentVote(undefined);
        if (type === "UP") setVoteAmt((pre) => pre - 1);
        else if (type === "DOWN") setVoteAmt((pre) => pre + 1);
      } else {
        setCurrentVote(type);
        if (type === "UP") setVoteAmt((pre) => pre + (currentVote ? 2 : 1));
        else if (type === "DOWN")
          setVoteAmt((pre) => pre - (currentVote ? 2 : 1));
      }
    },
  });

  return (
    <div className={pathName.includes("/post") ? detailPage : otherPage}>
      <Button
        onClick={() => vote("UP")}
        aria-label="upvote"
        variant="ghost"
        size="sm"
      >
        <ArrowBigUp
          className={cn("h-4 w-4 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {voteAmt}
      </p>

      <Button
        onClick={() => vote("DOWN")}
        aria-label="downvote"
        variant="ghost"
        size="sm"
      >
        <ArrowBigDown
          className={cn("h-4 w-4 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
