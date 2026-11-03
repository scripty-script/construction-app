"use client";

import * as React from "react";
import { useActionState } from "react";

import { createUser, updateUser } from "@/actions/users";
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
  FieldDescription,
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
import type { UserFormState } from "@/lib/definitions";
import { Role, roleLabels } from "@/lib/enums";
import type { User } from "@/lib/types";

type UserFormDialogProps = {
  /** When set, the dialog edits this user; otherwise it creates one. */
  user?: User;
  /** Element that opens the dialog (rendered via `DialogTrigger`). */
  trigger: React.ReactElement;
};

export function UserFormDialog({ user, trigger }: UserFormDialogProps) {
  const [open, setOpen] = React.useState(false);

  // Dispatching `null` resets the form state, so each opening starts clean.
  const [state, action, pending] = useActionState(
    async (prevState: UserFormState, formData: FormData | null) => {
      if (!formData) return undefined;

      const result = user
        ? await updateUser(user.id, prevState, formData)
        : await createUser(prevState, formData);

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
    name: user?.name,
    email: user?.email,
    role: user?.role,
  };
  const errors = state?.errors;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Edit user" : "Create user"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Update the user's details. Leave the password blank to keep it."
              : "Fill in the details to add a new user."}
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                defaultValue={values.name}
              />
              {errors?.name && <FieldError>{errors.name[0]}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                defaultValue={values.email}
              />
              {errors?.email && <FieldError>{errors.email[0]}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <Select
                id="role"
                name="role"
                items={roleLabels}
                defaultValue={values.role ?? Role.HOMEOWNER}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Role).map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabels[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.role && <FieldError>{errors.role[0]}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                required={!user}
                autoComplete="new-password"
              />
              <FieldDescription>
                {user
                  ? "Leave blank to keep the current password."
                  : "Must be at least 8 characters long."}
              </FieldDescription>
              {errors?.password && (
                <FieldError>
                  <ul className="ml-4 flex list-disc flex-col gap-1">
                    {errors.password.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </FieldError>
              )}
            </Field>

            {state?.message && <FieldError>{state.message}</FieldError>}

            <DialogFooter>
              <DialogClose render={<Button variant="outline" type="button" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : user ? "Save changes" : "Create user"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
