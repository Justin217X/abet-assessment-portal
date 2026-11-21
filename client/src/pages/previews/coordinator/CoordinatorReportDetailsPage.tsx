/**
 * File: CoordinatorReportDetailsPage.tsx
 * Purpose: Shows a submitted report version and its supporting materials in a read-only view.
 *
 * !!! This is an earlier preview page. Its records are not connected yet.
 * Current Coordinator pages also use RoleDataPage.tsx and CoordinatorPlanningPage.tsx.
 * Check CoordinatorDashboard.tsx before connecting or replacing this preview.
 * [SD]
 *
 * !!! TODO:
 * - Receive the selected report ID and version from CoordinatorArchivePage.
 * - Load report details, review status, and linked evidence from Django.
 * - Replace Not loaded values and EmptyPanel with the saved records.
 * - Connect Download report packet to the selected saved file.
 * - Keep earlier submitted versions unchanged when later revisions are created.
 * - Show loading, empty results, and clear success or error messages where needed.
 * - Django: Check Coordinator permission before returning or changing records.
 * [SD]
 */

import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"

// Names of the details shown for a submitted report.
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

                {/* !!! TODO: Load this report version and its review status from Django. [SD] */}
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    {reportFields.map((label) => (
                        <div key={label}>
                            <dt className="text-sm font-semibold">{label}</dt>
                            <dd className="text-sm text-slate-600">Not loaded</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* !!! TODO: Load the files linked to this report version. [SD] */}
            <EmptyPanel
                title="Reports and supporting evidence"
                columns={["Material", "Availability", "Action"]}
                message="No report materials loaded."
            />

            {/* !!! TODO: Enable download when the saved file and access checks are ready. [SD] */}
            <Button disabled className="opacity-60">Download report packet</Button>
        </div>
    )
}
