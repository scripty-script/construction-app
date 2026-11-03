"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { roleLabels } from "@/lib/enums";
import type { ProjectUser, User } from "@/lib/types";
import { AddProjectUserForm } from "./add-project-user-form";
import { RemoveProjectUserDialog } from "./remove-project-user-dialog";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

type ProjectUsersDialogProps = {
  projectId: number;
  /** Users on the project's team. */
  users: ProjectUser[];
  /** Non-homeowner users who are not on the team yet. */
  availableUsers: User[];
  /** Whether the viewer can add and remove team users. */
  canUpdate: boolean;
  /** Element that opens the dialog (rendered via `DialogTrigger`). */
  trigger: React.ReactElement;
};

export function ProjectUsersDialog({
  projectId,
  users,
  availableUsers,
  canUpdate,
  trigger,
}: ProjectUsersDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Team</DialogTitle>
          <DialogDescription>
            {users.length} {users.length === 1 ? "member" : "members"} on this
            project.
          </DialogDescription>
        </DialogHeader>

        {canUpdate && (
          // Remount when the list changes so the form starts clean after an add.
          <AddProjectUserForm
            key={availableUsers.length}
            projectId={projectId}
            availableUsers={availableUsers}
          />
        )}

        {users.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No one is on this project&apos;s team yet.
          </p>
        ) : (
          <ul className="-mx-1 flex max-h-96 flex-col divide-y overflow-y-auto">
            {users.map((user) => (
              <li key={user.id} className="flex items-center gap-3 px-1 py-2">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-sm text-muted-foreground">
                    {user.email} · {roleLabels[user.role]} · Added{" "}
                    {dateFormat.format(user.joinedAt)}
                  </span>
                </div>
                {canUpdate && (
                  <RemoveProjectUserDialog projectId={projectId} user={user} />
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
