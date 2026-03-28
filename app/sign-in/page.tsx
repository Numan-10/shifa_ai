import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/auth'
import Navbar from '@/components/Navbar'
import {
  DEFAULT_AUTH_CALLBACK_URL,
  normalizeCallbackUrl,
} from '@/lib/authRoutes'

import SignInPanel from './SignInPanel'

type SignInPageProps = {
  searchParams?: {
    callbackUrl?: string | string[]
    error?: string | string[]
  }
}

export const metadata: Metadata = {
  title: 'Sign In | Shifa AI',
  description: 'Sign in with Google to access Shifa AI.',
}

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getServerSession(authOptions)
  const callbackUrl = normalizeCallbackUrl(getSingleParam(searchParams?.callbackUrl))
  const error = getSingleParam(searchParams?.error)

  if (session) {
    redirect(callbackUrl || DEFAULT_AUTH_CALLBACK_URL)
  }

  const googleConfigured = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <SignInPanel
        callbackUrl={callbackUrl}
        error={error}
        googleConfigured={googleConfigured}
      />
    </div>
  )
}
