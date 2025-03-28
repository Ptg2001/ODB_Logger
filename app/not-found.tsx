import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background px-4 text-center"
      style={{
        backgroundImage: "url('/assets/login-bg.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto w-full max-w-md rounded-lg border border-border/40 bg-background/90 p-6 backdrop-blur-sm shadow-xl">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </div>
        <div className="mb-6 flex justify-center">
          <Image 
            src="/assets/obd-logo.svg" 
            alt="OBD-II Logger" 
            width={50} 
            height={50} 
            priority
          />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Page Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          The diagnostic path you're looking for does not exist or has been disconnected.
        </p>
        <Link href="/dashboard" passHref>
          <Button 
            variant="default"
            className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
          >
            Return to Dashboard
          </Button>
        </Link>
        <p className="mt-4 text-xs text-muted-foreground">
          Error Code: 404 | Connection Failed
        </p>
      </div>
    </div>
  )
} 