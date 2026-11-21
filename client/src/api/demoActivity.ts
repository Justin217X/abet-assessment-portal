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
