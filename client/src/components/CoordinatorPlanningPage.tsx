/**
 * File: CoordinatorPlanningPage.tsx
 * Purpose: Allows coordinators to create assessment schedules
 * and assign reporting tasks to faculty using fictional data.
 *
 * Saves records in the local Django database.
 * 
 * !!! Production permissions and notifications are not connected yet. [SD]
 * 
 * !!! TODO: replace demo saving with authenticated production saving. [SD]
 */

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { loadPortalData } from "../api/portalData"
import { saveDemoPlan } from "../api/plans"
import type { PortalData } from "../api/portalData"

export function CoordinatorPlanningPage({ kind }: { kind: "schedule" | "assignment" }) {
    const [data, setData] = useState<PortalData | null>(null)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [saving, setSaving] = useState(false)
    const [assignmentVersionId, setAssignmentVersionId] = useState("")
    const [programId, setProgramId] = useState("SE")
    const [title, setTitle] = useState("")
    const [semesterId, setSemesterId] = useState("fall-2026")
    const [courseId, setCourseId] = useState("")
    const [facultyId, setFacultyId] = useState("faculty-1")
    const [indicatorId, setIndicatorId] = useState("")
    const [due, setDue] = useState("")
    
    // Load shared planning options from Django.
    // Cancel the request of the user leaves this page.
    useEffect(() => {
        const controller = new AbortController()
        loadPortalData(controller.signal).then(setData).catch((reason: unknown) => {
            if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load planning records.")
        })
        return () => controller.abort()
    }, [])
    if (error) return <p role="alert">{error}</p>
    if (!data) return <p role="status">Loading planning options…</p>
    const source = data

    // Limit courses to the selected semester and use the first available option when the current selection is no longer valid.
    const courses = source.courses.filter((course) => course.semester_id === semesterId)
    const selectedCourse = courses.find((course) => course.id === courseId) ?? courses[0]
    const selectedIndicator = source.indicators.find((indicator) => indicator.id === indicatorId) ?? source.indicators[0]
    
    // List each saved assignment version once for the selected course, even when several assessment task reference that version.
    const assignmentOptions = source.assessments.filter((row, index, rows) => row.course_id === selectedCourse?.id && rows.findIndex((item) => item.assignment_version_id === row.assignment_version_id && item.course_id === row.course_id) === index)
    const selectedAssignment = assignmentOptions.find((row) => row.assignment_version_id === assignmentVersionId) ?? assignmentOptions[0]
    
    // Show task created through the demo planning form.
    const saved = source.assessments.filter((row) => row.id.startsWith("demo-assignment-"))
    
    // !!! TODO (production): Replace the development route with authenticated Coordinator APIs. [SD]
    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const fields = new FormData(event.currentTarget)
        setSaving(true); setMessage("")
        try {
            await saveDemoPlan({ kind, title: String(fields.get("title") ?? ""), due_on: String(fields.get("due") ?? ""), semester_id: semesterId, program_id: programId, course_id: selectedCourse?.id ?? "", faculty_id: facultyId, indicator_id: selectedIndicator?.id ?? "", assignment_version_id: selectedAssignment?.assignment_version_id ?? "" })
            setData(await loadPortalData(new AbortController().signal))
            setTitle(""); setMessage("Saved in the local Django database. Shared demo views now include this record. No notifications were sent.")
        } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Could not save the plan.") }
        finally { setSaving(false) }
    }
    
    // Reuse the same Tailwind styling across form inputs and dropdowns
    const field = "mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2"

    return <div className="space-y-4">
        <p className="rounded-lg bg-amber-50 p-3 text-sm">Demo planning · Saves are stored in your local Django database and shared across the demo views on this server. Production permissions and notifications remain pending.</p>
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(20rem,1fr)_minmax(0,1.3fr)]">
            <section className="overflow-hidden rounded-lg border border-blue-200"><h3 className="bg-blue-50 px-4 py-3 font-semibold">{kind === "schedule" ? "Create assessment schedule" : "Assign work to faculty"}</h3>
                <form onSubmit={save} className="grid gap-3 p-4">
                    <label className="text-sm font-medium">{kind === "schedule" ? "Schedule name" : "Assessment task"}<input name="title" required maxLength={255} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={kind === "schedule" ? "Spring assessment collection" : "Prepare the final instrument report"} className={field} /></label>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-sm font-medium">Semester<select className={field} value={semesterId} onChange={(event) => { setSemesterId(event.target.value); setCourseId(""); setMessage("") }}>{source.semesters.map((row) => <option key={row.id} value={row.id}>{row.label}</option>)}</select></label>
                        <label className="text-sm font-medium">Due date<input name="due" type="date" min={source.semesters.find((row) => row.id === semesterId)?.starts_on} max={source.semesters.find((row) => row.id === semesterId)?.ends_on} required value={due} onChange={(event) => setDue(event.target.value)} className={field} /></label>
                    </div>
                    {kind === "schedule" && <label className="text-sm font-medium">Program<select className={field} value={programId} onChange={(event) => setProgramId(event.target.value)}>{source.programs.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>}
                    {kind === "assignment" && <>
                        <label className="text-sm font-medium">Course<select required className={field} value={selectedCourse?.id ?? ""} onChange={(event) => setCourseId(event.target.value)}>{courses.map((row) => <option key={row.id} value={row.id}>{row.course_code} · {row.name}</option>)}</select></label>
                        <label className="text-sm font-medium">Saved Canvas assignment<select className={field} value={selectedAssignment?.assignment_version_id ?? ""} onChange={(event) => setAssignmentVersionId(event.target.value)}>{assignmentOptions.map((row) => <option key={row.assignment_version_id} value={row.assignment_version_id}>{source.assignment_versions.find((version) => version.id === row.assignment_version_id)?.payload.name}</option>)}</select></label>
                        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium">Faculty member<select className={field} value={facultyId} onChange={(event) => setFacultyId(event.target.value)}>{source.users.filter((row) => row.roles.includes("faculty")).map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
                        <label className="text-sm font-medium">Performance indicator<select className={field} value={selectedIndicator?.id ?? ""} onChange={(event) => setIndicatorId(event.target.value)}>{source.indicators.map((row) => <option key={row.id} value={row.id}>PI {row.code}</option>)}</select></label></div>
                    </>}
                    <button type="submit" disabled={saving} className="disabled:opacity-60 justify-self-start rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white">{kind === "schedule" ? "Save demo schedule" : "Save demo assignment"}</button>
                    <p role="status" className="text-sm">{message}</p>
                </form>
            </section>
            <section className="overflow-hidden rounded-lg border border-teal-200"><h3 className="bg-teal-50 px-4 py-3 font-semibold">{kind === "schedule" ? "Assessment schedules" : "Work saved in Django"}</h3>
                <div role="region" aria-label="Saved planning records" tabIndex={0} className="max-h-[46dvh] space-y-3 overflow-y-auto p-4">
                    {kind === "assignment" && saved.map((plan) => <article key={plan.id} className="rounded-md border border-slate-200 p-3"><h4 className="font-semibold">{plan.task_title}</h4><p className="text-sm">{source.semesters.find((row) => row.id === plan.semester_id)?.label} · Due {plan.due_on}</p><p className="text-sm">{source.courses.find((row) => row.id === plan.course_id)?.course_code} · {source.users.find((row) => row.id === plan.faculty_id)?.name} · {plan.status}</p><p className="text-xs">Saved in local Django database</p></article>)}
                    {kind === "schedule" && source.schedules.map((row) => <article key={row.id} className="rounded-md border border-slate-200 p-3"><h4 className="font-semibold">{row.title}</h4><p className="text-sm">{source.semesters.find((term) => term.id === row.semester_id)?.label} · {row.program_id} · Due {row.due_on}</p><p className="text-xs text-slate-600">Shared demo schedule</p></article>)}
                    {!saved.length && kind === "assignment" && <p className="text-sm text-slate-600">No new demo tasks assigned yet. Existing shared assessments remain on Assessment progress.</p>}
                </div>
            </section>
        </div>
    </div>
}
