/**
 * File: AssessmentProgressPage.tsx
 * Purpose: Shows preparation, submission, and peer review progress separately.
 *
 * !!! This is an earlier preview page. Its records are not connected yet.
 * Current Coordinator pages also use RoleDataPage.tsx and CoordinatorPlanningPage.tsx.
 * Check CoordinatorDashboard.tsx before connecting or replacing this preview.
 * [SD]
 *
 * !!! TODO:
 * - Load assessment tasks and their preparation, submission, and review status from Django.
 * - Replace EmptyPanel with task rows and connect search.
 * - Put View task on each row and pass its task ID to CoordinatorTaskPage.
 * - Remove the separate Open task details preview button once row actions work.
 * - Show loading, empty results, and clear success or error messages where needed.
 * - Django: Check Coordinator permission before returning or changing records.
 * [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"
import { CoordinatorTaskPage } from "./CoordinatorTaskPage"

export function AssessmentProgressPage() {
    // Switch between the task list and task-details preview.
    const [showTaskPreview, setShowTaskPreview] = useState(false)

    if (showTaskPreview) {
        return (
            <div className="space-y-4">
                <Button variant="secondary" onClick={() => setShowTaskPreview(false)}>
                    Back to assessment progress
                </Button>
                <CoordinatorTaskPage />
            </div>
        )
    }

    return (
        <div className="space-y-4">

            {/* !!! TODO: Add View task to each row and pass the selected task ID. [SD] */}
            <Button variant="secondary" onClick={() => setShowTaskPreview(true)}>
                Open task details preview
            </Button>

            <EmptyPanel
                title="Assessment tasks"
                columns={[
                "Task / Course / PI",
                "Faculty",
                "Due date",
                "Preparation",
                "Submitted version",
                "Peer review",
                "Action",
            ]}

            message="No assessment tasks loaded."
            showSearch
            searchLabel="Search tasks or faculty"
            />
        </div>
    )
}
