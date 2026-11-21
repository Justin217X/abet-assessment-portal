/**
 * File: CoordinatorArchivePage.tsx
 * Purpose: Shows submitted assessment reports and opens a report details preview.
 *
 * !!! This is an earlier preview page. Its records are not connected yet.
 * Current Coordinator pages also use RoleDataPage.tsx and CoordinatorPlanningPage.tsx.
 * Check CoordinatorDashboard.tsx before connecting or replacing this preview.
 * [SD]
 *
 * !!! TODO:
 * - Load saved submitted reports the Coordinator can access from Django.
 * - Replace EmptyPanel with report rows and a View report action.
 * - Pass the selected report ID and version to CoordinatorReportDetailsPage.
 * - Remove the separate submitted-report preview button when row actions work.
 * - Show loading, empty results, and clear success or error messages where needed.
 * - Django: Check Coordinator permission before returning or changing records.
 * [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"
import { CoordinatorReportDetailsPage } from "./CoordinatorReportDetailsPage"

export function CoordinatorArchivePage() {

    // Switch between the report list and report-details preview.
    const [showReportDetails, setShowReportDetails] = useState(false)

    if (showReportDetails) {
        return (
            <div className="space-y-4">
                <Button variant="secondary" onClick={() => setShowReportDetails(false)}>
                    Back to report archive
                </Button>
                <CoordinatorReportDetailsPage />
            </div>
        )
    }

    return (
        <div className="space-y-4">

            {/* !!! TODO: Add View report to each row and pass the selected report ID and version. [SD] */}
            <Button variant="secondary" onClick={() => setShowReportDetails(true)}>
                Open submitted report preview
            </Button>

            <EmptyPanel
                title="Submitted assessment reports"
                columns={["Assessment / Course", "Program", "Semester", "Submitted version", "Action"]}
                message="No submitted reports loaded."
            />
        </div>
    )
}
