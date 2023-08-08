"use client";

import { UsernameRequest, UsernameValidor } from "@/lib/validators/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface Props {
  user: Pick<User, "id" | "username">;
}

const UsernameForm = ({ user }: Props) => {
  const router = useRouter();

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UsernameRequest>({
    resolver: zodResolver(UsernameValidor),
    defaultValues: {
      name: user?.username || "",
    },
  });

  const { mutate: changeUsername, isLoading } = useMutation({
    mutationFn: async ({ name }: UsernameRequest) => {
      const payload: UsernameRequest = { name };

      const { data } = await axios.patch("/api/setting/username", payload);

      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Username already exist",
            description: "Please choose another  Username",
          });
        }
      }
      return toast({
        title: "There was a problem!",
        description: "Could not create Subreddit",
      });
    },
    onSuccess: () => {
      toast({
        description: "User name have been updated.",
        variant: "destructive",
      });
      router.refresh();
    },
  });

  return (
    <form onSubmit={handleSubmit((e) => changeUsername(e))}>
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>
            Please enter your display name, you are comfortable with.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div className=" absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>

            <Label className=" sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              className=" w-[400px] pl-6"
              id="name"
              size={32}
              {...register("name")}
            />

            {errors?.name && (
              <p className=" px-1 text-xs text-red-600">
                {errors.name.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button isLoading={isLoading}>Change name</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UsernameForm;
