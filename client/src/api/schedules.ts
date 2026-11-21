/**
 * File: schedules.ts
 * Purpose: Sends new demo Coordinator schedules to Django.
 * !!! Uses the development-only endpoint, not production authorization. [SD]
 */
import type { PortalData } from "./portalData"

type ScheduleInput = { title: string; program_id: string; semester_id: string; due_on: string }

export async function saveSchedule(input: ScheduleInput) {
    const token = document.cookie.split("; ").find((row) => row.startsWith("csrftoken="))?.slice("csrftoken=".length)
    if (!token) throw new Error("The save token is missing. Reload the page and try again.")
    const response = await fetch("/api/demo/plans/", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-CSRFToken": decodeURIComponent(token) },
        body: JSON.stringify({ ...input, kind: "schedule" }),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) throw new Error(body?.error || "Could not save the schedule. Check Django and try again.")
    if (typeof body?.id !== "string" || typeof body.title !== "string" || body.program_id !== input.program_id || body.semester_id !== input.semester_id || body.due_on !== input.due_on) {
        throw new Error("The server returned an unexpected schedule. Reload to check whether it saved.")
    }
    return body as PortalData["schedules"][number]
}
