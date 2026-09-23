import type { Metadata, Viewport } from "next";
import { Google_Sans_Flex } from "next/font/google";

import { ServiceWorker } from "@/components/moodist/service-worker";
import { THEME_SCRIPT } from "@/components/moodist/theme-provider";
import { Shell } from "@/components/moodist/shell";
import { StoreConsumer } from "@/components/moodist/store-consumer";
import { Toolbar } from "@/components/moodist/toolbar";
import { ToolsProvider } from "@/components/moodist/tools-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

/**
 * One family, which is the style's resting state and the right answer for a
 * product UI. `--font-heading` is left undeclared on purpose: `globals.css`
 * falls it back to `--font-sans`, so every heading resolves here too.
 *
 * The vietnamese subset is listed because `ss01` is what it is for — the
 * feature swaps the alternate ă and ạ and nothing else, so on Latin copy it
 * is inert and on Vietnamese copy it is the whole point.
 */
const sans = Google_Sans_Flex({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Loopmere — ambient sound, mixed by you",
  description:
    "Eighty-odd loops of rain, forest, cafe and static. Layer them, set the levels, and let the tab run.",
};

export const viewport: Viewport = {
  // One per scheme, so the browser chrome matches the page it is framing. The
  // values are `--background` from each block in `globals.css`; a mismatch
  // here shows as a seam above the status bar on a phone.
  themeColor: [
    { color: "#fdfcfa", media: "(prefers-color-scheme: light)" },
    { color: "#161514", media: "(prefers-color-scheme: dark)" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} h-full antialiased`}
      // The script below writes `class` and `style` on this element before
      // React sees it, which is exactly the mismatch this suppresses. It does
      // not reach any child.
      suppressHydrationWarning
    >
      <head>
        {/* Before the first paint, or the page is drawn light and repainted
            dark. `beforeInteractive` from `next/script` is not early enough
            for this one — it has to be the first thing the parser runs. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} id="theme" />
      </head>
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
