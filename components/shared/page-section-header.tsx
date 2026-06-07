import type { ReactNode } from "react";

import { Breadcrumbs, Button, Card, Tooltip} from "@heroui/react";
import { ProductThumbnailView } from "../inventory/product-thumbnail-view";

export function PageSectionHeader({
  action,
  breadcrumb,
  description,
  title,
  inventory_sub=false,
  productData,
}: {
  action?: ReactNode;
  breadcrumb: { href?: string; label: string }[];
  description: string;
  title: string;
  inventory_sub?: boolean;
  productData?: { id: string; lcsin: string; asin?: string; sku?: string; title: string; description?: string; created_at: string }[];
}) {
  return (
    
    inventory_sub ?(
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
            <div className="flex  flex-row gap-4 items-start">
              <div>
                <ProductThumbnailView 
                  lcsin={productData?.[0].lcsin || ""}
                />
              </div>
              <div className="space-y-2">
                <div className="flex flex-col items-start gap-2">
                  <Card.Title className="text-3xl">{title}</Card.Title>
                  <div className="flex items-center gap-1">
                    <Tooltip delay={0}>
                      <Button size="sm" variant="secondary">{productData?.[0].lcsin}</Button>
                      <Tooltip.Content>
                        <p>Limn Creation Standard Identification Number</p>
                      </Tooltip.Content>
                    </Tooltip>
                    <p className="text-muted">|</p>
                    
                    <Tooltip delay={0}>
                      <Button size="sm" variant="secondary">{productData?.[0].asin}</Button>
                      <Tooltip.Content>
                        <p>Amazon Standard Identification Number</p>
                      </Tooltip.Content>
                    </Tooltip>
                    <p className="text-muted">|</p>
                    <Tooltip delay={0}>
                      <Button size="sm" variant="secondary">{productData?.[0].sku}</Button>
                      <Tooltip.Content>
                        <p>Stock Keeping Unit</p>
                      </Tooltip.Content>
                    </Tooltip>
                    
                  </div>
                </div>
                <Card.Description className="max-w-2xl text-sm leading-7 text-muted">
                  {description}
                </Card.Description>
                
              </div>
            </div>
              
            {action ? <div className="flex items-center gap-3">{action}</div> : <Button className="hidden" />}
          </div>
        </Card.Header>
      </Card>
    ) : (
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
    )
    
  );
}

