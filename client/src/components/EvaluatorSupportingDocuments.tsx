/**
 * File: EvaluatorSupportingDocuments.tsx
 * Purpose: Shows searchable supporting-document categories for evaluator review.
 *
 * !!! Document uploads, storage, and released-file access are not connected yet. [SD]
 * !!! View, preview, and download buttons remain disabled until files are linked. [SD]
 *
 * !!! TODO: connect to saved documents, permissions, previews, and downloads.  [SD]
 */

import { useState } from "react"
import { PendingEvaluatorAction } from "./PendingEvaluatorAction"

// !!! These are planned document categories, not uploaded files or saved document records. [SD]
const categories = [
    { title: "Course syllabi & curriculum maps", detail: "Course content and curriculum coverage relevant to the program review." },
    { title: "Student outcomes & PI mappings", detail: "How courses and assessments connect to the program's outcomes and performance indicators." },
    { title: "Assessment plans", detail: "Assessment methods, schedules, and evaluation processes." },
    { title: "Meeting records & decisions", detail: "Supporting records of assessment discussions and improvement decisions." },
    { title: "Additional review materials", detail: "Other supporting documents explicitly released for the evaluator's review." },
]

export function EvaluatorSupportingDocuments() {

    // Track the text entered in the category search field.
    const [search, setSearch] = useState("")

    // Match category titles and descriptions without requiring the same capitalization.
    const visible = categories.filter((item) => `${item.title} ${item.detail}`.toLowerCase().includes(search.toLowerCase()))
    return <section className="space-y-3">
        <div><h2 className="font-semibold">Supporting documents</h2><p className="mt-1 text-sm">Planned access to documents and information saved through the Coordinator and Evaluator workflows and released for review.</p></div>
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-950">No supporting documents are connected yet. The categories below show planned options, not available files. Self-Study Report management is outside the current scope.</p>

        {/* Search filters the category cards only; document-content search is not implemented. */}
        <label className="grid max-w-lg gap-1 text-sm font-medium">Search document categories<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2" placeholder="Syllabus, outcome, plan, or meeting" /></label>

        {/* Keep long category lists scrollable inside this keyboard-focusable region. */}
        <div role="region" aria-label="Supporting document categories" tabIndex={0} className="max-h-[45dvh] overflow-y-auto pr-2 [scrollbar-gutter:stable]">
            <ul className="grid gap-3 md:grid-cols-2">{visible.map((item) => <li key={item.title} className="rounded-lg border border-slate-200 bg-white p-4"><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm">{item.detail}</p><p className="mt-3 text-xs text-slate-600">Not connected · Upload, storage, and release pending</p>

                {/* !!! TODO (documents): Open a released file list, then preview/download the selected document. [SD] */}
                <div className="mt-3 flex flex-wrap gap-2"><PendingEvaluatorAction label="View documents" /><PendingEvaluatorAction label="Preview document" /><PendingEvaluatorAction label="Download document" /></div></li>)}</ul>

            {/* Explain why no cards appear when the search has no matches. */}
            {!visible.length && <p role="status" className="p-3 text-sm">No categories match your search.</p>}
        </div>

    {/* !!! TODO (documents): Load authorized documents from Django with program/year/outcome metadata, version, preview and download URLs. Connect saved Coordinator and Evaluator outputs; enforce identity and release rules server-side. [SD] */}
    </section>
}
