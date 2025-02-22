import { apiClient } from "@/utils/api";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
}

export const taskService = {
  getTasks: async () => {
    return apiClient.get<Task[]>("/api/tasks");
  },
  getTaskById: async (id: string) => {
    return apiClient.get<Task>(`/api/tasks/${id}`);
  },
  createTask: async (data: CreateTaskData) => {
    return apiClient.post<Task>("/api/tasks", data);
  },
  updateTask: async (id: string, data: UpdateTaskData) => {
    return apiClient.put<Task>(`/api/tasks/${id}`, data);
  },
  deleteTask: async (id: string) => {
    return apiClient.delete(`/api/tasks/${id}`);
  },
};

export default taskService;
