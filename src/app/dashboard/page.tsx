"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import taskService from "@/services/task.service";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import TaskModal from "@/components/TaskModal";
import { Switch } from "@headlessui/react";
import { useAppSelector } from "@/redux/hooks/hooks";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const username = useAppSelector((state) => state?.user?.user?.name) || "User";
  type Task = {
    id: string;
    title: string;
    description: string;
    status: string;
  };
  // Fetch all tasks
  const { data, error, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: taskService.getTasks,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track expanded task
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [taskDetails, setTaskDetails] = useState<Task | null>(null);

  const handleExpand = async (taskId: string) => {
    if (expandedTask === taskId) {
      setExpandedTask(null); // Collapse
    } else {
      try {
        const response = await taskService.getTaskById(taskId);
        if (response?.data) {
          setTaskDetails({
            id: response.data.id,
            title: response.data.title || "",
            description: response.data.description || "",
            status: response.data.status || "",
          });
          setExpandedTask(taskId);
        } else {
          console.error("Task data is undefined");
        }
      } catch (error) {
        console.error("Error fetching task details:", error);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTaskDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [e.target.name]: e.target.value ?? "",
      };
    });
  };

  // Define mutation for deleting a task
  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      return await taskService.deleteTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleDelete = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate(taskId);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (updatedTask: Task) => {
      return await taskService.updateTask(expandedTask!, {
        ...updatedTask,
        status: updatedTask.status as "PENDING" | "IN_PROGRESS" | "COMPLETED" | undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", expandedTask] });
      setEditMode(false);
      setExpandedTask(null)
    },
  });

  const handleSave = () => {
    if (taskDetails) {
      updateMutation.mutate(taskDetails);
    }
  };

  if (isLoading) return <p>Loading tasks...</p>;
  if (error) return <p>Error fetching tasks: {error.message}</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">{username}&apos;s Dashboard</h2>
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Task Dashboard</h2>
          <LogoutButton />
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Task
        </button>
        <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <div className="bg-white shadow-md rounded-lg p-6">
          <ul className="divide-y divide-gray-200">
            {data?.data?.map((task) => (
              <li key={task.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-900">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                  <button
                    onClick={() => handleExpand(task.id)}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    {expandedTask === task.id ? "Collapse" : "View Details"}
                  </button>
                </div>
                {expandedTask === task.id && (
                  <div className="mt-4 p-4 bg-white shadow-lg rounded-lg border border-gray-300">
                    <div className="flex items-center">
                      <h3 className="text-lg mr-auto font-semibold text-gray-900">
                        {editMode ? "Edit Task" : "Task Details"}
                      </h3>
                      {taskDetails && (
                        <Switch
                          checked={editMode}
                          onChange={setEditMode}
                          className={`${editMode ? "bg-blue-600" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full`}
                        >
                          <span className="sr-only">Toggle Edit Mode</span>
                          <span
                            className={`${editMode ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform bg-white rounded-full transition`}
                          />
                        </Switch>
                      )}
                      {!editMode && <button
                        onClick={() => handleDelete(task.id)}
                        className="ml-4 px-2 py-1 bg-red-600 text-white rounded-md"
                      >
                        Delete
                      </button>}
                    </div>
                    {editMode ? (
                      <>
                        <input
                          type="text"
                          name="title"
                          value={taskDetails?.title || ""}
                          onChange={handleChange}
                          className="border p-2 rounded w-full mt-2 text-gray-900 bg-white"
                        />
                        <textarea
                          name="description"
                          value={taskDetails?.description || ""}
                          onChange={handleChange}
                          className="border p-2 rounded w-full mt-2 text-gray-900 bg-white"
                        />
                        <button
                          onClick={handleSave}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md"
                        >
                          Save
                        </button>
                      </>
                    ) : (
                      <div className="mt-2 text-gray-900">
                        <p><strong>Title:</strong> {taskDetails?.title}</p>
                        <p><strong>Description:</strong> {taskDetails?.description}</p>
                        <p><strong>Status:</strong> {taskDetails?.status}</p>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
