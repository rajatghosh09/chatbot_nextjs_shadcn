"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios.instance";
import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SendHorizontal, Bot, User, Loader2, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const currentInput = input;
    const userMessage: Message = { role: "user", content: currentInput };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setInput("");

    try {
      const response = await axiosInstance.post("/chat/completions", {
        model: "llama-3.1-8b-instant",
        messages: [...messages, userMessage],
      });

      const reply = response?.data?.choices?.[0]?.message?.content || "No response received.";
      const aiMessage: Message = { role: "assistant", content: reply };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Error connecting to AI." }]);
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Clear Chat Function ---
  const clearChat = () => {
    if (messages.length === 0) return;
    if (confirm("Are you sure you want to clear this conversation?")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto border-x bg-background shadow-2xl">
      {/* Header */}
      <header className="p-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
          <h1 className="font-bold text-lg tracking-tight">AI Assistant</h1>
        </div>

        {/* Clear Chat Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          className="text-muted-foreground hover:text-destructive transition-colors gap-2 cursor-pointer"
          disabled={messages.length === 0}
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">Clear Chat</span>
        </Button>
      </header>

      {/* Message Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-200"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground animate-in fade-in zoom-in duration-500">
            <div className="bg-muted p-4 rounded-full mb-4">
              <Bot className="w-10 h-10 opacity-40" />
            </div>
            <p className="text-sm font-medium">Chat is empty</p>
            <p className="text-xs opacity-70">How can I help you today?</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-300 ${message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
          >
            <Avatar className="w-8 h-8 border">
              {message.role === "user" ? (
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]"><User size={14} /></AvatarFallback>
              ) : (
                <AvatarFallback className="bg-muted text-[10px]"><Bot size={14} /></AvatarFallback>
              )}
            </Avatar>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${message.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-none shadow-md"
                : "bg-muted text-foreground rounded-tl-none border shadow-sm"
                }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3 animate-in fade-in duration-300">
            <Avatar className="w-8 h-8 border">
              <AvatarFallback className="bg-muted"><Bot size={14} /></AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-4 flex gap-1.5 items-center border">
              <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <footer className="p-4 border-t bg-background/95 backdrop-blur-sm">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="relative flex items-center gap-2 max-w-4xl mx-auto"
        >
          <Input
            className="pr-12 py-6 rounded-2xl focus-visible:ring-offset-0 focus-visible:ring-1 transition-all"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 h-9 w-9 rounded-xl transition-transform active:scale-95"
            disabled={!input.trim() || loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
          </Button>
        </form>
      </footer>
    </div>
  );
}