"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export default function LogoutButton() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      router.push("/login"); // Redirect to login page after logout
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
    >
      {mutation.isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
