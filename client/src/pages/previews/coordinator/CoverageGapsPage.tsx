/**
 * File: CoverageGapsPage.tsx
 * Purpose: Shows scheduled outcomes and PIs that lack submitted assessment records.
 *
 * !!! This is an earlier preview page. Its records are not connected yet.
 * Current Coordinator pages also use RoleDataPage.tsx and CoordinatorPlanningPage.tsx.
 * Check CoordinatorDashboard.tsx before connecting or replacing this preview.
 * [SD]
 *
 * !!! TODO:
 * - Load the selected program, semester, schedule, and submitted records from Django.
 * - Compare scheduled outcome and PI assessments with submitted records.
 * - Show missing submissions separately from unfinished drafts.
 * - Replace EmptyPanel with the results. This is not a complete accreditation check.
 * - Show loading, empty results, and clear success or error messages where needed.
 * - Django: Check Coordinator permission before returning or changing records.
 * [SD]
 */

import { EmptyPanel } from "../../../components/FacultyPanels"

export function CoverageGapsPage() {
    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-600">
                Drafts are tracked separately from submitted assessment records.
            </p>

            {/* !!! TODO: Find scheduled assessments that have no submitted record. [SD] */}
            <EmptyPanel
                title="Scheduled assessments needing submitted records"
                columns={["Student outcome", "Performance indicator", "Course", "Current record"]}
                message="No coverage records loaded."
            />
        </div>
    )
}
