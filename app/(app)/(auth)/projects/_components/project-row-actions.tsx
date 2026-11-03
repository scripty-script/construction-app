"use client";

import * as React from "react";
import Link from "next/link";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { deleteProject } from "@/actions/projects";
import { ProjectFormDialog } from "./project-form-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FieldError } from "@/components/ui/field";
import type { Project } from "@/lib/types";

export function ProjectRowActions({
  project,
  canUpdate,
  canDelete,
}: {
  project: Project;
  canUpdate: boolean;
  canDelete: boolean;
}) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={<Link href={`/projects/${project.id}`} />}
      >
        <EyeIcon />
        <span className="sr-only">View {project.title}</span>
      </Button>
      {canUpdate && (
        <ProjectFormDialog
          project={project}
          trigger={
            <Button variant="ghost" size="icon-sm">
              <PencilIcon />
              <span className="sr-only">Edit {project.title}</span>
            </Button>
          }
        />
      )}
      {canDelete && <DeleteProjectDialog project={project} />}
    </div>
  );
}

function DeleteProjectDialog({ project }: { project: Project }) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProject(project.id);
      if (result.success) {
        setOpen(false);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setError(undefined);
        setOpen(next);
      }}
    >
      <AlertDialogTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <Trash2Icon className="text-destructive" />
            <span className="sr-only">Delete {project.title}</span>
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{project.title}</strong> (
            {project.projectNumber})?
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <FieldError>{error}</FieldError>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={handleDelete}
          >
            {pending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
