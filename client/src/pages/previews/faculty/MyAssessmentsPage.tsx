/**
 * File: MyAssessmentsPage.tsx
 * Purpose: Lists assigned mock assessments with course, due date, and status.
 * !!! The fixed demo profile is not a real access check. [SD]
 * !!! TODO: Use the signed-in user and connect report review separately. [SD]
 */
import { useEffect, useState } from "react"
import { loadPortalData } from "../../../api/portalData"
import type { PortalData } from "../../../api/portalData"
import { AssessmentProgress } from "../../../components/StatusProgress"
import { PortalIcon } from "../../../components/PortalIcon"

type Props = { onReviewAssessment?: (assessmentId: string) => void }

export function MyAssessmentsPage({ onReviewAssessment }: Props = {}) {
    const [data, setData] = useState<PortalData | null>(null)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")

    useEffect(() => {
        const controller = new AbortController()
        loadPortalData(controller.signal).then(setData).catch((reason: unknown) => {
            if (!controller.signal.aborted) setError(
                reason instanceof Error ? reason.message : "Could not load assigned assessments.",
            )
        })
        return () => controller.abort()
    }, [])

    if (error) return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3">{error}</p>
    if (!data) return <p role="status">Loading assigned assessments...</p>

    const rows = data.assessments.filter((row) => row.faculty_id === "faculty-1")
    const course = (id: string) => data.courses.find((row) => row.id === id)
    const term = (id: string) => data.semesters.find((row) => row.id === id)?.label ?? ""
    const title = (row: typeof rows[number]) => row.task_title ??
        data.assignment_versions.find((version) => version.id === row.assignment_version_id)?.payload.name ??
        "Untitled assessment"
    const visible = rows.filter((row) =>
        [title(row), course(row.course_id)?.course_code, term(row.semester_id), row.due_on, row.status.replaceAll("_", " ")]
            .join(" ").toLowerCase().includes(search.trim().toLowerCase()),
    )
    const formatDate = (date: string) => new Intl.DateTimeFormat("en-US", {
        month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
    }).format(new Date(date + "T12:00:00Z"))

    return <section className="space-y-3" aria-label="Assigned assessments">
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm">
            Generative AI mock data from Django. Report review and editing are connected in a separate change.
        </p>
        <div className="flex flex-wrap items-end justify-between gap-3">
            <label className="grid w-full max-w-lg gap-1 text-sm font-medium">
                Search your assessments
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                    placeholder="Course, assignment, semester, due date or status"
                    className="rounded-md border border-slate-300 bg-white px-3 py-2" />
            </label>
            <p role="status" className="text-sm">{visible.length} of {rows.length} assigned assessments</p>
        </div>
        <div className="max-w-2xl rounded-md border border-slate-200 p-3">
            <AssessmentProgress statuses={visible.map((row) => row.status)} label="Shown assessment records" />
        </div>
        <div role="region" aria-label="Assessment list" tabIndex={0}
            className="max-h-[48dvh] overflow-y-auto pr-2 [scrollbar-gutter:stable]">
            <ul className="grid gap-3 sm:grid-cols-2 min-[1400px]:grid-cols-3">
                {visible.map((row) => <li key={row.id}
                    className="flex min-w-0 flex-col items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <h3 className="font-semibold">{title(row)}</h3>
                    <p className="text-sm">{course(row.course_id)?.course_code} · {term(row.semester_id)}</p>
                    <p className="text-sm">Status: {row.status.replaceAll("_", " ")}</p>
                    <p className="inline-flex items-center gap-1.5 text-sm font-medium">
                        <PortalIcon name="calendar-days" />Due <time dateTime={row.due_on}>{formatDate(row.due_on)}</time>
                    </p>
                    <button type="button" disabled={!onReviewAssessment}
                        onClick={() => onReviewAssessment?.(row.id)}
                        className="mt-auto rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
                        {onReviewAssessment ? "Review report" : "Review report (pending)"}
                    </button>
                </li>)}
            </ul>
            {!rows.length && <p role="status" className="p-3 text-sm">No assessments are assigned to this demo profile.</p>}
            {rows.length > 0 && !visible.length && <p role="status" className="p-3 text-sm">No assessments match your search.</p>}
        </div>
    </section>
}
