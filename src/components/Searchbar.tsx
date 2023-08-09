"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Prisma, Subreddit } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { User } from "lucide-react";
import debounce from "lodash.debounce";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

const Searchbar = () => {
  const [input, setInput] = useState<string>("");

  const {
    data: qureyResult,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];
      const { data } = await axios.get(`/api/search?q=${input}`);
      return data as (Subreddit & {
        _count: Prisma.SubredditCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false,
  });

  const router = useRouter();

  const request = debounce(() => {
    refetch();
  }, 400);

  const debounceRequest = useCallback(() => {
    request();
  }, []);

  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setInput("");
  }, [pathname]);

  useOnClickOutside(searchRef, () => {
    setInput("");
  });

  return (
    <Command className="relative rounded-lg border max-w-lg z-50 overflow-visible">
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debounceRequest();
        }}
        className=" outline-none border-none focus:border-none focus:outline-none ring-0 text-[11px] sm:text-sm"
        placeholder="Search communities..."
      />

      {input.length > 0 && (
        <CommandList className=" absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No result found.</CommandEmpty>}
          {(qureyResult?.length ?? 0) > 0 && (
            <CommandGroup heading="communities">
              {qureyResult?.map((subreddit) => (
                <CommandItem
                  key={subreddit.id}
                  onSelect={(e) => {
                    router.push(`/r/${e}`);
                    router.refresh();
                  }}
                  value={subreddit.name}
                >
                  <User className="h-4 w-4 mr-2" />
                  <a href={`/r/${subreddit.name}`}>r/{subreddit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </Command>
  );
};

export default Searchbar;
