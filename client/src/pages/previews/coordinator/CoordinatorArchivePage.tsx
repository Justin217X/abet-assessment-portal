/**
 * CoordinatorArchivePage.tsx
 * Shows submitted assessment reports and opens a report details preview. [SD]
 */

import { useState } from "react"
import { Button } from "../../../Button"
import { EmptyPanel } from "../../../components/FacultyPanels"
import { CoordinatorReportDetailsPage } from "./CoordinatorReportDetailsPage"

export function CoordinatorArchivePage() {
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
            {/* TODO: Move View report to each authorized submitted report row. [SD] */}
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