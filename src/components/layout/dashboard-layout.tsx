"use client";

import { useState, useEffect } from "react";
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
  const [hasMounted, setHasMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsCollapsed(window.innerWidth < 768);
    };

    // Check on mount
    checkMobile();
    setHasMounted(true);

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - only render after mount to prevent flash */}
      {hasMounted && (
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
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} rounded-lg ${isCollapsed ? 'px-3' : 'px-3'} py-2.5 text-sm font-medium transition-colors relative ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-md border border-primary-foreground/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {isActive && (
                      isCollapsed ? (
                        <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-accent rounded-full"></div>
                      ) : (
                        <div className="absolute left-0 top-0 bottom-0 w-3 bg-accent rounded-r-full"></div>
                      )
                    )}
                    <Icon className="h-5 w-5" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </SidebarContent>
        </aside>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-auto bg-background transition-all duration-300 ${hasMounted && isCollapsed ? "ml-16" : hasMounted ? "ml-64" : "ml-16"}`}>
        {children}
      </main>
    </div>
  );
}
