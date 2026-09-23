import { App } from "@/components/moodist/app";
import { Hero } from "@/components/moodist/hero";
import { SiteFooter } from "@/components/moodist/site-footer";
import { homeJsonLd, pageMeta, SITE_TITLE } from "@/lib/seo";

export const metadata = pageMeta({ path: "/", title: SITE_TITLE });

export default function Home() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: homeJsonLd() }}
        type="application/ld+json"
      />

      <main
        /* 96 at mobile rather than the house step's 128, and the floor drops
           with it. Nine near-identical shelves are a *run*, and the rule that
           sets the step says a run reads as one passage when it is tight; 128
           between two of them is a sixth of a 390px screen, spent eight times
           over. From `sm` the section is no longer three times the height of
           its window and the house number is right again. */
        className="flex grow flex-col gap-24 pb-24 sm:gap-40 sm:pb-32 xl:gap-28 xl:pb-16"
        id="content"
      >
        <Hero />
        <App />
        <SiteFooter />
      </main>
    </>
  );
}
