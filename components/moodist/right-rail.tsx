"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Delete02Icon,
  ShuffleIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { PauseButton } from "./pause-button";
import { BalanceKnob } from "./balance-knob";
import { OccasionalButton } from "./occasional-button";
import { SoundIcon } from "./sound-icon";
import { SwellButton } from "./swell-button";
import { TOOL_GROUPS, useTools } from "./tools-provider";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sounds } from "@/data/sounds";
import { removeKeepingFocus } from "@/lib/focus";
import { cn } from "@/lib/utils";
import { useRestStore } from "@/stores/rest";
import { useSettingsStore } from "@/stores/settings";
import { useSoundStore } from "@/stores/sound";
import { PERCENT } from "@/components/ui/slider";

/** id → label, built once. The rail names sounds it never renders a card for. */
const labels: Record<string, string> = Object.fromEntries(
  sounds.categories.flatMap((category) =>
    category.sounds.map((sound) => [sound.id, sound.label]),
  ),
);

/**
 * `px-2.5` on the label and `pl-2.5` on every row below it, so the two start
 * at the same pixel. A label sitting six pixels left of the icons it names is
 * the misalignment you cannot unsee once you have seen it — and it only ever
 * looked right on hover, when the row's ground reached out to meet it.
 *
 * What stays at the rail's own edge is a ground: a button, a bordered mix row.
 * Something you read lines up with what you read; something you press does not
 * have to.
 */
function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section>
      <h2 className="text-muted-foreground px-2.5 text-xs tracking-widest uppercase">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** The sounds that can come now and then, from their data. */
const events = new Set(
  sounds.categories
    .flatMap((category) => category.sounds)
    .filter((sound) => sound.event)
    .map((sound) => sound.id),
);

/** "in 40s", counting down, for a sound resting between plays. */
function Resting({ until }: { until: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);

    return () => clearInterval(timer);
  }, []);

  const left = Math.max(0, Math.ceil((until - now) / 1000));

  return (
    <>
      <span className="sr-only">Resting, back </span>
      {left >= 90 ? `in ${Math.round(left / 60)} min` : `in ${left}s`}
    </>
  );
}

function MixRow({
  id,
  shuffleButton,
}: {
  id: string;
  /** Where focus goes when this row was the last one — see its X. */
  shuffleButton: React.RefObject<HTMLButtonElement | null>;
}) {
  const volume = useSoundStore((state) => state.sounds[id].volume);
  const isPaused = useSoundStore((state) => state.sounds[id].isPaused);
  const setVolume = useSoundStore((state) => state.setVolume);
  const unselect = useSoundStore((state) => state.unselect);
  const restingUntil = useRestStore((state) => state.until[id]);

  return (
    <li
      // Still in the mix, still holding its level, just not sounding — the
      // render fades and the name goes grey, the card's own reading of the
      // state. Fading the whole row put its name at 3.88:1 and its level at
      // 2.28:1 while both were still something to read and a slider to drag.
      className="bg-card rounded-sm border p-3"
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "text-primary-ink shrink-0 transition-opacity",
            isPaused && "opacity-55",
          )}
        >
          <SoundIcon id={id} size={24} />
        </span>

        <span
          className={cn(
            "truncate text-sm font-medium",
            isPaused && "text-muted-foreground",
          )}
        >
          {labels[id]}
        </span>

        {/* Between plays of a "now and then" sound the level gives way to
            when it is back: a sound in the mix, unpaused and silent, says
            what it is waiting for rather than looking broken. */}
        <span className="text-muted-foreground ml-auto text-xs tabular-nums">
          {restingUntil ? (
            <Resting until={restingUntil} />
          ) : (
            `${Math.round(volume * 100)}%`
          )}
        </span>

        <PauseButton
          className="-mr-1 size-8 shrink-0"
          id={id}
          label={labels[id]}
        />

        <Button
          aria-label={`Take ${labels[id]} out of the mix`}
          className="-mr-1 shrink-0"
          data-slot="mix-remove"
          size="icon-sm"
          variant="ghost"
          // The level stays with the sound; putting it back in the mix from
          // its card brings the level back with it.
          //
          // Focus moves to the X on the row that closes the gap. After the
          // last row it goes to Shuffle: Play and Clear are both disabled on
          // an empty desk, and Shuffle is the one way back to a mix from it.
          onClick={(event) =>
            removeKeepingFocus(
              event.currentTarget,
              event.currentTarget
                .closest("ul")!
                .querySelectorAll<HTMLElement>("[data-slot=mix-remove]"),
              () => unselect(id),
              () => shuffleButton.current,
            )
          }
        >
          <XMarkIcon />
        </Button>
      </div>

      {/* The level's row: where the sound sits, how loud, and the ways it
          moves on its own. Swell ends it rather than joining the buttons
          above, where a fourth left a name like "Rain on car roof" eighty
          pixels to be read in; balance leads it as a pan pot leads a
          channel strip, so a sound stays two rows. */}
      <div className="mt-3 flex items-center gap-2">
        <BalanceKnob className="-my-1 -ml-1" id={id} label={labels[id]} />

        <Slider
          format={PERCENT}
          aria-label={`${labels[id]} level`}
          className="min-w-0 flex-1"
          max={1}
          min={0}
          step={0.01}
          value={[volume]}
          onValueChange={(next) =>
            setVolume(id, Array.isArray(next) ? next[0] : next)
          }
        />

        {events.has(id) && (
          <OccasionalButton
            className="-my-1 size-8 shrink-0"
            id={id}
            label={labels[id]}
          />
        )}

        <SwellButton
          className="-my-1 -mr-1 size-8 shrink-0"
          id={id}
          label={labels[id]}
        />
      </div>
    </li>
  );
}

