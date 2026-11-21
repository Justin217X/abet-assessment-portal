/**
 * File: FacultyReportReviewPage.tsx
 * Purpose: Reviews a mock assessment and edits its explanation and evidence draft.
 * !!! Drafts save only in this browser tab. Server saving and report actions are pending. [SD]
 */
import { useState } from "react"
import type { PortalData } from "../../../api/portalData"
import { MockEvidencePicker } from "../../../components/MockEvidencePicker"
import { readGroupConfirmation } from "../../../helpers/rosterConfirmation"
import { recordDemoActivity } from "../../../api/demoActivity"
import { PendingAction } from "../../../components/PendingAction"

type Props = {
    data: PortalData
    assessmentId: string
    onChooseAssessment: () => void
    onReviewRoster: (courseId: string) => void
}

type Draft = { explanation: string; evidence: string[] }

function readDraft(key: string, fallback: Draft): Draft {
    try {
        const saved: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null")
        if (saved && typeof saved === "object" && "explanation" in saved && typeof saved.explanation === "string") {
            const evidence = "evidence" in saved && Array.isArray(saved.evidence) && saved.evidence.every((id) => typeof id === "string")
                ? saved.evidence : fallback.evidence
            return { explanation: saved.explanation, evidence }
        }
    } catch { /* Use shared values when storage is unavailable or invalid. */ }
    return fallback
}

export function FacultyReportReviewPage(props: Props) {
    const versionId = props.data.assessments.find((row) => row.id === props.assessmentId)?.assignment_version_id ?? ""
    return <ReportReview key={[props.data.metadata.dataset_id, props.assessmentId, versionId].join(":")} {...props} />
}

