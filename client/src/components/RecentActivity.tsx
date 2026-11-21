/**
 * File: RecentActivity.tsx
 * Purpose: Shows recent updates for the current dashboard role.
 *
 * !!! TODO: use authorized server activity in production. [SD]
 */

import { useEffect, useState } from "react"
import { loadPortalData } from "../api/portalData"
import type { ActivityEvent, PortalData } from "../api/portalData"
import { activityChanged, readDemoActivity } from "../api/demoActivity"
import { PortalIcon } from "./PortalIcon"

type Props = { role: "faculty" | "coordinator" | "admin"; data?: PortalData | null }
export function RecentActivity({ role, data: suppliedData }: Props) {
    const [data, setData] = useState<PortalData | null>(null)
    const [localEvents, setLocalEvents] = useState<ActivityEvent[]>(readDemoActivity)
    const [error, setError] = useState("")
    useEffect(() => {
        const update = () => setLocalEvents(readDemoActivity())
        window.addEventListener(activityChanged, update)
        window.addEventListener("storage", update)
        return () => { window.removeEventListener(activityChanged, update); window.removeEventListener("storage", update) }
    }, [])
    useEffect(() => {
        if (suppliedData !== undefined) return
        const controller = new AbortController()
        loadPortalData(controller.signal).then(setData).catch(() => { if (!controller.signal.aborted) setError("Could not load recent mock activity.") })
        return () => controller.abort()
    }, [suppliedData])
    const shared = suppliedData === undefined ? data : suppliedData
    const events = [...(shared?.activity ?? []), ...localEvents].filter((event) => event.roles.includes(role)).sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
    return <section className="faculty-card">
        <div className="faculty-card-heading"><h2><PortalIcon name="clock" />Recent activity</h2><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-900">{events.length} updates</span></div>
        <div role="region" aria-label="Recent activity updates" tabIndex={0} className="max-h-[24dvh] overflow-y-auto px-3 [scrollbar-gutter:stable]">
            <ol className="divide-y divide-slate-200">{events.map((event) => <li key={event.id} className="py-2"><p className="text-sm font-semibold">{event.title}</p><p className="text-xs">{event.description}</p><p className="mt-1 text-xs text-slate-600">{event.actor} · <time dateTime={event.occurred_at}>{new Date(event.occurred_at).toLocaleString()}</time></p><p className="text-[11px] text-slate-500">{event.source === "browser_demo" ? "Browser-only demo change" : event.source === "saved_demo" ? "Saved Django demo update" : "Generative AI mock event"}</p></li>)}</ol>
            {error && <p role="alert" className="py-2 text-sm">{error}</p>}
            {!shared && !error && <p role="status" className="py-2 text-sm">Loading updates…</p>}
            {shared && !events.length && <p className="py-2 text-sm">No recent updates.</p>}
        </div>
        <p role="status" className="px-3 py-2 text-[11px] text-slate-600">Demo activity · Not a production audit log.</p>
    </section>
}
