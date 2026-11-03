/**
 * Shadcn-style compound component for standardized page headers.
 *
 * @example
 * <PageHeader>
 *   <PageHeaderBack href="/payroll" />
 *   <PageHeaderTitle>Payroll Summary</PageHeaderTitle>
 *   <PageHeaderSubTitle>Manage payroll computations and payouts.</PageHeaderSubTitle>
 *   <PageHeaderAction>
 *     <Button>Create Payroll</Button>
 *   </PageHeaderAction>
 * </PageHeader>
 */
import * as React from "react";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function PageHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header"
      className={cn(
        "grid grid-cols-1 items-start gap-4 sm:items-center sm:has-data-[slot=page-header-action]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  );
}

function PageHeaderAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-action"
      className={cn(
        "flex items-center gap-2 sm:col-start-2 sm:row-start-1 sm:justify-self-end",
        className
      )}
      {...props}
    />
  );
}

function PageHeaderBack({
  className,
  href,
  ...props
}: React.ComponentProps<"div"> & { href: string }) {
  return (
    <div
      data-slot="page-header-back"
      className={cn("-mb-4", className)}
      {...props}
    >
      <Button
        variant="link"
        size="sm"
        className="px-0!"
        nativeButton={false}
        render={<Link href={href} />}
      >
        <ChevronLeftIcon /> Back
      </Button>
    </div>
  );
}

function PageHeaderTitle({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-title"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    >
      <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
        {children}
      </h1>
    </div>
  );
}

function PageHeaderSubTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-header-sub-title"
      className={cn("text-muted-foreground gap-1", className)}
      {...props}
    />
  );
}

export {
  PageHeader,
  PageHeaderAction,
  PageHeaderBack,
  PageHeaderSubTitle,
  PageHeaderTitle,
};
