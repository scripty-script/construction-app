import { notFound } from "next/navigation";
import {
  ClipboardListIcon,
  FileTextIcon,
  NotebookPenIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import {
  getAvailableProjectUsers,
  getProjectUsers,
} from "@/lib/data/project-users";
import { getProject } from "@/lib/data/projects";
import { authenticated } from "@/lib/dal";
import * as ProjectPolicy from "@/policies/project-policy";
import { ProjectUsersDialog } from "./_components/project-users-dialog";

const sections = [
  {
    title: "Daily Logs",
    description: "Record weather, manpower, and work completed each day.",
    icon: NotebookPenIcon,
  },
  {
    title: "Documents",
    description: "Store drawings, contracts, and other project files.",
    icon: FileTextIcon,
  },
  {
    title: "Forms",
    description: "Fill out inspections, checklists, and safety forms.",
    icon: ClipboardListIcon,
  },
];

const sectionClassName = "flex flex-col gap-3 rounded-xl border p-6 text-left";

function SectionContent({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <>
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </>
  );
}

export const instant = false;
export default async function ProjectPage({
  params,
}: PageProps<"/projects/[project]">) {
  const { project: projectId } = await params;

  const auth = await authenticated();
  const project = await getProject(Number(projectId));

  if (!project) {
    notFound();
  }

  const canUpdate = ProjectPolicy.update(auth, project, false);

  const [users, availableUsers] = await Promise.all([
    getProjectUsers(project.id),
    canUpdate ? getAvailableProjectUsers(project.id) : [],
  ]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {sections.map((section) => (
        <div key={section.title} className={sectionClassName}>
          <SectionContent {...section} />
        </div>
      ))}

      <ProjectUsersDialog
        projectId={project.id}
        users={users}
        availableUsers={availableUsers}
        canUpdate={canUpdate}
        trigger={
          <button
            type="button"
            className={`${sectionClassName} cursor-pointer transition-colors hover:bg-muted/50`}
          >
            <SectionContent
              title="Team"
              description={`${users.length} ${users.length === 1 ? "member" : "members"} — admins, project managers, and subcontractors.`}
              icon={UsersIcon}
            />
          </button>
        }
      />
    </div>
  );
}
