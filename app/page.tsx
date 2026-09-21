import { App } from "@/components/moodist/app";
import { Hero } from "@/components/moodist/hero";
import { SiteFooter } from "@/components/moodist/site-footer";

export default function Home() {
  return (
    <main
      className="flex grow flex-col gap-32 pb-40 sm:gap-40 xl:gap-28 xl:pb-16"
      id="content"
    >
      <Hero />
      <App />
      <SiteFooter />
    </main>
  );
}
