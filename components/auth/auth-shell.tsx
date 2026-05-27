import type { ReactNode } from "react";

import { Card, Chip } from "@heroui/react";
import { Boxes, LockKeyhole, Sparkles } from "lucide-react";

import { AppLogo } from "@/components/app-logo";

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
}: {
  children: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[1.15fr_minmax(420px,560px)]">
      <section className="relative hidden overflow-hidden border-r border-border/70 px-10 py-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.13),transparent_35%)]" />
        <div className="relative z-10 flex w-full flex-col justify-between rounded-[2rem] border border-border/70 bg-surface/70 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl">
          <div className="space-y-10">
            <AppLogo />
            <div className="space-y-5">
              <Chip color="accent" variant="soft">
                {eyebrow}
              </Chip>
              <h1 className="max-w-xl text-5xl leading-tight font-semibold text-foreground">
                Build a clean local workflow for products, settings, and team access.
              </h1>
              <p className="max-w-lg text-base leading-8 text-muted">
                Fast local auth, HeroUI-based forms, responsive navigation, and live inventory
                updates tied to your LIMN backend.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: LockKeyhole, label: "Secure local auth" },
              { icon: Boxes, label: "Inventory-first workflow" },
              { icon: Sparkles, label: "Theme-aware UI" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.label} className="gap-3" variant="secondary">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-surface-tertiary text-accent">
                    <Icon className="size-5" />
                  </div>
                  <Card.Header className="p-0">
                    <Card.Title className="text-base">{item.label}</Card.Title>
                  </Card.Header>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <Card className="glass-panel hero-border w-full max-w-xl gap-6 rounded-[2rem] p-5 sm:p-8" variant="default">
          <Card.Header className="flex flex-col items-start gap-3 p-0">
            <AppLogo compact />
            <div className="space-y-2">
              <Chip color="accent" size="sm" variant="soft">
                {eyebrow}
              </Chip>
              <Card.Title className="text-3xl">{title}</Card.Title>
              <Card.Description className="text-sm leading-7 text-muted">
                {description}
              </Card.Description>
            </div>
          </Card.Header>
          <Card.Content className="p-0">{children}</Card.Content>
        </Card>
      </section>
    </div>
  );
}

