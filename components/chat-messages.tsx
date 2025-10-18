"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import type { Message } from "@/lib/chat"
import prisma from "@/lib/prisma";
import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"
import { useEffect } from "react"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp?: string | Date
}

// type Message = Prisma.MessageGetPayload<{}> // includes all fields

interface ChatMessagesProps {
  messages: Message[]
}

// const START_PROMPTS = [
//   "Explain quantum computing in simple terms",
//   "Write a Python function to sort a list using bubble sort",
//   "What are the benefits of functional programming?",
// ];

export function ChatMessages({ messages }: ChatMessagesProps) {
  useEffect(() => {
    const scrollArea = document.querySelector("[data-radix-scroll-area-viewport]")
    scrollArea?.scrollTo({ top: scrollArea.scrollHeight, behavior: "smooth" })
  }, [messages]);

  // useEffect(() => {
  //   const handler = (e: Event) => {
  //     const detail = (e as CustomEvent).detail as string
  //     if (detail) sendMessage(detail)
  //   }
  //   window.addEventListener("insert-chat-prompt", handler)
  //   return () => window.removeEventListener("insert-chat-prompt", handler)
  // }, [sendMessage])
  
  const handleInsertPrompt = (prompt: string) => {
    // Emit a simple CustomEvent the parent can listen for:
    window.dispatchEvent(new CustomEvent("insert-chat-prompt", { detail: prompt }))
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-2xl">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>

          <div>
            <h3 className="text-lg text-white font-semibold mb-1">Welcome to AI Chat</h3>
            <p className="text-sm text-white mb-4">
              Start a conversation with our AI assistant. 
              Ask questions, get help with tasks, 
              or explore ideas together.
            </p>
          </div>

          {/* <div className="text-left">
            <p className="text-sm text-muted-foreground mb-2">Try one of these starter prompts:</p>
            <div className="flex flex-col gap-2">
              {START_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleInsertPrompt(p)}
                  className="text-sm text-left px-4 py-2 rounded-md bg-secondary/70 hover:bg-secondary/90 text-foreground transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
          >
            {message.role === "assistant" && (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}

            <div
              className={cn(
                "rounded-lg px-4 py-3 max-w-[80%]",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground border border-border",
              )}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              {message.createdAt && (
                <p className="text-xs mt-2 opacity-70">{new Date(message.createdAt).toLocaleTimeString()}</p>
              )}
            </div>

            {message.role === "user" && (
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
