"use client";

import { useRef } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSoundStore } from "@/stores/sound";

/** How far the pointer turns either side of the top, at full left or right. */
const SWEEP = (135 * Math.PI) / 180;

/** Pixels of drag for the whole travel, left end to right. */
const TRAVEL = 120;

const STEP = 0.05;

/** A balance in words, for a screen reader. */
function describe(pan: number) {
  if (pan === 0) return "Centre";

  return `${Math.round(Math.abs(pan) * 100)}% ${pan < 0 ? "left" : "right"}`;
}

/** A balance in the mixing desk's shorthand, for the tooltip. */
function short(pan: number) {
  if (pan === 0) return "centre";

  return `${pan < 0 ? "L" : "R"}${Math.round(Math.abs(pan) * 100)}`;
}

/** A point on the dial's circle, `turn` radians clockwise from the top. */
function at(turn: number, radius: number) {
  return [14 + radius * Math.sin(turn), 14 - radius * Math.cos(turn)] as const;
}

/**
 * The dial itself, drawn for `pan`: a ring with a notch at the middle, the
 * turn off it in the brand round the ring, and the pointer. Also the picture
 * of the control in the Controls panel.
 */
export function KnobGlyph({
  className,
  pan,
}: {
  className?: string;
  pan: number;
}) {
  const turn = pan * SWEEP;
  const [tipX, tipY] = at(turn, 9);
  const [baseX, baseY] = at(turn, 3.5);
  const [startX, startY] = at(0, 12);
  const [endX, endY] = at(turn, 12);

  return (
    <svg
      aria-hidden="true"
      className={cn("size-7", className)}
      viewBox="0 0 28 28"
    >
      {/* The ring, and a notch at the top for the middle. */}
      <circle
        className="fill-card stroke-border"
        cx="14"
        cy="14"
        r="12"
        strokeWidth="2"
      />
      <line
        className="stroke-muted-foreground/50"
        strokeLinecap="round"
        strokeWidth="1.5"
        x1="14"
        x2="14"
        y1="0.75"
        y2="2.75"
      />

      {/* How far off the middle, drawn round the ring in the brand: the
          level's fill, read as a turn rather than a length. */}
      {pan !== 0 && (
        <path
          className="stroke-primary"
          d={`M ${startX} ${startY} A 12 12 0 0 ${pan > 0 ? 1 : 0} ${endX} ${endY}`}
          fill="none"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      )}

      <line
        className="stroke-foreground"
        strokeLinecap="round"
        strokeWidth="2"
        x1={baseX}
        x2={tipX}
        y1={baseY}
        y2={tipY}
      />
    </svg>
  );
}

interface BalanceKnobProps {
  className?: string;
  id: string;
  label: string;
}

/**
 * Where a sound sits between the ears, as a desk's pan pot: a dial left of
 * the level, so one sound stays one row in the mix desk. A second slider under
 * the level doubled every row's height and read as a second level.
 *
 * Dragged sideways — right turns it right — or stepped with the arrows, and a
 * double-click puts it back in the middle. The tooltip says where it is while
 * it moves, which a dial this size cannot.
 */
export function BalanceKnob({ className, id, label }: BalanceKnobProps) {
  const pan = useSoundStore((state) => state.sounds[id].pan);
  const setPan = useSoundStore((state) => state.setPan);
  const drag = useRef<{ from: number; x: number; y: number } | null>(null);

  const place = (value: number) => {
    const stepped = Math.round(Math.max(-1, Math.min(1, value)) / STEP) * STEP;

    setPan(id, Math.abs(stepped) < STEP / 2 ? 0 : Number(stepped.toFixed(2)));
  };

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={`${label} balance`}
        aria-orientation="horizontal"
        aria-valuemax={1}
        aria-valuemin={-1}
        aria-valuenow={pan}
        aria-valuetext={describe(pan)}
        className={cn(
          "focus-visible:ring-ring/50 hover:bg-muted grid size-8 shrink-0 cursor-ew-resize touch-none place-items-center rounded-full transition-colors outline-none select-none focus-visible:ring-3",
          className,
        )}
        render={<div />}
        role="slider"
        tabIndex={0}
        onDoubleClick={() => place(0)}
        onKeyDown={(event) => {
          const moves: Record<string, number> = {
            ArrowDown: pan - STEP,
            ArrowLeft: pan - STEP,
            ArrowRight: pan + STEP,
            ArrowUp: pan + STEP,
            End: 1,
            Home: -1,
            PageDown: pan - 0.25,
            PageUp: pan + 0.25,
          };

          if (!(event.key in moves)) return;

          event.preventDefault();
          event.stopPropagation();
          place(moves[event.key]);
        }}
        onPointerDown={(event) => {
          // The main button only: a right-click started a drag, and with the
          // menu open its release never arrived.
          if (event.button !== 0) return;

          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { from: pan, x: event.clientX, y: event.clientY };
        }}
        // Every way a drag can end, not only a release over the page. One
        // that ended any other way left the drag open, and a pointer merely
        // passing over the dial afterwards turned it.
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onPointerMove={(event) => {
          if (!drag.current) return;

          // Up counts as right too, the way a knob turns under a thumb.
          const moved =
            event.clientX - drag.current.x - (event.clientY - drag.current.y);

          place(drag.current.from + (moved / TRAVEL) * 2);
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
      >
        <KnobGlyph pan={pan} />
      </TooltipTrigger>
      <TooltipContent>Balance · {short(pan)}</TooltipContent>
    </Tooltip>
  );
}
