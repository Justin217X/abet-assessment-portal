/**
 * File: MockEvidencePicker.tsx
 * Purpose: Lets faculty choose eligible fictional high, middle, and low examples.
 * !!! Suggestions are proposed demo tools. Real files and uploads are pending. [SD]
 */
import { useEffect, useId, useRef, useState } from "react"
import type { PortalData } from "../api/portalData"
import { EvidencePdfPreviewButton } from "./EvidencePdfPreviewButton"
import { PendingAction } from "./PendingAction"

type Props = {
    data: PortalData
    assessmentId: string
    selectedIds: string[]
    editing: boolean
    onChange: (ids: string[]) => void
}
type Band = "high" | "middle" | "low"

export function MockEvidencePicker({ data, assessmentId, selectedIds, editing, onChange }: Props) {
    const [band, setBand] = useState<Band | null>(null)
    const [search, setSearch] = useState("")
    const dialog = useRef<HTMLDialogElement>(null)
    const titleId = useId()
    useEffect(() => {
        if (band && dialog.current && !dialog.current.open) dialog.current.showModal()
        if (!band && dialog.current?.open) dialog.current.close()
    }, [band])

    const evidence = data.evidence.filter((row) => row.assessment_id === assessmentId)
    const selected = evidence.filter((row) => selectedIds.includes(row.id))
    const student = (id: string) => data.students.find((row) => row.id === id)?.display_label ?? id
    const score = (row: typeof evidence[number]) => typeof row.criterion_score === "number" && typeof row.criterion_max === "number"
        ? "Rubric score: " + row.criterion_score + "/" + row.criterion_max : "Rubric score unavailable"
    const choices = evidence.filter((row) => row.band === band && row.eligible).sort((a, b) =>
        Number(b.suggested) - Number(a.suggested) ||
        (band === "high" ? (b.criterion_score ?? 0) - (a.criterion_score ?? 0) :
            band === "low" ? (a.criterion_score ?? 0) - (b.criterion_score ?? 0) : 0))
    const visible = choices.filter((row) =>
        [student(row.student_id), row.criterion_score].join(" ").toLowerCase().includes(search.trim().toLowerCase()))
    const close = () => { setBand(null); setSearch("") }

    return <>
        <div className="max-h-[32dvh] space-y-3 overflow-y-auto p-4">
            <p className="text-xs text-slate-600">AI-generated fictional examples. PDF previews show fictional work. Actual graded-file uploads remain pending.</p>
            {(["high", "middle", "low"] as const).map((category) => {
                const current = selected.find((row) => row.band === category)
                return <section key={category} aria-label={category + " evidence selection"} className="space-y-2 border-b border-slate-200 pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold capitalize">{category} example</h4>
                        {editing && <button type="button" aria-label={"Choose mock " + category + " example"}
                            onClick={() => { setBand(category); setSearch("") }}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs">Choose mock example</button>}
                    </div>
                    {current ? <>
                        <p className="text-sm">{student(current.student_id)} · {score(current)}</p>
                        <p className="break-all text-xs">{current.filename}</p>
                        <p className="text-xs">Feedback: {current.instructor_feedback || "No feedback supplied."}</p>
                        {!current.eligible && <p className="text-xs text-amber-900">This selection is no longer eligible. Choose a replacement.</p>}
                    </> : <p className="text-sm">No example selected.</p>}
                    <div className="flex flex-wrap gap-2">
                        {current && <EvidencePdfPreviewButton evidenceId={current.id} label={"Preview selected " + category + " example PDF"} />}
                        {editing && <PendingAction label="Upload graded sample" />}
                    </div>
                </section>
            })}
        </div>
        <dialog ref={dialog} aria-labelledby={titleId} onCancel={close}
            className="m-auto max-h-[85dvh] w-[min(48rem,92vw)] overflow-hidden rounded-xl border border-slate-300 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/40">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 p-3">
                <h3 id={titleId} className="font-semibold">Choose {band} example</h3>
                <button type="button" onClick={close} className="rounded border border-slate-300 px-3 py-1 text-sm">Close</button>
            </div>
            <div className="space-y-3 p-4">
                <p className="text-sm">Proposed mock picker for UI testing. Suggested ordering is not a sponsor-approved automatic selection rule.</p>
                <label className="grid gap-1 text-sm">Search students or rubric scores
                    <input type="search" autoFocus value={search} onChange={(event) => setSearch(event.target.value)}
                        className="rounded-md border border-slate-300 p-2" />
                </label>
                <div role="region" aria-label="Eligible evidence choices" tabIndex={0} className="max-h-[42dvh] overflow-y-auto">
                    <ul className="divide-y divide-slate-200">{visible.map((row) => <li key={row.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                        <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold">{student(row.student_id)} · {score(row)}</h4>
                            <p className="break-all text-xs">{row.suggested ? "Suggested · " : ""}{row.filename}</p>
                            <p className="mt-1 text-xs">Feedback: {row.instructor_feedback || "No feedback supplied."}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <EvidencePdfPreviewButton evidenceId={row.id} label={"Preview " + student(row.student_id) + " " + band + " example PDF"} />
                            <button type="button" aria-label={"Select " + student(row.student_id) + " as " + band + " example"}
                                onClick={() => { onChange([...selected.filter((item) => item.band !== row.band).map((item) => item.id), row.id]); close() }}
                                className="rounded-md border border-slate-300 px-3 py-1 text-sm">Select</button>
                        </div>
                    </li>)}</ul>
                    {!visible.length && <p role="status" className="p-3 text-sm">No eligible examples match your search.</p>}
                </div>
            </div>
        </dialog>
    </>
}
