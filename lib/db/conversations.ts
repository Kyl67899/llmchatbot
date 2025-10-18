import prisma, { isDatabaseConnected } from "@/lib/prisma";

export interface Message {
  id: string
  conversationId: string
  userId: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

export interface Conversation {
  id: string
  title: string
  userId: string
  organizationId: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// Fallback to localStorage
function getLocalConversations(userId: string): Conversation[] {
  if (typeof window === "undefined") return []
  const key = `chat_app_conversations_${userId}`
  const conversations = localStorage.getItem(key)
  return conversations ? JSON.parse(conversations) : []
}

function saveLocalConversations(userId: string, conversations: Conversation[]) {
  if (typeof window === "undefined") return
  const key = `chat_app_conversations_${userId}`
  localStorage.setItem(key, JSON.stringify(conversations))
}

export async function getConversation(conversationId: string, userId?: string): Promise<Conversation | null> {
  const isConnected = await isDatabaseConnected()

  if (isConnected) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    })
    return conversation as Conversation | null
  } else if (userId) {
    const conversations = getLocalConversations(userId)
    return conversations.find((c) => c.id === conversationId) || null
  } else {
    return null
  }
}

export async function createConversation(
  userId: string,
  organizationId: string,
  title = "New Chat",
): Promise<Conversation> {
  const isConnected = await isDatabaseConnected()

  if (isConnected) {
    const conversation = await prisma.conversation.create({
      data: {
        title,
        userId,
        organizationId,
      },
      include: { messages: true },
    })
    return conversation as Conversation
  } else {
    const conversations = getLocalConversations(userId)
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title,
      userId,
      organizationId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    conversations.unshift(newConversation)
    saveLocalConversations(userId, conversations)
    return newConversation
  }
}

export async function addMessage(
  conversationId: string,
  userId: string,
  role: "user" | "assistant",
  content: string,
): Promise<Message> {
  const isConnected = await isDatabaseConnected()

  if (isConnected) {
    const message = await prisma.message.create({
      data: {
        conversationId,
        userId,
        role,
        content,
      },
    })

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return message
  } else {
    // Fallback to localStorage
    const userIdFromConv = userId // We need to get this from somewhere
    const conversations = getLocalConversations(userIdFromConv)
    const conversation = conversations.find((c) => c.id === conversationId)

    if (conversation) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        conversationId,
        userId,
        role,
        content,
        createdAt: new Date(),
      }
      conversation.messages.push(newMessage)
      conversation.updatedAt = new Date()

      // Update title based on first user message
      if (conversation.messages.length === 1 && role === "user") {
        conversation.title = content.slice(0, 50) + (content.length > 50 ? "..." : "")
      }

      saveLocalConversations(userIdFromConv, conversations)
      return newMessage
    }
    throw new Error("Conversation not found")
  }
}

export async function deleteConversation(userId: string, conversationId: string): Promise<void> {
  const isConnected = await isDatabaseConnected()

  if (isConnected) {
    await prisma.conversation.delete({
      where: { id: conversationId },
    })
  } else {
    const conversations = getLocalConversations(userId)
    const filtered = conversations.filter((c) => c.id !== conversationId)
    saveLocalConversations(userId, filtered)
  }
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const isConnected = await isDatabaseConnected()

  if (isConnected) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    })
    return conversation as Conversation | null
  } else {
    // For localStorage, we need userId which we don't have here
    // This is a limitation of the fallback approach
    return null
  }
}
