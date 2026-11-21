/**
 * File: EvidencePdfPreviewButton.tsx
 * Purpose: Opens the requested fictional evidence PDF and reports preview errors.
 * !!! Uses the development-only mock endpoint. Original student files remain pending. [SD]
 */
import { useState } from "react"

type Props = { evidenceId: string; label: string }

export function EvidencePdfPreviewButton({ evidenceId, label }: Props) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function preview() {
        setError("")
        // Open during the click so browsers can allow the new tab.
        const tab = window.open("about:blank", "_blank")
        if (!tab) {
            setError("Allow pop-ups for this portal, then try the PDF preview again.")
            return
        }
        tab.opener = null
        tab.document.title = "Loading fictional evidence PDF"
        tab.document.body.textContent = "Loading fictional evidence PDF..."
        setLoading(true)
        try {
            const response = await fetch("/api/demo/evidence/" + encodeURIComponent(evidenceId) + "/pdf/", {
                signal: AbortSignal.timeout(30000),
            })
            if (!response.ok || response.headers.get("Content-Type")?.split(";")[0].trim() !== "application/pdf") {
                throw new Error("PDF preview is unavailable. Check that Django is running in development mode, then try again.")
            }
            const blob = await response.blob()
            if (!blob.size) throw new Error("The PDF preview was empty. Please try again.")
            if (tab.closed) return
            const url = URL.createObjectURL(blob)
            // Release the temporary PDF after the browser has had time to load it.
            window.setTimeout(() => URL.revokeObjectURL(url), 300000)
            tab.location.replace(url)
        } catch (reason) {
            tab.close()
            setError(reason instanceof Error && reason.name !== "TypeError" && reason.name !== "TimeoutError"
                ? reason.message : "Could not load the PDF preview. Check the connection and try again.")
        } finally {
            setLoading(false)
        }
    }

    return <div className="space-y-1">
        <button type="button" aria-label={label} disabled={loading} onClick={() => { void preview() }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs disabled:opacity-60">
            {loading ? "Loading PDF..." : "Preview PDF"}
        </button>
        {error && <p role="alert" className="max-w-xs text-xs text-red-800">{error}</p>}
    </div>
}
