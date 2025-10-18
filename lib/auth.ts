"use client"

import { setCurrentUser } from '@/lib/auth';
import { getOrganizations } from '@/lib/auth';
import { createUser, findUserByUsername, findUserByEmail, type User } from "./db/users"
import { createOrganization, addOrganizationMember, getUserOrganizations } from "./db/organizations";
import { createSession, deleteSession, getSessionByToken, updateSessionOrganization } from "./db/session"

export interface Organization {
  id: string
  name: string
  memberCount: number
}

const SESSION_TOKEN_KEY = "chat_app_session_token";

// src/lib/auth.ts
export function setCurrentUser(user: { id: string; email?: string } | null) {
  // implement storing user in-memory, in a store, or call backend
  // example: localStorage, or a global store, or a thin wrapper around your server API
  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
  } else {
    localStorage.removeItem("currentUser")
  }
}

function getSessionToken(): string | null {
  if (typeof document === "undefined") return null
  const cookies = document.cookie.split("; ")
  const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_TOKEN_KEY}=`))
  return sessionCookie ? sessionCookie.split("=")[1] : null
}

function setSessionToken(token: string) {
  if (typeof document === "undefined") return
  // Set cookie with 30 day expiry
  const expires = new Date()
  expires.setDate(expires.getDate() + 30)
  document.cookie = `${SESSION_TOKEN_KEY}=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

function removeSessionToken() {
  if (typeof document === "undefined") return
  document.cookie = `${SESSION_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

export async function getCurrentUser(user: any){
  if (typeof window === "undefined") return null

  const token = getSessionToken()
  if (!token) return null

  const session = await getSessionByToken(token)
  if (!session) {
    removeSessionToken()
    return null
  }

  const { findUserById } = await import("./db/users")
  return await findUserById(session.userId)
}

export async function getCurrentOrganizationId(): Promise<string | null> {
  if (typeof window === "undefined") return null

  const token = getSessionToken()
  if (!token) return null

  const session = await getSessionByToken(token)
  return session?.currentOrganizationId || null
}

export async function setCurrentOrganizationId(orgId: string | null): Promise<void> {
  if (typeof window === "undefined") return

  const token = getSessionToken()
  if (!token || !orgId) return

  await updateSessionOrganization(token, orgId)
}

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const existingUser = await findUserByUsername(username)
    if (existingUser) {
      return { success: false, error: "Username already exists" }
    }

    if (email) {
      const existingEmail = await findUserByEmail(email)
      if (existingEmail) {
        return { success: false, error: "Email already exists" }
      }
    }

    const dbUser = await createUser(username, password, email)

    const org = await createOrganization(`${username}'s Organization`, 500)
    await addOrganizationMember(org.id, dbUser.id, "admin")

    const newUser: User = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email || undefined,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
      password: dbUser.password,
    }

    const session = await createSession(dbUser.id, org.id)
    setSessionToken(session.token)

    return { success: true, user: newUser }
  } catch (error) {
    console.error("Registration error:", error)
    return { success: false, error: "Registration failed" }
  }
}

export async function login(
  username: string,
  password: string,
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const dbUser = await findUserByUsername(username)

    if (!dbUser) {
      return { success: false, error: "Invalid username or password" }
    }

    if (dbUser.password !== password && !dbUser.password.includes(password)) {
      return { success: false, error: "Invalid username or password" }
    }

    const orgs = await getUserOrganizations(dbUser.id)
    const orgId = orgs[0]?.id || ""

    const user: User = {
      id: dbUser.id,
      username: dbUser.username,
      email: dbUser.email || undefined,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
      password: dbUser.password,
    }

    const session = await createSession(dbUser.id, orgId)
    setSessionToken(session.token)

    return { success: true, user }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Login failed" }
  }
}

export async function loginWithGoogle(): Promise<{ success: boolean; error?: string; user?: User }> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const mockEmail = `user${Date.now()}@gmail.com`
      const mockUsername = `google_user_${Date.now()}`

      const existingUser = await findUserByEmail(mockEmail)

      if (existingUser) {
        const result = await login(existingUser.username, existingUser.password)
        resolve(result)
      } else {
        const result = await register(mockUsername, mockEmail, `google_${Date.now()}`)
        resolve(result)
      }
    }, 1000)
  })
}

export async function logout() {
  if (typeof window === "undefined") return

  const token = getSessionToken()
  if (token) {
    await deleteSession(token)
    removeSessionToken()
  }
}

export function setCurrentUser(user: User | null)
export function getOrganizations(): Record<string, Organization> { return {} }
export function getUsers(): Record<string, any> { return {} }
export function updateUserCredits(...args: any[]): Promise<void> { return Promise.resolve() }

