/**
 * File: FacultyPeerReviewsPage.tsx
 * Purpose: Lists assigned demo reviews and saves their feedback through Django.
 * !!! Fixed Faculty demo profile. Live sign-in and document access are pending. [SD]
 */
import { useEffect, useState } from "react"
import type { PortalData } from "../../../api/portalData"
import { loadPortalData } from "../../../api/portalData"
import { savePeerReview } from "../../../api/peerReviews"
import { StatusProgress } from "../../../components/StatusProgress"

type Props = { onDataChange?: (data: PortalData) => void }

export function FacultyPeerReviewsPage({ onDataChange }: Props) {
    const [data, setData] = useState<PortalData | null>(null)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [selectedId, setSelectedId] = useState("")
    useEffect(() => {
        const controller = new AbortController()
        loadPortalData(controller.signal).then(setData).catch((reason: unknown) => {
            if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load peer reviews.")
        })
        return () => controller.abort()
    }, [])
    if (error) return <p role="alert">{error}</p>
    if (!data) return <p role="status">Loading assigned peer reviews...</p>

    // Display scoping only. Django must use the signed-in reviewer in production.
    const reviews = data.peer_reviews.filter((row) => row.reviewer_id === "faculty-1")
    const assessment = (id: string) => data.assessments.find((row) => row.id === id)
    const title = (id: string) => {
        const row = assessment(id)
        return row?.task_title ?? data.assignment_versions.find((version) => version.id === row?.assignment_version_id)?.payload.name ?? "Assessment unavailable"
    }
    const course = (id: string) => data.courses.find((row) => row.id === assessment(id)?.course_id)?.course_code ?? "Course unavailable"
    const semester = (id: string) => data.semesters.find((row) => row.id === assessment(id)?.semester_id)?.label ?? ""
    const visible = reviews.filter((row) => [title(row.assessment_id), course(row.assessment_id), semester(row.assessment_id), row.status, row.due_on].join(" ").toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a, b) => Number(a.status === "completed") - Number(b.status === "completed") || a.due_on.localeCompare(b.due_on))
    const selected = visible.find((row) => row.id === selectedId)
    const completed = reviews.filter((row) => row.status === "completed").length
    return <div className="space-y-3">
        <p className="rounded-md bg-blue-50 p-3 text-sm">AI-generated mock records. Reviews assigned to Professor Martin are shown here. Feedback saves to the local demo database.</p>
        <StatusProgress label="Peer review progress" complete={completed} completeLabel="reviews completed" segments={[
            { label: "Completed", count: completed, tone: "complete" },
            { label: "Pending", count: reviews.length - completed, tone: "review" },
        ]} />
        <label className="grid max-w-lg gap-1 text-sm font-medium">Search peer reviews
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Course, assignment, semester, status or due date"
                className="rounded-md border border-slate-300 bg-white px-3 py-2" />
        </label>
        <p className="text-xs">{visible.length} of {reviews.length} assigned reviews</p>
        <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div role="region" aria-label="Assigned peer reviews" tabIndex={0} className="grid max-h-[52dvh] gap-3 overflow-y-auto pr-2 sm:grid-cols-2">
                {visible.map((row) => <article key={row.id} className={"space-y-2 rounded-lg border p-3 " + (selectedId === row.id ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white")}>
                    <h3 className="text-sm font-semibold">{title(row.assessment_id)}</h3>
                    <p className="text-sm">{course(row.assessment_id)} · {semester(row.assessment_id)}</p>
                    <p className="text-sm">Status: {row.status}</p>
                    <p className="text-sm">Due <time dateTime={row.due_on}>{row.due_on}</time></p>
                    <button type="button" onClick={() => setSelectedId(row.id)} aria-pressed={selectedId === row.id}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm">View review</button>
                </article>)}
                {!visible.length && <p role="status" className="p-3 text-sm">{reviews.length ? "No reviews match your search." : "No peer reviews are assigned to you."}</p>}
            </div>
            {selected ? <ReviewFeedback key={selected.id} review={selected} title={title(selected.assessment_id)} course={course(selected.assessment_id)}
                report={data.reports.find((row) => row.id === selected.report_id)}
                onSaved={(review) => {
                    const updated = { ...data, peer_reviews: data.peer_reviews.map((row) => row.id === review.id ? review : row) }
                    setData(updated)
                    onDataChange?.(updated)
                }} /> : <p role="status" className="rounded-lg border border-slate-200 bg-white p-4 text-sm">Choose an assigned review to view feedback.</p>}
        </div>
    </div>
}

type FeedbackProps = {
    review: PortalData["peer_reviews"][number]
    title: string
    course: string
    report?: PortalData["reports"][number]
    onSaved: (review: PortalData["peer_reviews"][number]) => void
}

function ReviewFeedback({ review, title, course, report, onSaved }: FeedbackProps) {
    const [feedback, setFeedback] = useState(review.feedback ?? "")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    async function save(complete: boolean) {
        setSaving(true); setError(""); setMessage("")
        try {
            const saved = await savePeerReview(review.id, feedback, complete || review.status === "completed" ? "completed" : "assigned")
            setFeedback(saved.feedback)
            onSaved(saved)
            setMessage(saved.status === "completed" ? "Review completed and saved in Django." : "Feedback saved in Django.")
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Could not save feedback. Your text is still available.")
        } finally { setSaving(false) }
    }
    return <section aria-label="Peer review details" className="max-h-[60dvh] space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm">{course} · {review.status}</p>
        <p className="text-sm">{report ? "Report version " + report.report_version + " · " + report.status : "Linked report details unavailable."}</p>
        <p className="break-all text-xs">{report?.filename}</p>
        <p className="text-xs text-slate-600">Report PDF and supporting-document access are not connected in this change.</p>
        <label className="grid gap-2 text-sm font-medium">Your review feedback
            <textarea rows={6} maxLength={10000} value={feedback} disabled={saving}
                onChange={(event) => { setFeedback(event.target.value); setError(""); setMessage("") }}
                className="w-full rounded-md border border-slate-300 p-2" />
        </label>
        <div className="flex flex-wrap gap-2">
            <button type="button" disabled={saving} onClick={() => { void save(false) }} className="rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-60">{saving ? "Saving..." : "Save feedback"}</button>
            <button type="button" disabled={saving || !feedback.trim() || review.status === "completed"} onClick={() => { void save(true) }} className="rounded-md bg-blue-800 px-3 py-2 text-sm text-white disabled:opacity-60">Complete review</button>
        </div>
        {message && <p role="status" className="text-sm">{message}</p>}
        {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
    </section>
}
