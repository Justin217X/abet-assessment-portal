/**
 * File: demoActivity.ts
 * Purpose: Records demo activity in this browser.
 *
 * !!! Browser activity is a demo, not the official server activity history. [SD]
 * !!! Keep only for Demo mode. [SD]
 */

import type { ActivityEvent } from "./portalData"
export const activityStorageKey = "abet-demo-activity-v1"
export const activityChanged = "abet-demo-activity-changed"
export function readDemoActivity(): ActivityEvent[] {
    try {
        const rows: unknown = JSON.parse(localStorage.getItem(activityStorageKey) ?? "[]")
        return Array.isArray(rows) ? rows.filter((row): row is ActivityEvent => row && typeof row.id === "string" && typeof row.occurred_at === "string" && Array.isArray(row.roles) && row.source === "browser_demo") : []
    } catch { return [] }
}

// !!! TODO (backend): Load saved activity from Django with the user, time, and changed record. [SD]
// Keep role access checks on the server; browser events are UI examples, not an audit trail.
export function recordDemoActivity(event: Omit<ActivityEvent, "id" | "occurred_at" | "source">) {
    try {
        const row: ActivityEvent = { ...event, id: crypto.randomUUID(), occurred_at: new Date().toISOString(), source: "browser_demo" }
        localStorage.setItem(activityStorageKey, JSON.stringify([row, ...readDemoActivity()].slice(0, 100)))
        window.dispatchEvent(new Event(activityChanged))
    } catch { /* Activity storage failure must not undo a successfully saved demo draft. */ }
}
