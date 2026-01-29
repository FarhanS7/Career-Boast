import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-100/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
