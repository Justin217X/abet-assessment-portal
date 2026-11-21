/**
 * File: RoleDataPage.tsx
 * Purpose: Shows shared demo records and planned actions for each role.
 *
 * !!! Browser filters do not protect real records. The server must check access. [SD]
 *
 * !!! TODO: Replace demo data and browser-only access filtering. [SD]
 */

import { useEffect, useState } from "react"
import { loadPortalData } from "../api/portalData"
import type { PortalData } from "../api/portalData"
import { AssessmentProgress, StatusProgress } from "./StatusProgress"
import { SampleReportLibrary } from "./SampleReportLibrary"
import { RecentActivity } from "./RecentActivity"
import { PendingAction } from "./PendingAction"
import { CourseFilters } from "./CourseFilters"
import { PortalIcon } from "./PortalIcon"

type Role = "Coordinator" | "ABET Evaluator" | "System Administrator"
type Props = { role: Role; view: string }
type RecordCard = { id: string; title: string; subtitle: string; status: string; description: string; details: string[] }

function recordsFor(data: PortalData, role: Role, view: string): RecordCard[] {
    const person = (id: string) => data.users.find((row) => row.id === id)?.name ?? id
    const term = (id: string) => data.semesters.find((row) => row.id === id)?.label ?? id
    const course = (id: string) => data.courses.find((row) => row.id === id)
    const assignment = (id: string) => data.assignment_versions.find((row) => row.id === id)
    const reportTitle = (id: string) => assignment(data.reports.find((row) => row.id === id)?.assignment_version_id ?? "")?.payload.name ?? id

    // This is display filtering of fictional records, not server-side authorization.
    // !!! TODO (access): Ask Django for only the records the signed-in user can access. [SD]
    // Never rely on these client-side grant filters to protect real student/report information.
    const releasedIds = new Set(data.access_grants.filter((grant) => grant.user_id === "evaluator-1" && grant.expires_on >= (data.metadata.current_date ?? new Date().toISOString().slice(0, 10))).flatMap((grant) => grant.report_ids))
    const reports = data.reports.filter((report) => role !== "ABET Evaluator" || (releasedIds.has(report.id) && ["submitted", "archived"].includes(report.status)))
    if (view === "users") return data.users.map((row) => ({ id: row.id, title: row.name, subtitle: row.roles.join(" · "), status: "Fictional profile", description: row.email, details: ["Sample profile only. No login credentials were created.", ...data.access_grants.filter((grant) => grant.user_id === row.id).map((grant) => `${grant.report_ids.length} report grant(s), expires ${grant.expires_on}`)] }))
    if (view === "settings") return Object.entries(data.settings).map(([key, value]) => ({ id: key, title: key.replaceAll("_", " "), subtitle: "Application setting", status: "Read-only mock configuration", description: value, details: ["Changing connections, credentials and policy settings is not implemented in this preview."] }))
    if (view === "errors") return data.application_errors.map((row) => ({ id: row.id, title: row.kind.replaceAll("_", " "), subtitle: row.occurred_at, status: row.status, description: row.message, details: [`Import: ${row.import_id}`, ...data.imports.filter((item) => item.id === row.import_id).map((item) => `${item.source} · ${item.status} · Requested by ${person(item.requested_by)}`)] }))
    if (view === "improvement") return data.improvement_actions.filter((row) => role !== "ABET Evaluator" || releasedIds.has(row.report_id)).map((row) => ({ id: row.id, title: row.description, subtitle: reportTitle(row.report_id), status: row.status, description: `Review on ${row.review_on}`, details: [`Owner: ${person(row.owner_id)}`, "Fictional action example; effectiveness has not been evaluated."] }))
    if (view === "self-study") return data.self_study_materials.filter((row) => role !== "ABET Evaluator" || (row.status === "released" && row.report_ids.every((id) => releasedIds.has(id)))).map((row) => ({ id: row.id, title: row.title, subtitle: `${row.report_ids.length} linked report(s)`, status: row.status, description: "Fictional Self-Study material", details: [...row.report_ids.map(reportTitle), "Sample file unavailable. Official Self-Study submission is outside this preview."] }))
    if (view === "outcomes") return data.indicators.map((row) => {
        const outcome = data.outcomes.find((item) => item.id === row.outcome_id)
        return { id: row.id, title: `PI ${row.code}: ${row.description}`, subtitle: `${outcome?.program_id} · Outcome ${outcome?.code}`, status: "Fictional mapping", description: outcome?.description ?? "", details: [`${data.assessments.filter((item) => item.indicator_id === row.id).length} linked assessments`, "Any example attainment target is a demo value, not an approved requirement."] }
    })
    if (view === "scheduleEditor") return data.schedules.map((row) => ({ id: row.id, title: row.title, subtitle: `${row.program_id} · ${term(row.semester_id)}`, status: "Sample schedule", description: `Due ${row.due_on}`, details: [`Owner: ${person(row.owner_id)}`, "New schedules can be saved through Create schedule. Editing existing schedules is pending."] }))
    if (["archive", "reports"].includes(view)) return reports.map((row) => {
        const task = data.assessments.find((item) => item.id === row.assessment_id)!
        const version = assignment(row.assignment_version_id)!
        return { id: row.id, title: version.payload.name, subtitle: `${course(task.course_id)?.course_code} · ${term(task.semester_id)}`, status: row.status, description: `Report version ${row.report_version} · Saved ${row.generated_at.slice(0,10)}`, details: [`Saved source revision ${version.revision_number}`, `Faculty: ${person(task.faculty_id)}`, `${row.filename} — sample PDF unavailable`, `${data.evidence.filter((item) => item.assessment_id === task.id).length} linked evidence examples`, "Contents: PI results, rubric, instructions, student evidence and feedback."] }
    })
    if (view === "reviews") return data.peer_reviews.map((row) => ({ id: row.id, title: reportTitle(row.report_id), subtitle: `Reviewer: ${person(row.reviewer_id)}`, status: row.status, description: `Due ${row.due_on}`, details: [row.feedback || "No feedback submitted yet.", "Assigned reviewers can save feedback in the Faculty workspace. Reviewer reassignment is pending."] }))
    const tasks = view === "coverage" ? data.assessments.filter((row) => !reports.some((report) => report.assessment_id === row.id)) : data.assessments
    return tasks.map((row) => ({ id: row.id, title: row.task_title ?? assignment(row.assignment_version_id)?.payload.name ?? row.id, subtitle: `${course(row.course_id)?.course_code} · ${term(row.semester_id)}`, status: row.status.replaceAll("_", " "), description: `Due ${row.due_on} · ${person(row.faculty_id)}`, details: [`PI ${data.indicators.find((item) => item.id === row.indicator_id)?.code}`, `${data.statistics[row.id]?.total_students ?? 0} assessed students`, view === "coverage" ? "No submitted report record for this assessment. This is a task-level gap, not a full accreditation coverage evaluation." : "Create schedules and assign work through the planning tabs. Submission changes remain pending."] }))
}

