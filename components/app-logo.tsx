import { Badge } from "@heroui/react";

export function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-[color:var(--accent)] text-sm font-bold text-[color:var(--accent-foreground)] shadow-lg shadow-orange-500/20">
        LC
      </div>
      {!compact ? (
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-[0.18em] text-muted uppercase">
            LIMN Creation
          </p>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold text-foreground">limncreartion-local</p>
            <Badge color="accent" size="sm" variant="soft">
              Local
            </Badge>
          </div>
        </div>
      ) : null}
    </div>
  );
}

