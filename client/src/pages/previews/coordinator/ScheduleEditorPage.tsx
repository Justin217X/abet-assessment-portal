/**
 * File: ScheduleEditorPage.tsx
 * Purpose: Creates demo schedules and lists records loaded from Django.
 * !!! Fixed Coordinator profile. Work assignment and real permissions are pending. [SD]
 */
import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { loadPortalData } from "../../../api/portalData"
import type { PortalData } from "../../../api/portalData"
import { saveSchedule } from "../../../api/schedules"

export function ScheduleEditorPage() {
    const [data, setData] = useState<PortalData | null>(null)
    const [loadError, setLoadError] = useState("")
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [saving, setSaving] = useState(false)
    const [title, setTitle] = useState("")
    const [programId, setProgramId] = useState("")
    const [semesterId, setSemesterId] = useState("")
    const [due, setDue] = useState("")
    const [search, setSearch] = useState("")
    useEffect(() => {
        const controller = new AbortController()
        loadPortalData(controller.signal).then(setData).catch((reason: unknown) => {
            if (!controller.signal.aborted) setLoadError(reason instanceof Error ? reason.message : "Could not load schedule options.")
        })
        return () => controller.abort()
    }, [])
    if (loadError) return <p role="alert">{loadError}</p>
    if (!data) return <p role="status">Loading schedule options...</p>
    const source = data
    const semester = source.semesters.find((row) => row.id === semesterId) ?? source.semesters[0]
    const program = source.programs.find((row) => row.id === programId) ?? source.programs[0]
    const visible = source.schedules.filter((row) => [row.title, row.due_on,
        source.semesters.find((term) => term.id === row.semester_id)?.label,
        source.programs.find((item) => item.id === row.program_id)?.name].join(" ").toLowerCase().includes(search.trim().toLowerCase()))
        .sort((a, b) => a.due_on.localeCompare(b.due_on))

    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(""); setMessage("")
        if (!program || !semester || !title.trim() || !due || due < semester.starts_on || due > semester.ends_on) {
            setError("Enter a schedule title, program, semester, and a due date inside that semester.")
            return
        }
        setSaving(true)
        try {
            const saved = await saveSchedule({ title: title.trim(), program_id: program.id, semester_id: semester.id, due_on: due })
            setData({ ...source, schedules: [...source.schedules, saved] })
            setTitle(""); setDue(""); setSearch("")
            setMessage("Schedule saved in the local demo database. No notifications were sent.")
        } catch (reason) {
            setError(reason instanceof Error && reason.name !== "TypeError" ? reason.message : "Could not save the schedule. Check the connection and try again.")
        } finally { setSaving(false) }
    }
    const field = "mt-1 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2"
    return <div className="space-y-3">
        <p className="rounded-md bg-blue-50 p-3 text-sm">AI-generated demo planning records. New schedules save to the local Django database. Real permissions and notifications are pending.</p>
        <div className="grid min-w-0 items-start gap-4 lg:grid-cols-2">
            <section className="min-w-0 rounded-lg border border-blue-200 bg-white">
                <h3 className="rounded-t-lg bg-blue-50 p-3 font-semibold">Create assessment schedule</h3>
                <form onSubmit={(event) => { void save(event) }} className="space-y-3 p-4">
                    <fieldset disabled={saving || !program || !semester} className="space-y-3">
                        <legend className="sr-only">New assessment schedule</legend>
                        <label className="block text-sm font-medium">Schedule title<input required maxLength={255} value={title} onChange={(event) => setTitle(event.target.value)} className={field} /></label>
                        <label className="block text-sm font-medium">Program<select required value={program?.id ?? ""} onChange={(event) => setProgramId(event.target.value)} className={field}>{source.programs.map((row) => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
                        <label className="block text-sm font-medium">Semester<select required value={semester?.id ?? ""} onChange={(event) => { setSemesterId(event.target.value); setDue("") }} className={field}>{source.semesters.map((row) => <option key={row.id} value={row.id}>{row.label}</option>)}</select></label>
                        <label className="block text-sm font-medium">Due date<input required type="date" min={semester?.starts_on} max={semester?.ends_on} value={due} onChange={(event) => setDue(event.target.value)} className={field} /></label>
                        <p className="text-xs text-slate-600">{semester ? "Choose a date from " + semester.starts_on + " through " + semester.ends_on + "." : "No semester options are available."}</p>
                        <button type="submit" className="rounded-md bg-blue-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving..." : "Save schedule"}</button>
                    </fieldset>
                    {(!program || !semester) && <p role="status" className="text-sm">Program and semester options are needed before creating a schedule.</p>}
                    {message && <p role="status" className="text-sm">{message}</p>}
                    {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
                </form>
            </section>
            <section className="min-w-0 rounded-lg border border-teal-200 bg-white">
                <h3 className="rounded-t-lg bg-teal-50 p-3 font-semibold">Assessment schedules</h3>
                <label className="m-3 grid gap-1 text-sm font-medium">Search schedules<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Title, program, semester or date" className={field} /></label>
                <p className="px-3 text-xs">{visible.length} of {source.schedules.length} schedules</p>
                <div role="region" aria-label="Saved schedules" tabIndex={0} className="max-h-[48dvh] space-y-3 overflow-y-auto p-3">
                    {visible.map((row) => <article key={row.id} className="space-y-1 rounded-md border border-slate-200 p-3">
                        <h4 className="text-sm font-semibold">{row.title}</h4>
                        <p className="text-sm">{source.programs.find((item) => item.id === row.program_id)?.name ?? row.program_id}</p>
                        <p className="text-sm">{source.semesters.find((term) => term.id === row.semester_id)?.label} · Due <time dateTime={row.due_on}>{row.due_on}</time></p>
                    </article>)}
                    {!visible.length && <p role="status" className="text-sm">{source.schedules.length ? "No schedules match your search." : "No schedules are available yet."}</p>}
                </div>
            </section>
        </div>
    </div>
}
