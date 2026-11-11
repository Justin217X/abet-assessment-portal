/**
 * RubricPreviewPage.tsx
 * Displays the fictional rubric returned by Django for the local demo. [SD]
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

export function RubricPreviewPage() {
    const [preview, setPreview] = useState<RubricPreview | null>(null)
    const [error, setError] = useState("")

    useEffect(() => {
        const controller = new AbortController()

        // Vite forwards this request to Django during local development. [SD]
        async function loadPreview() {
            try {
                const response = await fetch("/api/demo/rubric-preview/", {
                    signal: controller.signal,
                })
                if (!response.ok) throw new Error("Rubric request failed")

                const data = (await response.json()) as RubricPreview
                if (!controller.signal.aborted) setPreview(data)
            } catch {
                if (!controller.signal.aborted) {
                    setError("Could not load the rubric. Check that Django is running, then reopen this page.")
                }
            }
        }

        void loadPreview()
        return () => controller.abort()
    }, [])

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-600">Demo using fictional Canvas data.</p>

            {error && <p role="alert">{error}</p>}
            {!preview && !error && <p role="status">Loading rubric…</p>}

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

                    {preview.criteria.length === 0 && <p>No rubric criteria were returned.</p>}

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

            {/* TODO: Enable PDF generation after the PDF generator is connected. [SD] */}
            <Button disabled className="cursor-not-allowed opacity-60">
                Generate Rubric Report PDF
            </Button>
        </div>
    )
}