'use client'

import type { ReactNode } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { SessionProvider } from 'next-auth/react'

type AuthSessionProviderProps = {
  children: ReactNode
}

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

export default function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  if (!convex) {
    throw new Error('NEXT_PUBLIC_CONVEX_URL is not configured.')
  }

  return (
    <SessionProvider>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </SessionProvider>
  )
}
