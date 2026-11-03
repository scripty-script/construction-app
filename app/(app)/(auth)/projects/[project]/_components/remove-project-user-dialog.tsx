"use client";

import * as React from "react";
import { UserMinusIcon } from "lucide-react";

import { removeProjectUser } from "@/actions/project-users";
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
import type { ProjectUser } from "@/lib/types";

export function RemoveProjectUserDialog({
  projectId,
  user,
}: {
  projectId: number;
  user: ProjectUser;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();

  function handleRemove() {
    startTransition(async () => {
      const result = await removeProjectUser(projectId, user.id);
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
            <UserMinusIcon className="text-destructive" />
            <span className="sr-only">Remove {user.name}</span>
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove team member</AlertDialogTitle>
          <AlertDialogDescription>
            Remove <strong>{user.name}</strong> ({user.email}) from this
            project&apos;s team? Their account is not deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <FieldError>{error}</FieldError>}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={handleRemove}
          >
            {pending ? "Removing..." : "Remove"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
