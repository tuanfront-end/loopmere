import { App } from "@/components/moodist/app";
import { count } from "@/lib/sounds";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24">
      <header className="py-20 text-center">
        <h1 className="font-display text-4xl leading-tight font-semibold text-balance sm:text-6xl">
          Ambient Sounds
          <br />
          For Focus and Calm
        </h1>
        <p className="text-muted-foreground mt-4 text-sm">
          {count(true)}+ sounds, mixed however you like. Nothing to sign up for.
        </p>
      </header>

      <App />
    </main>
  );
}
