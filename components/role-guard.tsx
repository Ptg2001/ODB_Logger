"use client"

import { useAuth } from "@/components/auth-provider"
import React from "react"

type RoleGuardProps = {
  children: React.ReactNode
  allowedRoles: Array<"admin" | "tester" | "viewer">
  fallback?: React.ReactNode
}

/**
 * A component that conditionally renders children based on the user's role
 * 
 * @example
 * <RoleGuard allowedRoles={["admin", "tester"]}>
 *   <Button>Clear Fault Codes</Button>
 * </RoleGuard>
 */
export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback = null 
}: RoleGuardProps) {
  const { user } = useAuth()
  
  // If user is not authenticated, don't render anything
  if (!user) return null
  
  // If user's role is in the allowed roles, render the children
  if (user.role && allowedRoles.includes(user.role)) {
    return <>{children}</>
  }
  
  // Otherwise, render the fallback (if provided)
  return <>{fallback}</>
} 