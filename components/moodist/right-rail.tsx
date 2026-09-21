"use client";

import { PauseIcon, PlayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Delete02Icon,
  ShuffleIcon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo } from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { PauseButton } from "./pause-button";
import { SoundIcon } from "./sound-icon";
import { TOOL_GROUPS, useTools } from "./tools-provider";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sounds } from "@/data/sounds";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings";
import { useSoundStore } from "@/stores/sound";

/** id → label, built once. The rail names sounds it never renders a card for. */
const labels: Record<string, string> = Object.fromEntries(
  sounds.categories.flatMap((category) =>
    category.sounds.map((sound) => [sound.id, sound.label]),
  ),
);

function Section({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section>
      <h2 className="text-muted-foreground px-1 text-xs tracking-widest uppercase">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MixRow({ id }: { id: string }) {
  const volume = useSoundStore((state) => state.sounds[id].volume);
  const isPaused = useSoundStore((state) => state.sounds[id].isPaused);
  const setVolume = useSoundStore((state) => state.setVolume);
  const unselect = useSoundStore((state) => state.unselect);

  return (
    <li
      className={cn(
        "bg-card rounded-sm border p-3 transition-opacity",
        // Still in the mix, still holding its level, just not sounding.
        isPaused && "opacity-55",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="bg-chip text-primary-ink grid size-8 shrink-0 place-items-center rounded-full"
        >
          <SoundIcon id={id} size={18} />
        </span>

        <span className="truncate text-sm font-medium">{labels[id]}</span>

        <span className="text-muted-foreground ml-auto text-xs tabular-nums">
          {Math.round(volume * 100)}%
        </span>

        <PauseButton
          className="-mr-1 size-8 shrink-0"
          id={id}
          label={labels[id]}
        />

        <Button
          aria-label={`Take ${labels[id]} out of the mix`}
          className="-mr-1 shrink-0"
          size="icon-sm"
          variant="ghost"
          onClick={() => {
            unselect(id);
            setVolume(id, 0.5);
          }}
        >
          <XMarkIcon />
        </Button>
      </div>

      <Slider
        aria-label={`${labels[id]} level`}
        className="mt-3"
        max={1}
        min={0}
        step={0.01}
        value={[volume]}
        onValueChange={(next) =>
          setVolume(id, Array.isArray(next) ? next[0] : next)
        }
      />
    </li>
  );
}

function TheMix() {
  const isPlaying = useSoundStore((state) => state.isPlaying);
  const togglePlay = useSoundStore((state) => state.togglePlay);
  const noSelected = useSoundStore((state) => state.noSelected());
  const shuffle = useSoundStore((state) => state.shuffle);
  const unselectAll = useSoundStore((state) => state.unselectAll);
  const restoreHistory = useSoundStore((state) => state.restoreHistory);
  const hasHistory = useSoundStore((state) => !!state.history);

  const selected = useSoundStore(
    useShallow((state) =>
      Object.keys(state.sounds).filter((id) => state.sounds[id].isSelected),
    ),
  );

  return (
    <Section
      title={selected.length ? `The mix · ${selected.length}` : "The mix"}
    >
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
            <MixRow id={id} key={id} />
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-4 px-1 text-sm">
          Nothing picked yet. Tap a card in the middle and it starts — every
          sound you add gets its own level here.
        </p>
      )}
    </Section>
  );
}

function Levels() {
  const globalVolume = useSettingsStore((state) => state.globalVolume);
  const alarmVolume = useSettingsStore((state) => state.alarmVolume);
  const setGlobalVolume = useSettingsStore((state) => state.setGlobalVolume);
  const setAlarmVolume = useSettingsStore((state) => state.setAlarmVolume);

  const rows = [
    ["Everything", globalVolume, setGlobalVolume],
    ["Alarms and timers", alarmVolume, setAlarmVolume],
  ] as const;

  return (
    <Section title="Levels">
      <div className="flex flex-col gap-5 px-1">
        {rows.map(([label, value, setValue]) => (
          <div key={label}>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-muted-foreground text-xs tabular-nums">
                {Math.round(value * 100)}%
              </p>
            </div>
            <Slider
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
    </Section>
  );
}

function Tools() {
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
            <p className="text-muted-foreground px-1 text-xs">{group.title}</p>

            <div className="mt-2 flex flex-col gap-1">
              {group.tools.map((tool) => (
                <button
                  className="hover:bg-muted disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2.5 rounded-full py-2 pr-4 pl-2.5 text-sm font-medium transition-colors"
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
                  {tool.shortcut && (
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

  return (
    <div className="no-scrollbar flex h-full flex-col gap-8 overflow-y-auto p-5">
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
                  className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2.5 rounded-full py-2 pr-4 pl-2.5 text-sm transition-colors"
                  key={tool.name}
                  onClick={() => open(tool.name)}
                >
                  <HugeiconsIcon
                    className="size-4 shrink-0"
                    icon={tool.icon}
                    strokeWidth={1.5}
                  />
                  {tool.label}
                  {tool.shortcut && (
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
