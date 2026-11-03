"use client";

import { usePathname, useSearchParams } from "next/navigation";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function UsersPagination({
  currentPage,
  pageSize,
  pageCount,
  total,
}: {
  currentPage: number;
  pageSize: number;
  pageCount: number;
  total: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (total === 0) return null;

  const firstShown = (currentPage - 1) * pageSize + 1;
  const lastShown = Math.min(currentPage * pageSize, total);
  const showing = (
    <p className="text-sm whitespace-nowrap text-muted-foreground">
      Showing {firstShown}–{lastShown} of {total}
    </p>
  );

  if (pageCount <= 1) return showing;

  function pageHref(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${pathname}?${params}`;
  }

  // First, last, and the current page's neighbours.
  const pages = [
    ...new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount]),
  ].filter((page) => page >= 1 && page <= pageCount);

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      {showing}
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious href={pageHref(currentPage - 1)} />
            </PaginationItem>
          )}

          {pages.map((page, index) => (
            <PaginationItem key={page} className="flex items-center gap-1">
              {index > 0 && page - pages[index - 1] > 1 && (
                <PaginationEllipsis />
              )}
              <PaginationLink
                href={pageHref(page)}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {currentPage < pageCount && (
            <PaginationItem>
              <PaginationNext href={pageHref(currentPage + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
