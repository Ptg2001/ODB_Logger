// This file is being replaced by our new dashboard/analytics page
// See app/dashboard/analytics/page.tsx for the updated implementation

"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyticsRedirectPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/dashboard/analytics')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Redirecting to analytics dashboard...</p>
    </div>
  )
}

