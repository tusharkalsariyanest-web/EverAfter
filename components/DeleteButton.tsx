"use client"; // This makes it a Client Component

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function DeleteButton() {
  return (
    <button 
      type="submit"
      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
      title="Delete"
      onClick={(e) => {
        // Now the confirm popup will work!
        if (!confirm("Are you sure you want to delete this masterpiece?")) {
          e.preventDefault();
        } else {
          toast.success("Deleting item...");
        }
      }}
    >
      <Trash2 size={16} />
    </button>
  );
}