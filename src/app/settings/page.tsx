export const metadata = {
  title: "Setting",
  description: "Manage your personal username.",
};

import UsernameForm from "@/components/UsernameForm";
import { authOptions, getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

const Page = async () => {
  const session = await getAuthSession();

  if (!session) {
    redirect(authOptions.pages?.signIn || "/sign-in");
  }

  return (
    <div className=" max-w-4xl mx-auto py-12 ">
      <div className=" grid items-start gap-8">
        <h1 className=" font-bold text-3xl md:text-4xl">Setting</h1>
      </div>

      <div className="grid gap-10">
        <UsernameForm
          user={{
            id: session.user.id,
            username: session.user.username || "",
          }}
        />
      </div>
    </div>
  );
};

export default Page;
