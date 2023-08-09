"use client";

import { Session } from "next-auth";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import UserAvatar from "./UserAvatar";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { ImageIcon, Link2 } from "lucide-react";

interface Props {
  session: Session | null;
}

const MiniCreatePost = ({ session }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="rounded-md bg-white shadow ">
      <div className=" h-full px-6 py-4 flex sm:justify-between gap-1">
        <div className="relative">
          <UserAvatar
            user={{
              name: session?.user.name || null,
              image: session?.user.image || null,
            }}
          />
          <span
            className={
              (session?.user ? "bg-green-500" : " bg-gray-600") +
              " absolute bottom-0 right-0 rounded-full w-3 h-3  outline outline-2 outline-white"
            }
          />
        </div>

        <Input
          readOnly
          onClick={() => router.push(pathname + "/submit")}
          placeholder="Create post"
        />
        <div className=" gap-1 hidden sm:flex">
          <Button
            variant="ghost"
            onClick={() => router.push(pathname + "/submit")}
          >
            <ImageIcon className=" text-zinc-600 " />
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push(pathname + "/submit")}
          >
            <Link2 className=" text-zinc-600" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MiniCreatePost;
