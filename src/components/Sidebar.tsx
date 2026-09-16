"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Users,
  ListChecks,
  Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/auftraege", label: "Aufträge", icon: ClipboardList },
  { href: "/kalender", label: "Kalender", icon: CalendarDays },
  { href: "/kunden", label: "Kunden", icon: Users },
  { href: "/leistungen", label: "Leistungen & Checklisten", icon: ListChecks },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print flex h-full w-64 shrink-0 flex-col bg-gray-900 text-gray-100">
      <div className="flex items-center gap-2 px-5 py-5">
        <Sparkles className="h-6 w-6 text-blue-400" />
        <span className="text-lg font-semibold tracking-tight">DetailFlow</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 text-xs text-gray-500">
        Fahrzeugaufbereitung Management
      </div>
    </aside>
  );
}
