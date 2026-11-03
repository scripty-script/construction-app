import { notFound } from "next/navigation";
import {
  PageHeader,
  PageHeaderBack,
  PageHeaderSubTitle,
  PageHeaderTitle,
} from "@/components/page-header";
import { getProject } from "@/lib/data/projects";
import { authenticated } from "@/lib/dal";
import { cn } from "@/lib/utils";
import * as ProjectPolicy from "@/policies/project-policy";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const currencyFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const instant = false;
export default async function ProjectLayout({
  children,
  params,
}: LayoutProps<"/projects/[project]">) {
  const { project: projectId } = await params;

  const auth = await authenticated();
  const project = await getProject(Number(projectId));

  if (!project) {
    notFound();
  }

  // GATES
  ProjectPolicy.view(auth, project);

  return (
    <main className="flex flex-col gap-6">
      <PageHeader>
        <PageHeaderBack href="/projects" />
        <PageHeaderTitle>
          {project.title}
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
        </PageHeaderTitle>
        {project.description && (
          <PageHeaderSubTitle className="whitespace-pre-line">
            {project.description}
          </PageHeaderSubTitle>
        )}
      </PageHeader>

      <dl className="grid grid-cols-1 gap-4 rounded-xl border p-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">Project Number</dt>
          <dd className="font-mono font-medium">{project.projectNumber}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">Total Value</dt>
          <dd className="font-medium tabular-nums">
            {currencyFormat.format(project.totalValue)}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-muted-foreground">Created</dt>
          <dd className="font-medium">{dateFormat.format(project.createdAt)}</dd>
        </div>
      </dl>

      {children}
    </main>
  );
}
