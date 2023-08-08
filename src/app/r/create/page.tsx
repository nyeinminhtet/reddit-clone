"use client";

import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import axios, { AxiosError } from "axios";
import { CreateSubredditPayload } from "@/lib/validators/subreddit";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";

const Page = () => {
  const [input, setInput] = useState<string>("");
  const router = useRouter();
  const { loginToast } = useCustomToast();

  const { mutate: createCommunity, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: CreateSubredditPayload = {
        name: input,
      };
      const { data } = await axios.post("/api/subreddit", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Subreddit already exist",
            description: "Please choose another subreddit name",
          });
        }

        if (err.response?.status === 422) {
          return toast({
            title: "Invalid Subreddit name",
            description: "Please choose a name between 3 and 20 characters",
          });
        }

        if (err.response?.status === 401) {
          return loginToast();
        }
      }
      return toast({
        title: "There was a problem!",
        description: "Could not create Subreddit",
      });
    },
    onSuccess: (data) => {
      router.push(`/r/${data}`);
    },
  });

  return (
    <div className=" container flex items-center h-full max-w-3xl mx-auto">
      <div className=" relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
        <div className=" flex justify-between items-center">
          <h1 className="text-xl font-semibold">Create Community</h1>
        </div>

        <hr className=" bg-zinc-500 h-px" />

        <div>
          <p className=" text-lg font-medium">Name</p>
          <p className=" text-sm pb-2">
            Community name including capitalization cannot be change.
          </p>

          <div className="relative">
            <p className=" absolute left-0 text-sm w-8 inset-y-0 grid place-items-center text-zinc-400">
              r/
            </p>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-6"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="subtle" onClick={() => router.back()}>
            Cancle
          </Button>
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={() => createCommunity()}
          >
            Create Community
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
