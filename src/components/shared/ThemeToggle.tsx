"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { useSettingsStore } from "@/stores/settingsStore";

export function ThemeToggle() {
  const theme = useSettingsStore((state) => state.theme);
  const toggleTheme = useSettingsStore((state) => state.toggleTheme);
  return (
    <Tooltip content="Toggle theme (⌘/)">
      <Button type="button" variant="secondary" size="icon" aria-label="Toggle dark or light theme" onClick={toggleTheme}>
        {theme === "dark" ? <Moon aria-hidden="true" size={17} /> : <Sun aria-hidden="true" size={17} />}
      </Button>
    </Tooltip>
  );
}
