/**
 * EvaluatorReportDetailsPage.tsx
 * Shows a submitted assessment report and its available materials. [SD]
 */

import { Button } from "../../../Button"

const reportFields = ["Report", "Program", "Course", "Semester", "Submitted version"]

const reportMaterials = [
    "Rubric Report",
    "PI Report",
    "Assignment instructions",
    "Selected student work",
    "Instructor feedback",
]

export function EvaluatorReportDetailsPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-semibold">Selected report</h2>
                
                {/* TODO: Load the selected submitted version and its assessment context. [SD] */}
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    {reportFields.map((label) => (
                        <div key={label}>
                            <dt className="text-sm font-semibold">{label}</dt>
                            <dd className="text-sm text-slate-600">Not loaded</dd>
                        </div>
                    ))}
                </dl>
                
                <h3 className="mt-6 text-sm font-semibold">Faculty explanation</h3>
                <p className="mt-1 text-sm text-slate-600">No explanation loaded.</p>
            </section>
            
            <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-semibold">Report materials</h2>
                <p className="mt-1 text-sm text-slate-600">\
                    Materials belong to the selected submitted version.
                </p>
                
                {/* TODO: Show only available materials approved for release to this evaluator. [SD] */}
                <dl className="mt-4 divide-y divide-slate-200">
                    {reportMaterials.map((material) => (
                        <div key={material} className="flex flex-wrap justify-between gap-2 py-3">
                            <dt className="text-sm font-medium">{material}</dt>
                            <dd className="text-sm text-slate-600">Not loaded</dd>
                        </div>
                    ))}
                </dl>
                
                {/* TODO: Enable this action when authorized supporting evidence is available. [SD] */}
                <Button variant="secondary" disabled className="mt-4 opacity-60">
                    View evidence
                </Button>
            </section>
        </div>
    )
}