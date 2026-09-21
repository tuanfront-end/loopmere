import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import { ServiceWorker } from "@/components/moodist/service-worker";
import { Shell } from "@/components/moodist/shell";
import { StoreConsumer } from "@/components/moodist/store-consumer";
import { Toolbar } from "@/components/moodist/toolbar";
import { ToolsProvider } from "@/components/moodist/tools-provider";
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
        <TooltipProvider delay={200}>
          {/* The header is a dozen tab stops before the first sound card. */}
          <a
            className="bg-card shadow-soft-lg sr-only rounded-full px-5 py-2.5 text-sm font-medium focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60"
            href="#content"
          >
            Skip to the sounds
          </a>

          <StoreConsumer>
            <ToolsProvider>
              <Shell>{children}</Shell>
              <Toolbar />
            </ToolsProvider>
          </StoreConsumer>
        </TooltipProvider>
        <ServiceWorker />
        <Toaster />
      </body>
    </html>
  );
}
