import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import { IconSetProvider } from "@/components/dev/icon-set";
import { SwitchControl } from "@/components/dev/switch-control";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

/** The Warm pairing: a soft display serif over a wide humanist grotesque. */
const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });

const heading = Fraunces({
  axes: ["opsz"],
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Moodist — ambient sound, mixed by you",
  description:
    "Eighty-odd loops of rain, forest, cafe and static. Layer them, set the levels, and let the tab run.",
};

export const viewport: Viewport = {
  themeColor: "#fdfcfa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${heading.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <IconSetProvider>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
          {/* Build scaffolding: delete components/dev/ and these two lines. */}
          <SwitchControl />
        </IconSetProvider>
        <Toaster />
      </body>
    </html>
  );
}
