/**
 * AssessmentProgressPage.tsx
 * Shows preparation, submission, and peer review progress separately. [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"
import { CoordinatorTaskPage } from "./CoordinatorTaskPage"

export function AssessmentProgressPage() {
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
            {/* TODO: Move View task to each assessment row once tasks are loaded. [SD] */}
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