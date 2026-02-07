import React from 'react';
import { cn } from "@/lib/utils";

type SkeletonProps = {
  variant?: 'hero' | 'card' | 'carousel';
  count?: number;
  className?: string;
};

const SkeletonFull: React.FC<SkeletonProps> = ({ variant = 'card', count = 3, className = '' }) => {
  if (variant === 'hero') {
    return (
      <section className={`relative overflow-hidden ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 py-12 sm:py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="space-y-6">
                <div className="h-6 w-40 bg-muted/40 rounded-full animate-pulse" />
                <div className="h-12 w-full max-w-2xl bg-muted/30 rounded-lg animate-pulse" />
                <div className="h-6 w-3/4 bg-muted/30 rounded-lg animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-12 w-36 bg-muted/30 rounded-lg animate-pulse" />
                  <div className="h-12 w-36 bg-muted/30 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="hidden lg:block w-full h-56 bg-muted/20 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'carousel') {
    const items = Array.from({ length: count });
    return (
      <div className={`w-full py-8 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {items.map((_, i) => (
              <div key={i} className="flex-shrink-0 w-48">
                <div className="w-full h-40 bg-muted/20 rounded-lg animate-pulse" />
                <div className="h-4 mt-3 bg-muted/20 rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // default: card list skeleton
  const cards = Array.from({ length: count });
  return (
    <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {cards.map((_, idx) => (
        <div key={idx} className="p-4 border border-border rounded-lg">
          <div className="w-full h-44 bg-muted/20 rounded-lg animate-pulse mb-4" />
          <div className="h-4 bg-muted/20 rounded w-5/6 animate-pulse mb-2" />
          <div className="h-4 bg-muted/20 rounded w-1/2 animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonFull;

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
