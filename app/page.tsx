import { App } from "@/components/moodist/app";
import { Hero } from "@/components/moodist/hero";

export default function Home() {
  return (
    <main className="flex flex-col gap-32 pb-40 sm:gap-40">
      <Hero />
      <App />
    </main>
  );
}
