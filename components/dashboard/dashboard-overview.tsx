"use client";

import { useEffect, useState } from "react";

import { Card, Chip, Skeleton, Spinner, Tabs } from "@heroui/react";
import { Boxes, FolderTree, ShieldCheck, Settings2 } from "lucide-react";

type SummaryResponse = {
  stats: {
    configuredStoragePath: string | null;
    products: number;
    roles: string[];
    settingsConfigured: boolean;
    users: number;
  };
};

const statItems = [
  { icon: Boxes, key: "products", label: "Products tracked" },
  { icon: ShieldCheck, key: "users", label: "Team accounts" },
];

export function DashboardOverview() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      const response = await fetch("/api/dashboard/summary", { cache: "no-store" });
      const payload = (await response.json()) as SummaryResponse;

      if (isMounted) {
        setData(payload);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2].map((item) => (
            <Card className="gap-4 rounded-[1.5rem] p-5" key={item} variant="secondary">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-4 w-40 rounded-full" />
            </Card>
          ))}
        </div>
        <Card className="rounded-[1.75rem] p-6" variant="secondary">
          <div className="flex items-center gap-3 text-muted">
            <Spinner size="lg" />
            <span>Loading dashboard summary...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {statItems.map((item) => {
          const Icon = item.icon;
          const value = data.stats[item.key as "products" | "users"];

          return (
            <Card className="gap-4 rounded-[1.5rem] p-5" key={item.key} variant="secondary">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-surface-tertiary text-accent">
                <Icon className="size-5" />
              </div>
              <Card.Header className="flex flex-col items-start gap-1 p-0">
                <Card.Description>{item.label}</Card.Description>
                <Card.Title className="text-4xl">{value}</Card.Title>
              </Card.Header>
            </Card>
          );
        })}
      </div>
      <Card className="rounded-[1.75rem] p-5" variant="secondary">
        <Tabs defaultSelectedKey="overview" variant="secondary">
          <Tabs.ListContainer>
            <Tabs.List aria-label="Dashboard panels">
              <Tabs.Tab id="overview">
                Overview
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="status">
                Workspace status
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel className="pt-5" id="overview">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="gap-3 rounded-[1.5rem] p-5" variant="default">
                <div className="flex items-center gap-3">
                  <FolderTree className="size-5 text-accent" />
                  <p className="text-sm font-medium">Storage folder status</p>
                </div>
                <p className="text-sm leading-7 text-muted">
                  {data.stats.configuredStoragePath
                    ? data.stats.configuredStoragePath
                    : "Storage location is not configured yet."}
                </p>
              </Card>
              <Card className="gap-3 rounded-[1.5rem] p-5" variant="default">
                <div className="flex items-center gap-3">
                  <Settings2 className="size-5 text-accent" />
                  <p className="text-sm font-medium">Settings completeness</p>
                </div>
                <Chip color={data.stats.settingsConfigured ? "success" : "warning"} variant="soft">
                  {data.stats.settingsConfigured ? "Configured" : "Needs attention"}
                </Chip>
              </Card>
            </div>
          </Tabs.Panel>
          <Tabs.Panel className="pt-5" id="status">
            <div className="flex flex-wrap gap-3">
              {data.stats.roles.map((role) => (
                <Chip color="accent" key={role} variant="soft">
                  {role}
                </Chip>
              ))}
            </div>
          </Tabs.Panel>
        </Tabs>
      </Card>
    </div>
  );
}

