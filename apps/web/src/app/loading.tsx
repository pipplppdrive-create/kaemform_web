import { BrandLogo } from "@/components/shared/BrandLogo";
import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="brand-accent h-[3px]" />
      <div className="mx-auto flex h-14 max-w-7xl items-center border-b border-border bg-white px-4 sm:px-6">
        <BrandLogo />
      </div>
      <div className="page-container">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-card" />
          <Skeleton className="h-24 rounded-card" />
          <Skeleton className="h-24 rounded-card" />
        </div>
        <Skeleton className="mt-8 h-72 rounded-card" />
      </div>
    </main>
  );
}
