/**
 * SignInCard.tsx
 * Shares the centered card layout across sign-in views. [SD]
 */

import type { ReactNode } from "react"

type SignInCardProps = {
    title: string
    children: ReactNode
}

export function SignInCard({ title, children }: SignInCardProps) {
    // TODO: Apply the team's approved sign-in styling once the design is finalized. [SD]
    return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-xl rounded-lg bg-white p-8 text-center shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900">
                ABET Assessment Portal
            </h1>
            <h2 className="mt-4 text-lg font-semibold">{title}</h2>
            
            {/* Each sign-in view supplies its own buttons, form, or message. [SD] */}
            {children}
        </div>
    </main>
  )
}