"use client";

import { Button, Dropdown, Label } from "@heroui/react";
import { Laptop, Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

const options = [
  { icon: SunMedium, key: "light", label: "Light" },
  { icon: Moon, key: "dark", label: "Dark" },
  { icon: Laptop, key: "system", label: "System" },
] as const;

export function ThemeModeSwitch() {
  const { resolvedTheme, setTheme, theme } = useTheme();

  const active = options.find((item) => item.key === theme) ?? options[2];
  const ActiveIcon = active.icon;

  return (
    <Dropdown>
      <Button aria-label="Theme mode" isIconOnly variant="secondary">
        <ActiveIcon className="size-4" />
      </Button>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu onAction={(key) => setTheme(String(key))}>
          {options.map((option) => {
            const Icon = option.icon;

            return (
              <Dropdown.Item id={option.key} key={option.key} textValue={option.label}>
                <div className="flex min-w-36 items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4" />
                    <Label>{option.label}</Label>
                  </div>
                  {option.key === resolvedTheme || option.key === theme ? (
                    <span className="text-xs text-accent">Active</span>
                  ) : null}
                </div>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

