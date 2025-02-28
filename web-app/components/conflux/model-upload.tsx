"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ModelUpload() {
  const [modelStatus, setModelStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const [modelName, setModelName] = useState("");
  const [modelEndpoint, setModelEndpoint] = useState("");

  const handleConnect = () => {
    if (!modelName || !modelEndpoint) return;
    
    setModelStatus("connecting");
    
    // Simulate connection process
    setTimeout(() => {
      setModelStatus("connected");
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="model-name" className="text-zinc-400">Model Name</Label>
              <Input
                id="model-name"
                placeholder="e.g., ETH-Predictor-v3"
                className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                disabled={modelStatus === "connected"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-endpoint" className="text-zinc-400">API Endpoint</Label>
              <div className="relative">
                <Input
                  id="model-endpoint"
                  placeholder="https://your-model-api.com/predict"
                  className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500 pl-9"
                  value={modelEndpoint}
                  onChange={(e) => setModelEndpoint(e.target.value)}
                  disabled={modelStatus === "connected"}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              </div>
              <p className="text-xs text-zinc-500">Your model API remains private and never leaves your device</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {modelStatus === "connected" ? (
            <>
              <CheckCircle className="h-4 w-4 text-indigo-400 mr-2" />
              <span className="text-sm text-indigo-400">Model connected securely</span>
            </>
          ) : modelStatus === "connecting" ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-zinc-500 border-t-indigo-500 animate-spin mr-2"></div>
              <span className="text-sm text-zinc-400">Establishing secure connection...</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-zinc-500 mr-2" />
              <span className="text-sm text-zinc-500">No model connected</span>
            </>
          )}
        </div>
        
        <Button
          onClick={handleConnect}
          disabled={modelStatus === "connected" || modelStatus === "connecting" || !modelName || !modelEndpoint}
          className={cn(
            "bg-zinc-800 hover:bg-zinc-700 text-zinc-100",
            modelStatus === "connected" && "bg-indigo-600 hover:bg-indigo-700"
          )}
        >
          {modelStatus === "connected" ? (
            <>Connected</>
          ) : modelStatus === "connecting" ? (
            <>Connecting...</>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Connect Model
            </>
          )}
        </Button>
      </div>
    </div>
  );
}