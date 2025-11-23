import { Button } from "@/components/ui/button";
import { FileQuestion, Plus } from "lucide-react";

export function EmptyState({ 
  icon: Icon = FileQuestion,
  title = "No items found",
  description = "Get started by creating your first item",
  actionLabel,
  onAction 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        <Icon className="w-10 h-10 text-zinc-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 mb-6 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
