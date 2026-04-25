"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNavigation } from "@/components/layout/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-background md:flex md:flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/crypto" className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            AD
          </span>
          <span className="text-sm font-semibold tracking-normal">
            AdminDashboard
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {dashboardNavigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
