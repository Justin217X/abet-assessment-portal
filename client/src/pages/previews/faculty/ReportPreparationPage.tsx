/**
 * ReportPreparationPage.tsx
 * Shows the assessment setup and opens the three report previews. [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { FinalInstrumentPreviewPage } from "./FinalInstrumentPreviewPage"
import { PIReportPreviewPage } from "./PIReportPreviewPage"
import { RubricPreviewPage } from "./RubricPreviewPage"

const reportPreviews = [
    { title: "Rubric Report", Component: RubricPreviewPage },
    { title: "PI Report", Component: PIReportPreviewPage },
    { title: "Final Instrument Report", Component: FinalInstrumentPreviewPage },
] as const

type ReportPreview = (typeof reportPreviews)[number]

export function ReportPreparationPage() {
    const [preview, setPreview] = useState<ReportPreview | null>(null)
    
    if (preview) {
        const { title, Component } = preview
        
        return (
            <div className="space-y-4">
                <Button variant="secondary" onClick={() => setPreview(null)}>
                    Back to report preparation
                </Button>
                
                <h2 className="text-lg font-semibold">{title} preview</h2>
                <Component />
            </div>
        )
    }
    
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Report preparation</h2>
            
            {/* TODO: Load available courses and assignments. [SD] */}
            <fieldset disabled className="mt-4 grid gap-4 sm:grid-cols-2">
                <legend className="sr-only">Assessment source</legend>
                
                <label className="block text-sm font-medium">
                    Course
                    
                    <select className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2">
                        <option>Courses not loaded</option>
                    </select>
                </label>
                
                <label className="block text-sm font-medium">
                    Assignment
                    <select className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2">
                        <option>Assignments not loaded</option>
                    </select>
                </label>
            </fieldset>
            
            {/* TODO: Pass the selected assessment context to each preview once it is available. [SD] */}
            <div className="mt-6 flex flex-wrap gap-2">
                {reportPreviews.map((report) => (
                    <Button key={report.title} onClick={() => setPreview(report)}>
                        Preview {report.title}
                    </Button>
                ))}
            </div>
        </section>
    )
}