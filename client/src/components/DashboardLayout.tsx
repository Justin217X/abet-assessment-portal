/**
 * DashboardLayout.tsx
 * Shares the sidebar and main content area across all four role dashboards.
 * Each dashboard supplies its own title, menu, and content. [SD]
 */

import type { ReactNode } from "react"

type DashboardLayoutProps = {
    role: string
    title: string
    navigation?: ReactNode
    children: ReactNode
}

export function DashboardLayout({
    role,
    title,
    navigation,
    children,
}: DashboardLayoutProps) {
    
    // TODO: Apply the team's approved dashboard design once it's finalized. [SD]
    return (
    <div className="grid min-h-screen grid-cols-1 bg-slate-100 text-slate-900 md:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white p-6 md:border-r md:border-b-0">
            <p className="mb-4 font-semibold">{role} workspace</p>

            {/* Each dashboard supplies its own menu links. [SD] */}
            {navigation && (
                <nav aria-label={`${role} navigation`} className="flex flex-col gap-2">
                    {navigation}
                </nav>
            )}
        </aside>

        <main className="min-w-0 p-6">
            <h1 className="text-2xl font-bold">{title}</h1>

            {/* The dashboard's own content goes here. [SD] */}
            <div className="mt-6">{children}</div>
        </main>
    </div>
  )
}

