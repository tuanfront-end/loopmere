"use client";

import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";
import YouTube from "react-youtube";
import { toast } from "sonner";

import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { padNumber } from "@/helpers/number";
import { removeKeepingFocus } from "@/lib/focus";
import { keepKeys } from "@/lib/keys";
import { lookUpVideo, parseYouTubeLink } from "@/lib/youtube";
import { type Station, useRadioStore } from "@/stores/radio";

interface LofiModalProps {
  onClose: () => void;
  show: boolean;
}

/**
 * Lofi Girl's live streams get a new id each time one restarts, and the old
 * id stays a valid video that only says "This live stream recording is not
 * available". oEmbed answers 200 for both, so a dead station does not show
 * from here: open its watch page, and take the new id from the channel's
 * Live tab.
 */
const STATIONS: Array<Station> = [
  { channel: "Lofi Girl", id: "rFZHOHl-L8A", title: "lofi hip hop radio" },
  { channel: "Lofi Girl", id: "4xDzrJKXOOY", title: "synthwave radio" },
  { channel: "Lofi Girl", id: "CwPCy1GLS38", title: "sad lofi radio" },
  { channel: "Lofi Girl", id: "S_MOd40zlYU", title: "dark ambient radio" },
  { channel: "Lofi Girl", id: "N0snMcR6aaA", title: "relaxing piano radio" },
];

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

function StationPlayer({
  action,
  index,
  station,
}: {
  action?: React.ReactNode;
  index: number;
  station: Station;
}) {
  return (
    <li>
      <div className="flex items-center gap-2">
        <h3 className="flex min-w-0 flex-1 items-baseline gap-2 text-sm">
          <span className="text-muted-foreground tabular-nums">
            {padNumber(index + 1, 2)}
          </span>
          <span className="shrink-0 font-medium">{station.channel}</span>
          <span className="text-muted-foreground truncate">
            · {station.title}
          </span>
        </h3>
        {action}
      </div>

      <div className="mt-3 aspect-video overflow-hidden rounded-sm">
        <YouTube
          className="size-full"
          iframeClassName="size-full"
          title={`${station.title}, ${station.channel}`}
          videoId={station.id}
        />
      </div>
    </li>
  );
}

export function LofiModal({ onClose, show }: LofiModalProps) {
  const [accepted, setAccepted] = useState(false);
  const stations = useRadioStore((state) => state.stations);
  const removeStation = useRadioStore((state) => state.removeStation);
  const input = useRef<HTMLInputElement>(null);

  return (
    <ToolPanel
      className="sm:max-w-2xl"
      show={show}
      title="Lofi radio"
      onClose={onClose}
    >
      {accepted ? (
        <div className="flex flex-col gap-8">
          {/* After the consent, not before: looking a link up asks YouTube
              for its title, which is the same connection the players make. */}
          <AddStation input={input} />

          {stations.length > 0 && (
            <div>
              <Group count={stations.length} label="Yours" />
              <ul className="mt-4 flex flex-col gap-8">
                {stations.map((station, index) => (
                  <StationPlayer
                    action={
                      <Button
                        aria-label={`Remove ${station.title}`}
                        className="-my-1.5 shrink-0"
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
                  />
                ))}
              </ul>
            </div>
          )}

          <div>
            <Group count={STATIONS.length} label="Lofi Girl" />
            <ul className="mt-4 flex flex-col gap-8">
              {STATIONS.map((station, index) => (
                <StationPlayer
                  index={index}
                  key={station.id}
                  station={station}
                />
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* The embed is a third party, so the visitor decides, not the page. */}
          <p className="text-muted-foreground text-sm">
            These stations are embedded YouTube players. Loading them connects
            you to YouTube, which collects data under its own privacy policy.
            Loopmere itself only counts visits, anonymously.
          </p>

          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" onClick={onClose}>
              Not now
            </Button>
            <Button className="flex-1" onClick={() => setAccepted(true)}>
              Load the players
            </Button>
          </div>
        </>
      )}
    </ToolPanel>
  );
}
