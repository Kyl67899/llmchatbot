"use client"

import { User } from "@/lib/db/users"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getCurrentUser, setCurrentUser } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const currentUser = await getCurrentUser()
      setUserState(currentUser)
      setIsLoading(false)
    }
  
    loadUser()
  }, [])  

  const setUser = (user: User | null) => {
    setUserState(user)
    setCurrentUser(user)
  }

  return <AuthContext.Provider value={{ user, setUser, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
