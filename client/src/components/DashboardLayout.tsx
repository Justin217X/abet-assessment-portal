/**
 * File: DashboardLayout.tsx
 * Purpose: Provides the shared header, campus banner, navigation,
 * content area, help panel, and footer for Coordinator,
 * Evaluator, and Administrator pages.
 *
 * University branding is configured in branding.ts.
 * Each page supplies the content shown inside this layout.
 *
 * !!! TODO: replace preview wording as live features become available. [SD]
 */

import type { CSSProperties, ReactNode } from "react"
import { CampusBanner } from "./CampusBanner"
import { PortalIcon } from "./PortalIcon"
import { branding } from "../config/branding"
import "../styles/DashboardStyles.css"

// List what each dashboard must provide to this layout.
type DashboardLayoutProps = {
    role: string
    title: string
    navigation?: ReactNode
    onSignOut: () => void
    children: ReactNode
}

// Set the help text for each role.
// !!! These instructions do not control access permissions. [SD]
const workspaceGuidance: Record<string, { icon: string; purpose: string; steps: string[] }> = {
    Faculty: {
        icon: "clipboard-list",
        purpose: "Review assigned assessments, prepare reports, and complete peer reviews.",
        steps: ["Choose an assigned assessment", "Review the report information", "Prepare the report", "Review feedback and archived reports"],
    },
    Coordinator: {
        icon: "clipboard-list",
        purpose: "Coordinate assessment assignments, monitor progress, and review program coverage.",
        steps: ["Review outcomes and performance indicators", "Plan schedules and assign assessments", "Track submissions and peer reviews", "Review coverage and archived reports"],
    },
    "ABET Evaluator": {
        icon: "file-text",
        purpose: "Review materials released to you. This workspace is read-only.",
        steps: ["Find an authorized assessment report", "Review released supporting evidence", "Review improvement actions"],
    },
    "System Administrator": {
        icon: "users",
        purpose: "Manage portal access, review application settings, and investigate reported errors.",
        steps: ["Review user access", "Check application settings", "Review application errors", "Coordinate corrections with the team"],
    },
}

export function DashboardLayout({ role, title, navigation, children, onSignOut }: DashboardLayoutProps) {

    // Select help text for the current workspace.
    const guidance = workspaceGuidance[role]
    return (
        <div className="faculty-portal faculty-responsive" style={{ "--portal-pattern": `url("${branding.graphicPattern.imageUrl}")` } as CSSProperties}>
            <a className="faculty-skip-link" href="#role-content">Skip to content</a>
            <header className="faculty-header">
                <div className="faculty-brand"><PortalIcon name="graduation-cap" className="faculty-brand-icon" />{branding.portalName}</div>
                <div className="faculty-header-actions">
                    <span>{role} workspace</span>
                    <button type="button" onClick={onSignOut}><PortalIcon name="log-out" />Sign out</button>
                </div>
            </header>
            <CampusBanner title={`${role} Assessment Portal`} subtitle="Assessment reporting and review" />
            <main id="role-content" tabIndex={-1} className="faculty-content faculty-content-full">
                <div className="faculty-toolbar">
                    {navigation && <nav aria-label={`${role} navigation`} className="[&_button]:inline-flex [&_button]:items-center [&_button]:gap-2">{navigation}</nav>}
                    <span className="faculty-demo-label">Generative AI mock data · Live connections pending</span>
                </div>
                <div className="grid min-w-0 items-start gap-3 pb-4">
                    <section className="faculty-card min-w-0">
                        <h2><PortalIcon name={guidance?.icon ?? "layout-dashboard"} />{title}</h2>

                        {/* Display the selected dashboard page inside the shared layout. */}
                        <div className="p-4">{children}</div>
                    </section>
                    <details className="rounded-lg border border-[var(--faculty-border)] bg-[var(--faculty-surface)] px-4 py-2 text-sm">
                        <summary className="cursor-pointer font-semibold">Workspace help and preview status</summary>
                        <p className="mt-2">{guidance?.purpose}</p>
                        <ol className="mt-2 grid list-inside list-decimal gap-2 sm:grid-cols-2">{guidance?.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                        <p className="mt-2 text-slate-600">Generative AI mock data for UI testing. Unavailable records and unfinished actions are labeled. University connections and permissions remain pending.</p>
                    </details>
                </div>
            </main>
            <footer className="faculty-footer">{branding.universityName} · {branding.portalName}</footer>
        </div>
    )
}
