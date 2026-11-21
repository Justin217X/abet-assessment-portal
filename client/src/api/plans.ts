/**
 * File: plans.ts
 * Purpose: Sends demo Coordinator work assignments to Django.
 * !!! Fixed demo identity; production permissions are pending. [SD]
 */
export async function saveDemoPlan(payload: Record<string, string>) {
    const token = document.cookie.split("; ").find((row) => row.startsWith("csrftoken="))?.slice(10)
    if (!token) throw new Error("Reload the page to get the save token, then try again.")
    const response = await fetch("/api/demo/plans/", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-CSRFToken": decodeURIComponent(token) },
        body: JSON.stringify(payload),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) throw new Error(data?.error || "Could not save the assignment. Check Django and try again.")
    return data
}
