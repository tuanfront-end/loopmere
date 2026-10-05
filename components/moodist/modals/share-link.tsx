"use client";

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PAN_KEY, SHARE_PARAM, SWELL_KEY } from "@/constants/share";
import { useCopy } from "@/hooks/use-copy";
import { extrasOf, useSoundStore } from "@/stores/sound";

interface ShareLinkModalProps {
  onClose: () => void;
  show: boolean;
}

export function ShareLinkModal({ onClose, show }: ShareLinkModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const sounds = useSoundStore((state) => state.sounds);
  const { copy, copying } = useCopy();

  useEffect(() => setIsMounted(true), []);

  const mix = useMemo(() => {
    const ids = Object.keys(sounds).filter((id) => sounds[id].isSelected);
    const { pan, swell } = extrasOf(sounds, ids);

    return JSON.stringify({
      ...Object.fromEntries(
        ids.map((id) => [id, Number(sounds[id].volume.toFixed(2))]),
      ),
      ...(swell.length > 0 && { [SWELL_KEY]: swell }),
      ...(Object.keys(pan).length > 0 && { [PAN_KEY]: pan }),
    });
  }, [sounds]);

  /**
   * The origin is only knowable on the client, so the first render leaves it
   * off. It used to guess `moodist.app`, which is the original's domain, and a
   * port has no business handing that out as its own.
   */
  const url = useMemo(() => {
    const origin = isMounted ? window.location.origin : "";

    return `${origin}/?${SHARE_PARAM}=${encodeURIComponent(mix)}`;
  }, [mix, isMounted]);

  return (
    <ToolPanel
      blurb="Whoever opens it gets your loops at your levels."
      show={show}
      title="Send this mix"
      onClose={onClose}
    >
      <div className="flex gap-2">
        <Input aria-label="Link to this mix" readOnly value={url} />
        <Button
          aria-label="Copy the link"
          size="icon"
          variant="outline"
          onClick={() => {
            copy(url);
            toast.success("Link copied.");
          }}
        >
          <HugeiconsIcon
            icon={copying ? Tick02Icon : Copy01Icon}
            strokeWidth={1.5}
          />
        </Button>
      </div>
    </ToolPanel>
  );
}
