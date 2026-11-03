"use client";

import * as React from "react";
import { PencilIcon, Trash2Icon } from "lucide-react";

import { deleteUser } from "@/actions/users";
import { UserFormDialog } from "./user-form-dialog";
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
import type { User } from "@/lib/types";

export function UserRowActions({
  user,
  isCurrentUser,
}: {
  user: User;
  isCurrentUser: boolean;
}) {
  return (
    <div className="flex justify-end gap-1">
      <UserFormDialog
        user={user}
        trigger={
          <Button variant="ghost" size="icon-sm">
            <PencilIcon />
            <span className="sr-only">Edit {user.name}</span>
          </Button>
        }
      />
      <DeleteUserDialog user={user} disabled={isCurrentUser} />
    </div>
  );
}

function DeleteUserDialog({
  user,
  disabled,
}: {
  user: User;
  disabled: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string>();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUser(user.id);
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
          <Button variant="ghost" size="icon-sm" disabled={disabled}>
            <Trash2Icon className="text-destructive" />
            <span className="sr-only">Delete {user.name}</span>
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{user.name}</strong> (
            {user.email})? This cannot be undone.
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
