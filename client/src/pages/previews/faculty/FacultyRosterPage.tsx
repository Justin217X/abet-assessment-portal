/**
 * File: FacultyRosterPage.tsx
 * Purpose: Lets faculty choose an assigned mock class and review its roster.
 * !!! The fixed demo profile and filters are not production access checks. [SD]
 * !!! Upload, source refresh, confirmation, and server saving are pending. [SD]
 */
import { useEffect, useState } from "react"
import { loadPortalData } from "../../../api/portalData"
import type { PortalData } from "../../../api/portalData"
import { CourseFilters } from "../../../components/CourseFilters"
import { groupKey, readGroupConfirmation } from "../../../helpers/rosterConfirmation"
import { recordDemoActivity } from "../../../api/demoActivity"
import { PendingAction } from "../../../components/PendingAction"

export function FacultyRosterPage({ initialCourseId = "" }: { initialCourseId?: string } = {}) {
    const [data, setData] = useState<PortalData | null>(null)
    const [error, setError] = useState("")
    const [campus, setCampus] = useState("")
    const [subject, setSubject] = useState("")
    const [courseId, setCourseId] = useState(initialCourseId)
    const [search, setSearch] = useState("")
    const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})
    const [confirmationError, setConfirmationError] = useState("")

    useEffect(() => {
        const controller = new AbortController()
        loadPortalData(controller.signal).then(setData).catch((reason: unknown) => {
            if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Could not load the roster.");
        })
        return () => controller.abort()
    }, [])

    if (error) return <p role="alert" className="rounded-lg bg-red-50 p-3">{error}</p>
    if (!data) return <p role="status">Loading assigned classes...</p>

    const assigned = data.courses.filter((course) => course.faculty_id === "faculty-1" ||
        data.assessments.some((task) => task.course_id === course.id && task.faculty_id === "faculty-1"))
    const campuses = (data.campuses ?? []).filter((item) => assigned.some((course) => course.campus_id === item.id))
    if (assigned.some((course) => !course.campus_id)) campuses.push({ id: "not-specified", name: "Not specified" })
    const visible = assigned.filter((course) =>
        (!campus || (course.campus_id ?? "not-specified") === campus) &&
        (!subject || course.course_code.split(" ")[0] === subject))
    const selected = visible.find((course) => course.id === courseId)
    const campusName = (id?: string) => data.campuses?.find((item) => item.id === id)?.name ?? "Campus not specified"
    const term = (id: string) => data.semesters.find((item) => item.id === id)?.label ?? id
    const roster = data.enrollments.filter((row) => row.course_id === selected?.id)
    const section = (id: string) => data.sections.find((item) => item.id === id)?.section_code ?? "Not specified"
    const students = new Map(data.students.map((student) => [student.id, student]))
    const visibleRoster = roster.filter((row) => [
        students.get(row.student_id)?.display_label, students.get(row.student_id)?.program_id,
        section(row.section_id), row.status, row.match_status,
    ].join(" ").toLowerCase().includes(search.trim().toLowerCase()))
    const clearSelection = () => { setCourseId(""); setSearch("") }

    return <div className="min-w-0 space-y-3">
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm">Generative AI mock data. Course-campus assignments are fictional; no live LionPath connection is used.</p>
        <CourseFilters campuses={campuses} campus={campus} subject={subject}
            onCampusChange={(value) => { setCampus(value); clearSelection() }}
            onSubjectChange={(value) => { setSubject(value); clearSelection() }}
            onClear={() => { setCampus(""); setSubject(""); clearSelection() }} />
        <div role="region" aria-label="Assigned classes" tabIndex={0} className="flex min-w-0 gap-3 overflow-x-auto pb-2">
            {visible.map((course) => <article key={course.id} className="w-60 shrink-0 rounded-lg border border-slate-200 bg-white p-3">
                <h3 className="font-semibold">{course.course_code} · {course.name}</h3>
                <p className="text-xs text-slate-600">{campusName(course.campus_id)} · {term(course.semester_id)}</p>
                <button type="button" aria-pressed={selected?.id === course.id}
                    onClick={() => { setCourseId(course.id); setSearch("") }}
                    className="mt-2 rounded-md border border-slate-300 px-3 py-1 text-sm">View roster</button>
            </article>)}
        </div>
        {!visible.length && <p role="status">No assigned classes match these filters.</p>}
        {selected ? <section aria-label="Selected class roster" className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
            <header>
                <h3 className="font-semibold">{selected.course_code} · {selected.name}</h3>
                <p className="text-sm">{campusName(selected.campus_id)} · {term(selected.semester_id)}</p>
                <p className="text-xs text-slate-600">All sections linked to this mock course. Enrollment and matching status are shown separately.</p>
            </header>
            <label className="grid max-w-lg gap-1 text-sm font-medium">Search roster
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                    placeholder="Student, program, section or status" className="rounded-md border border-slate-300 px-3 py-2" />
            </label>
            <div role="region" aria-label="Roster records" tabIndex={0} className="max-h-[35dvh] overflow-auto [scrollbar-gutter:stable]">
                <table className="w-full min-w-[34rem] text-left text-sm">
                    <thead className="sticky top-0 bg-slate-100"><tr>
                        {["Student", "Program", "Section", "Enrollment", "Matching"].map((label) => <th key={label} scope="col" className="p-2">{label}</th>)}
                    </tr></thead>
                    <tbody>{visibleRoster.map((row) => <tr key={row.id} className="border-t border-slate-200">
                        <td className="p-2">{students.get(row.student_id)?.display_label ?? row.student_id}</td>
                        <td className="p-2">{students.get(row.student_id)?.program_id ?? "Not specified"}</td>
                        <td className="p-2">{section(row.section_id)}</td>
                        <td className="p-2">{row.status}</td><td className="p-2">{row.match_status}</td>
                    </tr>)}</tbody>
                </table>
            </div>
            <p role="status" className="text-sm">{visibleRoster.length} of {roster.length} roster records shown.</p>
            {!roster.length && <p role="status">No roster records are available for this class.</p>}
            {roster.length > 0 && !visibleRoster.length && <p role="status">No students match your search.</p>}
            {data.student_groups.filter((group) => group.course_id === selected.id).map((group) => <label key={group.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={confirmed[group.id] ?? readGroupConfirmation(data.metadata.dataset_id, group.id, group.confirmed)} onChange={(event) => {
                    const value = event.target.checked
                    try {
                        sessionStorage.setItem(groupKey(data.metadata.dataset_id, group.id), String(value))
                        setConfirmed({ ...confirmed, [group.id]: value }); setConfirmationError("")
                        recordDemoActivity({ actor: "Professor Martin", title: "Demo group confirmation saved", description: selected.course_code + " · Browser-tab draft only", roles: ["faculty"], kind: "group", entity_id: group.id })
                    } catch { setConfirmationError("Could not save confirmation in this browser tab.") }
                }} />
                I have verified the {group.program_id} student group (browser-tab demo only).
            </label>)}
            {confirmationError && <p role="alert" className="text-sm text-red-800">{confirmationError}</p>}
            <div className="flex flex-wrap gap-2">
                <PendingAction label="Refresh roster from approved source" />
                <PendingAction label="Upload CSV/Excel roster" />
                <PendingAction label="Save roster confirmation to server" />
            </div>
        </section> : visible.length > 0 && <p role="status">Choose View roster for a class to review its students.</p>}
    </div>
}
