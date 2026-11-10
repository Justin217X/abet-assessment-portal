/**
 * CoordinatorPeerReviewsPage.tsx
 * Shows peer review assignments and opens the reviewer assignment preview. [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"
import { AssignReviewerPage } from "./AssignReviewerPage"

export function CoordinatorPeerReviewsPage() {
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
            {/* TODO: Open reviewer assignment from an eligible submitted report row. [SD] */}
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