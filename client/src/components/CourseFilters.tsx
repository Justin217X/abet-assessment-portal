/**
 * File: CourseFilters.tsx
 * Purpose: Shares Campus and Subject filters for course-linked records.
 * !!! Display filters do not replace server access checks. [SD]
 */
type Props = {
    campuses: { id: string; name: string }[]
    campus: string
    subject: string
    onCampusChange: (value: string) => void
    onSubjectChange: (value: string) => void
    onClear: () => void
}
export function CourseFilters({ campuses, campus, subject, onCampusChange, onSubjectChange, onClear }: Props) {
    return <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <label className="grid gap-1 text-sm font-medium">Campus
            <select value={campus} onChange={(event) => onCampusChange(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2">
                <option value="">All available campuses</option>
                {campuses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">Subject
            <select value={subject} onChange={(event) => onSubjectChange(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2">
                <option value="">CMPSC and SWENG</option><option value="CMPSC">CMPSC</option><option value="SWENG">SWENG</option>
            </select>
        </label>
        <button type="button" onClick={onClear} className="rounded-md border border-slate-300 px-3 py-2 text-sm">Clear filters</button>
    </div>
}
