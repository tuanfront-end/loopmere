"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ToolPanelProps {
  /** Sits on the title's row: a settings cog, a counter, a reset. */
  action?: React.ReactNode;
  blurb?: string;
  children: React.ReactNode;
  className?: string;
  onClose: () => void;
  show: boolean;
  title: string;
}

/**
 * Every tool and every modal opens through this, so the escape key, the focus
 * trap, the scroll lock and the close control are one implementation rather
 * than thirteen.
 */
export function ToolPanel({
  action,
  blurb,
  children,
  className,
  onClose,
  show,
  title,
}: ToolPanelProps) {
  return (
    <Dialog open={show} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className={cn("sm:max-w-md", className)}>
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 pr-10">
            <DialogTitle className="text-xl tracking-tight">
              {title}
            </DialogTitle>
            {action}
          </div>
          {/* No stand-in description when there is no blurb: repeating the
              title there had a screen reader say the panel's name twice. */}
          {blurb && <DialogDescription>{blurb}</DialogDescription>}
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
}
