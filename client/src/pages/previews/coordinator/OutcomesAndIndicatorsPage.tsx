/**
 * File: OutcomesAndIndicatorsPage.tsx
 * Purpose: Shows approved student outcomes, performance indicators, and their links.
 *
 * !!! This is an earlier preview page. Its records are not connected yet.
 * Current Coordinator pages also use RoleDataPage.tsx and CoordinatorPlanningPage.tsx.
 * Check CoordinatorDashboard.tsx before connecting or replacing this preview.
 * [SD]
 *
 * !!! TODO:
 * - Load the selected program's approved outcomes, PIs, and versions from Django.
 * - Replace both EmptyPanel tables with the loaded records.
 * - Show which outcome each PI belongs to.
 * - Connect only the viewing and editing actions allowed by the agreed portal rules.
 * - Show loading, empty results, and clear success or error messages where needed.
 * - Django: Check Coordinator permission before returning or changing records.
 * [SD]
 */

import { EmptyPanel } from "../../../components/FacultyPanels"

export function OutcomesAndIndicatorsPage() {
    return (
        <div className="space-y-6">

            {/* !!! TODO: Load approved outcomes and PIs, then add allowed row actions. [SD] */}
            <EmptyPanel
                title="Student outcomes"
                columns={["Outcome", "Description", "Version", "Action"]}
                message="No student outcomes loaded."
            />

            <EmptyPanel
                title="Performance indicators"
                columns={["Performance indicator", "Description", "Linked outcome", "Version", "Action"]}
                message="No performance indicators loaded."
            />
        </div>
    )
}
