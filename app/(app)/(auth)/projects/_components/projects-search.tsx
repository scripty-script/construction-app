"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchInput } from "@/components/search-input";

export function ProjectsSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    params.delete("page"); // new search starts on page 1

    router.replace(`${pathname}?${params}`, { scroll: false });
  }

  return (
    <SearchInput
      aria-label="Search projects"
      placeholder="Search by title or project number..."
      defaultValue={searchParams.get("q") ?? ""}
      onSearch={handleSearch}
    />
  );
}
