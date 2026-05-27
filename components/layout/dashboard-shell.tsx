"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, Button, Card, Drawer, Dropdown, Label } from "@heroui/react";
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  UserCircle2,
} from "lucide-react";

import { AppLogo } from "@/components/app-logo";
import { ThemeModeSwitch } from "@/components/theme-mode-switch";
import type { AuthUser } from "@/lib/types";

const navigation = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/inventory", icon: Boxes, label: "Inventory" },
  { href: "/dashboard/settings", icon: Settings2, label: "Settings" },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link href={item.href} key={item.href} onClick={onNavigate}>
            <Card
              className={`transition-all ${isActive ? "border-accent/30 bg-[color:color-mix(in_srgb,var(--accent)_13%,var(--surface))]" : "bg-transparent hover:bg-surface-secondary"}`}
              variant="transparent"
            >
              <Card.Content className="flex flex-row items-center gap-3 p-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-2xl ${isActive ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]" : "bg-surface-secondary text-muted"}`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted">
                    {item.label === "Inventory"
                      ? "Live product operations"
                      : item.label === "Settings"
                        ? "Global app controls"
                        : "Daily local overview"}
                  </p>
                </div>
              </Card.Content>
            </Card>
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthUser;
}) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app-shell-grid min-h-screen">
      <aside className="hidden border-r border-border/70 bg-surface/65 px-5 py-5 backdrop-blur-xl lg:block">
        <div className="sticky top-5 space-y-6">
          <div className="rounded-[1.75rem] border border-border/70 bg-surface p-5">
            <AppLogo />
          </div>
          <SidebarNav />
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                aria-label="Open navigation"
                className="lg:hidden"
                isIconOnly
                onPress={() => setDrawerOpen(true)}
                variant="secondary"
              >
                <Menu className="size-4" />
              </Button>
              <div>
                <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
                  Local workspace
                </p>
                <p className="text-lg font-semibold text-foreground">limncreartion-local</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeModeSwitch />
              <Dropdown>
                <Button className="h-auto rounded-full px-2 py-1" variant="secondary">
                  <Avatar size="sm" variant="soft">
                    <Avatar.Fallback>{user.name.slice(0, 1).toUpperCase()}</Avatar.Fallback>
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted capitalize">{user.role}</p>
                  </div>
                </Button>
                <Dropdown.Popover placement="bottom end">
                  <Dropdown.Menu onAction={(key) => key === "logout" && handleLogout()}>
                    <Dropdown.Item id="profile" textValue="Profile">
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="size-4" />
                        <Label>{user.email}</Label>
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item id="logout" textValue="Log out" variant="danger">
                      <div className="flex items-center gap-2">
                        <LogOut className="size-4" />
                        <Label>Log out</Label>
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6">{children}</main>
      </div>
      <Drawer isOpen={drawerOpen} onOpenChange={setDrawerOpen}>
        <Drawer.Backdrop />
        <Drawer.Content className="w-[92vw] max-w-sm lg:hidden" placement="left">
          <Drawer.Dialog>
            <Drawer.Header className="border-b border-border/70 px-5 py-4">
              <AppLogo compact />
            </Drawer.Header>
            <Drawer.Body className="px-4 py-4">
              <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
