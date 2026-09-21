import { App } from "@/components/moodist/app";
import { Hero } from "@/components/moodist/hero";

export default function Home() {
  return (
    <main className="flex grow flex-col gap-32 pb-40 sm:gap-40" id="content">
      <Hero />
      <App />
    </main>
  );
}
