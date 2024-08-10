"use client";

import ChatMessage from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2Icon } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

export type Message = {
  id?: string;
  role: "human" | "assistant" | "placeholder";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! Welcome to Nerdation. How can I assist you today?`,
    },
  ]);
  const [loading, setLoading] = useState(true); // Global loading state
  const [isPending, startTransition] = useState(false); // Button loading state
  const [message, setMessage] = useState("");
  const bottomOfChat = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    bottomOfChat.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const userMessage = message.trim();
    if (!userMessage) return;

    setMessage("");
    setMessages((prev) => [
      ...prev,
      { role: "human", content: userMessage },
      { role: "assistant", content: "thinking..." },
    ]);

    try {
      const response = await fetch("/api/newLlama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([...messages, { role: "human", content: userMessage }]),
      });

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedResponse = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          accumulatedResponse += chunk;

          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            return [
              ...prev.slice(0, -1),
              { ...lastMessage, content: accumulatedResponse },
            ];
          });

          bottomOfChat.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    } catch (error) {
      console.error("Error fetching the response:", error);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      startTransition(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-[90%] w-full">
      <div className="flex flex-col h-full rounded-lg overflow-y-scroll m-12 w-full lg:w-[50%]">
        <div className="flex-1 w-full bg-white">
          {/* chat messages */}
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2Icon className="animate-spin h-20 w-20 text-teal-500 mt-20" />
            </div>
          ) : (
            <div>
              {messages.length === 0 && (
                <ChatMessage
                  key={"placeholder"}
                  message={{
                    role: "assistant",
                    content: "Ask me anything about Nerdation",
                  }}
                />
              )}
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              <div ref={bottomOfChat}></div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex sticky bottom-0 space-x-2 p-5 bg-teal-600/75"
        >
          <Input
            placeholder="Ask anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button type="submit" disabled={!message || isPending}>
            {isPending ? (
              <Loader2Icon className="animate-spin text-teal-500" />
            ) : (
              "Ask"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
