"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/16/solid";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";

import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePresetStore } from "@/stores/preset";
import { useSoundStore } from "@/stores/sound";
import { keepKeys } from "@/lib/keys";

interface PresetsModalProps {
  onClose: () => void;
  show: boolean;
}

/**
 * A mix as one comparable string: its loops in one order, each with its level
 * to the hundredth — the slider's own step. Levels count, not just loops,
 * because a preset is a mix at *those* levels: two presets can share every
 * loop and differ only in how loud, and only the one that is on is playing.
 */
const signature = (levels: Record<string, number>) =>
  Object.keys(levels)
    .sort()
    .map((id) => `${id}:${Math.round(levels[id] * 100)}`)
    .join();

export function PresetsModal({ onClose, show }: PresetsModalProps) {
  const [name, setName] = useState("");

  const noSelected = useSoundStore((state) => state.noSelected());
  const sounds = useSoundStore((state) => state.sounds);
  const override = useSoundStore((state) => state.override);
  const play = useSoundStore((state) => state.play);
  const togglePlay = useSoundStore((state) => state.togglePlay);
  const isPlaying = useSoundStore((state) => state.isPlaying);

  const presets = usePresetStore((state) => state.presets);
  const addPreset = usePresetStore((state) => state.addPreset);
  const changeName = usePresetStore((state) => state.changeName);
  const deletePreset = usePresetStore((state) => state.deletePreset);

  /** The mix that is on, as the levels a preset would save for it. */
  const mix = Object.fromEntries(
    Object.keys(sounds)
      .filter((id) => sounds[id].isSelected)
      .map((id) => [id, sounds[id].volume]),
  );

  /**
   * The saved preset the mix *is*, if any — matched on what is on rather than
   * on a flag set by the Play button, so it stays true for a preset rebuilt by
   * hand and goes false the moment a level moves. It is what the hero's
   * starter rows do too. While it matches, saving would only make a second
   * copy of it, so the field is closed and says why.
   */
  const saved = noSelected
    ? undefined
    : presets.find((preset) => signature(preset.sounds) === signature(mix));

  return (
    <ToolPanel
      blurb="A preset remembers which loops were on and how loud each one was."
      show={show}
      title="Presets"
      onClose={onClose}
    >
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name || noSelected || saved) return;

          addPreset(name, mix);
          setName("");
          toast.success(`Saved as ${name}.`);
        }}
      >
        <Input
          aria-label="Name this preset"
          disabled={noSelected || Boolean(saved)}
          placeholder="Name this mix"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={keepKeys}
        />
        <Button disabled={noSelected || Boolean(saved)} type="submit">
          Save
        </Button>
      </form>

      {noSelected ? (
        <p className="text-muted-foreground text-sm">
          Nothing is playing, so there is nothing to save yet.
        </p>
      ) : saved ? (
        <p className="text-muted-foreground text-sm">
          This mix is already saved as &ldquo;{saved.label || "Untitled"}&rdquo;.
        </p>
      ) : null}

      <div>
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium">Saved</p>
          <div className="bg-border h-px flex-1" />
          <p className="text-muted-foreground text-xs tabular-nums">
            {presets.length}
          </p>
        </div>

        {presets.length ? (
          <ul className="divide-border mt-2 divide-y">
            {presets.map((preset) => {
              const active = preset.id === saved?.id;
              const sounding = active && isPlaying;

              return (
                <li className="flex items-center gap-2 py-3" key={preset.id}>
                  <input
                    aria-label={`Rename ${preset.label}`}
                    className="-mx-1 flex-1 rounded-sm bg-transparent px-1 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    placeholder="Untitled"
                    value={preset.label}
                    onChange={(event) =>
                      changeName(preset.id, event.target.value)
                    }
                    onKeyDown={keepKeys}
                  />

                  <Button
                    aria-label={`Delete ${preset.label}`}
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => deletePreset(preset.id)}
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} />
                  </Button>

                  {/* The button is the transport once its preset is the mix
                      that is on — the turn the hero's starter rows make. A
                      play triangle beside a preset already sounding would be
                      the control lying about its own state. Pausing keeps the
                      panel open; only starting a different preset closes it,
                      which sends you back to the mix you just chose. */}
                  <Button
                    aria-label={
                      sounding
                        ? `Pause ${preset.label}`
                        : active
                          ? `Play ${preset.label} again`
                          : `Play ${preset.label}`
                    }
                    size="icon-sm"
                    onClick={() => {
                      if (active) {
                        togglePlay();
                        return;
                      }

                      override(preset.sounds);
                      play();
                      onClose();
                    }}
                  >
                    {sounding ? <PauseIcon /> : <PlayIcon />}
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            No presets yet. Build a mix, then name it above.
          </p>
        )}
      </div>
    </ToolPanel>
  );
}
