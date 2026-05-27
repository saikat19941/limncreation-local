import type { ReactNode } from "react";

import { Breadcrumbs, Button, Card } from "@heroui/react";

export function PageSectionHeader({
  action,
  breadcrumb,
  description,
  title,
}: {
  action?: ReactNode;
  breadcrumb: { href?: string; label: string }[];
  description: string;
  title: string;
}) {
  return (
    <Card className="glass-panel hero-border mb-6 gap-5 rounded-[1.75rem] p-5" variant="secondary">
      <Card.Header className="flex flex-col items-start gap-4 p-0">
        <Breadcrumbs>
          {breadcrumb.map((item) => (
            <Breadcrumbs.Item href={item.href} key={item.label}>
              {item.label}
            </Breadcrumbs.Item>
          ))}
        </Breadcrumbs>
        <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Card.Title className="text-3xl">{title}</Card.Title>
            <Card.Description className="max-w-2xl text-sm leading-7 text-muted">
              {description}
            </Card.Description>
          </div>
          {action ? <div className="flex items-center gap-3">{action}</div> : <Button className="hidden" />}
        </div>
      </Card.Header>
    </Card>
  );
}

