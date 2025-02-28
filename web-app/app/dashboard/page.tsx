import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black to-zinc-900 text-white">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
          <Button variant="outline" size="sm" asChild className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="border border-zinc-800 rounded-lg p-8 flex items-center justify-center bg-zinc-900/50">
          <p className="text-zinc-400">Your dashboard content will go here</p>
        </div>
      </div>
    </div>
  );
}