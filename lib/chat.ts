"use client"

import {
  getConversations as dbGetConversations,
  createConversation as dbCreateConversation,
  addMessage as dbAddMessage,
  deleteConversation as dbDeleteConversation,
  getConversation as dbGetConversation,
} from "./db/conversations";
import prisma from "@/lib/prisma";

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
  createdAt?: Date
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

export async function getConversations(userId: string, organizationId: string): Promise<Conversation[]> {
  try {
    const conversations = await dbGetConversations(userId, organizationId)
    // Convert to legacy format
    return conversations.map((c) => ({
      id: c.id,
      title: c.title,
      messages: c.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.createdAt.getTime(),
        createdAt: m.createdAt,
      })),
      createdAt: c.createdAt.getTime(),
      updatedAt: c.updatedAt.getTime(),
    }))
  } catch (error) {
    console.error("Error getting conversations:", error)
    return []
  }
}

export async function createConversation(
  userId: string,
  organizationId: string,
  title = "New Chat",
): Promise<Conversation> {
  try {
    const conversation = await dbCreateConversation(userId, organizationId, title)
    return {
      id: conversation.id,
      title: conversation.title,
      messages: [],
      createdAt: conversation.createdAt.getTime(),
      updatedAt: conversation.updatedAt.getTime(),
    }
  } catch (error) {
    console.error("Error creating conversation:", error)
    throw error
  }
}

export async function addMessage(userId: string, conversationId: string, message: Message): Promise<void> {
  try {
    await dbAddMessage(conversationId, userId, message.role, message.content)
  } catch (error) {
    console.error("Error adding message:", error)
  }
}

export async function deleteConversation(userId: string, conversationId: string): Promise<void> {
  try {
    await dbDeleteConversation(userId, conversationId)
  } catch (error) {
    console.error("Error deleting conversation:", error)
  }
}

export async function getConversation(userId: string, conversationId: string): Promise<Conversation | null> {
  try {
    const conversation = await dbGetConversation(conversationId)
    if (!conversation) return null

    return {
      id: conversation.id,
      title: conversation.title,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.createdAt.getTime(),
        createdAt: m.createdAt,
      })),
      createdAt: conversation.createdAt.getTime(),
      updatedAt: conversation.updatedAt.getTime(),
    }
  } catch (error) {
    console.error("Error getting conversation:", error)
    return null
  }
}
