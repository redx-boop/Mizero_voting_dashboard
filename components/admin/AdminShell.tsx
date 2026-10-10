"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType, type SVGProps } from "react";
import { signOutAction } from "@/app/actions/auth";
import { getInitials } from "@/lib/utils";
import {
  CandidatesIcon,
  CategoriesIcon,
  CloseIcon,
  DashboardIcon,
  LogoutIcon,
  MenuIcon,
  ResultsIcon,
  SettingsIcon,
  StudentsIcon,
  TrophyIcon,
  VotesIcon,
} from "./Icons";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: DashboardIcon },
  { label: "Categories", href: "/admin/categories", icon: CategoriesIcon },
  { label: "Candidates", href: "/admin/candidates", icon: CandidatesIcon },
  { label: "Students", href: "/admin/students", icon: StudentsIcon },
  { label: "Votes", href: "/admin/votes", icon: VotesIcon },
  { label: "Results", href: "/admin/results", icon: ResultsIcon },
  { label: "Election Settings", href: "/admin/settings", icon: SettingsIcon },
];

export interface AdminShellProfile {
  full_name: string;
  class_name: string | null;
  email: string;
}

export function AdminShell({
  profile,
  children,
}: {
  profile: AdminShellProfile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close the mobile drawer whenever the route changes. Adjusting state during
  // render (rather than from an effect) avoids a cascading extra render.
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setDrawerOpen(false);
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-primary-dark lg:flex">
        <SidebarContent profile={profile} pathname={pathname} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-primary-dark px-4 py-3 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white/90 hover:bg-white/10"
        >
          <MenuIcon />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-primary-dark shadow-xl">
            <div className="flex items-center justify-between px-4 py-3">
              <Brand />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/90 hover:bg-white/10"
              >
                <CloseIcon />
              </button>
            </div>
            <SidebarContent
              profile={profile}
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {/* Main content */}
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold text-primary-dark">
        <TrophyIcon width={20} height={20} />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-white">
          Mizero Awards
        </span>
        <span className="block text-[11px] font-medium uppercase tracking-wider text-white/60">
          Admin Dashboard
        </span>
      </span>
    </Link>
  );
}

function SidebarContent({
  profile,
  pathname,
  onNavigate,
}: {
  profile: AdminShellProfile;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-5">
        <Brand />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white text-primary-dark shadow-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon width={19} height={19} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Admin profile + logout */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-semibold text-primary-dark">
            {getInitials(profile.full_name) || "AD"}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-medium text-white">
              {profile.full_name}
            </span>
            <span className="block truncate text-[11px] text-white/60">
              Administrator
            </span>
          </span>
        </div>

        <form action={signOutAction} className="mt-1">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogoutIcon width={19} height={19} />
            Logout
          </button>
        </form>
      </div>
    </div>
  );
}
