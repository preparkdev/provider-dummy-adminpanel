"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

interface SidebarProps {
  children?: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card">
        {children}
      </aside>
    </div>
  );
}

interface SidebarHeaderProps {
  children: React.ReactNode;
  collapsed?: boolean;
}

export function SidebarHeader({ children, collapsed = false }: SidebarHeaderProps) {
  return (
    <div className={`${collapsed ? 'px-2 py-4' : 'px-6 py-6'} border-b border-gray-200`}>
      {children}
    </div>
  );
}

interface SidebarContentProps {
  children: React.ReactNode;
}

export function SidebarContent({ children }: SidebarContentProps) {
  return (
    <div className="flex-1 py-6">
      {children}
    </div>
  );
}

interface SidebarNavProps {
  items: {
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    label: string;
  }[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2 px-3">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
              isActive
                ? "bg-primary text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            {Icon && <Icon className="h-5 w-5" />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
