/**
 * PIReportPreviewPage.tsx
 * Lets faculty review performance indicator results before generating the PI Report PDF. [SD]
 */

import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"

const contextLabels = [
    "Program",
    "Semester",
    "Course",
    "Assignment",
    "Course sections",
    "Performance indicator (PI)",
    "Student group",
]

const scoreSummaryLabels = [
    "Students assessed",
    "Students with missing scores",
    "Highest supported performance level",
    "MAX Level Score",
    "Minimum PI score",
    "Median PI score",
    "Maximum PI score",
    "Mean PI score",
]

export function PIReportPreviewPage() {
    return (
        <div className="space-y-6">
            {/* TODO: Show the assessment context selected in Report Preparation. [SD] */}
            <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-lg font-semibold">Assessment context</h3>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                    {contextLabels.map((label) => (
                        <div key={label}>
                            <dt className="text-sm font-semibold">{label}</dt>
                            <dd className="text-sm text-slate-600">Not loaded</dd>
                            </div>
                    ))}   
                </dl>
            </section>

            {/* TODO: Show the distribution for the confirmed student group. [SD] */}
            <EmptyPanel
                title="Performance distribution"
                columns={["Performance level", "Student count", "Percentage", "Average score"]}
                message="No PI results loaded."
            />

            {/* TODO: Display the calculated score summary and saved faculty comments. [SD] */}
            <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-lg font-semibold">Score summary</h3>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                    {scoreSummaryLabels.map((label) => (
                        <div key={label}>
                            <dt className="text-sm font-semibold">{label}</dt>
                            <dd className="text-sm text-slate-600">Unavailable</dd>
                        </div>
                    ))}
                </dl>

                <h4 className="mt-6 text-sm font-semibold">Faculty comments</h4>
                <p className="mt-1 text-sm text-slate-600">No faculty comments loaded.</p>
            </section>
            
            {/* TODO: Enable PDF generation after faculty confirm a valid, current preview. [SD] */}
            <div>
                <Button disabled className="cursor-not-allowed opacity-60">
                    Generate PI Report PDF
                </Button>
                <p className="mt-2 text-sm text-slate-600">
                    Load and confirm the PI Report preview before generating the PDF.
                    </p>
            </div>
        </div>
    )
}