// !!! TODO: Connect these actions to real sign-in and saving before enabling them. [SD]
function plannedActions(role: Role, view: string): string[] {
    if (role === "Coordinator") {
        const actions: Record<string, string[]> = {
            schedules: ["Edit schedule", "Send reminders"],
            progress: ["Update assignment", "Send reminder"],
            reviews: ["Assign reviewer", "Reassign reviewer"],
            outcomes: ["Add outcome or PI", "Edit mapping"],
            archive: ["Preview report", "Download report", "Release to evaluator", "Withdraw evaluator release"],
            improvement: ["Create improvement action", "Edit action", "Add follow-up evidence", "Generate Actions Report PDF", "Release to evaluator"],
            documents: ["Upload supporting document", "Edit document details", "Release to evaluator", "Withdraw evaluator release"],
        }
        return actions[view] ?? []
    }
    if (role === "System Administrator") {
        const actions: Record<string, string[]> = {
            users: ["Add evaluator account", "Manage roles and access", "Set access expiration"],
            settings: ["Edit application settings", "Test connections"],
            errors: ["Retry failed import", "Mark error resolved"],
        }
        return actions[view] ?? []
    }
    return []
}

export function RoleDataPage({ role, view }: Props) {
    const [data, setData] = useState<PortalData | null>(null)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [campusFilter, setCampusFilter] = useState("")
    const [subjectFilter, setSubjectFilter] = useState("")
    const [selectedId, setSelectedId] = useState("")
    useEffect(() => {
        const controller = new AbortController()
        loadPortalData(controller.signal).then(setData).catch((reason: unknown) => {
            if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load mock records.")
        })
        return () => controller.abort()
    }, [])
    if (error) return <p role="alert" className="rounded-lg bg-red-50 p-3">{error}</p>
    if (!data) return <p role="status">Loading shared fictional records…</p>
    const rows = recordsFor(data, role, view)
    const filterable = role !== "System Administrator" && ["progress", "schedules", "coverage", "reviews", "archive", "reports", "improvement"].includes(view)
    const linkedCourse = (id: string) => {
        const reportId = view === "reviews" ? data.peer_reviews.find((row) => row.id === id)?.report_id
            : view === "improvement" ? data.improvement_actions.find((row) => row.id === id)?.report_id : id
        const assessmentId = ["archive", "reports", "reviews", "improvement"].includes(view)
            ? data.reports.find((row) => row.id === reportId)?.assessment_id : id
        const task = data.assessments.find((row) => row.id === assessmentId)
        return data.courses.find((row) => row.id === task?.course_id)
    }
    // Filter only the records already allowed by the demo release rules.
    const campusIds = new Set(rows.map((row) => linkedCourse(row.id)?.campus_id ?? "not-specified"))
    const campuses = [...(data.campuses ?? [])]
    if (campusIds.has("not-specified")) campuses.push({ id: "not-specified", name: "Not specified" })
    const visible = rows.filter((row) => {
        const course = linkedCourse(row.id)
        return (!filterable || ((!campusFilter || (course?.campus_id ?? "not-specified") === campusFilter) &&
            (!subjectFilter || course?.course_code.split(" ")[0] === subjectFilter))) &&
            [row.title, row.subtitle, row.status, row.description].join(" ").toLowerCase().includes(search.trim().toLowerCase())
    })
    const selected = visible.find((row) => row.id === selectedId)
    const filters = <CourseFilters campuses={campuses} campus={campusFilter} subject={subjectFilter} onCampusChange={setCampusFilter} onSubjectChange={setSubjectFilter} onClear={() => { setCampusFilter(""); setSubjectFilter(""); setSearch("") }} />

    const summaries = role === "Coordinator" ? [["Course offerings", data.courses.length], ["Assessments", data.assessments.length], ["Saved reports", data.reports.length]] : role === "ABET Evaluator" ? [["Released reports", recordsFor(data, role, "reports").length], ["Released materials", recordsFor(data, role, "self-study").length], ["Linked actions", recordsFor(data, role, "improvement").length]] : [["Sample profiles", data.users.length], ["Import records", data.imports.length], ["Error records", data.application_errors.length]]
    if (view === "documents" && role === "Coordinator") return <section className="space-y-3"><h2 className="font-semibold">Supporting document management</h2><p className="text-sm">Upload syllabi, curriculum maps, assessment plans, meeting records, and additional review materials. Save document details and explicitly release files to evaluators.</p><p className="rounded-md bg-amber-50 p-3 text-sm">No documents are connected. Upload, storage, and release are pending. Self-Study management is outside the current scope.</p><div className="flex flex-wrap gap-2">{plannedActions(role, view).map((label) => <PendingAction key={label} label={label} />)}</div></section>
    if (view === "sample-reports" && role === "Coordinator") return <SampleReportLibrary data={data} />
    if (view === "activity" && role !== "ABET Evaluator") return <RecentActivity role={role === "Coordinator" ? "coordinator" : "admin"} data={data} />
    if (view === "overview" && role === "System Administrator") return <div className="space-y-4">
        <p className="rounded-lg bg-blue-50 p-3 text-sm">Generative AI mock data · System administration overview</p>
        <dl className="grid grid-cols-3 gap-3">{summaries.map(([label, count]) => <div key={label} className="rounded-lg border border-blue-200 bg-blue-50 p-3"><dt className="text-sm">{label}</dt><dd className="text-2xl font-bold">{count}</dd></div>)}</dl>
        <div className="grid items-start gap-4 lg:grid-cols-2">
            <div className="space-y-3"><StatusProgress label="Import completion" complete={data.imports.filter((row) => row.status === "completed").length} completeLabel="imports completed" segments={[{ label: "Completed", count: data.imports.filter((row) => row.status === "completed").length, tone: "complete" }, { label: "Other states", count: data.imports.filter((row) => row.status !== "completed").length, tone: "waiting" }]} /><RecentActivity role="admin" data={data} /></div>
            <section className="overflow-hidden rounded-lg border border-teal-200"><h3 className="bg-teal-50 px-4 py-3 font-semibold">Connection status</h3><dl className="divide-y divide-slate-200 p-4">{Object.entries(data.settings).filter(([key]) => key.includes("connection") || key === "evaluator_authentication").map(([key, value]) => <div key={key} className="flex flex-wrap justify-between gap-2 py-2 text-sm"><dt>{key.replaceAll("_", " ")}</dt><dd className="font-semibold">{value.replaceAll("_", " ")}</dd></div>)}</dl></section>
        </div>
    </div>
    if (view === "overview") {
        const upcoming = [...data.assessments].filter((row) => !["submitted", "archived"].includes(row.status)).sort((a, b) => a.due_on.localeCompare(b.due_on))
        return <div className="space-y-4">
            <p className="rounded-lg bg-blue-50 p-3 text-sm">Generative AI mock data · Coordinator overview across both semesters.</p>
            <dl className="grid grid-cols-3 gap-3">{summaries.map(([label, count]) => <div key={label} className="rounded-lg border border-blue-200 bg-blue-50 p-3"><dt className="text-sm">{label}</dt><dd className="text-2xl font-bold">{count}</dd></div>)}</dl>
            <div className="grid items-start gap-4 lg:grid-cols-3">
                <section className="rounded-lg border border-blue-200 p-4"><AssessmentProgress statuses={data.assessments.map((row) => row.status)} label="Assessment collection · both semesters" /></section>
                <section className="overflow-hidden rounded-lg border border-amber-200"><h3 className="bg-amber-50 px-4 py-3 font-semibold">Upcoming work</h3><div role="region" tabIndex={0} aria-label="Upcoming assessment work" className="max-h-[30dvh] divide-y divide-slate-200 overflow-y-auto px-4">{upcoming.map((task) => <article key={task.id} className="py-3"><h4 className="text-sm font-semibold">{data.assignment_versions.find((row) => row.id === task.assignment_version_id)?.payload.name}</h4><p className="text-sm">{data.courses.find((row) => row.id === task.course_id)?.course_code} · Due {task.due_on} · {task.status.replaceAll("_", " ")}</p></article>)}</div></section>
                <RecentActivity role="coordinator" data={data} />
            </div>
            <p className="text-sm text-slate-600">Create schedules and assign work using the shared local Django database. Reload a view to see newly saved demo records. Notifications and production access controls remain pending.</p>
        </div>
    }
    return <div className="space-y-3">
        {plannedActions(role, view).length > 0 && <div className="flex flex-wrap gap-2" aria-label="Planned workflow actions">{plannedActions(role, view).map((label) => <PendingAction key={label} label={label} />)}</div>}
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm">Generative AI mock data · {role === "ABET Evaluator" ? "Read-only mock release view. Live authentication and authorization remain pending." : "Changes and server saving remain pending; these records are for UI testing."}</p>
        <dl className="grid grid-cols-3 gap-3">{summaries.map(([label, count]) => <div key={label} className="rounded-lg border border-blue-200 bg-blue-50 p-3"><dt className="text-sm">{label}</dt><dd className="mt-1 text-xl font-bold">{count}</dd></div>)}</dl>
        {["progress", "schedules"].includes(view) && <div className="rounded-lg border border-blue-200 p-3"><AssessmentProgress statuses={data.assessments.map((row) => row.status)} /></div>}
        {view === "reviews" && <div className="rounded-lg border border-blue-200 p-3"><StatusProgress label="Peer review progress" complete={data.peer_reviews.filter((row) => row.status === "completed").length} completeLabel="reviews completed" segments={[{ label: "Completed", count: data.peer_reviews.filter((row) => row.status === "completed").length, tone: "complete" }, { label: "Pending", count: data.peer_reviews.filter((row) => row.status !== "completed").length, tone: "review" }]} /></div>}
        {view === "errors" && <div className="rounded-lg border border-blue-200 p-3"><StatusProgress label="Error resolution" complete={data.application_errors.filter((row) => row.status === "resolved").length} completeLabel="errors resolved" segments={[{ label: "Resolved", count: data.application_errors.filter((row) => row.status === "resolved").length, tone: "complete" }, { label: "Unresolved", count: data.application_errors.filter((row) => row.status !== "resolved").length, tone: "revision" }]} /></div>}
        {filterable && <p className="text-xs text-slate-600">Summary totals above cover all available records. Campus and Subject filter the record list below.</p>}
        {filterable && filters}
        <div className="flex flex-wrap items-end justify-between gap-3"><label className="grid w-full max-w-lg gap-1 text-sm font-medium">Search records<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, course, semester or status" className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2" /></label><p role="status" className="text-sm">{visible.length} of {rows.length} records</p></div>
        <div className="grid min-w-0 items-start gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
            <div role="region" aria-label="Mock record list" tabIndex={0} className="max-h-[43dvh] overflow-auto pr-2 [scrollbar-gutter:stable]">
                {["progress", "schedules", "coverage", "reviews", "users"].includes(view) ? <table className="w-full min-w-[34rem] text-left text-sm">
                    <thead className="sticky top-0 bg-blue-50"><tr><th scope="col" className="p-2">{view === "users" ? "User" : view === "reviews" ? "Review / report" : "Assessment"}</th><th scope="col" className="p-2">{view === "users" ? "Role" : "Context"}</th><th scope="col" className="p-2">Status</th><th scope="col" className="p-2">Action</th></tr></thead>
                    <tbody>{visible.map((row) => <tr key={row.id} className="border-b border-slate-200"><th scope="row" className="p-2 font-medium">{row.title}</th><td className="p-2">{row.subtitle}<p className="text-xs text-slate-600">{row.description}</p></td><td className="p-2">{row.status}</td><td className="p-2"><button type="button" className="rounded border border-slate-300 px-2 py-1" onClick={() => setSelectedId(row.id)}>View</button></td></tr>)}</tbody>
                </table> : view === "settings" ? <dl className="divide-y divide-slate-200">{visible.map((row) => <div key={row.id} className="grid grid-cols-[minmax(8rem,1fr)_minmax(0,1.5fr)] gap-3 p-3"><dt className="font-semibold">{row.title}</dt><dd className="break-words text-sm">{row.description}</dd></div>)}</dl> : view === "errors" ? <ol className="space-y-3">{visible.map((row) => <li key={row.id} className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3"><p className="text-xs text-slate-600">{row.subtitle}</p><h3 className="font-semibold">{row.title} · {row.status}</h3><p className="mt-2 text-sm">{row.description}</p><button type="button" onClick={() => setSelectedId(row.id)} className="mt-2 rounded border border-amber-300 px-2 py-1 text-sm">View import details</button></li>)}</ol> : (
                <ul className="grid gap-3 sm:grid-cols-2">{visible.map((row) => <li key={row.id} className={`flex min-w-0 flex-col items-start gap-2 rounded-lg border p-3 ${selectedId === row.id ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white"}`}><h3 className="font-semibold">{row.title}</h3><p className="text-sm">{row.subtitle}</p><span className="rounded bg-teal-50 px-2 py-1 text-xs text-teal-900">{row.status}</span><p className="text-sm">{row.description}</p><button type="button" aria-pressed={selectedId === row.id} onClick={() => setSelectedId(row.id)} className="mt-auto inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm"><PortalIcon name="file-text" />View details</button></li>)}</ul>
                )}
                {!visible.length && <p className="p-3 text-sm">{rows.length ? "No records match your search or filters." : "No released or matching records available for this view."}</p>}
            </div>
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white"><h3 className="bg-blue-50 px-4 py-3 font-semibold">{view === "settings" ? "Configuration status" : view === "outcomes" ? "Outcome mapping" : view === "errors" ? "Import and error details" : "Selected record"}</h3><div className="max-h-[43dvh] space-y-3 overflow-y-auto p-4">{selected ? <><h4 className="font-semibold">{selected.title}</h4><p className="text-sm">{selected.subtitle}</p>{selected.details.map((detail, index) => <p key={index} className="break-words rounded-md bg-slate-50 p-2 text-sm">{detail}</p>)}</> : <p className="text-sm text-slate-600">{view === "settings" ? "These values describe the current mock connections. Configuration editing and live integrations remain pending." : "Select a record to review its linked information."}</p>}</div></section>
        </div>
    </div>
}
