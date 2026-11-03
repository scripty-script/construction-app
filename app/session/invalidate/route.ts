import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";

// Server Components can't modify cookies, so the DAL redirects here when the
// session points at a user that no longer exists. Route Handlers can.
export async function GET(request: NextRequest) {
  await deleteSession();

  return NextResponse.redirect(new URL("/login", request.nextUrl));
}
