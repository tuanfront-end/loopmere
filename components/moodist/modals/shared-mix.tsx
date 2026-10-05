"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { PAN_KEY, SHARE_PARAM, SWELL_KEY } from "@/constants/share";
import { sounds } from "@/data/sounds";
import { useCloseListener } from "@/hooks/use-close-listener";
import { useSoundStore } from "@/stores/sound";

interface SharedSound {
  id: string;
  label: string;
  pan: number;
  swell: boolean;
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
        unknown
      >;

      const swell = Array.isArray(parsed[SWELL_KEY]) ? parsed[SWELL_KEY] : [];
      const pan =
        parsed[PAN_KEY] && typeof parsed[PAN_KEY] === "object"
          ? (parsed[PAN_KEY] as Record<string, unknown>)
          : {};

      // A Map, not an object: the keys come from whoever wrote the link, and
      // on a plain object `constructor` or `__proto__` find a prototype
      // member. The first was saved into the mix as a sound; the second was
      // rendered as a child and took the whole page down.
      const labels = new Map(
        sounds.categories
          .flatMap((category) => category.sounds)
          .map((sound) => [sound.id, sound.label]),
      );

      const found = Object.keys(parsed).flatMap((id) => {
        const label = labels.get(id);
        const volume = Number(parsed[id]);

        // A level the slider could not have set is a hand-edited link, and a
        // stored 9 read back as 900% on the mix desk. Such a sound is left
        // out rather than guessed at.
        if (!label || !Number.isFinite(volume) || volume < 0 || volume > 1)
          return [];

        return [
          {
            id,
            label,
            // A hand-edited place is held to the rail rather than trusted.
            pan: Math.max(-1, Math.min(1, Number(pan[id]) || 0)),
            swell: swell.includes(id),
            volume,
          },
        ];
      });

      if (found.length) {
        setShared(found);
        setIsOpen(true);
      }
    } catch {
      // A hand-edited link: nothing to offer, and nothing to explain either.
    }

    // Replaced, not pushed: a pushed entry put the link back one press of
    // Back away. Only this parameter goes; a campaign tag beside it stays, as
    // the analytics wrapper promises.
    //
    // A task later, not now. Next patches `history` in an effect of its
    // router, which is this component's ancestor, so its effects run after
    // this one. A call made from here is the browser's own: the router keeps
    // the old address, and its next commit writes it back.
    const strip = setTimeout(() => {
      const url = new URL(window.location.href);

      url.searchParams.delete(SHARE_PARAM);
      history.replaceState(null, "", url);
    }, 0);

    return () => clearTimeout(strip);
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
            override(
              Object.fromEntries(shared.map((s) => [s.id, s.volume])),
              {
                pan: Object.fromEntries(shared.map((s) => [s.id, s.pan])),
                swell: shared.filter((s) => s.swell).map((s) => s.id),
              },
            );
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
