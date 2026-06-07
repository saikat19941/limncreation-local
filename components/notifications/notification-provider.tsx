"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { Button, Card, Chip, Dropdown, Spinner, Toast, ToastQueue } from "@heroui/react";
import { Bell, CheckCheck, ExternalLink, Inbox, RadioTower } from "lucide-react";

import type { AppSettings, NotificationRow } from "@/lib/types";

type ToastSettings = Pick<
  AppSettings,
  "toast_enabled" | "toast_max_visible" | "toast_placement" | "toast_timeout_ms"
>;

type NotificationPayload = {
  notifications: NotificationRow[];
  settings: ToastSettings;
  unreadCount: number;
};

type NotificationContextValue = {
  isLoading: boolean;
  markAllRead: () => Promise<void>;
  markRead: (notification: NotificationRow) => Promise<void>;
  notifications: NotificationRow[];
  refresh: () => Promise<void>;
  settings: ToastSettings;
  unreadCount: number;
};

const defaultSettings: ToastSettings = {
  toast_enabled: true,
  toast_max_visible: 3,
  toast_placement: "bottom end",
  toast_timeout_ms: 5000,
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

function notificationVariant(type: NotificationRow["type"]) {
  return type === "info" ? "accent" : type;
}

function formatNotificationTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [lastToastId, setLastToastId] = useState(0);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [settings, setSettings] = useState<ToastSettings>(defaultSettings);
  const [unreadCount, setUnreadCount] = useState(0);
  const queue = useMemo(
    () => new ToastQueue({ maxVisibleToasts: settings.toast_max_visible }),
    [settings.toast_max_visible],
  );

  async function refresh() {
    const response = await fetch("/api/notifications?limit=10", { cache: "no-store" });

    if (!response.ok) {
      setIsLoading(false);
      return;
    }

    const payload = (await response.json()) as NotificationPayload;
    const newestId = payload.notifications[0]?.id ?? lastToastId;
    const freshNotifications = payload.notifications
      .filter((notification) => lastToastId > 0 && notification.id > lastToastId)
      .sort((left, right) => left.id - right.id);

    setSettings(payload.settings);
    setNotifications(payload.notifications);
    setUnreadCount(payload.unreadCount);
    setLastToastId(newestId);
    setIsLoading(false);

    if (payload.settings.toast_enabled) {
      for (const notification of freshNotifications) {
        queue.add({
          description: notification.message ?? undefined,
          title: notification.title,
          variant: notificationVariant(notification.type),
        }, {
          timeout: payload.settings.toast_timeout_ms,
        });
      }
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();

    const interval = window.setInterval(() => {
      void refresh();
    }, 5000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markRead(notification: NotificationRow) {
    await fetch(`/api/notifications/${notification.id}`, { method: "PATCH" });
    await refresh();
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    await refresh();
  }

  return (
    <NotificationContext.Provider
      value={{
        isLoading,
        markAllRead,
        markRead,
        notifications,
        refresh,
        settings,
        unreadCount,
      }}
    >
      <Toast.Provider placement={settings.toast_placement} queue={queue} />
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used inside NotificationProvider.");
  }

  return context;
}

export function NotificationBell() {
  const { isLoading, markAllRead, markRead, notifications, unreadCount } = useNotifications();

  return (
    <Dropdown>
      <Button aria-label="Notifications" className="relative" isIconOnly variant="secondary">
        <Bell className="size-4" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-danger-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </Button>
      <Dropdown.Popover className="w-[min(92vw,420px)]" placement="bottom end">
        <Card className="border-0 bg-transparent shadow-none" variant="transparent">
          <Card.Header className="flex-row items-center justify-between gap-3 border-b border-border/70 p-4">
            <div>
              <Card.Title className="text-base">Notifications</Card.Title>
              <Card.Description>{unreadCount} unread update{unreadCount === 1 ? "" : "s"}</Card.Description>
            </div>
            <Button
              isDisabled={unreadCount === 0}
              onPress={() => void markAllRead()}
              size="sm"
              variant="secondary"
            >
              <CheckCheck className="size-4" />
              Read all
            </Button>
          </Card.Header>
          <Card.Content className="max-h-[420px] space-y-2 overflow-y-auto p-3">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted">
                <Spinner size="sm" />
                <span className="text-sm">Loading notifications</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center text-muted">
                <Inbox className="size-7" />
                <p className="text-sm">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  className="w-full rounded-lg border border-border/70 bg-surface p-3 text-left transition hover:bg-surface-secondary"
                  key={notification.id}
                  onClick={() => void markRead(notification)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Chip color={notification.type === "danger" ? "danger" : "accent"} size="sm" variant="soft">
                          {notification.type}
                        </Chip>
                        {!notification.read_at ? (
                          <span className="size-2 rounded-full bg-accent" aria-label="Unread" />
                        ) : null}
                      </div>
                      <p className="text-sm font-medium text-foreground">{notification.title}</p>
                      {notification.message ? (
                        <p className="line-clamp-2 text-xs leading-5 text-muted">{notification.message}</p>
                      ) : null}
                      <p className="text-xs text-muted">{formatNotificationTime(notification.created_at)}</p>
                    </div>
                    <RadioTower className="mt-1 size-4 shrink-0 text-muted" />
                  </div>
                </button>
              ))
            )}
          </Card.Content>
          <Card.Footer className="border-t border-border/70 p-3">
            <Link className="w-full" href="/dashboard/notifications">
              <Button className="w-full" variant="secondary">
                <ExternalLink className="size-4" />
                Open notification center
              </Button>
            </Link>
          </Card.Footer>
        </Card>
      </Dropdown.Popover>
    </Dropdown>
  );
}

export function NotificationListPage() {
  const { isLoading, markAllRead, markRead, notifications, unreadCount } = useNotifications();

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-muted">{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}</p>
        </div>
        <Button isDisabled={unreadCount === 0} onPress={() => void markAllRead()} variant="secondary">
          <CheckCheck className="size-4" />
          Mark all read
        </Button>
      </div>
      {isLoading ? (
        <Card className="p-6" variant="secondary">
          <div className="flex items-center gap-3 text-muted">
            <Spinner />
            <span>Loading notifications...</span>
          </div>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="p-8 text-center" variant="secondary">
          <Inbox className="mx-auto size-9 text-muted" />
          <p className="mt-3 text-sm text-muted">No notifications have been recorded yet.</p>
        </Card>
      ) : (
        notifications.map((notification) => (
          <Card className="rounded-lg p-4" key={notification.id} variant="secondary">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip color={notification.type === "danger" ? "danger" : "accent"} size="sm" variant="soft">
                    {notification.type}
                  </Chip>
                  <span className="text-xs text-muted">{formatNotificationTime(notification.created_at)}</span>
                  {!notification.read_at ? <Chip size="sm" variant="soft">Unread</Chip> : null}
                </div>
                <h3 className="text-base font-semibold text-foreground">{notification.title}</h3>
                {notification.message ? <p className="text-sm leading-6 text-muted">{notification.message}</p> : null}
              </div>
              <div className="flex items-center gap-2">
                {notification.action_url ? (
                  <Link href={notification.action_url}>
                    <Button size="sm" variant="secondary">
                      <ExternalLink className="size-4" />
                      Open
                    </Button>
                  </Link>
                ) : null}
                <Button
                  isDisabled={Boolean(notification.read_at)}
                  onPress={() => void markRead(notification)}
                  size="sm"
                  variant="secondary"
                >
                  <CheckCheck className="size-4" />
                  Mark read
                </Button>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
