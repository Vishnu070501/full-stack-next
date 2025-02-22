"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import taskService from "@/services/task.service";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskModal({ isOpen, onClose }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => taskService.createTask({ title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      handleClose();
    },
    onError: (error) => {
      console.error("Task creation failed:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const handleClose = () => {
    setTitle("");  // Reset title
    setDescription(""); // Reset description
    onClose();  // Close the modal
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <div className="fixed inset-0 bg-black bg-opacity-60" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl w-96 text-gray-900">
            <Dialog.Title className="text-xl font-bold text-black">Add New Task</Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4 mt-3">
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <div className="flex justify-end space-x-3">
                <button type="button" className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400" onClick={handleClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Adding..." : "Add Task"}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
