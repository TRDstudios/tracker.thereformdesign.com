export const statusOptions = ["todo", "in_progress", "review", "done"];

export const statusLabels: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export const statusStyles: Record<string, string> = {
  todo: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  review: "bg-purple-50 text-purple-700 border-purple-200",
  done: "bg-green-50 text-green-700 border-green-200",
};

export const priorityStyles: Record<string, string> = {
  low: "bg-blue-50 text-blue-600 border-blue-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

export interface TaskRow {
  id: string;
  displayId: string;
  title: string;
  status: string;
  priority: string;
  projectName: string;
  assigneeName: string;
  dueDate: string | null;
  createdAt: string;
  commentCount: number;
}

export interface TaskRowData {
  id: string;
  displayId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  projectId: string | null;
  assigneeId: string | null;
  projectName: string;
  assigneeName: string;
  dueDate: string | null;
  createdAt: string;
  subtasks?: { id: string; title: string }[];
  commentCount: number;
}

export interface GridContext {
  setStatusTarget: (target: { rowId: string; current: string; rect: DOMRect } | null) => void;
  onEdit: (task: TaskRowData) => void;
}
