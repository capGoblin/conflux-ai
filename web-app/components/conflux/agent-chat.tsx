"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SecretjsFunctions } from "@/components/secretJs/SecretjsFunctions";

type Message = {
  id: number;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
};

interface AgentChatProps {
  logs: string[];
  setWithdrawAmount?: (amount: number) => void;
}

const AgentChat = ({ logs, setWithdrawAmount }: AgentChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Agent online. Trading parameters active. How can I assist you?",
      sender: "agent",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [agentStatus, setAgentStatus] = useState<
    "online" | "thinking" | "offline"
  >("online");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [logIndex, setLogIndex] = useState(0); // Track the current log index
  const [allLogsDisplayed, setAllLogsDisplayed] = useState(false); // Track if all logs have been displayed
  const { handle_record_total_profit, handle_query_profit_distribution } =
    SecretjsFunctions();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    // Function to add logs one by one with a delay
    const interval = setInterval(() => {
      if (logIndex < logs.length) {
        const log = logs[logIndex];
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            content: log,
            sender: "agent",
            timestamp: new Date(),
          },
        ]);
        setLogIndex((prev) => prev + 1); // Move to the next log
      } else {
        clearInterval(interval); // Clear the interval when all logs are added
        if (logs.length > 0 && logIndex >= logs.length && !allLogsDisplayed) {
          setAllLogsDisplayed(true);
          // Call handle_record_total_profit after all logs are displayed
          handleRecordTotalProfit();
        }
      }
    }, 200); // Adjust the delay as needed

    return () => clearInterval(interval); // Cleanup on unmount
  }, [logs, logIndex, allLogsDisplayed]);

  // Function to handle recording total profit
  const handleRecordTotalProfit = async () => {
    try {
      // Extract profit from logs or use a fixed value
      const totalProfit = 5220.9; // Fixed value for demo
      console.log("Total profit:", totalProfit);

      // Record the total profit
      await handle_record_total_profit(totalProfit);
      console.log("Total profit recorded:", totalProfit);

      // Add a message to indicate profit was recorded
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: `Total profit of ${totalProfit} USCRT recorded to the contract.`,
          sender: "agent",
          timestamp: new Date(),
        },
      ]);

      // Query profit distribution after recording total profit
      setTimeout(async () => {
        const distributedAmount = await handle_query_profit_distribution();
        console.log("Profit distribution queried:", distributedAmount);

        // Update the withdraw amount in the parent component
        if (setWithdrawAmount) {
          setWithdrawAmount(distributedAmount);
        }

        // Add a message to show the profit distribution
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            content: `Profit distribution calculated: ${distributedAmount} USCRT available for withdrawal.`,
            sender: "agent",
            timestamp: new Date(),
          },
        ]);
      }, 2000); // Wait 2 seconds before querying profit distribution
    } catch (error) {
      console.error("Error handling profit operations:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const newMessage: Message = {
      id: messages.length + 1,
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setAgentStatus("thinking");

    // Check for the "distribute profit" command
    if (input.trim().toLowerCase() === "calculate my profit") {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 2,
          content: "Initiating profit calculation process...",
          sender: "agent",
          timestamp: new Date(),
        },
      ]);

      // Call the handleRecordTotalProfit function
      handleRecordTotalProfit();
    }
    // Check for the "execute trade" command
    else if (input.trim().toLowerCase() === "execute trade") {
      try {
        const response = await fetch("http://127.0.0.1:5000/start-trade", {
          method: "POST",
        });
        if (response.ok) {
          const result = await response.json();
          console.log("Trade execution started:", result);
          setMessages((prev) => [
            ...prev,
            {
              id: prev.length + 2,
              content: "Trade execution started.",
              sender: "agent",
              timestamp: new Date(),
            },
          ]);

          // Fetch logs immediately after starting the trade
          const logsResponse = await fetch("http://127.0.0.1:5000/logs");
          const logsData = await logsResponse.json();
          setLogIndex(0); // Reset log index to start from the beginning
          setAllLogsDisplayed(false); // Reset allLogsDisplayed flag
          // No need to clear displayed logs here, as we are adding them sequentially
        } else {
          throw new Error("Failed to start trade execution.");
        }
      } catch (error) {
        console.error("Error starting trade execution:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 2,
            content: "Error starting trade execution.",
            sender: "agent",
            timestamp: new Date(),
          },
        ]);
      }
    } else {
      // Simulate agent response after a delay
      setTimeout(() => {
        const responses = [
          "Current market volatility is within acceptable parameters. No action required.",
          "Analyzing BTC/ETH correlation patterns. Recommendation: maintain current position.",
          "Alert: Detected potential arbitrage opportunity between exchanges. Evaluating risk profile.",
          "Position secured with multi-signature verification. Security protocols active.",
          "Market indicators suggest increased volatility in next 4-6 hours. Adjusting risk parameters.",
        ];

        const agentResponse: Message = {
          id: messages.length + 2,
          content: responses[Math.floor(Math.random() * responses.length)],
          sender: "agent",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, agentResponse]);
        setAgentStatus("online");
      }, 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center">
          <Bot className="h-4 w-4 text-indigo-400 mr-2" />
          <span className="font-medium text-zinc-100 text-sm">
            AI Trading Agent
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-3 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex flex-col max-w-[85%] rounded-lg p-2 text-xs",
                  message.sender === "user"
                    ? "ml-auto bg-zinc-800 text-zinc-100"
                    : "bg-zinc-900 text-zinc-100 border border-zinc-800"
                )}
              >
                <p>{message.content}</p>
                <span className="text-[10px] text-zinc-500 mt-1 self-end">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="p-3 border-t border-zinc-800">
        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send command..."
            className="bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-indigo-500 focus:ring-indigo-500 text-xs h-8"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            size="icon"
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 w-8"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
        <div className="mt-1 flex items-center text-[10px] text-zinc-500">
          <AlertCircle className="h-2.5 w-2.5 mr-1" />
          <span>End-to-end encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
