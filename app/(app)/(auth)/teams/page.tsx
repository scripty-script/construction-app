import {
  PageHeader,
  PageHeaderAction,
  PageHeaderTitle,
} from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRowActions } from "./_components/user-row-actions";
import { getUsers } from "@/lib/data/users";
import { authenticated } from "@/lib/dal";
import { UserFormDialog } from "./_components/user-form-dialog";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { UsersSearch } from "./_components/users-search";
import { UsersPagination } from "./_components/users-pagination";
import * as UserPolicy from "@/policies/user-policy";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export const instant = false;
export default async function TeamsPage({ searchParams }: PageProps<"/teams">) {
  const { q, page } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const auth = await authenticated();

  // GATES
  UserPolicy.viewAny(auth);

  const {
    users,
    total,
    page: currentPage,
    pageSize,
    pageCount,
  } = await getUsers({ query, page: Number(page) || 1 });

  return (
    <main className="flex flex-col gap-6">
      <PageHeader>
        <PageHeaderTitle>Teams</PageHeaderTitle>
        <PageHeaderAction>
          <UserFormDialog
            trigger={
              <Button>
                <PlusIcon /> Create user
              </Button>
            }
          />
        </PageHeaderAction>
      </PageHeader>

      <UsersSearch />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-0">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-24 text-center text-muted-foreground"
              >
                {query ? `No users match "${query}".` : "No users yet."}
              </TableCell>
            </TableRow>
          ) : (
            users.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{dateFormat.format(row.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <UserRowActions
                    user={row}
                    isCurrentUser={row.id === auth.id}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <UsersPagination
        currentPage={currentPage}
        pageSize={pageSize}
        pageCount={pageCount}
        total={total}
      />
    </main>
  );
}
