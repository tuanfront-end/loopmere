"use client";

import { useState } from "react";
import YouTube from "react-youtube";

import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { padNumber } from "@/helpers/number";

interface LofiModalProps {
  onClose: () => void;
  show: boolean;
}

const STATIONS = [
  { channel: "Lofi Girl", id: "X4VbdwhkE10", title: "lofi hip hop radio" },
  { channel: "Lofi Girl", id: "4xDzrJKXOOY", title: "synthwave radio" },
  { channel: "Lofi Girl", id: "CwPCy1GLS38", title: "sad lofi radio" },
  { channel: "Lofi Girl", id: "S_MOd40zlYU", title: "dark ambient radio" },
  { channel: "Lofi Girl", id: "N0snMcR6aaA", title: "relaxing piano radio" },
];

export function LofiModal({ onClose, show }: LofiModalProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <ToolPanel
      className="sm:max-w-2xl"
      show={show}
      title="Lofi radio"
      onClose={onClose}
    >
      {accepted ? (
        <div className="flex flex-col gap-8">
          {STATIONS.map((station, index) => (
            <div key={station.id}>
              <h3 className="flex items-baseline gap-2 text-sm">
                <span className="text-muted-foreground tabular-nums">
                  {padNumber(index + 1, 2)}
                </span>
                <span className="font-medium">{station.channel}</span>
                <span className="text-muted-foreground">· {station.title}</span>
              </h3>

              <div className="mt-3 aspect-video overflow-hidden rounded-sm">
                <YouTube
                  className="size-full"
                  iframeClassName="size-full"
                  title={`${station.title}, ${station.channel}`}
                  videoId={station.id}
                />
              </div>
            </div>
          ))}
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
