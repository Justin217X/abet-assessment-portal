/**
 * File: CoordinatorPeerReviewsPage.tsx
 * Purpose: Shows peer review assignments and opens the reviewer assignment preview.
 *
 * !!! This is an earlier preview page. Its records are not connected yet.
 * Current Coordinator pages also use RoleDataPage.tsx and CoordinatorPlanningPage.tsx.
 * Check CoordinatorDashboard.tsx before connecting or replacing this preview.
 * [SD]
 *
 * !!! TODO:
 * - Load submitted report versions, reviewers, and review status from Django.
 * - Replace EmptyPanel with review records.
 * - Open AssignReviewerPage from a report row and pass its ID and version.
 * - Connect reviewer assignment and reassignment using the agreed review rules.
 * - Show loading, empty results, and clear success or error messages where needed.
 * - Django: Check Coordinator permission before returning or changing records.
 * [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"
import { AssignReviewerPage } from "./AssignReviewerPage"

export function CoordinatorPeerReviewsPage() {

    // Switch between the review list and reviewer-assignment preview.
    const [showAssignment, setShowAssignment] = useState(false)

    if (showAssignment) {
        return (
            <div className="space-y-4">
                <Button variant="secondary" onClick={() => setShowAssignment(false)}>
                    Back to peer reviews
                </Button>
                <AssignReviewerPage />
            </div>
        )
    }

    return (
        <div className="space-y-4">

            {/* !!! TODO: Open reviewer assignment from a submitted report row. [SD] */}
            <Button variant="secondary" onClick={() => setShowAssignment(true)}>
                Open reviewer assignment preview
            </Button>

            <EmptyPanel
                title="Peer review assignments"
                columns={["Report / Version", "Course", "Reviewer", "Review status", "Action"]}
                message="No peer review assignments loaded."
            />
        </div>
    )
}
