/**
 * PIReportPreviewPage.tsx
 * Lets faculty review performance indicator results before generating the PI Report PDF. [SD]
 */

import { useEffect, useState } from "react"
import { Button } from "../../../Button"

type PerformanceLevel = {
    level: number
    label: string
    student_count: number
    percentage: number
    average_score: number | null
    max_score: number
}

type PIReportPreview = {
    program: {
        code: string
        name: string
    }
    course: {
        id: number
        name: string
        course_code: string
    }
    semester: string
    section: string
    instructor: string
    assignment_title: string
    performance_indicator: {
        code: string
        description: string
        criterion_ids: string[]
    }
    statistics: {
        total_students: number
        highest_supported_level: number | null
        distribution: PerformanceLevel[]
        min_score: number | null
        max_score: number | null
        median_score: number | null
        mean_score: number | null
        mean_level: number | null
    }
    instructor_comments: string
}

// Format scores and statistics to two decimal places. [JH]
function formatNumber(value: number | null) {
    return value === null ? "Unavailable" : value.toFixed(2)
}

export function PIReportPreviewPage() {
    const [preview, setPreview] = useState<PIReportPreview | null>(null)
    const [error, setError] = useState("")

    useEffect(() => {
        const controller = new AbortController()

        // Retrieve the PI Report preview from Django. [JH]
        async function loadPreview() {
            try {
                const response = await fetch("/api/demo/pi-preview/", {
                    signal: controller.signal,
                })

                if (!response.ok) throw new Error("PI request failed")

                const data = (await response.json()) as PIReportPreview

                if (!controller.signal.aborted) setPreview(data)
            } catch {
                if (!controller.signal.aborted) {
                    setError("Could not load the PI Report. Check that Django is running, then reopen this page.")
                }
            }
        }

        void loadPreview()
        return () => controller.abort()
    }, [])

    // Assessment context displayed in the preview. [JH]
    const contextDetails = preview ? [
        ["Program", preview.program.name],
        ["Semester", preview.semester],
        ["Course", `${preview.course.course_code}: ${preview.course.name}`],
        ["Assignment", preview.assignment_title],
        ["Course sections", preview.section],
        ["Performance indicator (PI)",
            `${preview.performance_indicator.code}: ${preview.performance_indicator.description}`,
        ],
        ["Student group", "All assessed demo students"],
    ] : []

    const scoreSummary = preview ? [
        ["Students assessed", preview.statistics.total_students],
        ["Students with missing scores", "Unavailable"],
        [
            "Highest supported performance level",
            preview.statistics.highest_supported_level ?? "Unavailable",
        ],
        ["Minimum PI score", formatNumber(preview.statistics.min_score)],
        ["Median PI score", formatNumber(preview.statistics.median_score)],
        ["Maximum PI score", formatNumber(preview.statistics.max_score)],
        ["Mean PI score", formatNumber(preview.statistics.mean_score)],
        ["Mean performance level", formatNumber(preview.statistics.mean_level)],
    ] : []

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-600">
                Demo using fictional Canvas data.
            </p>

            {error && <p role="alert">{error}</p>}
            {!preview && !error && <p role="status">Loading PI Report…</p>}

            {preview && (
                <>
                    {/* Assessment context. [JH] */}
                    <section className="rounded-lg border border-slate-200 bg-white p-4">
                        <h3 className="text-lg font-semibold">
                            Assessment context
                        </h3>

                        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                            {contextDetails.map(([label, value]) => (
                                <div key={label}>
                                    <dt className="text-sm font-semibold">
                                        {label}
                                    </dt>
                                    <dd className="text-sm text-slate-600">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    {/* Student performance distribution. [JH] */}
                    <section className="rounded-lg border border-slate-200 bg-white p-4">
                        <h3 className="text-lg font-semibold">
                            Performance distribution
                        </h3>

                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <caption className="sr-only">
                                    Student performance distribution
                                </caption>

                                <thead>
                                    <tr>
                                        <th scope="col" className="p-2">
                                            Performance level
                                        </th>
                                        <th scope="col" className="p-2">
                                            Student count
                                        </th>
                                        <th scope="col" className="p-2">
                                            Percentage
                                        </th>
                                        <th scope="col" className="p-2">
                                            Average score
                                        </th>
                                        <th scope="col" className="p-2">
                                            MAX Level Score
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {preview.statistics.distribution.map((level) => (
                                        <tr
                                            key={level.level}
                                            className="border-t border-slate-200"
                                        >
                                            <th scope="row" className="p-2 font-medium">
                                                {level.level}: {level.label}
                                            </th>
                                            <td className="p-2">
                                                {level.student_count}
                                            </td>
                                            <td className="p-2">
                                                {level.percentage.toFixed(2)}%
                                            </td>
                                            <td className="p-2">
                                                {formatNumber(level.average_score)}
                                            </td>
                                            <td className="p-2">
                                                {formatNumber(level.max_score)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Score statistics and faculty comments. [JH] */}
                    <section className="rounded-lg border border-slate-200 bg-white p-4">
                        <h3 className="text-lg font-semibold">
                            Score summary
                        </h3>

                        <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                            {scoreSummary.map(([label, value]) => (
                                <div key={label}>
                                    <dt className="text-sm font-semibold">
                                        {label}
                                    </dt>
                                    <dd className="text-sm text-slate-600">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        <h4 className="mt-6 text-sm font-semibold">
                            Faculty comments
                        </h4>

                        <p className="mt-1 text-sm text-slate-600">
                            {preview.instructor_comments || "No faculty comments provided."}
                        </p>
                    </section>
                </>
            )}

            {/* Download the PI Report from Django. [JH] */}
            <div>
                <Button
                    disabled={!preview || !!error}
                    onClick={() => {
                        window.location.assign("/api/demo/pi-report/")
                    }}
                >
                    Generate PI Report PDF
                </Button>

                <p className="mt-2 text-sm text-slate-600">
                    Review the PI Report preview before generating the PDF.
                </p>
            </div>
        </div>
    )
}
