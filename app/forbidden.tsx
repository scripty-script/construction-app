import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-6xl font-bold tracking-tight">403</p>
        <h1 className="text-2xl font-semibold">Forbidden</h1>
        <p className="max-w-sm text-sm text-balance text-muted-foreground">
          You don&apos;t have permission to access this page.
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/dashboard" />}>
        Back to dashboard
      </Button>
    </main>
  );
}
