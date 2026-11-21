/**
 * File: StatusProgress.tsx
 * Purpose: Shows progress with written counts and colored bars.
 *
 * !!! TODO: connect to real records. [SD]
 */

type Segment = { label: string; count: number; tone: "complete" | "review" | "draft" | "waiting" | "revision" }
type Props = { label: string; segments: Segment[]; complete: number; completeLabel: string }
const colors = { complete: "bg-teal-600", review: "bg-blue-600", draft: "bg-amber-500", waiting: "bg-slate-300", revision: "bg-violet-500" }
export function StatusProgress({ label, segments, complete, completeLabel }: Props) {
    const total = segments.reduce((sum, row) => sum + row.count, 0)
    const done = Math.min(total, Math.max(0, complete))
    const percentage = total ? Math.round(done / total * 100) : 0
    return <section aria-label={label} className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-sm font-semibold">{label}</h3><strong className="text-lg tabular-nums">{total ? `${percentage}%` : "—"}</strong></div>
        <p className="text-sm"><strong>{done} of {total}</strong> {completeLabel}</p>
        <div role="img" aria-label={`${label}: ${segments.map((row) => `${row.label} ${row.count}`).join(", ")}`} className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
            {segments.filter((row) => row.count > 0).map((row) => <span key={row.label} className={colors[row.tone]} style={{ width: `${row.count / total * 100}%` }} />)}
        </div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">{segments.map((row) => <li key={row.label} className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5"><span className={`h-2 w-2 shrink-0 rounded-full ${colors[row.tone]}`} aria-hidden="true" />{row.label}</span><strong className="tabular-nums">{row.count}</strong></li>)}</ul>
        {!total && <p className="text-xs text-slate-600">No records available for this selection.</p>}
    </section>
}

export function AssessmentProgress({ statuses, label = "Assessment progress" }: { statuses: string[]; label?: string }) {
    const count = (values: string[]) => statuses.filter((status) => values.includes(status)).length
    return <StatusProgress label={label} complete={count(["submitted", "archived"])} completeLabel="submitted or archived" segments={[
        { label: "Submitted / archived", count: count(["submitted", "archived"]), tone: "complete" },
        { label: "Ready for review", count: count(["ready_for_review"]), tone: "review" },
        { label: "Draft", count: count(["draft"]), tone: "draft" },
        { label: "Revision needed", count: count(["revision_draft"]), tone: "revision" },
        { label: "Not started", count: count(["to_start"]), tone: "waiting" },
        { label: "Other", count: statuses.filter((status) => !["submitted", "archived", "ready_for_review", "draft", "revision_draft", "to_start"].includes(status)).length, tone: "waiting" },
    ]} />
}
