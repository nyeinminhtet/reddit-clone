import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { User } from "next-auth";
import Image from "next/image";
import React, { FC } from "react";
import { Icons } from "./Icons";
import { AvatarProps } from "@radix-ui/react-avatar";

interface UserProps extends AvatarProps {
  user: Pick<User, "name" | "image">;
}

const UserAvatar: FC<UserProps> = ({ user, ...props }) => {
  return (
    <Avatar {...props}>
      {user.image ? (
        <div className=" relative aspect-square h-full w-full">
          <Image
            src={user.image}
            width={40}
            height={40}
            alt="profile"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className=" sr-only">{user.name}</span>
          <Icons.user className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
