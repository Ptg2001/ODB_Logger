"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import bcrypt from "bcryptjs"

type Project = {
  id: number
  name: string
}

type User = {
  id: number
  name: string
  email: string
  role: "admin" | "tester" | "viewer"
  projects: Project[]
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Ensure that projects are properly structured, defensive coding
        if (parsedUser.projects && Array.isArray(parsedUser.projects)) {
          parsedUser.projects = parsedUser.projects.map((p: any) => {
            if (typeof p === 'string') {
              // Convert string projects to object format
              return { id: 0, name: p };
            } else if (typeof p === 'object' && p !== null) {
              // Ensure each project has id and name
              return { 
                id: p.id || 0, 
                name: p.name || 'Unknown Project' 
              };
            }
            return { id: 0, name: 'Unknown Project' };
          });
        } else {
          parsedUser.projects = [];
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error)
      // If there's an error, clear the localStorage to prevent future errors
      localStorage.removeItem("user")
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user && pathname !== "/login") {
      router.push("/login")
    }
  }, [loading, user, pathname, router])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      
      // Make an API call to validate the user
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.name}!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: data.message || "Invalid email or password",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An error occurred during login",
      })
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

