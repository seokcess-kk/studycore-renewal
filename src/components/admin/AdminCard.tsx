"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AdminCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function AdminCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: AdminCardProps) {
  return (
    <div
      className={cn(
        "border border-rule bg-white p-6",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-body font-medium text-muted">{title}</p>
          <p className="mt-2 font-serif text-3xl font-bold text-ink">
            {value}
          </p>
          {description && (
            <p className="mt-1 text-body text-muted">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 text-body font-medium",
                trend.isPositive ? "text-teal" : "text-red-500"
              )}
            >
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}% 지난 주 대비
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center bg-stone">
            <Icon className="h-6 w-6 text-navy" />
          </div>
        )}
      </div>
    </div>
  );
}

interface AdminCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function AdminCardGrid({ children, columns = 4 }: AdminCardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6",
        columns === 2 && "grid-cols-1 md:grid-cols-2",
        columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {children}
    </div>
  );
}
