"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquarePlus, Trash2, LogOut, CreditCard } from "lucide-react"
import type { Conversation } from "@/lib/chat"
import type { Organization } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { OrganizationSwitcher } from "./organization-switcher"

interface ChatSidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  onDeleteConversation: (id: string) => void
  onLogout: () => void
  username: string
  credits: number
  organizations: Organization[]
  currentOrgId: string
  currentOrganization: Organization | null
  onSwitchOrganization: (orgId: string) => void
  onManageOrganization: () => void
  onCreateOrganization: () => void
  onPurchaseCredits: () => void
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onLogout,
  username,
  credits,
  organizations,
  currentOrgId,
  currentOrganization,
  onSwitchOrganization,
  onManageOrganization,
  onCreateOrganization,
  onPurchaseCredits,
}: ChatSidebarProps) {
  
  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">AI Chat</h2>
          <Button onClick={onNewChat} size="sm" variant="ghost" className="h-8 w-8 p-0">
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {/* <OrganizationSwitcher
            organizations={organizations}
            currentOrgId={currentOrgId}
            onSwitchOrganization={onSwitchOrganization}
            onManageOrganization={onManageOrganization}
            onCreateOrganization={onCreateOrganization}
          /> */}
          <div className="flex items-center justify-between gap-2 text-sm px-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-emerald-500">{credits} credits</span>
            </div>
            <Button onClick={onPurchaseCredits} size="sm" variant="outline" className="h-7 text-xs bg-transparent">
              Buy More
            </Button>
          </div>
        </div>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">No conversations yet</div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors",
                  currentConversationId === conversation.id
                    ? "bg-secondary text-foreground"
                    : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground",
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conversation.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(conversation.id)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">{username}</span>
            </div>
          </div>
          <Button onClick={onLogout} size="sm" variant="ghost" className="h-8 w-8 p-0">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}