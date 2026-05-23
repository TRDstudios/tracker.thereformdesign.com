ALTER TABLE "tasks" ADD COLUMN "display_id" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_display_id_unique" UNIQUE("display_id");