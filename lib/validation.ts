import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address").max(255);
export const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(128);
export const nameSchema = z.string().min(1, "Name is required").max(100);
export const titleSchema = z.string().min(1, "Title is required").max(200);
export const descriptionSchema = z.string().max(2000).nullable().optional();
export const uuidSchema = z.string().uuid("Invalid UUID");
export const nullableUuidSchema = z.string().uuid().nullable().optional();
export const prioritySchema = z.enum(["low", "medium", "high"]);
export const taskStatusSchema = z.enum(["todo", "in_progress", "review", "done"]);
export const roleSchema = z.enum(["super_admin", "admin", "user"]);
export const projectRoleSchema = z.enum(["admin", "member"]);
export const projectStatusSchema = z.enum(["active", "archived"]);

export const loginSchema = z.object({
  email: z.string().min(1, "Email or User ID is required").max(255),
  password: passwordSchema,
});

export const createTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  projectId: nullableUuidSchema,
  assigneeId: nullableUuidSchema,
  priority: prioritySchema.default("medium"),
  dueDate: z.string().nullable().optional(),
  subtaskTitles: z.array(z.string().min(1).max(200)).optional(),
});

export const updateTaskSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  projectId: nullableUuidSchema,
  assigneeId: nullableUuidSchema,
  priority: prioritySchema.default("medium"),
  dueDate: z.string().nullable().optional(),
  subtaskTitles: z.array(z.string().min(1).max(200)).optional(),
});

export const featureSchema = z.object({
  name: z.string().min(1).max(200),
  completed: z.boolean().default(false),
});

export const createProjectSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  stack: z.array(z.string().max(100)).optional(),
  liveUrl: z.string().max(500).nullable().optional(),
  demoUrl: z.string().max(500).nullable().optional(),
  features: z.array(featureSchema).optional(),
  serverDetails: z.string().max(200).nullable().optional(),
  domainDetails: z.string().max(200).nullable().optional(),
});

export const updateProjectSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  status: projectStatusSchema,
  stack: z.array(z.string().max(100)).optional(),
  liveUrl: z.string().max(500).nullable().optional(),
  demoUrl: z.string().max(500).nullable().optional(),
  features: z.array(featureSchema).optional(),
  serverDetails: z.string().max(200).nullable().optional(),
  domainDetails: z.string().max(200).nullable().optional(),
});

export const userIdSchema = z.string().min(2, "User ID must be at least 2 characters").max(50);
export const professionSchema = z.enum(["Manager", "Developer", "Testing", "Marketing"]);

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema.default("user"),
  userId: userIdSchema,
  profession: professionSchema,
});

export const addCommentSchema = z.object({
  content: z.string().min(1, "Comment is required").max(2000),
  taskId: uuidSchema,
});

export const addProjectMemberSchema = z.object({
  projectId: uuidSchema,
  userId: uuidSchema,
  role: projectRoleSchema.default("member"),
});
