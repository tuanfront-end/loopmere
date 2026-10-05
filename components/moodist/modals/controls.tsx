"use client";

import { PauseIcon } from "@heroicons/react/16/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  DashedLine01Icon,
  Delete02Icon,
  FavouriteIcon,
  MinusSignIcon,
  ShuffleIcon,
  Sine02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { KnobGlyph } from "../balance-knob";
import { SoundIcon } from "../sound-icon";
import { ToolPanel } from "../tool-panel";

import { cn } from "@/lib/utils";

interface ControlsModalProps {
  onClose: () => void;
  show: boolean;
}

function Glyph({ icon }: { icon: typeof Sine02Icon }) {
  return <HugeiconsIcon className="size-4" icon={icon} strokeWidth={1.5} />;
}

function Row({
  children,
  glyph,
  name,
  ring = false,
}: {
  children: React.ReactNode;
  glyph: React.ReactNode;
  name: string;
  /** Draws the chip as a card that is in the mix. */
  ring?: boolean;
}) {
  return (
    <li className="flex gap-3 py-2.5">
      {/* The control as it looks on the page, so the line beside it can be
          matched to the thing on screen without reading its name. */}
      <span
        aria-hidden="true"
        className={cn(
          "bg-muted text-foreground grid size-9 shrink-0 place-items-center rounded-sm",
          ring && "bg-card ring-primary ring-2 ring-inset",
        )}
      >
        {glyph}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-muted-foreground mt-0.5 text-sm">{children}</p>
      </div>
    </li>
  );
}

function Group({
  caption,
  children,
  title,
}: {
  caption?: string;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <p className="text-xs font-medium">{title}</p>
        <div className="bg-border h-px flex-1" />
      </div>
      {caption && (
        <p className="text-muted-foreground mt-1 text-xs">{caption}</p>
      )}
      {/* A legend: each line is a record looked up, not copy read through. */}
      <ul className="mt-1 flex flex-col" data-object>
        {children}
      </ul>
    </div>
  );
}

/**
 * What each wordless control does, drawn as it looks. The cards, the mix desk
 * and the radio grew buttons that are a glyph and a tooltip — Swell, the
 * balance dial, Now and then — and a tooltip needs a pointer resting on the
 * one thing already in question. This is the page that answers all of them.
 */
export function ControlsModal({ onClose, show }: ControlsModalProps) {
  return (
    <ToolPanel show={show} title="What the controls do" onClose={onClose}>
      <div className="flex flex-col gap-6">
        <Group title="On a card">
          <Row glyph={<SoundIcon id="campfire" size={22} />} name="A card" ring>
            Tap it to add the sound to the mix, and again to take it out. The
            green ring means it is in.
          </Row>
          <Row
            glyph={
              <span className="bg-muted-foreground/20 relative block h-1 w-5 rounded-full">
                <span className="bg-primary absolute inset-y-0 left-0 w-3 rounded-full" />
              </span>
            }
            name="Level"
          >
            How loud this one sound plays. Reaching for it adds the sound too.
          </Row>
          <Row glyph={<Glyph icon={Sine02Icon} />} name="Swell">
            The level rises and falls on a slow wave of its own, so the sound
            never sits quite still. The level you set is the top of the wave.
          </Row>
          <Row glyph={<Glyph icon={FavouriteIcon} />} name="Favourite">
            Keeps the sound on the Favourites shelf at the foot of the page.
          </Row>
        </Group>

        <Group
          caption="The column on the right, or Mix on a phone."
          title="In the mix"
        >
          <Row glyph={<KnobGlyph className="size-6" pan={0.4} />} name="Balance">
            Moves the sound towards your left or right ear. Drag it sideways;
            double-click to centre it. Best with headphones.
          </Row>
          <Row glyph={<Glyph icon={DashedLine01Icon} />} name="Now and then">
            Only on single sounds like thunder or an owl. It plays once, then
            rests half a minute to three before it plays again. The row says
            when it is back.
          </Row>
          <Row glyph={<PauseIcon className="size-4" />} name="Quieten">
            Silences one sound but keeps it in the mix, at its level.
          </Row>
          <Row glyph={<XMarkIcon className="size-4" />} name="Take out">
            Removes the sound from the mix. Its level is kept for next time.
          </Row>
          <Row glyph={<Glyph icon={ShuffleIcon} />} name="Build me a mix">
            Four sounds picked at random, at random levels.
          </Row>
          <Row glyph={<Glyph icon={Delete02Icon} />} name="Clear">
            Empties the mix. Undo on the message that follows brings it back.
          </Row>
        </Group>

        <Group title="Elsewhere">
          <Row glyph={<SoundIcon id="night-village" size={22} />} name="Scenes">
            Mixes made for you. One click plays a scene, a second pauses it.
          </Row>
          <Row
            glyph={<span className="text-xs font-medium">/</span>}
            name="Search"
          >
            Finds a sound by name. Press / to get there, and Enter to play the
            first match.
          </Row>
          <Row glyph={<Glyph icon={MinusSignIcon} />} name="Fold the radio">
            Hides the radio&rsquo;s video. The music keeps playing.
          </Row>
        </Group>
      </div>
    </ToolPanel>
  );
}
