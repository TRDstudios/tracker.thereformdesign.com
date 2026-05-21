ALTER TABLE "projects" ADD COLUMN "stack" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "live_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "demo_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "features" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "server_details" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "domain_details" text;