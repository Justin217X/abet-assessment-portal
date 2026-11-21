/**
 * File: peerReviews.ts
 * Purpose: Sends demo peer-review feedback to Django with its CSRF token.
 * !!! Fixed demo user; production sign-in and permissions are pending. [SD]
 */
import type { PortalData } from "./portalData"

export async function savePeerReview(reviewId: string, feedback: string, status: "assigned" | "completed") {
    const token = document.cookie.split("; ").find((row) => row.startsWith("csrftoken="))?.slice("csrftoken=".length)
    if (!token) throw new Error("The save token is missing. Reload the page and try again.")
    const response = await fetch("/api/demo/reviews/", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-CSRFToken": decodeURIComponent(token) },
        body: JSON.stringify({ review_id: reviewId, feedback, status }),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) throw new Error(body?.error || "Could not save the review. Check Django and try again.")
    if (body?.id !== reviewId || typeof body.feedback !== "string" || !["assigned", "completed"].includes(body.status)) {
        throw new Error("The server returned an unexpected review. Reload to check the saved status.")
    }
    return body as PortalData["peer_reviews"][number]
}
