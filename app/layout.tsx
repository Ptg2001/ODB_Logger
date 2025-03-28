import { Inter } from "next/font/google"
import ClientLayout from "./layout-client"
import { metadata } from "./metadata"
import { viewport } from "./viewport"

// Load font only once
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export { metadata, viewport }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
} 