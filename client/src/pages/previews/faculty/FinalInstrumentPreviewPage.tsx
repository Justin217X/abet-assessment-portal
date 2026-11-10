/**
 * FinalInstrumentPreviewPage.tsx
 * Shows the materials that will go into the Final Instrument Report. [SD]
 */

import { Button } from "../../../Button"

const reportMaterials = [
    "Rubric Report",
    "PI Report",
    "Assignment instructions",
    "High-scoring student work",
    "Middle-scoring student work",
    "Low-scoring student work",
    "Instructor feedback (when needed separately)",
]

export function FinalInstrumentPreviewPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-lg font-semibold">Report contents</h3>
                
                {/* TODO: Show which materials are ready, missing, or outdated. [SD] */}
                <dl className="mt-4 divide-y divide-slate-200">
                    {reportMaterials.map((material) => (
                        <div key={material} className="flex flex-wrap justify-between gap-2 py-3">
                            <dt className="text-sm font-medium">{material}</dt>
                            <dd className="text-sm text-slate-600">Not loaded</dd>
                            </div>
                        ))}
                </dl>
            </section>
            
            {/* TODO: Enable PDF generation after faculty confirm a complete, current preview. [SD] */}
            <div>
                <Button disabled className="cursor-not-allowed opacity-60">
                    Generate Final Instrument Report PDF
                </Button>
                
                <p className="mt-2 text-sm text-slate-600">
                    Load the required materials and confirm the preview before generating the PDF.
                </p>
            </div>
        </div>
    )
}