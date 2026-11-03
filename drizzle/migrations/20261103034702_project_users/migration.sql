CREATE TABLE "project_users" (
	"project_id" integer,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_users_pkey" PRIMARY KEY("project_id","user_id")
);
--> statement-breakpoint
CREATE INDEX "project_users_user_id_index" ON "project_users" ("user_id");--> statement-breakpoint
ALTER TABLE "project_users" ADD CONSTRAINT "project_users_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "project_users" ADD CONSTRAINT "project_users_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;