/**
 * The transport and a row per sound in the mix, with no heading of its own: the
 * rail puts it under an eyebrow, and the phone's mix sheet under the sheet's
 * title.
 */
export function MixDesk({
  empty = "Nothing picked yet. Tap a card in the middle and it starts — every sound you add gets its own level here.",
}: {
  /** What the desk says with nothing on it, which depends on where it is. */
  empty?: string;
}) {
  const isPlaying = useSoundStore((state) => state.isPlaying);
  const togglePlay = useSoundStore((state) => state.togglePlay);
  const noSelected = useSoundStore((state) => state.noSelected());
  const shuffle = useSoundStore((state) => state.shuffle);
  const unselectAll = useSoundStore((state) => state.unselectAll);
  const restoreHistory = useSoundStore((state) => state.restoreHistory);
  const hasHistory = useSoundStore((state) => !!state.history);
  const shuffleButton = useRef<HTMLButtonElement>(null);

  const selected = useSoundStore(
    useShallow((state) =>
      Object.keys(state.sounds).filter((id) => state.sounds[id].isSelected),
    ),
  );

  return (
    <>
      <div className="flex items-center gap-1">
        <Button className="flex-1" disabled={noSelected} onClick={togglePlay}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
          {isPlaying ? "Pause" : "Play"}
        </Button>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label="Pick four sounds at random"
                ref={shuffleButton}
                size="icon"
                variant="ghost"
                onClick={shuffle}
              >
                <HugeiconsIcon icon={ShuffleIcon} strokeWidth={1.5} />
              </Button>
            }
          />
          <TooltipContent>Surprise me</TooltipContent>
        </Tooltip>

        {hasHistory ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label="Bring the last mix back"
                  size="icon"
                  variant="ghost"
                  onClick={restoreHistory}
                >
                  <HugeiconsIcon icon={Undo02Icon} strokeWidth={1.5} />
                </Button>
              }
            />
            <TooltipContent>Bring it back</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label="Clear every sound"
                  disabled={noSelected}
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    unselectAll(true);
                    toast("Mix cleared.", {
                      action: { label: "Undo", onClick: restoreHistory },
                    });
                  }}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} />
                </Button>
              }
            />
            <TooltipContent>Clear the mix</TooltipContent>
          </Tooltip>
        )}
      </div>

      {selected.length ? (
        <ul className="mt-4 flex flex-col gap-2">
          {selected.map((id) => (
            <MixRow id={id} key={id} shuffleButton={shuffleButton} />
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-4 px-2.5 text-sm text-balance">
          {empty}
        </p>
      )}
    </>
  );
}

function TheMix() {
  const count = useSoundStore(
    (state) =>
      Object.keys(state.sounds).filter((id) => state.sounds[id].isSelected)
        .length,
  );

  return (
    <Section title={count ? `The mix · ${count}` : "The mix"}>
      <MixDesk />
    </Section>
  );
}

/** The two master levels, headed by whoever draws them — see `MixDesk`. */
export function LevelSliders() {
  const globalVolume = useSettingsStore((state) => state.globalVolume);
  const alarmVolume = useSettingsStore((state) => state.alarmVolume);
  const setGlobalVolume = useSettingsStore((state) => state.setGlobalVolume);
  const setAlarmVolume = useSettingsStore((state) => state.setAlarmVolume);

  const rows = [
    ["Everything", globalVolume, setGlobalVolume],
    ["Alarms and timers", alarmVolume, setAlarmVolume],
  ] as const;

  return (
    <div className="flex flex-col gap-5 px-2.5">
      {rows.map(([label, value, setValue]) => (
        <div key={label}>
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">{label}</p>
            <p className="text-muted-foreground text-xs tabular-nums">
              {Math.round(value * 100)}%
            </p>
          </div>
          <Slider
            format={PERCENT}
            aria-label={`${label} level`}
            className="mt-3"
            max={1}
            min={0}
            step={0.01}
            value={[value]}
            onValueChange={(next) =>
              setValue(Array.isArray(next) ? next[0] : next)
            }
          />
        </div>
      ))}
    </div>
  );
}

function Levels() {
  return (
    <Section title="Levels">
      <LevelSliders />
    </Section>
  );
}

function Tools() {
  // Hints for keys that do nothing would be the rail lying about them.
  const shortcuts = useSettingsStore((state) => state.shortcuts);
  const { open } = useTools();
  const noSelected = useSoundStore((state) => state.noSelected());

  const groups = useMemo(
    () => TOOL_GROUPS.filter((group) => group.title !== "This app"),
    [],
  );

  return (
    <Section title="Tools">
      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-muted-foreground px-2.5 text-xs">
              {group.title}
            </p>

            <div className="mt-2 flex flex-col gap-1">
              {group.tools.map((tool) => (
                <button
                  className="hover:bg-muted disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2.5 rounded-sm py-2 pr-4 pl-2.5 text-sm font-medium transition-colors"
                  disabled={tool.name === "shareLink" && noSelected}
                  key={tool.name}
                  onClick={() => open(tool.name)}
                >
                  <HugeiconsIcon
                    className="size-4 shrink-0"
                    icon={tool.icon}
                    strokeWidth={1.5}
                  />
                  {tool.label}
                  {shortcuts && tool.shortcut && (
                    <span className="text-muted-foreground ml-auto text-xs tracking-widest">
                      {tool.shortcut}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function RightRail() {
  const { open } = useTools();
  const shortcuts = useSettingsStore((state) => state.shortcuts);

  return (
    // The bottom padding grows by the radio's height while it sits over the
    // rail's foot, so the last tools scroll clear of it.
    <div className="no-scrollbar flex h-full flex-col gap-8 overflow-y-auto p-5 pb-[calc(1.25rem+var(--radio-cover,0px))]">
      <TheMix />
      <Levels />
      <Tools />

      {/* `Levels` is not here: its panel is the two sliders the section above
          already draws, and a rail that opens a modal onto its own content is
          a door to the room it is in. The floating menu keeps it, because
          below `xl` there is no section for it to be a duplicate of. */}
      <div className="mt-auto flex flex-col gap-1 pt-4">
        {TOOL_GROUPS.filter((group) => group.title === "This app").map(
          (group) =>
            group.tools
              .filter((tool) => tool.name !== "settings")
              .map((tool) => (
                <button
                  className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2.5 rounded-sm py-2 pr-4 pl-2.5 text-sm transition-colors"
                  key={tool.name}
                  onClick={() => open(tool.name)}
                >
                  <HugeiconsIcon
                    className="size-4 shrink-0"
                    icon={tool.icon}
                    strokeWidth={1.5}
                  />
                  {tool.label}
                  {shortcuts && tool.shortcut && (
                    <span className="ml-auto text-xs tracking-widest">
                      {tool.shortcut}
                    </span>
                  )}
                </button>
              )),
        )}
      </div>
    </div>
  );
}
