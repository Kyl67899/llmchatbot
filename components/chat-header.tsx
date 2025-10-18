"use client"

import { useState } from "react"
import { NotificationBell } from "./notification-bell"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, User } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { SignOutButton } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export interface ChatHeaderProps {
  userId: string
  conversationTitle?: string
  onOpenSettings: () => void
}

export function ChatHeader({ userId, conversationTitle, onOpenSettings }: ChatHeaderProps) {
  const { user } = useUser();
  const router = useRouter();

  return (
    <div className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div>{conversationTitle && <h2 className="text-lg font-semibold">{conversationTitle}</h2>}</div>
      <div className="flex items-center gap-2">

        <NotificationBell userId={userId} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="px-3">
              {user?.username || user?.emailAddresses[0]?.emailAddress || "Account"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {user?.username || user?.emailAddresses[0]?.emailAddress || "Account"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* TODO: create a setttings dashboard for user transaction history, update username, chat history, update billing, stripe payment, etc.  */}
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SignOutButton>
                <div className="flex items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" /> Sign out
                </div>
              </SignOutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
