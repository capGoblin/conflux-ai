import Link from "next/link";
import ConfluxHeader from "@/components/conflux/header";
import AgentChat from "@/components/conflux/agent-chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Shield, Clock, ArrowDown, ArrowUp, AlertCircle } from "lucide-react";

export default function ConfluxAI() {
  return (
    <div className="flex min-h-screen bg-black text-zinc-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <ConfluxHeader />
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Model Connection */}
              <Card className="bg-zinc-900 border-zinc-800 col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-zinc-100 flex items-center">
                      <Brain className="mr-2 h-5 w-5 text-indigo-400" />
                      Global Model
                    </CardTitle>
                    <div className="flex items-center space-x-1 rounded-md bg-zinc-950 px-2 py-1 text-xs font-medium">
                      <Shield className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-indigo-400">Secure</span>
                    </div>
                  </div>
                  <CardDescription className="text-zinc-400">
                    Connect to the global trading model with your unique ID
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="relative">
                      <Input 
                        placeholder="Paste your global model ID" 
                        className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500 h-12"
                      />
                      <Button className="absolute right-1 top-1 bg-indigo-600 hover:bg-indigo-700 h-10">
                        Connect
                      </Button>
                    </div>
                    <p className="text-xs text-zinc-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Your model ID remains private and never leaves your device
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Contribution Score</span>
                      <span className="text-2xl font-bold text-indigo-400">76.4%</span>
                    </div>
                    <Progress value={76.4} className="h-2 bg-zinc-800" indicatorClassName="bg-indigo-500" />
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Global Rank: #42</span>
                      <span>Top 5%</span>
                    </div>
                  </div>
                  
                  <Separator className="bg-zinc-800" />
                  
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-zinc-300">Deposit</div>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <Select>
                        <SelectTrigger className="w-[120px] bg-zinc-900 border-zinc-800 text-zinc-100">
                          <SelectValue placeholder="ETH" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                          <SelectItem value="eth">ETH</SelectItem>
                          <SelectItem value="btc">BTC</SelectItem>
                          <SelectItem value="usdt">USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                      Deploy to Agent
                    </Button>
                  </div>
                  
                  <Separator className="bg-zinc-800" />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium text-zinc-300">Withdrawal</div>
                      <div className="text-xs text-zinc-500">Based on contribution score</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Available profit:</span>
                      <span className="text-xl font-semibold text-indigo-400">0.37 ETH</span>
                    </div>
                    <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
                      Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column - Agent Status */}
              <div className="space-y-6">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-zinc-100">Current Balance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-center">
                      <span className="text-4xl font-bold">2.45 ETH</span>
                    </div>
                    <div className="text-center text-xs text-zinc-500">
                      ≈ $5,423.78 USD
                    </div>
                  </CardContent>
                </Card>
                
                {/* Agent Chat (Mobile Only) */}
                <div className="lg:hidden">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-zinc-100">AI Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <AgentChat />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Sidebar - Agent Chat */}
      <div className="hidden lg:block w-80 border-l border-zinc-800 bg-zinc-950">
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Trading Status</div>
            <div className="flex items-center text-xs">
              <div className="h-2 w-2 rounded-full bg-indigo-400 mr-1.5"></div>
              <span className="text-indigo-400">Active</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-b border-zinc-800">
          <div className="space-y-2">
            <div className="text-xs text-zinc-500">Next scheduled trade</div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-zinc-400 mr-2" />
              <span className="text-lg font-medium">02:45:12</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-b border-zinc-800">
          <div className="space-y-2">
            <div className="text-xs text-zinc-500">Recent Transactions</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowUp className="h-3 w-3 text-red-500 mr-2" />
                  <span className="text-sm">Sell BTC</span>
                </div>
                <span className="text-sm font-medium">-0.015</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowDown className="h-3 w-3 text-indigo-400 mr-2" />
                  <span className="text-sm">Buy ETH</span>
                </div>
                <span className="text-sm font-medium">+0.12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowDown className="h-3 w-3 text-indigo-400 mr-2" />
                  <span className="text-sm">Buy ETH</span>
                </div>
                <span className="text-sm font-medium">+0.08</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 h-[calc(100vh-220px)]">
          <AgentChat />
        </div>
      </div>
    </div>
  );
}