import { authenticated } from "@/lib/dal";

export const instant = false;
export default async function DashboardPage() {
  const user = await authenticated();

  return <h1>Dashboard</h1>;
}
