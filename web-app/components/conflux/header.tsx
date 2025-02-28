"use client";

import { Button } from "@/components/ui/button";
import { Wallet, ChevronDown, ExternalLink } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function ConfluxHeader() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const connectWallet = () => {
    // Simulate wallet connection
    setIsConnected(true);
    setWalletAddress("0x7F5E...8A4D");
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 py-3 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-white flex items-center">
            <span className="text-indigo-400 mr-1">Conflux</span>
            <span>AI</span>
          </Link>
        </div>

        {isConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-white">
                <Wallet className="mr-2 h-4 w-4 text-indigo-400" />
                {walletAddress}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800 text-zinc-100">
              <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View on Explorer</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer text-red-400">
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={connectWallet}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}