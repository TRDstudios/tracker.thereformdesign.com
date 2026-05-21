CREATE INDEX "idx_al_entity" ON "activity_logs" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "idx_al_user" ON "activity_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_al_entity_created" ON "activity_logs" USING btree ("entity_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_comments_task" ON "comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_comments_author" ON "comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_pm_project" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_pm_user" ON "project_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_projects_owner" ON "projects" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_assignee" ON "tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_project" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tasks_created" ON "tasks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_tasks_creator" ON "tasks" USING btree ("creator_id");