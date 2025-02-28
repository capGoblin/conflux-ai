import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center mb-8">
          <Button variant="outline" size="sm" asChild className="mr-4 border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-white">About</h1>
        </div>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg mb-6 text-zinc-300">
            This is a clean Next.js 14 project with minimal boilerplate.
          </p>
          
          <p className="mb-6 text-zinc-400">
            Ready for you to build your application.
          </p>
        </div>
      </div>
    </div>
  );
}