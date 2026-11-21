/**
 * File: FacultyArchivePage.tsx
 * Purpose: Separates supplied historical PDFs from the demo Faculty report records.
 * !!! Fixed demo profile. Saved PDF access and production permissions are pending. [SD]
 */
import { useEffect, useState } from "react"
import { loadPortalData } from "../../../api/portalData"
import type { PortalData } from "../../../api/portalData"
import { SampleReportLibrary } from "../../../components/SampleReportLibrary"
import { PendingAction } from "../../../components/PendingAction"

export function FacultyArchivePage() {
    const [view, setView] = useState<"samples" | "records">("samples")
    return <div className="space-y-3">
        <div className="flex flex-wrap gap-2">{(["samples", "records"] as const).map((item) => <button type="button" key={item} aria-pressed={view === item} onClick={() => setView(item)} className={"rounded-md border px-3 py-2 text-sm " + (view === item ? "border-blue-800 bg-blue-800 text-white" : "border-slate-300 bg-white")}>
            {item === "samples" ? "Provided PDF samples" : "Saved mock reports"}
        </button>)}</div>
        {view === "samples" ? <SampleReportLibrary /> : <FacultyArchiveRecords />}
    </div>
}

function FacultyArchiveRecords() {
    const [data, setData] = useState<PortalData | null>(null)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [selectedId, setSelectedId] = useState("")
    useEffect(() => {
        const controller = new AbortController()
        loadPortalData(controller.signal).then(setData).catch((reason: unknown) => {
            if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load report records.")
        })
        return () => controller.abort()
    }, [])
    if (error) return <p role="alert">{error}</p>
    if (!data) return <p role="status">Loading Faculty report archive...</p>

    // Display scoping only. Production access must be checked by Django.
    const rows = data.reports.flatMap((report) => {
        const assessment = data.assessments.find((row) => row.id === report.assessment_id && row.faculty_id === "faculty-1")
        if (!assessment || !["submitted", "archived"].includes(report.status)) return []
        const version = data.assignment_versions.find((row) => row.id === report.assignment_version_id)
        return [{ ...report,
            title: assessment.task_title ?? version?.payload.name ?? "Untitled report",
            course: data.courses.find((row) => row.id === assessment.course_id)?.course_code ?? "Course unavailable",
            semester: data.semesters.find((row) => row.id === assessment.semester_id)?.label ?? "Semester unavailable",
            sourceRevision: version?.revision_number,
        }]
    }).sort((a, b) => b.generated_at.localeCompare(a.generated_at) || b.report_version - a.report_version)
    const visible = rows.filter((row) => [row.title, row.course, row.semester, row.status, row.filename, row.report_version].join(" ").toLowerCase().includes(search.trim().toLowerCase()))
    const selected = visible.find((row) => row.id === selectedId)
    return <div className="space-y-3">
        <p className="rounded-md bg-blue-50 p-3 text-sm">AI-generated mock report records for Professor Martin. These entries do not provide completed PDF files.</p>
        <label className="grid max-w-lg gap-1 text-sm font-medium">Search report archive
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Course, assignment, semester, status or filename"
                className="rounded-md border border-slate-300 bg-white px-3 py-2" />
        </label>
        <p className="text-xs">{visible.length} of {rows.length} report records</p>
        <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div role="region" aria-label="Faculty archive records" tabIndex={0} className="grid max-h-[55dvh] gap-3 overflow-y-auto pr-2 sm:grid-cols-2">
                {visible.map((row) => <article key={row.id} className={"space-y-2 rounded-lg border p-3 " + (selectedId === row.id ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white")}>
                    <h3 className="text-sm font-semibold">{row.title}</h3>
                    <p className="text-sm">{row.course} · {row.semester}</p>
                    <p className="text-sm">Report version {row.report_version} · {row.status}</p>
                    <p className="text-sm">Generated <time dateTime={row.generated_at}>{row.generated_at.slice(0, 10)}</time></p>
                    <button type="button" aria-pressed={selectedId === row.id} onClick={() => setSelectedId(row.id)} className="rounded-md border border-slate-300 bg-white px-3 py-1 text-sm">View report details</button>
                </article>)}
                {!visible.length && <p role="status" className="p-3 text-sm">{rows.length ? "No reports match your search." : "No submitted or archived reports are available."}</p>}
            </div>
            {selected ? <section aria-label="Archived report details" className="max-h-[55dvh] space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="font-semibold">{selected.title}</h3>
                <p className="text-sm">{selected.course} · {selected.semester}</p>
                <p className="text-sm">Status: {selected.status}</p>
                <p className="text-sm">Report version: {selected.report_version}</p>
                <p className="text-sm">Saved source revision: {selected.sourceRevision ?? "Unavailable"}</p>
                <p className="text-sm">Generated: <time dateTime={selected.generated_at}>{selected.generated_at}</time></p>
                <p className="break-all text-sm">Filename: {selected.filename}</p>
                <p className="text-xs text-slate-600">PDF preview and download are not connected for these report records.</p>
                <div className="flex flex-wrap gap-2"><PendingAction label="Preview report PDF" /><PendingAction label="Download report PDF" /></div>
            </section> : <p role="status" className="rounded-lg border border-slate-200 bg-white p-4 text-sm">Choose a report to view its saved record details.</p>}
        </div>
    </div>
}
