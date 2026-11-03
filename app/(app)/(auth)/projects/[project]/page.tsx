import { ClipboardListIcon, FileTextIcon, NotebookPenIcon } from "lucide-react";

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

export default function ProjectPage() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {sections.map((section) => (
        <div
          key={section.title}
          className="flex flex-col gap-3 rounded-xl border p-6"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <section.icon className="size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">{section.title}</h2>
            <p className="text-sm text-muted-foreground">
              {section.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
