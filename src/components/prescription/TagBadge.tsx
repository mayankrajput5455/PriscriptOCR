import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: string;
  size?: "sm" | "md";
}

// Deterministic color from tag string
function tagColor(tag: string): string {
  const colors = [
    "bg-blue-500/15 text-blue-300 border-blue-500/20",
    "bg-violet-500/15 text-violet-300 border-violet-500/20",
    "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
    "bg-amber-500/15 text-amber-300 border-amber-500/20",
    "bg-pink-500/15 text-pink-300 border-pink-500/20",
    "bg-teal-500/15 text-teal-300 border-teal-500/20",
    "bg-indigo-500/15 text-indigo-300 border-indigo-500/20",
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash += tag.charCodeAt(i);
  return colors[hash % colors.length];
}

export function TagBadge({ tag, size = "md" }: TagBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        tagColor(tag),
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
    >
      {tag}
    </span>
  );
}
