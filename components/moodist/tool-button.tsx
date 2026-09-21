"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  variant?: "default" | "ghost" | "outline";
}

/** An icon-only control inside a panel, with its name in a tooltip. */
export function ToolButton({
  children,
  disabled = false,
  label,
  onClick,
  variant = "ghost",
}: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
        <Button
          aria-label={label}
          disabled={disabled}
          size="icon-sm"
          variant={variant}
          onClick={onClick}
        >
          {children}
        </Button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
