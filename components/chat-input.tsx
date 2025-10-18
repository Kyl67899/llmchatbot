"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");

  // const handleSendMessage = async (content: string) => {
  //   if (!dbUser || !currentConversationId || !currentOrgId) return

  // Optional: check credits
  //   if (credits <= 0) {
  //     setShowInsufficientCredits(true)
  //     return
  //   }

  //   const res = await fetch("/api/send-message", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       userId: dbUser.id,
  //       conversationId: currentConversationId,
  //       orgId: currentOrgId,
  //       content,
  //     }),
  //   })

  //   const newMessage = await res.json()
  //   setCurrentMessages((prev) => [...prev, newMessage])
  //   setCredits((prev) => prev - 1)
  // }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      console.log("Sending message:", message)
      onSendMessage(message.trim())
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
      <div className="flex gap-2 max-w-4xl mx-auto">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          className="min-h-[60px] max-h-[200px] resize-none bg-secondary border-border"
          disabled={disabled}
        />
        <Button
          type="submit"
          size="icon"
          className="h-[60px] w-[60px] flex-shrink-0 bg-primary hover:bg-primary/90"
          disabled={disabled || !message.trim()}
        >
          {disabled ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </form>
  )
}
