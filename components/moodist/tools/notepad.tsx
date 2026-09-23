"use client";

import {
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  Tick02Icon,
  Undo02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { ToolButton } from "../tool-button";
import { ToolPanel } from "../tool-panel";

import { Textarea } from "@/components/ui/textarea";
import { download } from "@/helpers/download";
import { useCopy } from "@/hooks/use-copy";
import { useNoteStore } from "@/stores/note";
import { keepKeys } from "@/lib/keys";

interface NotepadProps {
  onClose: () => void;
  show: boolean;
}

export function Notepad({ onClose, show }: NotepadProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const note = useNoteStore((state) => state.note);
  const history = useNoteStore((state) => state.history);
  const write = useNoteStore((state) => state.write);
  const words = useNoteStore((state) => state.words());
  const characters = useNoteStore((state) => state.characters());
  const clear = useNoteStore((state) => state.clear);
  const restore = useNoteStore((state) => state.restore);

  const { copy, copying } = useCopy();

  useEffect(() => {
    if (show) setTimeout(() => textareaRef.current?.focus(), 10);
  }, [show]);

  return (
    <ToolPanel
      className="sm:max-w-xl"
      show={show}
      title="Your note"
      onClose={onClose}
      action={
        <div className="flex items-center gap-1">
          <ToolButton
            label="Copy the note"
            onClick={() => {
              copy(note);
              toast.success("Note copied.");
            }}
          >
            <HugeiconsIcon
              icon={copying ? Tick02Icon : Copy01Icon}
              strokeWidth={1.5}
            />
          </ToolButton>

          <ToolButton
            label="Download as a text file"
            onClick={() => {
              download("Loopmere note.txt", note);
              toast.success("Saved as Loopmere note.txt");
            }}
          >
            <HugeiconsIcon icon={Download01Icon} strokeWidth={1.5} />
          </ToolButton>

          <ToolButton
            label={history ? "Put the note back" : "Clear the note"}
            onClick={() => {
              if (history) {
                restore();
                toast.success("Note restored.");
              } else {
                clear();
                toast("Note cleared.", {
                  action: { label: "Undo", onClick: restore },
                });
              }
            }}
          >
            <HugeiconsIcon
              icon={history ? Undo02Icon : Delete02Icon}
              strokeWidth={1.5}
            />
          </ToolButton>
        </div>
      }
    >
      <Textarea
        className="min-h-64 resize-none"
        dir="auto"
        placeholder="What is on your mind?"
        ref={textareaRef}
        spellCheck={false}
        value={note}
        onChange={(event) => write(event.target.value)}
        // Escape belongs to the panel; every other key belongs to the note.
        onKeyDown={keepKeys}
      />

      <p className="text-muted-foreground text-xs tabular-nums">
        {characters} character{characters !== 1 && "s"} · {words} word
        {words !== 1 && "s"}
      </p>
    </ToolPanel>
  );
}
