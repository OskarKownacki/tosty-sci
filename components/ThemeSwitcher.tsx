"use client";
import { useTheme, type Theme } from "@/components/ThemeProvider";

const themeOptions: Array<{ value: Theme; label: string }> = [
  { value: "dark", label: "D" },
  { value: "wixapol", label: "W" },
  { value: "hellokitty", label: "H" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center rounded-lg border border-foreground/20 p-1">
      {themeOptions.map((option) => {
        const isActive = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setTheme(option.value)}
            className={`h-9 w-9 rounded-md text-sm font-semibold transition-colors ${
              isActive ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/10"
            }`}
            title={option.value}
            aria-label={option.value}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}