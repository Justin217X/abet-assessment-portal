/**
 * CoordinatorReportDetailsPage.tsx
 * Shows a submitted report version and its supporting materials in a read-only view. [SD]
 */

import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"

const reportFields = [
    "Assessment report",
    "Program",
    "Semester",
    "Course",
    "Submitted version",
    "Peer review status",
]

export function CoordinatorReportDetailsPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-semibold">Submitted report details</h2>
                
                {/* TODO: Load the selected submitted version and its review status. [SD] */}
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    {reportFields.map((label) => (
                        <div key={label}>
                            <dt className="text-sm font-semibold">{label}</dt>
                            <dd className="text-sm text-slate-600">Not loaded</dd>
                        </div>
                    ))}
                </dl>
            </section>
            
            {/* TODO: Show the reports and evidence associated with this submitted version. [SD] */}
            <EmptyPanel
                title="Reports and supporting evidence"
                columns={["Material", "Availability", "Action"]}
                message="No report materials loaded."
            />
            
            {/* TODO: Enable download when an authorized packet is available. [SD] */}
            <Button disabled className="opacity-60">Download report packet</Button>
        </div>
    )
}