function ReportReview({ data, assessmentId, onChooseAssessment, onReviewRoster }: Props) {
    // Display scoping only. Django must enforce real Faculty access later.
    const assessment = data.assessments.find((row) => row.id === assessmentId && row.faculty_id === "faculty-1")
    const course = data.courses.find((row) => row.id === assessment?.course_id)
    const version = data.assignment_versions.find((row) => row.id === assessment?.assignment_version_id)
    const group = data.student_groups.find((row) => row.id === assessment?.student_group_id)
    // Keep drafts separate for each dataset, assessment, and saved source version.
    const storageKey = ["abet-report-draft", data.metadata.dataset_id, assessmentId, assessment?.assignment_version_id ?? ""].join(":")
    const [savedDraft, setSavedDraft] = useState(() => readDraft(storageKey, {
        explanation: assessment?.faculty_explanation ?? "", evidence: assessment?.evidence_ids ?? [],
    }))
    const [explanation, setExplanation] = useState(savedDraft.explanation)
    const [evidenceIds, setEvidenceIds] = useState(savedDraft.evidence)
    const [editing, setEditing] = useState(false)
    const [saveMessage, setSaveMessage] = useState("")
    const [saveError, setSaveError] = useState("")

    function saveDraft() {
        try {
            sessionStorage.setItem(storageKey, JSON.stringify({ explanation, evidence: evidenceIds }))
            setSavedDraft({ explanation, evidence: evidenceIds })
            setEditing(false)
            setSaveError("")
            setSaveMessage("Draft saved in this browser tab. Server saving is pending.")
            recordDemoActivity({ actor: "Professor Martin", title: "Demo report draft saved", description: course?.course_code ?? assessmentId, roles: ["faculty"], kind: "draft", entity_id: assessmentId })
        } catch {
            setSaveError("Could not save the draft in this browser tab. Your text is still available below; try again.")
        }
    }
    if (!assessment || !course || !version || !group) return <div className="space-y-3">
        <p role="status">Choose an assigned assessment to review its report.</p>
        <button type="button" onClick={onChooseAssessment} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Choose assessment</button>
    </div>

    const groupConfirmed = readGroupConfirmation(data.metadata.dataset_id, group.id, group.confirmed)
    const criterion = version.payload.rubric?.find((row) => row.id === assessment.criterion_id)
    const stats = data.statistics[assessment.id]
    const selectedEvidence = data.evidence.filter((row) => row.assessment_id === assessment.id && (editing ? evidenceIds : savedDraft.evidence).includes(row.id))
    const evidenceReady = selectedEvidence.length === 3 &&
        ["high", "middle", "low"].every((band) => selectedEvidence.filter((row) => row.band === band && row.eligible).length === 1)
    const checks = [
        { label: "Grading rubric available", ready: Boolean(criterion && version.payload.use_rubric_for_grading) },
        { label: "Student group confirmed", ready: groupConfirmed },
        { label: "Assessed results available", ready: Boolean(stats?.total_students) },
        { label: "Three evidence examples selected", ready: evidenceReady },
    ]
    const card = "min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white"
    const heading = "border-b border-slate-200 bg-slate-50 px-4 py-2 font-semibold"
    return <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div><h3 className="font-semibold">{assessment.task_title ?? version.payload.name}</h3>
                <p className="text-sm">{course.course_code} · {data.semesters.find((row) => row.id === assessment.semester_id)?.label} · Saved revision {version.revision_number}</p>
                <p className="text-sm">Status: {assessment.status.replaceAll("_", " ")}</p>
            </div>
            <button type="button" onClick={onChooseAssessment} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">Choose another assessment</button>
        </div>
        <p className="rounded-md bg-blue-50 p-3 text-sm">Generative AI mock data. Drafts save only in this browser tab, not Django. Scores and rubric corrections belong in Canvas.</p>
        <div className="grid min-w-0 gap-3 md:grid-cols-2">
            <section className={card} aria-label="PI Results"><h3 className={heading}>PI Results</h3>
                <div className="max-h-[30dvh] space-y-3 overflow-y-auto p-4">
                    {stats ? <>
                        <p className="text-sm">{stats.total_students} assessed students · Average {stats.mean_score ?? "Not available"} · Median {stats.median_score ?? "Not available"}</p>
                        {stats.distribution.map((row) => <div key={row.label} className="grid grid-cols-[7rem_minmax(0,1fr)_5rem] items-center gap-2 text-sm">
                            <span>{row.label}</span>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="img" aria-label={row.label + ": " + row.student_count}>
                                <div className="h-full bg-teal-600" style={{ width: Math.max(0, Math.min(100, row.percentage)) + "%" }} />
                            </div><span>{row.student_count} ({Math.round(row.percentage)}%)</span>
                        </div>)}
                        <p className="text-xs text-slate-600">Zero scores count. Missing, excused, inactive, and unmatched records are excluded from these results.</p>
                    </> : <p role="status">No PI results are available for the selected rubric criterion.</p>}
                </div>
            </section>
            <section className={card} aria-label="Rubric and Student Group"><h3 className={heading}>Rubric &amp; Student Group</h3>
                <div className="max-h-[30dvh] space-y-2 overflow-y-auto p-4">
                    {criterion ? <><h4 className="font-semibold">{criterion.description}</h4>
                        <p className="text-sm">{criterion.long_description}</p>
                        <p className="text-sm">Maximum: {criterion.points} points</p>
                        <ul className="flex flex-wrap gap-2">{criterion.ratings.map((row) => <li key={row.id} className="rounded border border-slate-200 px-2 py-1 text-xs">{row.description}: {row.points}</li>)}</ul>
                    </> : <p role="status">No rubric criterion is available.</p>}
                    <p className="text-sm">{data.programs.find((row) => row.id === group.program_id)?.name ?? group.program_id} · {group.student_ids.length} students</p>
                    <p className="text-sm">{groupConfirmed ? "Group confirmed" : "Group confirmation needed"}</p>
                    <button type="button" onClick={() => onReviewRoster(course.id)} className="rounded border border-slate-300 px-2 py-1 text-sm">Review roster</button>
                    <h4 className="border-t border-slate-200 pt-2 text-sm font-semibold">Assignment instructions</h4>
                    <p className="text-sm">{version.payload.description?.replace(/<[^>]*>/g, "") || "No instructions supplied."}</p>
                </div>
            </section>
            <section className={card} aria-label="Faculty Explanation"><h3 className={heading}>Faculty Explanation</h3>
                <div className="max-h-[30dvh] overflow-y-auto p-4">
                    {editing ? <label className="grid gap-2 text-sm font-medium">Faculty explanation
                        <textarea rows={5} maxLength={10000} value={explanation}
                            onChange={(event) => { setExplanation(event.target.value); setSaveError(""); setSaveMessage("") }}
                            className="w-full rounded-md border border-slate-300 bg-white p-3" />
                    </label> : <p className="whitespace-pre-wrap text-sm">{savedDraft.explanation || "No faculty explanation added."}</p>}
                </div>
            </section>
            <section className={card} aria-label="Student Evidence"><h3 className={heading}>Student Evidence</h3>
                <MockEvidencePicker data={data} assessmentId={assessment.id}
                    selectedIds={editing ? evidenceIds : savedDraft.evidence} editing={editing}
                    onChange={(ids) => { setEvidenceIds(ids); setSaveMessage(""); setSaveError("") }} />
            </section>
        </div>
        <section aria-label="Report readiness and actions" className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <h3 className="text-sm font-semibold">{checks.filter((row) => row.ready).length} of {checks.length} input checks ready</h3>
            <ul className="flex flex-wrap gap-3 text-xs">{checks.map((row) => <li key={row.label}>{row.label}: {row.ready ? "Ready" : "Needed"}</li>)}</ul>
            <div className="flex flex-wrap gap-2">
                {editing ? <>
                    <button type="button" onClick={saveDraft} className="rounded-md bg-blue-800 px-3 py-2 text-sm text-white">Save Draft &amp; Return to Review</button>
                    <button type="button" onClick={() => { setExplanation(savedDraft.explanation); setEvidenceIds(savedDraft.evidence); setEditing(false); setSaveError(""); setSaveMessage("") }}
                        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">Cancel</button>
                </> : <button type="button" onClick={() => { setExplanation(savedDraft.explanation); setEvidenceIds(savedDraft.evidence); setEditing(true); setSaveMessage("") }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm">Edit report details</button>}
                {["Refresh from Canvas", "Preview combined PDF", "Generate Final Instrument Report PDF", "Submit for peer review", "Archive finalized report"].map((label) => <PendingAction key={label} label={label} />)}
            </div>
            {saveMessage && <p role="status" className="text-sm">{saveMessage}</p>}
            {saveError && <p role="alert" className="text-sm text-red-800">{saveError}</p>}
            <p className="text-xs text-slate-600">Input readiness does not mean the pending report actions are implemented. Browser drafts are not server submissions.</p>
        </section>
    </div>
}
