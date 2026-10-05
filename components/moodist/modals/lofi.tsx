"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STATIONS } from "@/data/stations";
import { padNumber } from "@/helpers/number";
import { removeKeepingFocus } from "@/lib/focus";
import { keepKeys } from "@/lib/keys";
import { lookUpVideo, parseYouTubeLink } from "@/lib/youtube";
import { type Station, useRadioStore } from "@/stores/radio";

interface LofiModalProps {
  onClose: () => void;
  show: boolean;
}

const BUILT_IN = new Set(STATIONS.map((station) => station.id));

const PROBLEMS = {
  "no-embed":
    "Its owner does not let it play outside YouTube. Try another link.",
  "not-found":
    "YouTube could not find that video. It may be private or taken down.",
  "not-youtube":
    "That is not a YouTube link. Paste the address of a video or a live stream.",
  offline: "YouTube did not answer. Check your connection and try again.",
  playlist:
    "A playlist cannot play here yet. Open one video from it and paste that link.",
} as const;

function AddStation({
  input,
}: {
  input: React.RefObject<HTMLInputElement | null>;
}) {
  const stations = useRadioStore((state) => state.stations);
  const addStation = useRadioStore((state) => state.addStation);
  const [link, setLink] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const parsed = parseYouTubeLink(link);

    if ("error" in parsed) {
      setProblem(PROBLEMS[parsed.error]);
      return;
    }

    if (BUILT_IN.has(parsed.id)) {
      setProblem("That station is already on the list below.");
      return;
    }

    if (stations.some((station) => station.id === parsed.id)) {
      setProblem("That one is already among your stations.");
      return;
    }

    setBusy(true);
    const result = await lookUpVideo(parsed.id);
    setBusy(false);

    if (!result.ok) {
      setProblem(PROBLEMS[result.reason]);
      return;
    }

    addStation({ id: parsed.id, ...result.details });
    setLink("");
    setProblem(null);
    toast.success(`Added ${result.details.title}.`);
  };

  return (
    <div className="flex flex-col gap-2">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy) submit();
        }}
      >
        <Input
          aria-describedby="lofi-add-note"
          aria-invalid={problem ? true : undefined}
          aria-label="YouTube link"
          inputMode="url"
          placeholder="Paste a YouTube link"
          ref={input}
          required
          value={link}
          onChange={(event) => {
            setLink(event.target.value);
            if (problem) setProblem(null);
          }}
          onKeyDown={keepKeys}
        />
        <Button disabled={busy} type="submit">
          {busy ? "Adding…" : "Add"}
        </Button>
      </form>

      {/* One line under the field, swapped rather than stacked: the note
          says what the field takes until there is a problem to say instead. */}
      <p
        aria-live="polite"
        className={
          problem ? "text-destructive text-sm" : "text-muted-foreground text-sm"
        }
        id="lofi-add-note"
      >
        {problem ??
          "Any video or live stream. It stays in this browser, like your presets."}
      </p>
    </div>
  );
}

function Group({ count, label }: { count: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <p className="text-xs font-medium">{label}</p>
      <div className="bg-border h-px flex-1" />
      <p className="text-muted-foreground text-xs tabular-nums">{count}</p>
    </div>
  );
}

function StationRow({
  action,
  index,
  onTune,
  station,
}: {
  action?: React.ReactNode;
  index: number;
  onTune: () => void;
  station: Station;
}) {
  const isCurrent = useRadioStore((state) => state.current?.id === station.id);
  const playing = useRadioStore((state) => state.playing);
  const sounding = isCurrent && playing;

  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="text-muted-foreground w-5 shrink-0 text-sm tabular-nums">
        {padNumber(index + 1, 2)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{station.title}</p>
        <p className="text-muted-foreground truncate text-xs">
          {station.channel}
          {isCurrent && (playing ? " · Playing" : " · Paused")}
        </p>
      </div>

      {action}

      {/* The station on the player turns its button into the player's own
          pause, the way a loaded preset does, and leaves the panel open. Any
          other one tunes the player to it and closes the panel, so the next
          thing seen is the player it just started. */}
      <Button
        aria-label={
          sounding ? `Pause ${station.title}` : `Play ${station.title}`
        }
        size="icon-sm"
        variant={isCurrent ? "default" : "outline"}
        onClick={() => {
          const radio = useRadioStore.getState();

          if (isCurrent) {
            radio.setPlaying(!radio.playing);
            return;
          }

          radio.tune(station);
          onTune();
        }}
      >
        {sounding ? <PauseIcon /> : <PlayIcon />}
      </Button>
    </li>
  );
}

export function LofiModal({ onClose, show }: LofiModalProps) {
  const accepted = useRadioStore((state) => state.accepted);
  const accept = useRadioStore((state) => state.accept);
  const stations = useRadioStore((state) => state.stations);
  const removeStation = useRadioStore((state) => state.removeStation);
  const input = useRef<HTMLInputElement>(null);

  return (
    <ToolPanel
      blurb={
        accepted
          ? "Pick a station. It keeps playing in a small player while you change your mix."
          : undefined
      }
      show={show}
      title="Lofi radio"
      onClose={onClose}
    >
      {accepted ? (
        <div className="flex flex-col gap-6">
          {/* After the consent, not before: looking a link up asks YouTube
              for its title, which is the same connection the player makes. */}
          <AddStation input={input} />

          {stations.length > 0 && (
            <div>
              <Group count={stations.length} label="Yours" />
              <ul className="mt-2 flex flex-col">
                {stations.map((station, index) => (
                  <StationRow
                    action={
                      <Button
                        aria-label={`Remove ${station.title}`}
                        className="shrink-0"
                        data-slot="station-remove"
                        size="icon-sm"
                        variant="ghost"
                        // Focus moves to the next station's remove, and to the
                        // link field once the last one is gone.
                        onClick={(event) =>
                          removeKeepingFocus(
                            event.currentTarget,
                            event.currentTarget
                              .closest("ul")!
                              .querySelectorAll<HTMLElement>(
                                "[data-slot=station-remove]",
                              ),
                            () => removeStation(station.id),
                            () => input.current,
                          )
                        }
                      >
                        <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} />
                      </Button>
                    }
                    index={index}
                    key={station.id}
                    station={station}
                    onTune={onClose}
                  />
                ))}
              </ul>
            </div>
          )}

          <div>
            <Group count={STATIONS.length} label="Lofi Girl" />
            <ul className="mt-2 flex flex-col">
              {STATIONS.map((station, index) => (
                <StationRow
                  index={index}
                  key={station.id}
                  station={station}
                  onTune={onClose}
                />
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* The embed is a third party, so the visitor decides, not the page.
              Asked once: the answer is kept with the stations. */}
          <p className="text-muted-foreground text-sm">
            These stations play through an embedded YouTube player. Loading it
            connects you to YouTube, which collects data under its own privacy
            policy. Loopmere itself only counts visits, anonymously.
          </p>

          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" onClick={onClose}>
              Not now
            </Button>
            <Button className="flex-1" onClick={accept}>
              Show the stations
            </Button>
          </div>
        </>
      )}
    </ToolPanel>
  );
}
