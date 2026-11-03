CREATE TABLE "projects" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"project_number" text NOT NULL,
	"description" text,
	"total_value" numeric(14,2) DEFAULT '0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "projects_project_number_unique" ON "projects" ("project_number") WHERE "deleted_at" is null;