"use client";

import { PlayIcon } from "@heroicons/react/16/solid";
import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { toast } from "sonner";

import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePresetStore } from "@/stores/preset";
import { useSoundStore } from "@/stores/sound";

interface PresetsModalProps {
  onClose: () => void;
  show: boolean;
}

export function PresetsModal({ onClose, show }: PresetsModalProps) {
  const [name, setName] = useState("");

  const noSelected = useSoundStore((state) => state.noSelected());
  const sounds = useSoundStore((state) => state.sounds);
  const override = useSoundStore((state) => state.override);
  const play = useSoundStore((state) => state.play);

  const presets = usePresetStore((state) => state.presets);
  const addPreset = usePresetStore((state) => state.addPreset);
  const changeName = usePresetStore((state) => state.changeName);
  const deletePreset = usePresetStore((state) => state.deletePreset);

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
          if (!name || noSelected) return;

          addPreset(
            name,
            Object.fromEntries(
              Object.keys(sounds)
                .filter((id) => sounds[id].isSelected)
                .map((id) => [id, sounds[id].volume]),
            ),
          );
          setName("");
          toast.success(`Saved as ${name}.`);
        }}
      >
        <Input
          aria-label="Name this preset"
          disabled={noSelected}
          placeholder="Name this mix"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => event.stopPropagation()}
        />
        <Button disabled={noSelected} type="submit">
          Save
        </Button>
      </form>

      {noSelected && (
        <p className="text-muted-foreground text-sm">
          Nothing is playing, so there is nothing to save yet.
        </p>
      )}

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
            {presets.map((preset) => (
              <li className="flex items-center gap-2 py-3" key={preset.id}>
                <input
                  aria-label={`Rename ${preset.label}`}
                  className="flex-1 bg-transparent text-sm outline-none"
                  placeholder="Untitled"
                  value={preset.label}
                  onChange={(event) =>
                    changeName(preset.id, event.target.value)
                  }
                  onKeyDown={(event) => event.stopPropagation()}
                />

                <Button
                  aria-label={`Delete ${preset.label}`}
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => deletePreset(preset.id)}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} />
                </Button>

                <Button
                  aria-label={`Play ${preset.label}`}
                  size="icon-sm"
                  onClick={() => {
                    override(preset.sounds);
                    play();
                    onClose();
                  }}
                >
                  <PlayIcon />
                </Button>
              </li>
            ))}
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
