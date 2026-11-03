"use client";

import * as React from "react";
import { useActionState } from "react";
import { PlusIcon } from "lucide-react";

import { addProjectUser } from "@/actions/project-users";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectUserFormState } from "@/lib/definitions";
import { roleLabels } from "@/lib/enums";
import type { User } from "@/lib/types";

export function AddProjectUserForm({
  projectId,
  availableUsers,
}: {
  projectId: number;
  /** Non-homeowner users who are not on the team yet. */
  availableUsers: User[];
}) {
  const [state, action, pending] = useActionState(
    (prevState: ProjectUserFormState, formData: FormData) =>
      addProjectUser(projectId, prevState, formData),
    undefined,
  );

  const items = Object.fromEntries(
    availableUsers.map((user) => [String(user.id), user.name]),
  );
  const hasAvailableUsers = availableUsers.length > 0;
  const error = state?.errors?.userId?.[0] ?? state?.message;

  return (
    <form action={action}>
      <Field>
        <div className="flex gap-2">
          <Select
            name="userId"
            items={items}
            defaultValue={state?.values?.userId || null}
            disabled={!hasAvailableUsers}
            required
          >
            <SelectTrigger aria-label="User to add" className="flex-1">
              <SelectValue placeholder="Select a user to add" />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((user) => (
                <SelectItem key={user.id} value={String(user.id)}>
                  {user.name}
                  <span className="text-muted-foreground">
                    {roleLabels[user.role]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={pending || !hasAvailableUsers}>
            <PlusIcon /> {pending ? "Adding..." : "Add"}
          </Button>
        </div>
        {!hasAvailableUsers && (
          <FieldDescription>
            Everyone who can join is already on this team.
          </FieldDescription>
        )}
        {error && <FieldError>{error}</FieldError>}
      </Field>
    </form>
  );
}
