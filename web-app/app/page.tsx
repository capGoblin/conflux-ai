import Link from "next/link";
import { Button } from "@/components/ui/button";
import HeroAnimation from "@/components/conflux/hero-animation";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-black to-zinc-900">
      {/* Hero Section */}
      <div className="w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white leading-tight">
            Collaborative AI Trading,{" "}
            <span className="text-indigo-400">Privately Secured</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light">
            Connect your model. Preserve your data. Share the rewards.
          </p>
        </div>

        <div className="relative w-full h-[500px] md:h-[600px] mb-12">
          <HeroAnimation />
        </div>

        <Button
          size="lg"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-6 h-auto rounded-full shadow-lg shadow-indigo-900/30 transition-all duration-300 hover:scale-105"
          asChild
        >
          <Link href="/conflux">Join the Network</Link>
        </Button>
      </div>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black opacity-70"></div>
    </main>
  );
}
