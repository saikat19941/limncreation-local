import { Card, Skeleton } from "@heroui/react";

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="gap-4 rounded-[1.75rem] p-6" variant="secondary">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="h-10 w-72 rounded-full" />
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card className="gap-4 rounded-[1.5rem] p-5" key={item} variant="secondary">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </Card>
        ))}
      </div>
      <Card className="rounded-[1.5rem] p-5" variant="secondary">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((item) => (
            <Skeleton className="h-12 w-full rounded-2xl" key={item} />
          ))}
        </div>
      </Card>
    </div>
  );
}

