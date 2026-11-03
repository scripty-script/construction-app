"use client";

import * as React from "react";
import { useActionState } from "react";

import { createProject, updateProject } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectFormState } from "@/lib/definitions";
import type { Project } from "@/lib/types";

const statusLabels = { true: "Active", false: "Inactive" };

type ProjectFormDialogProps = {
  /** When set, the dialog edits this project; otherwise it creates one. */
  project?: Project;
  /** Element that opens the dialog (rendered via `DialogTrigger`). */
  trigger: React.ReactElement;
};

export function ProjectFormDialog({ project, trigger }: ProjectFormDialogProps) {
  const [open, setOpen] = React.useState(false);

  // Dispatching `null` resets the form state, so each opening starts clean.
  const [state, action, pending] = useActionState(
    async (prevState: ProjectFormState, formData: FormData | null) => {
      if (!formData) return undefined;

      const result = project
        ? await updateProject(project.id, prevState, formData)
        : await createProject(prevState, formData);

      if (result?.success) setOpen(false);
      return result;
    },
    undefined,
  );

  function handleOpenChange(next: boolean) {
    if (!next) React.startTransition(() => action(null));
    setOpen(next);
  }

  const values = state?.values ?? {
    title: project?.title,
    projectNumber: project?.projectNumber,
    description: project?.description ?? undefined,
    totalValue: project ? project.totalValue.toFixed(2) : undefined,
    isActive: project ? String(project.isActive) : undefined,
  };
  const errors = state?.errors;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "Create project"}</DialogTitle>
          <DialogDescription>
            {project
              ? "Update the project's details."
              : "Fill in the details to add a new project."}
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="projectNumber">Project Number</FieldLabel>
              <Input
                id="projectNumber"
                name="projectNumber"
                placeholder="PRJ-2026-001"
                required
                defaultValue={values.projectNumber}
              />
              {errors?.projectNumber && (
                <FieldError>{errors.projectNumber[0]}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input
                id="title"
                name="title"
                placeholder="Riverside Office Renovation"
                required
                defaultValue={values.title}
              />
              {errors?.title && <FieldError>{errors.title[0]}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description</FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="Scope of work, location, notes..."
                defaultValue={values.description}
              />
              {errors?.description && (
                <FieldError>{errors.description[0]}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="totalValue">Total Value</FieldLabel>
              <Input
                id="totalValue"
                name="totalValue"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
                defaultValue={values.totalValue}
              />
              {errors?.totalValue && (
                <FieldError>{errors.totalValue[0]}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="isActive">Status</FieldLabel>
              <Select
                id="isActive"
                name="isActive"
                items={statusLabels}
                defaultValue={values.isActive ?? "true"}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{statusLabels.true}</SelectItem>
                  <SelectItem value="false">{statusLabels.false}</SelectItem>
                </SelectContent>
              </Select>
              {errors?.isActive && (
                <FieldError>{errors.isActive[0]}</FieldError>
              )}
            </Field>

            {state?.message && <FieldError>{state.message}</FieldError>}

            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending
                  ? "Saving..."
                  : project
                    ? "Save changes"
                    : "Create project"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
