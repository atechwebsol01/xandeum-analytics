"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  Send, 
  User,
  Sparkles,
  Loader2,
  RefreshCw,
  Lightbulb,
  HelpCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "What are pNodes and how do they work?",
  "How do Pod Credits work?",
  "What is Xandeum's storage layer?",
  "How to run a pNode?",
  "What is the X-Score metric?",
  "How is the XAND token used?",
  "What makes Xandeum different from other storage solutions?",
  "How can I earn rewards as a node operator?",
];

const QUICK_TOPICS = [
  { label: "pNodes", query: "Explain what pNodes are" },
  { label: "Credits", query: "How do Pod Credits work?" },
  { label: "Storage", query: "How does Xandeum storage work?" },
  { label: "Rewards", query: "How do node operators earn rewards?" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm XandBot, your AI assistant for all things Xandeum. I can help you understand pNodes, storage, credits, XAND token, and more. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "I apologize, but I couldn't process that request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat cleared! How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="container py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
              <Bot className="h-6 w-6 text-white" />
            </div>
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Ask XandBot anything about the Xandeum network
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Powered by GPT-4
          </Badge>
          <Button variant="outline" size="sm" onClick={clearChat}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Clear Chat
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Chat Area */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b py-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <CardTitle className="text-lg">XandBot</CardTitle>
              <Badge variant="outline" className="text-xs">Online</Badge>
            </div>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="p-2 rounded-lg bg-violet-500/10 h-fit shrink-0">
                      <Bot className="h-5 w-5 text-violet-500" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl p-4",
                      message.role === "user"
                        ? "bg-violet-600 text-white"
                        : "bg-muted"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    <p className={cn(
                      "text-[10px] mt-2",
                      message.role === "user" ? "text-white/70" : "text-muted-foreground"
                    )}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="p-2 rounded-lg bg-violet-600 h-fit shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="p-2 rounded-lg bg-violet-500/10 h-fit">
                    <Bot className="h-5 w-5 text-violet-500" />
                  </div>
                  <div className="bg-muted rounded-2xl p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Xandeum, pNodes, XAND token..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Topics */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Quick Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {QUICK_TOPICS.map((topic) => (
                  <Button
                    key={topic.label}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(topic.query)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {topic.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-500" />
                Suggested Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => sendMessage(question)}
                    disabled={isLoading}
                    className="w-full text-left text-xs p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-violet-500/5 border-violet-500/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-violet-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">AI-Powered</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    XandBot is trained on Xandeum documentation and can answer questions about the network, pNodes, tokens, and more.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
