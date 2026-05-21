export function ShopCardSkeleton() {
  return (
    <div className="card animate-pulse overflow-hidden">
      <div className="h-36 bg-gray-200 dark:bg-gray-800" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

export function ShopListSkeleton({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <ShopCardSkeleton key={i} />
      ))}
    </div>
  );
}
