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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { getProjects } from "@/lib/data/projects";
import { authenticated } from "@/lib/dal";
import { cn } from "@/lib/utils";
import * as ProjectPolicy from "@/policies/project-policy";
import { ProjectFormDialog } from "./_components/project-form-dialog";
import { ProjectRowActions } from "./_components/project-row-actions";
import { ProjectsSearch } from "./_components/projects-search";
import { ProjectsPagination } from "./_components/projects-pagination";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const instant = false;
export default async function ProjectsPage({
  searchParams,
}: PageProps<"/projects">) {
  const { q, page } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const auth = await authenticated();

  // GATES
  ProjectPolicy.viewAny(auth);

  const {
    projects,
    total,
    page: currentPage,
    pageSize,
    pageCount,
  } = await getProjects({ query, page: Number(page) || 1 });

  return (
    <main className="flex flex-col gap-6">
      <PageHeader>
        <PageHeaderTitle>Projects</PageHeaderTitle>
        {ProjectPolicy.create(auth, false) && (
          <PageHeaderAction>
            <ProjectFormDialog
              trigger={
                <Button>
                  <PlusIcon /> Create project
                </Button>
              }
            />
          </PageHeaderAction>
        )}
      </PageHeader>

      <ProjectsSearch />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-0">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                {query
                  ? `No projects match "${query}".`
                  : "No projects yet."}
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-mono text-sm">
                  {project.projectNumber}
                </TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/projects/${project.id}`}
                    className="hover:underline"
                  >
                    {project.title}
                  </Link>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {currencyFormat.format(project.totalValue)}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      project.isActive
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {project.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>{dateFormat.format(project.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <ProjectRowActions
                    project={project}
                    canUpdate={ProjectPolicy.update(auth, project, false)}
                    canDelete={ProjectPolicy.destroy(auth, project, false)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <ProjectsPagination
        currentPage={currentPage}
        pageSize={pageSize}
        pageCount={pageCount}
        total={total}
      />
    </main>
  );
}
