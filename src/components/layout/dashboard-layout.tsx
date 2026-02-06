"use client";

import { useState } from "react";
import { LayoutDashboard, ParkingSquare, BarChart3, ChevronLeft, ChevronRight, ReceiptIndianRupeeIcon } from "lucide-react";
import { SidebarHeader, SidebarContent } from "@/src/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";

const sidebarItems = [
  {
    href: "/",
    icon: LayoutDashboard,
    label: "Overview",
  },
  {
    href: "/parkings",
    icon: ParkingSquare,
    label: "Parkings",
  },
  {
    href: "/bookings",
    icon: ReceiptIndianRupeeIcon,
    label: "Bookings",
  },
  {
    href: "/analytics",
    icon: BarChart3,
    label: "Analytics",
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={`${
          isCollapsed ? "w-16" : "w-64"
        } bg-background border-r border-border shadow-xl transition-all duration-300 overflow-hidden fixed h-full z-40`}
      >
        <SidebarHeader collapsed={isCollapsed}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <div className="flex items-center gap-3 ml-6">
                <div>
                  <h2 className="text-xl font-bold text-foreground">PrePark</h2>
                  <p className="text-xs text-muted-foreground">Provider Portal</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-2 rounded-lg hover:bg-muted transition-colors ${isCollapsed ? '' : 'ml-auto'}`}
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5 text-muted-foreground" /> : <ChevronLeft className="h-5 w-5 text-muted-foreground" />}
            </button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <nav className="space-y-1 px-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} rounded-lg ${isCollapsed ? 'px-3' : 'px-3'} py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </SidebarContent>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto bg-background transition-all duration-300 ${isCollapsed ? "ml-16" : "ml-64"}`}>
        {children}
      </main>
    </div>
  );
}
