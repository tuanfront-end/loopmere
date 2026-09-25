"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { SHARE_PARAM } from "@/constants/share";
import { sounds } from "@/data/sounds";
import { useCloseListener } from "@/hooks/use-close-listener";
import { useSoundStore } from "@/stores/sound";

interface SharedSound {
  id: string;
  label: string;
  volume: number;
}

/**
 * The receiving half of Send this mix. It reads `?share=` once on mount, then
 * strips the parameter so a refresh does not ask again.
 */
export function SharedMix() {
  const override = useSoundStore((state) => state.override);
  const play = useSoundStore((state) => state.play);

  const [isOpen, setIsOpen] = useState(false);
  const [shared, setShared] = useState<Array<SharedSound>>([]);

  useCloseListener(() => setIsOpen(false));

  useEffect(() => {
    const share = new URLSearchParams(window.location.search).get(SHARE_PARAM);

    if (!share) return;

    try {
      const parsed = JSON.parse(decodeURIComponent(share)) as Record<
        string,
        number
      >;

      const labels = Object.fromEntries(
        sounds.categories
          .flatMap((category) => category.sounds)
          .map((sound) => [sound.id, sound.label]),
      );

      const found = Object.keys(parsed)
        .filter((id) => labels[id])
        .map((id) => ({
          id,
          label: labels[id],
          volume: Number(parsed[id]),
        }));

      if (found.length) {
        setShared(found);
        setIsOpen(true);
      }
    } catch {
      // A hand-edited link: nothing to offer, and nothing to explain either.
    } finally {
      history.pushState({}, "", window.location.href.split("?")[0]);
    }
  }, []);

  return (
    <ToolPanel
      blurb="Someone sent you these. Taking them replaces whatever you have on."
      show={isOpen}
      title="A mix arrived"
      onClose={() => setIsOpen(false)}
    >
      <ul className="flex flex-wrap gap-2">
        {shared.map((sound) => (
          <li
            className="bg-muted rounded-full px-3 py-1.5 text-sm"
            key={sound.id}
          >
            {sound.label}
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          variant="outline"
          onClick={() => setIsOpen(false)}
        >
          Keep mine
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            override(Object.fromEntries(shared.map((s) => [s.id, s.volume])));
            play();
            setIsOpen(false);
            toast.success(`Playing ${shared.length} sounds from the link.`);
          }}
        >
          Play theirs
        </Button>
      </div>
    </ToolPanel>
  );
}
