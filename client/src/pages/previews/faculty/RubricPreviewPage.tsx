/**
 * RubricPreviewPage.tsx
 * Displays the rubric for the requested saved assignment version. [SD]
 */

import { useEffect, useState } from "react"
import { Button } from "../../../Button"

type RubricRating = {
    label: string
    description: string | null
    points: number
}

type RubricPreview = {
    assignment_title: string
    use_rubric_for_grading: boolean | null
    criteria: {
        id: string
        label: string
        description: string | null
        points: number
        ratings: RubricRating[]
    }[]
}

type Props = { assignmentVersionId?: string }

export function RubricPreviewPage({ assignmentVersionId }: Props = {}) {
    const [downloading, setDownloading] = useState(false)
    const [downloadError, setDownloadError] = useState<{ versionId: string; message: string } | null>(null)
    const [requestNumber, setRequestNumber] = useState(0)
    const [versionInput, setVersionInput] = useState("")
    const [selectedVersionId, setSelectedVersionId] = useState("")
    const versionId = assignmentVersionId ?? selectedVersionId
    const [result, setResult] = useState<{ versionId: string; preview?: RubricPreview; error?: string } | null>(null)
    const preview = result?.versionId === versionId ? result.preview : undefined
    const error = result?.versionId === versionId ? result.error : undefined

    useEffect(() => {
        if (!versionId) return
        const controller = new AbortController()

        // Vite forwards this request to Django during local development. [SD]
        async function loadPreview() {
            try {
                const response = await fetch("/api/demo/assignment-versions/" + encodeURIComponent(versionId) + "/rubric/", {
                    signal: controller.signal,
                })
                if (response.status === 404) throw new Error("Saved assignment version not found. Check the imported version ID.")
                if (!response.ok) throw new Error("Could not load the saved rubric. Check that Django is running.")

                const data = (await response.json()) as RubricPreview
                if (!Array.isArray(data.criteria)) throw new Error("The saved rubric response is invalid.")
                if (!controller.signal.aborted) setResult({ versionId, preview: data })
            } catch (reason: unknown) {
                if (!controller.signal.aborted) {
                    setResult({ versionId, error: reason instanceof Error ? reason.message : "Could not load the saved rubric." })
                }
            }
        }

        void loadPreview()
        return () => controller.abort()
    }, [versionId, requestNumber])

    async function downloadPdf() {
        if (!preview || !versionId || downloading) return
        setDownloading(true)
        setDownloadError(null)
        try {
            const response = await fetch("/api/demo/assignment-versions/" + encodeURIComponent(versionId) + "/rubric/pdf/")
            if (!response.ok || !response.headers.get("Content-Type")?.startsWith("application/pdf")) {
                throw new Error("Could not download this saved rubric PDF. Check Django and try again.")
            }
            const url = URL.createObjectURL(await response.blob())
            const link = document.createElement("a")
            link.href = url
            link.download = "rubric-report-" + versionId + ".pdf"
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        } catch (reason: unknown) {
            setDownloadError({ versionId, message: reason instanceof Error ? reason.message : "Could not download the rubric PDF." })
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-600">Demo using fictional Canvas data.</p>

            {/* !!! TODO: Pass the assigned saved version from the real assessment workflow. [SD] */}
            {assignmentVersionId === undefined && <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); setSelectedVersionId(versionInput.trim()); setResult(null); setRequestNumber((value) => value + 1) }}>
                <label className="grid gap-1 text-sm font-medium">Saved assignment version ID
                    <input required value={versionInput} onChange={(event) => setVersionInput(event.target.value)} placeholder="Paste the ID printed by the import command" className="w-full rounded-md border border-slate-300 px-3 py-2 sm:w-96" />
                </label>
                <button type="submit" className="rounded-md border border-slate-300 px-3 py-2 text-sm">Load saved rubric</button>
            </form>}
            {!versionId && <p role="status">Import the fictional assignment, then enter its saved version ID to view the rubric.</p>}
            {versionId && <p className="break-all text-xs text-slate-600">Saved version: {versionId}</p>}
            {error && <p role="alert">{error}</p>}
            {versionId && !preview && !error && <p role="status">Loading rubric…</p>}

            {preview && (
                <>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <h2 className="text-lg font-semibold">{preview.assignment_title}</h2>
                        <p className="text-sm text-slate-600">
                            Rubric used for grading:{" "}
                            {preview.use_rubric_for_grading === null
                                ? "Not provided"
                                : preview.use_rubric_for_grading ? "Yes" : "No"}
                        </p>
                    </div>

                    {preview.criteria.length === 0 && <p>No rubric is saved for this assignment version.</p>}

                    {preview.criteria.map((criterion) => (
                        <section key={criterion.id} className="rounded-lg border border-slate-200 bg-white p-4">
                            <h3 className="font-semibold">{criterion.label}</h3>
                            <p>{criterion.description}</p>
                            <p className="mt-2 text-sm">Maximum: {criterion.points} points</p>

                            {criterion.ratings.length === 0 ? (
                                <p className="mt-3">No ratings were returned.</p>
                            ) : (
                                <div className="mt-3 overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <caption className="sr-only">Ratings for {criterion.label}</caption>
                                        <thead>
                                            <tr>
                                                <th scope="col" className="p-2">Performance level</th>
                                                <th scope="col" className="p-2">Description</th>
                                                <th scope="col" className="p-2">Points</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {criterion.ratings.map((rating, index) => (
                                                <tr key={`${rating.label}-${index}`} className="border-t border-slate-200">
                                                    <th scope="row" className="p-2 font-medium">{rating.label}</th>
                                                    <td className="p-2">{rating.description || "—"}</td>
                                                    <td className="p-2">{rating.points}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    ))}
                </>
            )}

            {/* Use the same saved version for the preview and PDF. */}
            <Button disabled={!preview || downloading} onClick={() => void downloadPdf()} className="disabled:cursor-not-allowed disabled:opacity-60">
                {downloading ? "Downloading PDF..." : "Generate Rubric Report PDF"}
            </Button>
            {downloadError?.versionId === versionId && <p role="alert">{downloadError.message}</p>}
        </div>
    )
}